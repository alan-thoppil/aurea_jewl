'use client';

import { useStudioStore } from '@/store/useStudioStore';
import { Download, ShoppingCart, Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function ActionPanel() {
  const { selectedOrnaments, uploadedPhoto, isARMode, isGeneratingAI, setAIGenerating, setUploadedPhoto } = useStudioStore();

  const totalValue = selectedOrnaments.reduce((sum, item) => sum + item.price, 0);

  const handleAIGenerate = async () => {
    // Only works in Photo Mode (where fabricCanvas is active)
    if (isARMode || !uploadedPhoto || selectedOrnaments.length === 0) return;
    
    const getDataUrl = (window as any).getStudioCanvasDataUrl;
    if (!getDataUrl) return;

    setAIGenerating(true);
    try {
      const dataUrl = getDataUrl();
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const data = await res.json();
      if (data.url) {
        // Replace current canvas photo with the generated masterpiece
        setUploadedPhoto(data.url);
        // We could also clear selectedOrnaments here if we wanted them completely baked in, 
        // but keeping them allows the cart functionality to remain active.
      } else {
        alert(data.error || "Failed to generate portrait.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during generation.");
    } finally {
      setAIGenerating(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl glass-heavy p-4 rounded-2xl border border-gold/20 shadow-2xl flex items-center justify-between z-50 animate-slide-up" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(10,10,10,0.85)' }}>
      
      <div className="flex flex-col px-2">
        <span className="text-gray-400 text-xs">Total Value ({selectedOrnaments.length} items)</span>
        <span className="gold-text-gradient font-serif text-2xl">
          ₹{totalValue.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="flex gap-3">
        {!isARMode && uploadedPhoto && selectedOrnaments.length > 0 && (
          <button 
            onClick={handleAIGenerate}
            disabled={isGeneratingAI}
            className="hidden md:flex shimmer-btn px-6 py-3 rounded-full text-black font-semibold items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Wand2 size={18} />
            <span>Generate Luxury Portrait</span>
          </button>
        )}

        <button 
          disabled={!uploadedPhoto && !isARMode}
          className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Download Look"
        >
          <Download size={20} />
        </button>
        <button 
          disabled={selectedOrnaments.length === 0}
          className="shimmer-btn px-6 py-3 rounded-full text-black font-semibold flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
