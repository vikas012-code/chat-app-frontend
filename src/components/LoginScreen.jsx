import React, { useState } from 'react';
import { motion } from "motion/react";

export default function LoginScreen({ onJoin, loading }) {
  const [val, setVal] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center text-[#2D2C2A] p-6 font-['Kalam'] relative bg-[#F4EFE6] bg-[url('/parchment-texture.png')] bg-cover bg-center">
      
      {/* Replaced the pen emoji box with the heart icon and added smooth animation */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="mb-6 flex items-center justify-center"
      >
        {/* Replace with your actual heart character SVG or image */}
        <img src={"/heart-character.png"} alt="Scribe Chat Heart" className="w-24 h-24 object-contain" />
      </motion.div>
      
      <h1 className="text-5xl font-bold mb-16 tracking-widest uppercase">SCRIBE CHAT</h1>
      
      <div className="w-full max-w-sm space-y-12 flex flex-col items-center">
        {/* Updated inputs to use a sketchy SVG underline */}
        <div className="relative w-full">
          <input
            className="w-full bg-transparent p-2 pb-3 text-center text-xl outline-none placeholder-gray-500/70"
            placeholder="Who are you?"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
          />
          <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 pointer-events-none text-[#2D2C2A]">
            <path d="M 0 5 Q 75 3 150 6 T 300 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 5 6 Q 80 8 160 5 T 295 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>
        <div className="relative w-full">
          <input
            className="w-full bg-transparent p-2 pb-3 text-center text-xl outline-none placeholder-gray-500/70"
            placeholder="Secret word..."
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onJoin(val)}
          />
          <svg viewBox="0 0 300 10" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-2 pointer-events-none text-[#2D2C2A]">
            <path d="M 2 4 Q 80 6 150 3 T 298 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 8 5 Q 85 7 160 4 T 292 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>
        
        <div className="relative w-28 h-28 mt-8 flex items-center justify-center group">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2D2C2A] pointer-events-none transition-transform group-hover:scale-105 duration-300">
            {/* Outer sketchy circle */}
            <path d="M 50,4 C 75,2 96,20 95,50 C 94,80 75,98 50,96 C 25,94 4,75 6,50 C 8,25 25,6 50,4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Inner sketchy circle */}
            <path d="M 50,8 C 72,5 92,25 90,50 C 88,75 72,92 50,91 C 28,90 10,75 11,50 C 12,28 28,10 50,8 Z" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          </svg>
          <button
            disabled={loading || !val.trim()}
            onClick={() => onJoin(val)}
            className="relative w-full h-full font-bold text-xl rounded-full hover:bg-[#2D2C2A]/5 transition-all disabled:opacity-30 flex items-center justify-center z-10"
          >
            {loading ? '...' : 'ENTER'}
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 text-sm opacity-80 flex gap-1 items-center">
        New to the parchment? <span className="border-b-[2px] border-[#2D2C2A] cursor-pointer hover:opacity-70 transition-opacity">Write your name here.</span>
      </div>
    </div>
  );
}