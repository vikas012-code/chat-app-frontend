import React, { useEffect } from 'react';
import { motion } from "motion/react";
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5" />;
      case 'info':
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return '#166534'; // green
      case 'error':
        return '#991b1b'; // red
      case 'info':
      default:
        return '#2D2C2A'; // dark
    }
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-6 right-6 z-50 max-w-sm"
      style={{
        border: '1.5px solid #2D2C2A',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        backgroundColor: '#F4EFE6',
        boxShadow: '2px 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4">
        <div style={{ color: getBgColor() }}>
          {getIcon()}
        </div>
        <p className="flex-1 text-sm md:text-base font-['Kalam'] text-[#2D2C2A]">
          {message}
        </p>
        <button
          onClick={onClose}
          className="ml-2 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{ color: getBgColor() }}
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}