import React from 'react';
import html2canvas from 'html2canvas';
import { Camera, Download } from 'lucide-react';

export const ScreenshotCapture = ({ targetRef }) => {
  const handleCapture = async () => {
    if (!targetRef.current) return;
    
    try {
      const canvas = await html2canvas(targetRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `AUREA-Virtual-TryOn-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
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
