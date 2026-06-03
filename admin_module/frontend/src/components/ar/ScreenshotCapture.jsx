import React from 'react';
import { Camera } from 'lucide-react';

export const ScreenshotCapture = ({ compositeCanvasRef }) => {
  const handleCapture = () => {
    const canvas = compositeCanvasRef?.current;
    if (!canvas) {
      console.error("Screenshot capture failed: Composite canvas not ready.");
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.download = `AUREA-Virtual-TryOn-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      console.log("Screenshot successfully captured via native Canvas 2D API!");
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }
  };

  return (
    <button
      onClick={handleCapture}
      className="absolute bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 bg-black/80 border border-gold-500/50 rounded-full text-gold-500 hover:bg-gold-500 hover:text-black transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
      title="Capture Snapshot"
    >
      <Camera size={24} />
    </button>
  );
};

