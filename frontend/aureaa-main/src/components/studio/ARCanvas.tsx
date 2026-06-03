'use client';

import { useStudioStore, Ornament } from '@/store/useStudioStore';
import { useCamera } from '@/hooks/useCamera';
import { useFaceTracking } from '@/hooks/useFaceTracking';
import { useHandTracking } from '@/hooks/useHandTracking';
import { usePoseTracking } from '@/hooks/usePoseTracking';
import { useEffect, useRef, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';

interface Component {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  pixelCount: number;
}

const keyOutBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 235 && g > 235 && b > 235) {
      data[i + 3] = 0;
    } else if (r > 215 && g > 215 && b > 215) {
      data[i + 3] = 100;
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

const findConnectedComponents = (img: HTMLImageElement): Component[] => {
  const downscaledSize = 256;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = downscaledSize;
  tempCanvas.height = downscaledSize;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return [];

  tempCtx.drawImage(img, 0, 0, downscaledSize, downscaledSize);
  const imgData = tempCtx.getImageData(0, 0, downscaledSize, downscaledSize);
  const pixels = imgData.data;

  const visited = new Uint8Array(downscaledSize * downscaledSize);
  const components: Component[] = [];

  const isBg = (x: number, y: number) => {
    const idx = (y * downscaledSize + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    return r > 235 && g > 235 && b > 235;
  };

  for (let y = 0; y < downscaledSize; y++) {
    for (let x = 0; x < downscaledSize; x++) {
      const idx = y * downscaledSize + x;
      if (visited[idx] || isBg(x, y)) continue;

      let minX = x, maxX = x, minY = y, maxY = y;
      const queue = [x, y];
      let head = 0;
      visited[idx] = 1;

      while (head < queue.length) {
        const cx = queue[head++];
        const cy = queue[head++];

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < downscaledSize && ny >= 0 && ny < downscaledSize) {
            const nIdx = ny * downscaledSize + nx;
            if (!visited[nIdx] && !isBg(nx, ny)) {
              visited[nIdx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      const cWidth = maxX - minX + 1;
      const cHeight = maxY - minY + 1;
      const pixelCount = queue.length / 2;

      if (pixelCount > 15) {
        components.push({
          minX,
          maxX,
          minY,
          maxY,
          width: cWidth,
          height: cHeight,
          pixelCount
        });
      }
    }
  }

  components.sort((a, b) => b.pixelCount - a.pixelCount);
  return components;
};

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

  // Determine if any selected ornaments have their required body parts missing
  let guidanceMessage = '';
  if (streamActive) {
    const hasHandOrnament = selectedOrnaments.some(o => o.category === 'Rings' || o.category === 'Bangles');
    const hasNecklaceOrnament = selectedOrnaments.some(o => o.category === 'Necklaces');
    const hasEarringOrnament = selectedOrnaments.some(o => o.category === 'Earrings');

    if (hasHandOrnament && (!handLandmarks || handLandmarks.length === 0)) {
      guidanceMessage = "Hand not detected. Please place your hand in front of the camera.";
    } else if (hasNecklaceOrnament && (!faceLandmarks || faceLandmarks.length === 0) && (!poseLandmarks || poseLandmarks.length === 0)) {
      guidanceMessage = "Neck not detected. Please center your face/neck in the camera view.";
    } else if (hasEarringOrnament && (!faceLandmarks || faceLandmarks.length === 0)) {
      guidanceMessage = "Ears not detected. Please center your face in the camera view.";
    }
  }

  // Preload selected ornament images and apply CCA splitting/cropping
  useEffect(() => {
    selectedOrnaments.forEach(ornament => {
      const cacheKey = ornament.id;
      if (!imageCache.has(cacheKey)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const components = findConnectedComponents(img);
          const category = ornament.category.toLowerCase();
          
          const scaleX = img.width / 256;
          const scaleY = img.height / 256;

          // Treat as a combo set ONLY if it has 3+ components AND the smaller components are symmetrical earrings.
          // This prevents multi-loop layered chains (e.g. Lightweight Chain) from being incorrectly split into earrings!
          const isComboSet = category.includes('necklace') && 
            components.length >= 3 && (() => {
              const center1 = (components[1].minX + components[1].maxX) / 2;
              const center2 = (components[2].minX + components[2].maxX) / 2;
              return (
                (center1 - 128) * (center2 - 128) < 0 &&
                Math.abs(Math.abs(center1 - 128) - Math.abs(center2 - 128)) < 12 &&
                Math.abs(components[1].minY - components[2].minY) < 12 &&
                Math.abs(components[1].width - components[2].width) < 10 &&
                Math.abs(components[1].height - components[2].height) < 10
              );
            })();

          const hasEarringPair = category.includes('earring') && 
            components.length >= 2 && (() => {
              const center0 = (components[0].minX + components[0].maxX) / 2;
              const center1 = (components[1].minX + components[1].maxX) / 2;
              return (center0 - 128) * (center1 - 128) < 0;
            })();

          if (isComboSet) {
            // Split into cropped necklace and earring textures
            const mainComp = components[0];
            const earringComp = components[1];

            // 1. Crop Necklace and erase earrings
            const neckCanvas = document.createElement("canvas");
            neckCanvas.width = img.width;
            neckCanvas.height = img.height;
            const neckCtx = neckCanvas.getContext("2d");
            if (neckCtx) {
              neckCtx.drawImage(img, 0, 0);
              keyOutBackground(neckCtx, img.width, img.height);
              for (let i = 1; i < components.length; i++) {
                const comp = components[i];
                const ex = Math.max(0, Math.floor(comp.minX * scaleX));
                const ey = Math.max(0, Math.floor(comp.minY * scaleY));
                const ew = Math.min(img.width - ex, Math.ceil(comp.width * scaleX));
                const eh = Math.min(img.height - ey, Math.ceil(comp.height * scaleY));
                neckCtx.clearRect(ex, ey, ew, eh);
              }

              // Recompute tight bounding box
              const neckData = neckCtx.getImageData(0, 0, img.width, img.height).data;
              let tightMinX = img.width, tightMaxX = 0, tightMinY = img.height, tightMaxY = 0;
              let hasNeckPixels = false;
              for (let y = 0; y < img.height; y++) {
                for (let x = 0; x < img.width; x++) {
                  const idx = (y * img.width + x) * 4;
                  if (neckData[idx + 3] > 0) {
                    hasNeckPixels = true;
                    if (x < tightMinX) tightMinX = x;
                    if (x > tightMaxX) tightMaxX = x;
                    if (y < tightMinY) tightMinY = y;
                    if (y > tightMaxY) tightMaxY = y;
                  }
                }
              }
              const tW = hasNeckPixels ? (tightMaxX - tightMinX + 1) : img.width;
              const tH = hasNeckPixels ? (tightMaxY - tightMinY + 1) : img.height;
              const tX = hasNeckPixels ? tightMinX : 0;
              const tY = hasNeckPixels ? tightMinY : 0;

              const finalNeckCanvas = document.createElement("canvas");
              finalNeckCanvas.width = tW;
              finalNeckCanvas.height = tH;
              const finalNeckCtx = finalNeckCanvas.getContext("2d");
              if (finalNeckCtx) {
                finalNeckCtx.drawImage(neckCanvas, tX, tY, tW, tH, 0, 0, tW, tH);
                (finalNeckCanvas as any).complete = true;
                imageCache.set(cacheKey, finalNeckCanvas as any);
              }
            }

            // 2. Crop Earring
            const earX = Math.max(0, Math.floor(earringComp.minX * scaleX));
            const earY = Math.max(0, Math.floor(earringComp.minY * scaleY));
            const earW = Math.min(img.width - earX, Math.ceil(earringComp.width * scaleX));
            const earH = Math.min(img.height - earY, Math.ceil(earringComp.height * scaleY));

            const earCanvas = document.createElement("canvas");
            earCanvas.width = earW;
            earCanvas.height = earH;
            const earCtx = earCanvas.getContext("2d");
            if (earCtx) {
              earCtx.drawImage(img, earX, earY, earW, earH, 0, 0, earW, earH);
              keyOutBackground(earCtx, earW, earH);
              const sqSize = Math.max(earW, earH);
              const sqCanvas = document.createElement("canvas");
              sqCanvas.width = sqSize;
              sqCanvas.height = sqSize;
              const sqCtx = sqCanvas.getContext("2d");
              if (sqCtx) {
                const offsetX = (sqSize - earW) / 2;
                const offsetY = (sqSize - earH) / 2;
                sqCtx.drawImage(earCanvas, offsetX, offsetY);
                (sqCanvas as any).complete = true;
                imageCache.set(`${cacheKey}_earring`, sqCanvas as any);
              }
            }
          } else if (hasEarringPair) {
            // Crop single earring
            const earringComp = components[0];
            const earX = Math.max(0, Math.floor(earringComp.minX * scaleX));
            const earY = Math.max(0, Math.floor(earringComp.minY * scaleY));
            const earW = Math.min(img.width - earX, Math.ceil(earringComp.width * scaleX));
            const earH = Math.min(img.height - earY, Math.ceil(earringComp.height * scaleY));

            const earCanvas = document.createElement("canvas");
            earCanvas.width = earW;
            earCanvas.height = earH;
            const earCtx = earCanvas.getContext("2d");
            if (earCtx) {
              earCtx.drawImage(img, earX, earY, earW, earH, 0, 0, earW, earH);
              keyOutBackground(earCtx, earW, earH);
              const sqSize = Math.max(earW, earH);
              const sqCanvas = document.createElement("canvas");
              sqCanvas.width = sqSize;
              sqCanvas.height = sqSize;
              const sqCtx = sqCanvas.getContext("2d");
              if (sqCtx) {
                const offsetX = (sqSize - earW) / 2;
                const offsetY = (sqSize - earH) / 2;
                sqCtx.drawImage(earCanvas, offsetX, offsetY);
                (sqCanvas as any).complete = true;
                imageCache.set(cacheKey, sqCanvas as any);
              }
            }
          } else {
            // General single item: key out background and crop to tightest bounding box
            let minX = 255, maxX = 0, minY = 255, maxY = 0;
            if (components.length > 0) {
              components.forEach(c => {
                if (c.minX < minX) minX = c.minX;
                if (c.maxX > maxX) maxX = c.maxX;
                if (c.minY < minY) minY = c.minY;
                if (c.maxY > maxY) maxY = c.maxY;
              });
            } else {
              minX = 0; maxX = 255; minY = 0; maxY = 255;
            }
            const compWidth = maxX - minX + 1;
            const compHeight = maxY - minY + 1;
            const cX = Math.max(0, Math.floor(minX * scaleX));
            const cY = Math.max(0, Math.floor(minY * scaleY));
            const cW = Math.min(img.width - cX, Math.ceil(compWidth * scaleX));
            const cH = Math.min(img.height - cY, Math.ceil(compHeight * scaleY));

            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = cW;
            cropCanvas.height = cH;
            const cropCtx = cropCanvas.getContext("2d");
            if (cropCtx) {
              cropCtx.drawImage(img, cX, cY, cW, cH, 0, 0, cW, cH);
              keyOutBackground(cropCtx, cW, cH);
              (cropCanvas as any).complete = true;
              imageCache.set(cacheKey, cropCanvas as any);
            }
          }
        };
        img.src = getLocalOverlayUrl(ornament.id, ornament.category);
        imageCache.set(cacheKey, img); // Set temporarily
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

              // Draw set earrings if split
              const earImg = imageCache.get(ornament.id + "_earring");
              if (earImg && (earImg as any).complete) {
                const earringWidth = cheekDist * cw * 0.15;
                const earringHeight = earringWidth; // square

                // Left Earlobe
                const cxL = (1 - leftCheek.x) * cw;
                const cyL = leftCheek.y * ch + earringWidth * 0.58;

                ctx.save();
                ctx.drawImage(earImg, cxL - earringWidth / 2, cyL, earringWidth, earringHeight);
                ctx.restore();

                // Right Earlobe (mirrored)
                const cxR = (1 - rightCheek.x) * cw;
                const cyR = rightCheek.y * ch + earringWidth * 0.58;

                ctx.save();
                ctx.translate(cxR, cyR + earringHeight / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(earImg, -earringWidth / 2, -earringHeight / 2, earringWidth, earringHeight);
                ctx.restore();
              }
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

        {guidanceMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 px-6 py-3 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-pulse select-none max-w-[90%] text-center">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
            <span className="text-[10px] tracking-wider uppercase text-zinc-300 font-bold">
              {guidanceMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
