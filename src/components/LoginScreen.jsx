import React, { useState } from 'react';
import { motion } from "motion/react";

export default function LoginScreen({ onJoin, loading }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (isRegister) {
      if (!username.trim() || !email.trim() || !password.trim()) return;
      onJoin({ username, email, password }, true);
    } else {
      if (!username.trim() || !password.trim()) return;
      // In login mode, "username" state holds either username or email
      onJoin({ username, password }, false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center text-[#2D2C2A] p-4 md:p-6 font-['Kalam'] relative bg-[#F4EFE6] bg-[url('/parchment-texture.png')] bg-cover bg-center overflow-y-auto">

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="mb-4 md:mb-6 flex items-center justify-center shrink-0"
      >
        <img src={"/heart-character.png"} alt="Scribe Chat Heart" className="w-16 h-16 md:w-24 md:h-24 object-contain" />
      </motion.div>

      <h1 className="text-3xl md:text-5xl font-bold mb-8 md:mb-16 tracking-widest uppercase text-center">SCRIBE CHAT</h1>

      <div className="w-full max-w-sm px-2 md:px-0 space-y-6 md:space-y-8 flex flex-col items-center">
        
        {isRegister && (
          <div className="relative w-full">
            <input
              className="w-full bg-transparent p-2 pb-3 text-center text-lg md:text-xl outline-none placeholder-gray-500/70"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 pointer-events-none text-[#2D2C2A]">
              <path d="M 0 5 Q 75 3 150 6 T 300 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <div className="relative w-full">
          <input
            className="w-full bg-transparent p-2 pb-3 text-center text-lg md:text-xl outline-none placeholder-gray-500/70"
            placeholder={isRegister ? "Choose a username" : "Username or Email"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 pointer-events-none text-[#2D2C2A]">
            <path d="M 5 6 Q 80 8 160 5 T 295 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>

        <div className="relative w-full">
          <input
            className="w-full bg-transparent p-2 pb-3 text-center text-lg md:text-xl outline-none placeholder-gray-500/70"
            placeholder="Secret word (Password)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 pointer-events-none text-[#2D2C2A]">
            <path d="M 2 4 Q 80 6 150 3 T 298 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative w-20 h-20 md:w-28 md:h-28 mt-2 md:mt-4 flex items-center justify-center group">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2D2C2A] pointer-events-none transition-transform group-hover:scale-105 duration-300">
            <path d="M 50,4 C 75,2 96,20 95,50 C 94,80 75,98 50,96 C 25,94 4,75 6,50 C 8,25 25,6 50,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 50,8 C 72,5 92,25 90,50 C 88,75 72,92 50,91 C 28,90 10,75 11,50 C 12,28 28,10 50,8 Z" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          </svg>
          <button
            disabled={loading || !username.trim() || !password.trim() || (isRegister && !email.trim())}
            onClick={handleSubmit}
            className="relative w-full h-full font-bold text-base md:text-xl rounded-full hover:bg-[#2D2C2A]/5 transition-all disabled:opacity-30 flex items-center justify-center z-10 uppercase"
          >
            {loading ? '...' : isRegister ? 'Join' : 'Enter'}
          </button>
        </div>
      </div>

      <div className="mt-8 md:mt-0 md:absolute md:bottom-10 text-xs md:text-sm opacity-80 flex gap-1 items-center justify-center text-center px-4">
        {isRegister ? (
          <>Already have a parchment? <span onClick={() => setIsRegister(false)} className="border-b-[2px] border-[#2D2C2A] cursor-pointer hover:opacity-70 transition-opacity">Read yours.</span></>
        ) : (
          <>New to the parchment? <span onClick={() => setIsRegister(true)} className="border-b-[2px] border-[#2D2C2A] cursor-pointer hover:opacity-70 transition-opacity">Write your name here.</span></>
        )}
      </div>
    </div>
  );
}