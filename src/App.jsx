import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import SettingsView from './components/SettingsView';
import HistoryView from './components/HistoryView';
import ChatView from './components/ChatView';
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
  
  const [activeView, setActiveView] = useState('history'); // 'history', 'chat', 'settings'
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

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

  const handleJoin = (name) => {
    if (!name.trim()) return;
    setIsLoading(true);
    socket.emit('join-app', name.trim(), (res) => {
      setIsLoading(false);
      if (res.success) setUser(name.trim());
      else alert(res.error);
    });
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
    if (!messageInput.trim() || !chatUser) return;
    const msgData = {
      from: user,
      to: chatUser.id,
      name: user,
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
    const msgs = messages.filter(m => (m.from === user && m.to === targetUserId) || (m.from === targetUserId && m.to === user));
    if (msgs.length === 0) return "Start a conversation";
    const last = msgs[msgs.length - 1];
    return last.message.length > 25 ? last.message.substring(0, 25) + '...' : last.message;
  };

  // --- Views ---

  if (!user) return <LoginScreen onJoin={handleJoin} loading={isLoading} />;

  // Determine active main content based on call state
  const isCallActive = inCall || isLoading || incomingCall || callError;

  return (
    <div className="h-screen w-full flex overflow-hidden text-[#2D2C2A] bg-[#F5F2EB]">
      
      {/* SIDEBAR */}
      <div className={`${showMobileSidebar ? 'flex w-full md:w-80' : 'hidden md:flex md:w-80'} shrink-0 border-r-2 border-black/10 flex-col relative z-20 shadow-[4px_0_15px_rgba(0,0,0,0.02)] bg-[#F5F2EB]`}>
        
        {/* Header */}
        <div className="p-6 pb-4 sketch-divider">
          <h1 className="text-3xl font-bold tracking-widest mb-4">SCRIBE CHAT</h1>
          <div className="relative w-full">
            <input 
              className="w-full bg-transparent p-2 pb-3 text-sm text-[#2D2C2A] outline-none placeholder-gray-500/70"
              placeholder="Search contacts..."
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
            className={`flex items-center gap-4 p-4 sketch-divider cursor-pointer transition-colors hover:bg-black/5 ${activeView === 'history' && !isCallActive ? 'bg-black/5' : ''}`}
          >
            <div className="w-12 h-12 sketch-circle flex items-center justify-center bg-[#F5F2EB]">
              🕒
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Call Logs</h3>
              <p className="text-sm text-black/50">Recent connections</p>
            </div>
          </div>

          {onlineUsers.filter(u => u.name !== user).map(u => (
            <div 
              key={u.id}
              onClick={() => { setActiveView('chat'); setChatUser(u); setShowMobileSidebar(false); }}
              className={`flex items-center gap-4 p-4 sketch-divider cursor-pointer transition-colors hover:bg-black/5 ${(activeView === 'chat' || isCallActive) && chatUser?.id === u.id ? 'bg-black/5' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 sketch-circle flex items-center justify-center bg-[#F5F2EB] text-xl font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                {u.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-black rounded-full border-2 border-[#F5F2EB]"></div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold truncate">{u.name}</h3>
                <p className="text-sm text-black/50 truncate">{getLastMessage(u.id)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Your Journal */}
        <div className="p-4 sketch-divider border-t-2 border-black/10 bg-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sketch-circle bg-black text-white flex items-center justify-center font-bold">
              {user.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold">Your Journal</span>
          </div>
          <button 
            onClick={() => { setActiveView(activeView === 'settings' ? 'history' : 'settings'); setShowMobileSidebar(false); }}
            className="w-8 h-8 sketch-circle flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className={`${!showMobileSidebar ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative z-10 overflow-hidden bg-white/30`}>
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
          <SettingsView user={user} onBack={() => setShowMobileSidebar(true)} />
        ) : activeView === 'chat' && chatUser ? (
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
          />
        ) : (
          <HistoryView callHistory={callHistory} user={user} formatTime={formatDate} startCall={startCall} onBack={() => setShowMobileSidebar(true)} />
        )}
      </div>

    </div>
  );
}
