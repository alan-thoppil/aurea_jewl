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

// Helper to map dummy Unsplash image IDs to local transparent PNG files
const getLocalOverlayUrl = (id: string, category: string): string => {
  switch (id) {
    case 'n1': return '/images/diamond_necklace.png';
    case 'n2': return '/images/kundan_choker.png';
    case 'e1': return '/images/diamond_chandelier_earrings.png';
    case 'e2': return '/images/pearl_studs.png';
    case 'r1': return '/images/ring.png';
    case 'r2': return '/images/ring.png';
    case 'b1': return '/images/bangle_single.png';
    default:
      if (category === 'Necklaces') return '/images/diamond_necklace.png';
      if (category === 'Earrings') return '/images/diamond_chandelier_earrings.png';
      if (category === 'Rings') return '/images/ring.png';
      if (category === 'Bangles') return '/images/bangle_single.png';
      return '/images/placeholder.png';
  }
};

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

  // Preload selected ornament images using the transparent local PNG paths
  useEffect(() => {
    selectedOrnaments.forEach(ornament => {
      if (!imageCache.has(ornament.id)) {
        const img = new Image();
        img.src = getLocalOverlayUrl(ornament.id, ornament.category);
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

          // Apply soft shimmer pulsing
          const shimmer = Math.sin(Date.now() * 0.003) * 0.08 + 0.92;
          ctx.globalAlpha = shimmer;

          // Add drop shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 8;

          if (ornament.category === 'Necklaces') {
            if (face && face.length > 0) {
              // High-Fidelity Chin and Cheek Mesh Alignment (stabilized)
              const leftCheek = face[234];
              const rightCheek = face[454];
              const chin = face[152];
              const forehead = face[10];
              const nose = face[1];

              const dx = rightCheek.x - leftCheek.x;
              const dy = rightCheek.y - leftCheek.y;
              const angle = Math.atan2(dy, dx);

              const faceHeight = Math.sqrt(Math.pow(forehead.x - chin.x, 2) + Math.pow(forehead.y - chin.y, 2));
              const cheekDist = Math.sqrt(Math.pow(rightCheek.x - leftCheek.x, 2) + Math.pow(rightCheek.y - leftCheek.y, 2));

              const cx = ((1 - leftCheek.x) + (1 - rightCheek.x)) / 2 * cw;
              const cy = chin.y * ch + faceHeight * ch * 0.58;
              const width = cheekDist * cw * 1.9;
              const height = width * (img.height / img.width);

              // 3D perspective squish based on yaw
              const midFaceX = (leftCheek.x + rightCheek.x) / 2;
              const maxOffset = cheekDist / 2;
              const yawOffset = (nose.x - midFaceX) / maxOffset;
              const scaleX = Math.max(0.4, 1 - Math.abs(yawOffset) * 0.45);

              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(angle);
              ctx.scale(scaleX, 1.0);
              ctx.drawImage(img, -width / 2, 0, width, height);
              ctx.restore();
            } else if (pose && pose.length > 0) {
              // Pose landmarks fallback: 11 (left shoulder), 12 (right shoulder)
              const leftShoulder = pose[11];
              const rightShoulder = pose[12];
              const neckX = (leftShoulder.x + rightShoulder.x) / 2;
              const neckY = (leftShoulder.y + rightShoulder.y) / 2;
              const cx = (1 - neckX) * cw;
              const cy = neckY * ch + (ch * 0.02);
              const width = Math.abs(leftShoulder.x - rightShoulder.x) * cw * 0.7;
              const height = width * (img.height / img.width);

              ctx.save();
              ctx.translate(cx, cy);
              ctx.drawImage(img, -width / 2, -height / 2, width, height);
              ctx.restore();
            }
          } 
          else if (ornament.category === 'Earrings' && face && face.length > 0) {
            // Symmetrical Twin Earlobe Anchors
            const leftEar = face[234];
            const rightEar = face[454];
            const faceWidth = Math.sqrt(Math.pow(rightEar.x - leftEar.x, 2) + Math.pow(rightEar.y - leftEar.y, 2));

            const earringWidth = faceWidth * cw * 0.15;
            const height = earringWidth * (img.height / img.width);

            // Left Earlobe
            const cxL = (1 - leftEar.x) * cw;
            const cyL = leftEar.y * ch + earringWidth * 0.58;

            ctx.save();
            ctx.drawImage(img, cxL - earringWidth / 2, cyL, earringWidth, height);
            ctx.restore();

            // Right Earlobe (mirrored)
            const cxR = (1 - rightEar.x) * cw;
            const cyR = rightEar.y * ch + earringWidth * 0.58;

            ctx.save();
            ctx.translate(cxR, cyR + height / 2);
            ctx.scale(-1, 1);
            ctx.drawImage(img, -earringWidth / 2, -height / 2, earringWidth, height);
            ctx.restore();
          }
          else if (ornament.category === 'Rings' && hand && hand.length > 0) {
            // Ring Finger Joint Alignment (13 MCP, 14 PIP)
            const mcp = hand[13];
            const pip = hand[14];

            const cx = ((1 - mcp.x) + (1 - pip.x)) / 2 * cw;
            const cy = (mcp.y + pip.y) / 2 * ch;

            const dx = (1 - pip.x) - (1 - mcp.x);
            const dy = pip.y - mcp.y;
            const angle = Math.atan2(dy, dx);

            const dist = Math.sqrt(Math.pow((1 - pip.x) - (1 - mcp.x), 2) + Math.pow(pip.y - mcp.y, 2));
            const width = dist * cw * 1.8;
            const height = width * (img.height / img.width);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle + Math.PI / 2);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
          }
          else if (ornament.category === 'Bangles' && hand && hand.length > 0) {
            // Wrist alignment
            const wrist = hand[0];
            const indexMcp = hand[5];

            const cx = (1 - wrist.x) * cw;
            const cy = wrist.y * ch;

            const dist = Math.sqrt(Math.pow((1 - indexMcp.x) - (1 - wrist.x), 2) + Math.pow(indexMcp.y - wrist.y, 2));
            const width = dist * cw * 2.5;
            const height = width * (img.height / img.width);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            ctx.restore();
          }

          // Reset draw properties
          ctx.shadowColor = 'transparent';
          ctx.globalAlpha = 1.0;
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
