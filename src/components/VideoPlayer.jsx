import React, { useEffect, useRef } from 'react';

export default function VideoPlayer({ stream, muted }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className="w-full h-full object-contain"
    />
  );
}
