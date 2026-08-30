import React from 'react';
import { FiArrowLeft, FiPhone, FiVideo, FiUser, FiMail, FiHash, FiMessageSquare, FiUserX } from 'react-icons/fi';

const ContactDetails = ({ user, onBack, onUnfriend, onCall }) => {
  if (!user) return null;

  const initials = (user.name || user.username || 'U').charAt(0).toUpperCase();
  const statusLabel = user.status === 'online' ? 'pondering...' : 'away';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4EFE6] text-[#2D2C2A] font-['Kalam'] relative z-10 overflow-hidden">
      {/* Top header bar */}
      <div className="flex items-center justify-between px-4 md:px-10 py-4 md:py-6 border-b border-black/10 bg-[#F5F2EB]/80 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={onBack}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-black/5 transition-colors"
          style={{ border: '1.5px solid #2D2C2A', borderRadius: "50% 40% 60% 40% / 40% 50% 40% 60%" }}
          title="Back"
        >
          <FiArrowLeft className="w-5 h-5 text-[#2D2C2A]" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold tracking-wide">Scribe Details</h2>
        <div className="w-10 md:w-12" />
      </div>

      {/* Profile card */}
      <div className="flex flex-col items-center py-8 md:py-12 px-6">
        <div className="relative mb-6">
          <div
            className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center text-6xl md:text-8xl font-bold bg-[#F5F2EB]"
            style={{ border: '2.5px solid #2D2C2A', borderRadius: "50% 45% 55% 45% / 45% 55% 45% 50%" }}
          >
            {initials}
          </div>
          {user.status === 'online' && (
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-5 h-5 bg-[#2D2C2A] rounded-full border-4 border-[#F4EFE6]" />
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-2">{user.name || user.username || 'Unknown User'}</h1>
        <div className="flex items-center gap-2 text-lg opacity-70 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#2D2C2A]" />
          <span>{statusLabel}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 md:gap-6 mb-10">
          <button
            onClick={() => onCall(user, 'voice')}
            className="w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-colors"
            style={{ border: '2px solid #2D2C2A', borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
          >
            <FiPhone className="w-7 h-7 md:w-8 md:h-8 text-[#2D2C2A]" />
            <span className="text-sm md:text-base font-bold uppercase tracking-widest">Voice</span>
          </button>
          <button
            onClick={() => onCall(user, 'video')}
            className="w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-colors"
            style={{ border: '2px solid #2D2C2A', borderRadius: "15px 225px 15px 255px / 255px 15px 225px 15px" }}
          >
            <FiVideo className="w-7 h-7 md:w-8 md:h-8 text-[#2D2C2A]" />
            <span className="text-sm md:text-base font-bold uppercase tracking-widest">Video</span>
          </button>
        </div>
      </div>

      {/* Details list */}
      <div className="mx-4 md:mx-10 mb-6">
        <div className="bg-[#F5F2EB] border-2 border-black/10 divide-y divide-black/10"
             style={{ border: '1.5px solid #2D2C2A', borderRadius: "4px 3px 6px 2px" }}>
          <div className="flex items-center gap-4 px-6 py-4">
            <FiUser className="w-6 h-6 text-[#2D2C2A] opacity-70" />
            <div>
              <p className="text-sm opacity-60 uppercase tracking-widest">Full Name</p>
              <p className="text-xl font-bold">{user.name || user.username || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <FiHash className="w-6 h-6 text-[#2D2C2A] opacity-70" />
            <div>
              <p className="text-sm opacity-60 uppercase tracking-widest">Scribe ID</p>
              <p className="text-xl font-bold">{user.id || user._id || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <FiMessageSquare className="w-6 h-6 text-[#2D2C2A] opacity-70" />
            <div>
              <p className="text-sm opacity-60 uppercase tracking-widest">Status</p>
              <p className="text-xl font-bold capitalize">{statusLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unfriend action */}
      <div className="mt-auto px-4 md:px-10 pb-8 md:pb-12">
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to remove ${user.name || user.username} from your journal?`)) {
              onUnfriend(user);
            }
          }}
          className="w-full py-4 md:py-5 flex items-center justify-center gap-3 text-lg md:text-xl font-bold hover:bg-[#991b1b]/10 transition-colors"
          style={{ border: '2px solid #991b1b', color: '#991b1b', borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
        >
          <FiUserX className="w-6 h-6" />
          Remove from Journal
        </button>
        <p className="text-center text-sm opacity-50 mt-4">
          Removing this scribe will hide their entries and end your shared parchment.
        </p>
      </div>
    </div>
  );
};

export default ContactDetails;