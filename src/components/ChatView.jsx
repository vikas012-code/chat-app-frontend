import React from 'react';
import { FiPhone, FiVideo, FiMoreVertical, FiArrowLeft, FiPlus, FiSend } from 'react-icons/fi';

const PhoneIcon = () => <FiPhone className="w-5 h-5 text-[#2D2C2A] opacity-80" />;
const VideoIcon = () => <FiVideo className="w-5 h-5 text-[#2D2C2A] opacity-80" />;
const MenuIcon = () => <FiMoreVertical className="w-5 h-5 text-[#2D2C2A] opacity-80" />;

const SketchyBubble = ({ children, isMe }) => (
  <div className="relative p-3 md:p-4 px-4 md:px-6 text-base md:text-xl text-[#2D2C2A] font-['Kalam'] inline-block max-w-[85%] md:max-w-full break-words"
       style={{
         border: '1.5px solid #2D2C2A',
         borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
         boxShadow: '1px 2px 4px rgba(0,0,0,0.05)'
       }}>
    <div className="absolute inset-0 pointer-events-none"
         style={{
           border: '1px solid rgba(45,44,42,0.5)',
           borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
           transform: 'scale(1.01) rotate(0.3deg)'
         }}></div>
    <div className="relative z-10 break-words break-all hyphens-auto whitespace-pre-wrap">{children}</div>
  </div>
);

export default function ChatView({ chatUser, user, messages, messageInput, setMessageInput, sendMessage, messagesEndRef, formatTime, startCall, onBack, onOpenDetails }) {
  const currentUserId = user?.id || user?._id;
  const msgs = messages.filter(m => (m.from === currentUserId && m.to === chatUser.id) || (m.from === chatUser.id && m.to === currentUserId));

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 sketch-vborder-left">
      
      {/* Top Header */}
      <div className="flex justify-between items-center px-3 md:px-10 py-3 md:py-6 sketch-hborder bg-[#F4EFE6]/80 backdrop-blur-sm sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden w-9 h-9 flex items-center justify-center hover:bg-black/10 transition-colors shrink-0"
            style={{ border: '1.5px solid #2D2C2A', borderRadius: "50%" }}
            title="Back"
          >
            <FiArrowLeft className="w-4 h-4 text-[#2D2C2A]" />
          </button>
          <div className="w-9 h-9 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-2xl font-bold bg-[#F4EFE6] shrink-0"
               style={{ border: '1.5px solid #2D2C2A', borderRadius: "50% 40% 60% 40% / 40% 50% 40% 60%" }}>
            {(chatUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-bold font-['Kalam'] truncate">{chatUser?.name || 'Unknown User'}</h2>
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-black/60">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#2D2C2A]"></span>
              <span>{chatUser?.status === 'online' ? 'Online' : 'Away'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 md:gap-4 shrink-0">
          <button onClick={() => startCall(chatUser.id, 'voice')}
                  className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center hover:bg-black/10 transition-colors"
                  style={{ border: '1.5px solid #2D2C2A', borderRadius: "60% 40% 50% 50% / 40% 50% 60% 40%" }}>
            <PhoneIcon />
          </button>
          <button onClick={() => startCall(chatUser.id, 'video')}
                  className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center hover:bg-black/10 transition-colors"
                  style={{ border: '1.5px solid #2D2C2A', borderRadius: "50% 60% 40% 50% / 50% 40% 60% 40%" }}>
            <VideoIcon />
          </button>
          <button
            onClick={() => onOpenDetails && onOpenDetails(chatUser)}
            className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center hover:bg-black/10 transition-colors"
            style={{ border: '1.5px solid #2D2C2A', borderRadius: "40% 50% 60% 50% / 50% 60% 40% 50%" }}
            title="Profile"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-10 space-y-3 md:space-y-8 min-h-0">
        {msgs.length === 0 && <p className="text-center opacity-50 mt-20 text-base md:text-xl font-['Kalam']">No messages yet. Start the conversation...</p>}
        {msgs.map((m, i) => {
          const isMe = m.from === currentUserId;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <SketchyBubble isMe={isMe}>{m.message}</SketchyBubble>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="px-3 md:px-10 py-3 md:py-6 sketch-hborder-top bg-transparent flex gap-2 md:gap-6 items-center shrink-0">
        <button className="hidden md:flex w-12 h-12 items-center justify-center hover:bg-black/5 transition-colors"
                style={{ border: '1.5px solid #2D2C2A', borderRadius: "50% 40% 60% 40% / 40% 50% 40% 60%" }}>
          <FiPlus className="w-6 h-6 text-[#2D2C2A]" />
        </button>

        <input
          className="flex-1 bg-transparent p-2 text-base md:text-2xl font-['Kalam'] outline-none placeholder-black/50 min-w-0"
          placeholder="Type a message..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />

        <button
          onClick={sendMessage}
          disabled={!messageInput.trim()}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:opacity-80 transition-opacity disabled:opacity-30 relative shrink-0"
          title="Send"
        >
          {/* Solid sketchy black circle background */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2D2C2A] pointer-events-none">
            <path d="M 50,4 C 75,2 96,20 95,50 C 94,80 75,98 50,96 C 25,94 4,75 6,50 C 8,25 25,6 50,4 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 50,8 C 72,5 92,25 90,50 C 88,75 72,92 50,91 C 28,90 10,75 11,50 C 12,28 28,10 50,8 Z" fill="currentColor" opacity="0.8"/>
          </svg>
          <FiSend className="w-4 h-4 md:w-5 md:h-5 relative z-10 text-[#F4EFE6]" />
        </button>
      </div>
    </div>
  );
}
