import React from 'react';
import VideoPlayer from './VideoPlayer';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiPhoneCall, FiMoreVertical, FiAlertCircle } from 'react-icons/fi';

const HangupIcon = ({ className }) => (
  <FiPhoneOff className={`w-7 h-7 ${className || ''}`} />
);

const PickupIcon = ({ className }) => (
  <FiPhoneCall className={`w-7 h-7 ${className || ''}`} />
);

const DefaultAvatarPath = () => (
  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {/* Head */}
    <path d="M 50,25 C 60,24 65,30 65,40 C 64,52 55,58 50,58 C 40,58 35,52 35,40 C 35,30 40,24 50,25 Z" />
    {/* Shoulders */}
    <path d="M 20,85 C 25,70 35,65 50,65 C 65,65 75,70 80,85" />
  </svg>
);

export default function CallScreen({ incomingCall, inCall, isLoading, callError, remoteStream, localStream, targetUser, acceptCall, declineCall, endCall, clearError }) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (callError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F4EFE6] font-['Kalam'] relative z-30">
        <div className="p-10 text-center max-w-md w-full"
             style={{ border: '1.5px solid #2D2C2A', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
          <div className="w-20 h-20 text-red-800 flex items-center justify-center mx-auto mb-6"
               style={{ border: '2px solid #991b1b', borderRadius: '50% 40% 60% 40% / 40% 50% 40% 60%' }}>
            <FiAlertCircle className="w-10 h-10 text-[#991b1b]" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{callError}</h2>
          <button onClick={clearError} className="px-8 py-3 text-xl hover:bg-[#2D2C2A] hover:text-[#F4EFE6] transition-colors"
                  style={{ border: '1.5px solid #2D2C2A', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
            Return to Journal
          </button>
        </div>
      </div>
    );
  }

  // --- INCOMING CALL UI ---
  if (incomingCall) {
    const callerName = incomingCall.name || incomingCall.from || 'Unknown User';
    return (
      <div className="flex-1 flex flex-col items-center bg-[#F4EFE6] text-[#2D2C2A] font-['Kalam'] relative z-30 pt-16">
        <h3 className="text-lg opacity-60 mb-20">Incoming Scribe...</h3>
        
        <div className="relative flex items-center justify-center mb-10 w-64 h-64">
          <div className="absolute inset-[-40px] border border-black/10 rounded-full"></div>
          <div className="absolute inset-[-80px] border border-black/5 rounded-full"></div>
          
          <div className="w-full h-full flex items-center justify-center bg-transparent"
               style={{ border: '2px solid #2D2C2A', borderRadius: "50% 45% 55% 45% / 45% 55% 45% 50%" }}>
            <DefaultAvatarPath />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-2">{callerName}</h1>
        <p className="text-xl opacity-70 mb-24">is calling your journal</p>

        <div className="flex gap-12">
          <button onClick={declineCall} className="w-24 h-24 flex flex-col items-center justify-center gap-2 text-[#991b1b] hover:bg-[#991b1b]/10 transition-colors"
                  style={{ border: '2.5px solid #991b1b', borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px' }}>
            <HangupIcon className="rotate-[135deg]" />
            <span className="font-bold uppercase tracking-widest text-sm">Decline</span>
          </button>

          <button onClick={acceptCall} className="w-24 h-24 flex flex-col items-center justify-center gap-2 text-[#166534] hover:bg-[#166534]/10 transition-colors"
                  style={{ border: '2.5px solid #166534', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
            <PickupIcon className="rotate-0" />
            <span className="font-bold uppercase tracking-widest text-sm">Accept</span>
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE / OUTGOING CALL UI ---
  const activeName = targetUser?.name || targetUser?.username || incomingCall?.name || incomingCall?.from || 'Unknown User';

  const isVideo = (localStream && localStream.getVideoTracks().length > 0) ||
                  (remoteStream && remoteStream.getVideoTracks().length > 0) ||
                  incomingCall?.type === 'video';

  return (
    <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-full bg-[#E6E1D6] text-[#2D2C2A] font-['Kalam'] relative z-30 p-3 md:p-4 pb-2">

      <div className="flex-1 relative flex flex-col items-center justify-center m-2 shadow-sm bg-[#E6E1D6] min-h-[400px] md:min-h-0"
           style={{ border: '1.5px solid #2D2C2A', borderRadius: '4px 3px 6px 2px' }}>
        
        <svg className="absolute top-2 left-2 text-[#2D2C2A] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12V4h8" />
        </svg>
        <svg className="absolute top-2 right-2 text-[#2D2C2A] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12V4h-8" />
        </svg>
        <svg className="absolute bottom-2 left-2 text-[#2D2C2A] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8h8" />
        </svg>
        <svg className="absolute bottom-2 right-2 text-[#2D2C2A] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12v8h-8" />
        </svg>

        <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 tracking-wide">{activeName}</h2>
          <div className="inline-block px-5 py-2 text-xl"
               style={{ border: '1.5px solid #2D2C2A', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>

        {isVideo && (
          <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20 bg-[#F4EFE6] px-3 py-1.5 md:px-6 md:py-3 shadow-md rotate-2"
               style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
            <p className="text-sm md:text-xl font-bold">Live Stream: {activeName.split(' ')[0]}</p>
          </div>
        )}

        {remoteStream && isVideo ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-90 z-0 flex items-center justify-center bg-transparent">
             <VideoPlayer stream={remoteStream} />
          </div>
        ) : (
          <div className="flex flex-col items-center opacity-70 z-10">
            <div className="w-56 h-56 flex items-center justify-center mb-6">
              <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 50,30 C 65,28 70,40 70,55 C 69,72 57,80 50,80 C 43,80 31,72 30,55 C 30,40 35,28 50,30 Z" />
                <path d="M 25,90 C 35,80 45,75 50,75 C 55,75 65,80 75,90" />
                <path d="M 35,62 C 45,52 55,52 65,62 C 60,60 55,58 50,58 C 45,58 40,60 35,62 Z" fill="currentColor"/>
                <path d="M 40,55 Q 45,50 48,55" />
                <path d="M 52,55 Q 55,50 60,55" />
              </svg>
            </div>
            <p className="text-2xl">
              {isLoading 
                ? 'Scribbling connection...' 
                : (isVideo ? `capturing ${activeName.split(' ')[0]}'s desk...` : `On a voice call with ${activeName.split(' ')[0]}...`)}
            </p>
          </div>
        )}

        {isVideo && (
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-32 h-24 md:w-72 md:h-48 bg-[#F4EFE6] flex flex-col items-center justify-center z-20 shadow-lg rotate-1"
               style={{ border: '1.5px solid #2D2C2A', borderRadius: '2px' }}>
            
            <div className="absolute -top-4 left-4 bg-[#F4EFE6] px-4 py-1 shadow-sm -rotate-2 z-30"
                 style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
              <p className="text-sm font-bold">Me {'{Scribe}'}</p>
            </div>

            {(inCall || localStream) && localStream ? (
              <div className="w-full h-full overflow-hidden">
                <VideoPlayer stream={localStream} muted />
              </div>
            ) : (
              <div className="opacity-50">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="50" cy="40" r="15" />
                  <path d="M 30,80 C 40,70 60,70 70,80" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="py-2 md:py-4 flex justify-center gap-3 md:gap-6 items-center">
        <button 
          onClick={toggleMic}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-colors ${isMuted ? 'bg-red-100 text-red-900 border-2 border-red-800' : 'bg-[#F4EFE6] hover:bg-black/5'}`}
          style={{ border: isMuted ? '2px solid #991b1b' : '1.5px solid #2D2C2A', borderRadius: '50% 40% 60% 40% / 40% 50% 40% 60%' }}
        >
          {isMuted ? <FiMicOff className="w-6 h-6 text-red-900" /> : <FiMic className="w-6 h-6 text-[#2D2C2A]" />}
        </button>
        <button 
          onClick={toggleVideo}
          title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-100 text-red-900 border-2 border-red-800' : 'bg-[#F4EFE6] hover:bg-black/5'}`}
          style={{ border: isVideoOff ? '2px solid #991b1b' : '1.5px solid #2D2C2A', borderRadius: '40% 60% 50% 50% / 50% 40% 60% 40%' }}
        >
          {isVideoOff ? <FiVideoOff className="w-6 h-6 text-red-900" /> : <FiVideo className="w-6 h-6 text-[#2D2C2A]" />}
        </button>
        <button className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center hover:bg-black/5 transition-colors bg-[#F4EFE6]"
                style={{ border: '1.5px solid #2D2C2A', borderRadius: '60% 40% 50% 50% / 40% 50% 60% 40%' }}>
          <FiMoreVertical className="w-6 h-6 text-[#2D2C2A]" />
        </button>
        <button onClick={endCall} className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-[#F4EFE6] bg-[#2D2C2A] hover:opacity-80 transition-opacity ml-2 md:ml-4"
                style={{ borderRadius: '50% 45% 55% 45% / 45% 55% 45% 50%' }}>
          <HangupIcon />
        </button>
      </div>

    </div>
  );
}

