import React from 'react';

export default function SettingsView({ user, onBack }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 md:p-6 sketch-divider flex justify-between items-center md:items-end">
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
          <h2 className="text-2xl md:text-3xl font-bold">Journal Settings</h2>
        </div>
        <span className="text-sm opacity-50">Drafting changes...</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center pt-10 md:pt-20 px-4 md:px-10">
        <div className="w-40 h-40 sketch-circle flex items-center justify-center text-7xl font-bold relative bg-white/50 shadow-sm mb-16">
          {user.charAt(0).toUpperCase()}
          <div className="absolute bottom-0 right-0 w-10 h-10 sketch-circle bg-white flex items-center justify-center text-sm cursor-pointer hover:bg-black/10">
            ✏️
          </div>
        </div>

        <div className="w-full max-w-md space-y-10">
          <div>
            <label className="text-sm opacity-70 mb-2 block">Journal Name</label>
            <input className="w-full sketch-border p-4 bg-transparent text-xl font-bold" value={user} readOnly />
          </div>
          <div>
            <label className="text-sm opacity-70 mb-2 block">Secret cipher (Password)</label>
            <input className="w-full sketch-border p-4 bg-transparent text-xl font-bold tracking-widest" value="••••••••" type="password" readOnly />
          </div>
          <div>
            <label className="text-sm opacity-70 mb-2 block">Ink color</label>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-black sketch-circle cursor-pointer border-4 border-black"></div>
              <div className="w-10 h-10 rounded-full bg-slate-500 sketch-circle cursor-pointer"></div>
              <div className="w-10 h-10 rounded-full bg-red-900 sketch-circle cursor-pointer"></div>
              <div className="w-10 h-10 rounded-full bg-blue-900 sketch-circle cursor-pointer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
