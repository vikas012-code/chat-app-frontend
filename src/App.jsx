import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { FiClock, FiSettings } from 'react-icons/fi';
import LoginScreen from './components/LoginScreen';
import SettingsView from './components/SettingsView';
import HistoryView from './components/HistoryView';
import ChatView from './components/ChatView';
import ContactDetails from './components/ContactDetails';
import CallScreen from './components/CallScreen';

const apiUrl = import.meta.env.VITE_API_URL || `https://${window.location.hostname}:5000`;
const socket = io(apiUrl);

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function App() {
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); 
  const [incomingCall, setIncomingCall] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [callError, setCallError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeView, setActiveView] = useState('history'); // 'history', 'chat', 'settings'
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [contactDetailsUser, setContactDetailsUser] = useState(null); // user object for ContactDetails

  const pcRef = useRef(null);
  const remoteIdRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const messagesEndRef = useRef(null);
  const ringingTimeoutRef = useRef(null);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatUser && activeView === 'chat') scrollToBottom();
  }, [messages, chatUser, activeView]);

  const cleanupCallFn = () => {
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setIsLoading(false);
    setIncomingCall(null);
    remoteIdRef.current = null;
    pendingCandidatesRef.current = [];
  };
  const cleanupRef = useRef(cleanupCallFn);
  cleanupRef.current = cleanupCallFn;

  const processPendingCandidates = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];
    for (const candidate of candidates) {
      try {
        if (pc.remoteDescription && pc.signalingState !== 'closed') {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {}
    }
  };

  function createPeerConnection() {
    if (pcRef.current) pcRef.current.close();
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteIdRef.current) {
        socket.emit('ice-candidate', {
          to: remoteIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(new MediaStream(event.streams[0].getTracks()));
      } else {
        setRemoteStream(prev => {
          if (prev) {
            const tracks = prev.getTracks();
            if (!tracks.some(t => t.id === event.track.id)) {
              return new MediaStream([...tracks, event.track]);
            }
            return prev;
          }
          return new MediaStream([event.track]);
        });
      }
    };

    pcRef.current = pc;
    return pc;
  }

  useEffect(() => {
    const onUserList = (list) => setOnlineUsers(list);
    const onIncomingCall = (data) => {
      setIncomingCall(data);
      setShowMobileSidebar(false);
    };

    const onCallAnswered = async ({ from, answer }) => {
      if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
      try {
        if (pcRef.current && pcRef.current.signalingState !== 'closed') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setIsLoading(false);
          setInCall(true);
          await processPendingCandidates();
        }
      } catch (err) {}
    };

    const onIceCandidate = async ({ candidate }) => {
      try {
        const pc = pcRef.current;
        if (candidate && pc && pc.remoteDescription && pc.signalingState !== 'closed') {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else if (candidate) {
          pendingCandidatesRef.current.push(candidate);
        }
      } catch (err) {}
    };

    const onCallEnded = () => cleanupRef.current();

    const onReceiveMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    const onSyncHistory = (data) => {
      if (data.chats) setMessages(data.chats);
      if (data.calls) setCallHistory(data.calls.reverse());
    };

    const onCallRejected = (data) => {
      let msg = 'Failed to connect.';
      if (data.reason === 'declined') msg = 'Call was declined.';
      else if (data.reason === 'timeout') msg = 'No answer from the user.';
      else if (data.reason === 'media_error') msg = 'User was unable to connect media devices.';
      
      setCallError(msg);
      cleanupRef.current();
    };

    socket.on('user-list', onUserList);
    socket.on('incoming-call', onIncomingCall);
    socket.on('call-answered', onCallAnswered);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('call-ended', onCallEnded);
    socket.on('receive-message', onReceiveMessage);
    socket.on('sync-history', onSyncHistory);
    socket.on('call-rejected', onCallRejected);

    return () => {
      socket.off('user-list', onUserList);
      socket.off('incoming-call', onIncomingCall);
      socket.off('call-answered', onCallAnswered);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('call-ended', onCallEnded);
      socket.off('receive-message', onReceiveMessage);
      socket.off('sync-history', onSyncHistory);
      socket.off('call-rejected', onCallRejected);
    };
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        socket.emit('join-app', savedToken, (socketRes) => {
          if (socketRes && socketRes.success) {
            setUser({ ...parsedUser, token: savedToken });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveView('history');
  };

  const handleUpdateUser = async (updatedFields) => {
    try {
      if (!user || !user.token) return { error: 'Not authenticated' };

      const res = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedFields)
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Failed to update profile' };
      }

      const { token, user: newUser } = data;
      const fullUser = { ...newUser, token };
      setUser(fullUser);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Error connecting to server' };
    }
  };

  const handleJoin = async (credentials, isRegister) => {
    setIsLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return alert(data.error || 'Authentication failed');
      }

      const { token, user: loggedInUser } = data;
      
      socket.emit('join-app', token, (socketRes) => {
        setIsLoading(false);
        if (socketRes.success) {
          setUser({ ...loggedInUser, token });
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
        } else {
          alert(socketRes.error);
        }
      });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      alert('Error connecting to server');
    }
  };

  const startCall = async (targetId, type) => {
    setIsLoading(true);
    setCallError(null);
    setShowMobileSidebar(false);
    remoteIdRef.current = targetId;

    try {
      if (!navigator.mediaDevices) {
        alert("WebRTC is blocked on HTTP.");
        setIsLoading(false);
        remoteIdRef.current = null;
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-request', { to: targetId, offer, type });

      ringingTimeoutRef.current = setTimeout(() => {
        setCallError("No answer from the user.");
        socket.emit('call-rejected', { to: targetId, reason: 'timeout' });
        cleanupRef.current();
      }, 30000);
    } catch (err) {
      setIsLoading(false);
      remoteIdRef.current = null;
      setCallError(`Call failed: ${err.message}`);
    }
  };

  const acceptCall = async () => {
    const data = incomingCall;
    if (!data) return;

    setIncomingCall(null);
    setIsLoading(true);
    setShowMobileSidebar(false);
    remoteIdRef.current = data.from;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: data.type === 'video',
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer-call', { to: data.from, answer });
      setIsLoading(false);
      setInCall(true);
      await processPendingCandidates();
    } catch (err) {
      setIsLoading(false);
      socket.emit('call-rejected', { to: remoteIdRef.current, reason: 'media_error' });
      remoteIdRef.current = null;
      setCallError(`Could not join call: ${err.message}`);
    }
  };

  const endCall = () => {
    if (remoteIdRef.current) {
      socket.emit('end-call', { to: remoteIdRef.current });
    }
    cleanupRef.current();
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !chatUser || !user) return;
    const userId = user.id || user._id;
    const msgData = {
      from: userId,
      to: chatUser.id,
      name: user.username || user.name || 'Me',
      message: messageInput.trim(),
      time: new Date().toISOString()
    };
    socket.emit('send-message', { to: chatUser.id, message: messageInput.trim() });
    
    setMessages(prev => [...prev, msgData]);
    setMessageInput('');
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    
    if (isToday) return formatTime(isoString);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
    
    if (isYesterday) return 'Yesterday, ' + formatTime(isoString);
    
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + formatTime(isoString);
  };

  const getLastMessage = (targetUserId) => {
    if (!user) return "Start a conversation";
    const userId = user.id || user._id;
    const msgs = messages.filter(m => (m.from === userId && m.to === targetUserId) || (m.from === targetUserId && m.to === userId));
    if (msgs.length === 0) return "Start a conversation";
    const last = msgs[msgs.length - 1];
    return last.message && last.message.length > 25 ? last.message.substring(0, 25) + '...' : (last.message || '');
  };

  // --- Views ---

  if (!user) return <LoginScreen onJoin={handleJoin} loading={isLoading} />;

  // Determine active main content based on call state
  const isCallActive = inCall || isLoading || incomingCall || callError;

  return (
    <div className="h-screen w-full flex overflow-hidden text-[#2D2C2A] bg-[#F5F2EB]">
      
      {/* SIDEBAR */}
      <div className={`${showMobileSidebar ? 'flex w-full md:w-80' : 'hidden md:flex md:w-80'} shrink-0 border-r-0 md:border-r-2 border-black/10 flex-col relative z-20 shadow-none md:shadow-[4px_0_15px_rgba(0,0,0,0.02)] bg-[#F5F2EB]`}>

        {/* Header */}
        <div className="p-4 md:p-6 pb-3 md:pb-4 sketch-divider">
          <h1 className="text-xl md:text-3xl font-bold tracking-widest mb-2 md:mb-4">SCRIBE CHAT</h1>
          <div className="relative w-full">
            <input
              className="w-full bg-transparent p-2 pb-3 text-sm text-[#2D2C2A] outline-none placeholder-gray-500/70"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[6px] pointer-events-none text-[#2D2C2A]">
              <path d="M 0 5 Q 75 3 150 6 T 300 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 5 6 Q 80 8 160 5 T 295 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Static call history button mimicking the mockup */}
          <div
            onClick={() => { setActiveView('history'); setChatUser(null); setShowMobileSidebar(false); }}
            className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 sketch-divider cursor-pointer transition-colors hover:bg-black/5 ${activeView === 'history' && !isCallActive ? 'bg-black/5' : ''}`}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 sketch-circle flex items-center justify-center bg-[#F5F2EB]">
              <FiClock className="w-4 h-4 md:w-5 md:h-5 text-[#2D2C2A]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm md:text-base">Call Logs</h3>
              <p className="text-xs md:text-sm text-black/50">Recent connections</p>
            </div>
          </div>

          {onlineUsers
            .filter(u => u.id !== (user?.id || user?._id))
            .filter(u => !searchQuery.trim() || u.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
            .map(u => (
            <div
              key={u.id}
              onClick={() => { setActiveView('chat'); setChatUser(u); setShowMobileSidebar(false); }}
              className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 sketch-divider cursor-pointer transition-colors hover:bg-black/5 ${(activeView === 'chat' || isCallActive) && chatUser?.id === u.id ? 'bg-black/5' : ''}`}
            >
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 sketch-circle flex items-center justify-center bg-[#F5F2EB] text-base md:text-xl font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                {u.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-black rounded-full border-1.5 md:border-2 border-[#F5F2EB]"></div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-sm md:text-base truncate">{u.name}</h3>
                <p className="text-xs md:text-sm text-black/50 truncate">{getLastMessage(u.id)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Your Journal */}
        <div className="p-3 md:p-4 sketch-divider border-t-2 border-black/10 bg-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 sketch-circle bg-black text-white flex items-center justify-center text-sm md:text-base font-bold">
              {(user?.username || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-sm md:text-base">Your Journal</span>
          </div>
          <button
            onClick={() => { setActiveView(activeView === 'settings' ? 'history' : 'settings'); setShowMobileSidebar(false); }}
            className="w-7 h-7 md:w-8 md:h-8 sketch-circle flex items-center justify-center hover:bg-black/10 transition-colors"
            title="Settings"
          >
            <FiSettings className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#2D2C2A]" />
          </button>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className={`${!showMobileSidebar ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative z-10 overflow-hidden bg-white/30 min-h-screen md:min-h-0 h-full`}>
        {isCallActive ? (
          <CallScreen
            incomingCall={incomingCall}
            inCall={inCall}
            isLoading={isLoading}
            callError={callError}
            remoteStream={remoteStream}
            localStream={localStream}
            targetUser={incomingCall ? incomingCall : (chatUser ? chatUser : { name: remoteIdRef.current })}
            acceptCall={acceptCall}
            declineCall={() => {
              socket.emit('call-rejected', { to: incomingCall.from, reason: 'declined' });
              setIncomingCall(null);
            }}
            endCall={endCall}
            clearError={() => setCallError(null)}
            onBack={() => setShowMobileSidebar(true)}
          />
        ) : activeView === 'settings' ? (
          <SettingsView user={user} onBack={() => setShowMobileSidebar(true)} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
        ) : activeView === 'chat' && chatUser ? (
          contactDetailsUser ? (
            <ContactDetails
              user={contactDetailsUser}
              onBack={() => setContactDetailsUser(null)}
              onCall={(u, type) => { setContactDetailsUser(null); startCall(u.id, type); }}
              onUnfriend={(u) => {
                socket.emit('unfriend', { to: u.id });
                setContactDetailsUser(null);
                if (chatUser && chatUser.id === u.id) {
                  setChatUser(null);
                  setActiveView('history');
                }
                alert(`Removed ${u.name || u.username} from your journal.`);
              }}
            />
          ) : (
            <ChatView
              chatUser={chatUser}
              user={user}
              messages={messages}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              messagesEndRef={messagesEndRef}
              formatTime={formatTime}
              startCall={startCall}
              onBack={() => setShowMobileSidebar(true)}
              onOpenDetails={(u) => setContactDetailsUser(u)}
            />
          )
        ) : (
          <HistoryView callHistory={callHistory} user={user} formatTime={formatDate} startCall={startCall} onBack={() => setShowMobileSidebar(true)} />
        )}
      </div>

    </div>
  );
}
