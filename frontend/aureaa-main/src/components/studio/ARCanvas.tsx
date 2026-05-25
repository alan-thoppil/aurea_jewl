'use client';

import { useStudioStore, Ornament } from '@/store/useStudioStore';
import { useCamera } from '@/hooks/useCamera';
import { useFaceTracking } from '@/hooks/useFaceTracking';
import { useHandTracking } from '@/hooks/useHandTracking';
import { usePoseTracking } from '@/hooks/usePoseTracking';
import { useEffect, useRef, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';

// Caching images to avoid reloading every frame
const imageCache = new Map<string, HTMLImageElement>();

export default function ARCanvas() {
  const { selectedOrnaments } = useStudioStore();
  const { videoRef, startCamera, stopCamera, streamActive, error } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Set video element once it's active
  useEffect(() => {
    if (streamActive && videoRef.current) {
      setVideoEl(videoRef.current);
    }
  }, [streamActive]);

  const { landmarks: faceLandmarks } = useFaceTracking(videoEl, true);
  const { landmarks: handLandmarks } = useHandTracking(videoEl, true);
  const { landmarks: poseLandmarks } = usePoseTracking(videoEl, true);

  // Store latest landmarks in ref for the animation loop
  const trackingData = useRef({ face: faceLandmarks, hand: handLandmarks, pose: poseLandmarks });
  useEffect(() => {
    trackingData.current = { face: faceLandmarks, hand: handLandmarks, pose: poseLandmarks };
  }, [faceLandmarks, handLandmarks, poseLandmarks]);

  // Preload selected ornament images
  useEffect(() => {
    selectedOrnaments.forEach(ornament => {
      if (!imageCache.has(ornament.id)) {
        const img = new Image();
        img.src = ornament.imageUrl;
        img.crossOrigin = "anonymous";
        imageCache.set(ornament.id, img);
      }
    });
  }, [selectedOrnaments]);

  // Main Render Loop
  const renderFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle canvas sizing
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
        
        const cw = canvas.width;
        const ch = canvas.height;

        // Draw Video feed (mirrored)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-cw, 0);
        ctx.drawImage(video, 0, 0, cw, ch);
        ctx.restore();

        const { face, hand, pose } = trackingData.current;

        // Draw Ornaments
        selectedOrnaments.forEach(ornament => {
          const img = imageCache.get(ornament.id);
          if (!img || !img.complete) return;

          let cx = 0;
          let cy = 0;
          let width = 0;
          let rotation = 0;
          let shouldDraw = false;

          if (ornament.category === 'Necklaces' && pose && pose.length > 0) {
            // Pose landmarks: 11 (left shoulder), 12 (right shoulder), 0 (nose)
            const leftShoulder = pose[11];
            const rightShoulder = pose[12];
            
            // Average shoulder position for neck base
            const neckX = (leftShoulder.x + rightShoulder.x) / 2;
            const neckY = (leftShoulder.y + rightShoulder.y) / 2;
            
            // Since video is mirrored, we invert X
            cx = (1 - neckX) * cw;
            cy = neckY * ch - (ch * 0.05); // slightly above shoulders
            width = Math.abs(leftShoulder.x - rightShoulder.x) * cw * 0.8;
            shouldDraw = true;
          } 
          else if (ornament.category === 'Earrings' && face && face.length > 0) {
            // FaceMesh landmarks: left ear tragus (164 approx), right ear tragus (390 approx)
            // Wait, using simplified fallback to cheekbones if exact IDs are wrong
            const leftEar = face[234]; 
            const rightEar = face[454];

            // Render twice (left and right) if we want a pair, but the PNG might already be a pair.
            // If the PNG is a pair, we place it in the center of the face.
            const nose = face[1];
            cx = (1 - nose.x) * cw;
            cy = nose.y * ch + (ch * 0.05);
            width = Math.abs(leftEar.x - rightEar.x) * cw * 1.5;
            shouldDraw = true;
          }
          else if (ornament.category === 'Rings' && hand && hand.length > 0) {
            // Ring finger proximal phalanx is landmark 13, MCP is 13, PIP is 14
            const ringMcp = hand[13];
            const ringPip = hand[14];
            
            cx = (1 - ringMcp.x) * cw;
            cy = ringMcp.y * ch;
            width = Math.abs(ringMcp.x - ringPip.x) * cw * 1.5;
            
            // Calculate rotation
            rotation = Math.atan2(ringPip.y - ringMcp.y, (1 - ringPip.x) - (1 - ringMcp.x));
            shouldDraw = true;
          }
          else if (ornament.category === 'Bangles' && hand && hand.length > 0) {
            // Wrist is landmark 0
            const wrist = hand[0];
            const indexMcp = hand[5]; // to calculate size
            
            cx = (1 - wrist.x) * cw;
            cy = wrist.y * ch;
            width = Math.abs(wrist.x - indexMcp.x) * cw * 2.5;
            shouldDraw = true;
          }

          if (shouldDraw) {
            // Calculate height maintaining aspect ratio
            const height = width * (img.height / img.width);

            // Add drop shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 10;

            ctx.save();
            ctx.translate(cx, cy);
            if (rotation !== 0) ctx.rotate(rotation);
            // Draw image centered
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
          }
        });
      }
    }
    requestRef.current = requestAnimationFrame(renderFrame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 rounded-xl glass-panel-heavy">
        <CameraOff className="text-red-500 mb-4" size={48} />
        <p className="text-white text-center px-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-8">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-gold/40"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-gold/40"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-gold/40"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-gold/40"></div>

      <div className="w-full max-w-2xl aspect-[3/4] md:aspect-auto md:h-full max-h-[80vh] rounded-xl overflow-hidden glass-panel-heavy relative bg-black">
        
        {/* Hidden video element for MediaPipe processing */}
        <video ref={videoRef} playsInline className="hidden" />

        {/* Realtime Canvas rendering */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover shadow-2xl"
        />

        {!streamActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
            <Loader2 className="animate-spin text-gold mb-4" size={40} />
            <p className="text-white font-serif text-xl tracking-wider">Starting AR Engine...</p>
          </div>
        )}

        {streamActive && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-gold/20 flex items-center gap-2 animate-fadeIn">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-white text-xs uppercase tracking-widest font-semibold">Live AR</span>
          </div>
        )}
      </div>
    </div>
  );
}
