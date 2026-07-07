import React from 'react';

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

export default function HistoryView({ callHistory, user, startCall, onBack }) {
  
  const groupCalls = (calls) => {
    const groups = {};
    calls.forEach(c => {
      const d = new Date(c.time);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateStr = d.toLocaleDateString([], { month: 'long', day: 'numeric' });
      if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        dateStr = 'Today';
      } else if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
        dateStr = 'Yesterday';
      }
      
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(c);
    });
    return groups;
  };

  const formatJustTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  };

  const groupedCalls = groupCalls(callHistory);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-transparent">
      
      <div className="flex justify-between items-center px-4 md:px-10 py-6 md:py-8 sticky top-0 z-20 border-b border-black/10 backdrop-blur-sm bg-[#F4EFE6]/80">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-black/10 transition-colors"
            style={{ border: '1.5px solid #2D2C2A', borderRadius: "50%" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2 className="text-xl md:text-3xl font-bold">call History Log</h2>
        </div>
        <div className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors relative"
             style={{ border: '1.5px solid #2D2C2A', borderRadius: "60% 40% 50% 50% / 40% 50% 60% 40%" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-4xl w-full mx-auto relative pb-20">
        
        {callHistory.length === 0 && (
          <p className="text-center opacity-50 mt-20 text-xl">No previous logs found.</p>
        )}

        {Object.entries(groupedCalls).map(([date, calls], groupIdx) => (
          <div key={date} className="mb-12 relative">
            
            {/* Timeline line connecting avatars - absolute positioned */}
            <div className="absolute top-14 bottom-[-3rem] left-[1.75rem] w-px border-l-2 border-solid border-black/10 z-0"></div>

            {/* Date Header */}
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <h3 className="text-xl text-black/70">{date}</h3>
              <div className="flex-1 border-b-2 border-dashed border-black/10 mt-2"></div>
            </div>
            
            <div className="space-y-10 relative z-10">
              {calls.map((c, i) => {
                const isIncoming = c.to === user;
                const peerName = isIncoming ? c.from : c.to;
                const isMissed = c.status === 'missed' || c.status === 'rejected';
                
                return (
                  <div key={i} className="flex items-center gap-4 md:gap-8 group">
                    
                    <div className="w-14 h-14 bg-[#F4EFE6] flex items-center justify-center text-2xl font-bold relative z-10"
                         style={{ border: '1.5px solid #2D2C2A', borderRadius: "50% 40% 60% 40% / 40% 50% 40% 60%" }}>
                      {peerName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{peerName}</h3>
                      <div className="flex items-center gap-2 text-sm text-black/60 mt-1">
                        {c.type === 'video' ? <VideoIcon /> : <PhoneIcon />}
                        <span>{c.type === 'video' ? 'video call' : 'voice call'} • {isMissed ? 'Missed' : isIncoming ? 'Incoming' : 'Outgoing'}</span>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2 md:gap-6">
                      <span className="text-sm opacity-60 font-sans tracking-wide">
                        {formatJustTime(c.time)}
                      </span>
                      <button 
                        onClick={() => startCall(peerName, c.type)}
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl hover:bg-black hover:text-[#F4EFE6] transition-colors md:opacity-0 md:group-hover:opacity-100"
                        style={{ border: '1.5px solid #2D2C2A', borderRadius: "50% 40% 60% 40% / 40% 50% 40% 60%" }}
                        title="Call back"
                      >
                        {c.type === 'video' ? <VideoIcon /> : <PhoneIcon />}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
