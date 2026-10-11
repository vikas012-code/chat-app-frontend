import React, { useState } from 'react';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';

const INK_COLORS = [
  { id: 'black', hex: '#2D2C2A', label: 'Classic Charcoal' },
  { id: 'sage', hex: '#7B8E85', label: 'Sage Leaf' },
  { id: 'rose', hex: '#9E7B78', label: 'Dusty Rose' },
  { id: 'slate', hex: '#748393', label: 'Slate Blue' }
];

export default function SettingsView({ user, onBack, onUpdateUser, onLogout }) {
  const initialUsername = typeof user === 'string' ? user : (user?.username || user?.name || user?.email || 'Your Name');
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [inkColor, setInkColor] = useState(user?.inkColor || '#2D2C2A');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const initialChar = username.trim() ? username.trim().charAt(0).toUpperCase() : 'W';

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      if (onUpdateUser) {
        const result = await onUpdateUser({ username, password: password || undefined, inkColor });
        if (result && result.error) {
          setSaveMessage({ type: 'error', text: result.error });
        } else {
          setSaveMessage({ type: 'success', text: 'Settings saved!' });
          setPassword('');
        }
      } else {
        setSaveMessage({ type: 'success', text: 'Settings saved!' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent font-['Kalam']">

      {/* Top Header */}
      <div className="p-3 md:p-6 sketch-divider flex justify-between items-center bg-[#F4EFE6]/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden w-9 h-9 flex items-center justify-center hover:bg-black/10 transition-colors shrink-0"
            style={{ border: '1.5px solid #2D2C2A', borderRadius: "50%" }}
            title="Back"
          >
            <FiArrowLeft className="w-4 h-4 text-[#2D2C2A]" />
          </button>
          <h2 className="text-lg md:text-3xl font-bold tracking-wide truncate">Settings</h2>
        </div>
        <span className="text-xs md:text-sm opacity-60 hidden md:block">Customize your profile</span>
      </div>
      
      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-12 flex flex-col items-center">

        {/* Profile Avatar Circle */}
        <div className="w-20 h-20 md:w-36 md:h-36 sketch-circle flex items-center justify-center text-4xl md:text-7xl font-bold relative bg-white/40 shadow-sm mb-6 md:mb-10 shrink-0">
          {initialChar}
          <div className="absolute bottom-0 right-0 w-7 h-7 md:w-9 md:h-9 sketch-circle bg-[#F4EFE6] border border-[#2D2C2A] flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors" title="Edit avatar">
            <FiEdit2 className="w-3 h-3 md:w-4 md:h-4 text-[#2D2C2A]" />
          </div>
        </div>

        {/* Settings Form Controls */}
        <div className="w-full max-w-md space-y-6 md:space-y-8 pb-10 px-2">
          
          {/* Journal Name Field */}
          <div className="space-y-1 md:space-y-2">
            <label className="text-sm md:text-lg font-bold block text-[#2D2C2A]/80">Display Name</label>
            <div className="relative w-full">
              <input
                className="w-full bg-transparent p-2 md:p-3 text-lg md:text-2xl outline-none font-bold text-[#2D2C2A]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Name"
              />
              <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 md:h-2.5 pointer-events-none text-[#2D2C2A]">
                <path d="M 0 5 Q 75 2 150 6 T 300 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 5 6 Q 85 8 165 4 T 295 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </div>
          </div>

          {/* Secret Cipher (Password) Field */}
          <div className="space-y-1 md:space-y-2">
            <label className="text-sm md:text-lg font-bold block text-[#2D2C2A]/80">New Password</label>
            <div className="relative w-full">
              <input
                type="password"
                className="w-full bg-transparent p-2 md:p-3 text-lg md:text-2xl outline-none font-bold tracking-widest text-[#2D2C2A]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty to keep current"
              />
              <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 md:h-2.5 pointer-events-none text-[#2D2C2A]">
                <path d="M 2 4 Q 80 6 150 3 T 298 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Ink Color Selection */}
          <div className="space-y-2 md:space-y-3">
            <label className="text-sm md:text-lg font-bold block text-[#2D2C2A]/80">Accent Color</label>
            <div className="flex items-center gap-3 md:gap-5">
              {INK_COLORS.map((c) => {
                const isSelected = inkColor === c.hex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setInkColor(c.hex)}
                    title={c.label}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full sketch-circle transition-all flex items-center justify-center relative ${isSelected ? 'scale-110' : 'hover:scale-105 opacity-80'}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && (
                      <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/80 border border-black/30"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Message */}
          {saveMessage && (
            <div className={`p-2 md:p-3 text-center text-base md:text-lg font-bold rounded ${saveMessage.type === 'error' ? 'text-red-700 bg-red-100/80 border border-red-300' : 'text-emerald-800 bg-emerald-100/80 border border-emerald-300'}`}>
              {saveMessage.text}
            </div>
          )}

          {/* Save Journal Button */}
          <div className="pt-2 md:pt-4 flex flex-col items-center">
            <button
              onClick={handleSave}
              disabled={isSaving || !username.trim()}
              className="w-full max-w-xs py-3 md:py-4 px-6 md:px-8 text-lg md:text-2xl font-bold uppercase tracking-wider text-[#2D2C2A] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 relative group"
              style={{
                backgroundColor: '#DCD4C4',
                border: '2px solid #2D2C2A',
                borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                boxShadow: '2px 3px 6px rgba(0,0,0,0.1)'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Handwritten Quote Footer */}
            <p className="mt-4 md:mt-8 text-center text-xs md:text-base italic text-[#2D2C2A]/70 px-4">
              "Your changes are saved automatically."
            </p>
          </div>

          {/* Logout Option */}
          {onLogout && (
            <div className="pt-4 md:pt-6 sketch-hborder-top">
              <button
                onClick={onLogout}
                className="w-full py-2 md:py-3 px-4 font-bold text-red-800 hover:bg-red-50 transition-colors sketch-border uppercase tracking-wider text-center text-sm md:text-base"
              >
                Log Out
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
