'use client';

import Sidebar from '@/components/studio/Sidebar';
import Link from 'next/link';
import { ArrowLeft, Video, Image as ImageIcon } from 'lucide-react';
import { useStudioStore } from '@/store/useStudioStore';
import dynamic from 'next/dynamic';

// Dynamically import client-only canvas components with SSR disabled to prevent pre-rendering failures
const PhotoCanvas = dynamic(() => import('@/components/studio/PhotoCanvas'), { ssr: false });
const ARCanvas = dynamic(() => import('@/components/studio/ARCanvas'), { ssr: false });
const ActionPanel = dynamic(() => import('@/components/studio/ActionPanel'), { ssr: false });

export default function StudioPage() {
  const { isARMode, toggleARMode } = useStudioStore();

  return (
    <main className="h-screen w-screen bg-[#0B0B0B] relative overflow-hidden flex flex-col md:flex-row">
      {/* Cinematic Noise Overlay */}
      <div className="noise-overlay absolute inset-0 pointer-events-none z-0"></div>

      {/* Top Left Navigation (Absolute) */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium tracking-wide uppercase">Exit Studio</span>
        </Link>
      </div>

      {/* Top Right AR Toggle (Absolute) */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleARMode}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-gold/30 text-white hover:bg-gold/10 transition-colors shadow-xl"
        >
          {isARMode ? (
            <>
              <ImageIcon size={16} className="text-gold" />
              <span className="text-xs uppercase tracking-widest font-semibold">Photo Mode</span>
            </>
          ) : (
            <>
              <Video size={16} className="text-gold" />
              <span className="text-xs uppercase tracking-widest font-semibold">Live AR Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas Area - Takes up remaining space */}
      <div className="flex-1 h-[60vh] md:h-full relative z-10 pt-20 md:pt-0">
        {isARMode ? <ARCanvas /> : <PhotoCanvas />}
        <ActionPanel />
      </div>

      {/* Sidebar Area - Fixed width on desktop, flexible on mobile */}
      <div className="w-full h-[40vh] md:w-[400px] lg:w-[450px] md:h-full z-20 relative">
        <Sidebar />
      </div>

    </main>
  );
}
