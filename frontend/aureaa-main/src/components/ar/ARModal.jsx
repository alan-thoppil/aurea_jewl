import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Bug, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CameraFeed } from './CameraFeed';
import { LandmarkTracker } from './LandmarkTracker';
import { ARCanvas } from './ARCanvas';
import { ScreenshotCapture } from './ScreenshotCapture';
import { ProductSelector } from './ProductSelector';
import * as THREE from 'three';

import { OneEuroFilter, OneEuroFilter3D } from '@/utils/ar/OneEuroFilter';
import { 
  estimateHeadPose, 
  calculateEarPositions, 
  calculateRingAlignment, 
  calculateBangleAlignment 
} from '@/utils/ar/poseEstimation';

const ARModal = () => {
  const { arModalOpen, setArModalOpen, initialProduct } = useStore();
  
  const [videoElement, setVideoElement] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Developer Debugging States
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugMetrics, setDebugMetrics] = useState({
    fps: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    depth: 0,
    scale: 0,
    trackingConfidence: 0,
  });
  const [activeLandmarks, setActiveLandmarks] = useState(null);

  const containerRef = useRef(null);
  const compositeCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Real-time FPS Calculation references
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Memoize One Euro Filters to persist across renders for premium stabilization
  const positionFilter = useMemo(() => new OneEuroFilter3D(0.4, 0.015, 1.0), []); // minCutoff, beta
  const scaleFilter = useMemo(() => new OneEuroFilter(0.6, 0.01, 1.0), []);
  const rotationFilter = useMemo(() => new OneEuroFilter3D(0.2, 0.005, 1.0), []); // Filters Pitch, Yaw, Roll

  useEffect(() => {
    if (initialProduct && arModalOpen) {
      setActiveProduct(initialProduct);
    }
    if (arModalOpen) {
      setIsLoading(true);
    } else {
      setVideoElement(null);
      positionFilter.reset();
      scaleFilter.reset();
      rotationFilter.reset();
      setActiveLandmarks(null);
    }
  }, [initialProduct, arModalOpen, positionFilter, scaleFilter, rotationFilter]);

  // Real-time Canvas 2D API compositor loop
  useEffect(() => {
    let active = true;

    const drawCompositeFrame = () => {
      if (!active) return;

      const canvas = compositeCanvasRef.current;
      const video = videoElement;
      
      // Query the actual <canvas> child or the element itself if it is the canvas
      const rawWebglEl = document.getElementById('ar-webgl-canvas');
      const webglCanvas = rawWebglEl && rawWebglEl.tagName === 'CANVAS'
        ? rawWebglEl
        : (rawWebglEl ? rawWebglEl.querySelector('canvas') : null);

      const isVideoValid = video && video instanceof HTMLVideoElement && video.readyState >= 2;
      const isCanvasValid = webglCanvas && webglCanvas instanceof HTMLCanvasElement;

      if (canvas && isVideoValid) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = video.videoWidth || 1280;
          const height = video.videoHeight || 720;
          
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          // 1. Clear previous content
          ctx.clearRect(0, 0, width, height);

          // 2. Draw Video Frame (Mirror-flipped horizontally to match natural look)
          const isMirrored = true;
          if (isMirrored) {
            ctx.save();
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, width, height);
            ctx.restore();
          } else {
            ctx.drawImage(video, 0, 0, width, height);
          }

          // 3. Draw WebGL jewelry overlay on top
          if (isCanvasValid) {
            ctx.drawImage(webglCanvas, 0, 0, width, height);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawCompositeFrame);
    };

    if (arModalOpen && videoElement) {
      animationFrameRef.current = requestAnimationFrame(drawCompositeFrame);
    }

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [arModalOpen, videoElement]);

  const handleLandmarksUpdate = (data) => {
    setIsLoading(false);
    if (!data) return;

    // Calculate FPS
    const now = performance.now();
    frameCountRef.current += 1;
    let currentFps = debugMetrics.fps;
    if (now - lastFrameTimeRef.current >= 1000) {
      currentFps = Math.round((frameCountRef.current * 1000) / (now - lastFrameTimeRef.current));
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    if (!activeProduct) return;

    const { poseLandmarks, faceLandmarks, leftHandLandmarks, rightHandLandmarks } = data;
    const cat = activeProduct.category.toLowerCase();

    let rawPosition = null;
    let rawScale = null;
    let rawRotation = null; // Can be a Quaternion or basic angle

    // Save key landmarks for the visual SVG debug overlay
    if (debugEnabled) {
      const debugNodes = [];
      if (faceLandmarks) {
        // Nose, chin, eyes outer, earlobes
        [1, 152, 33, 263, 234, 454].forEach(idx => {
          if (faceLandmarks[idx]) debugNodes.push({ ...faceLandmarks[idx], color: '#eab308' }); // yellow
        });
      }
      if (rightHandLandmarks || leftHandLandmarks) {
        const hand = rightHandLandmarks || leftHandLandmarks;
        [0, 5, 13, 14, 17].forEach(idx => {
          if (hand[idx]) debugNodes.push({ ...hand[idx], color: '#3b82f6' }); // blue
        });
      }
      if (poseLandmarks) {
        [11, 12].forEach(idx => {
          if (poseLandmarks[idx]) debugNodes.push({ ...poseLandmarks[idx], color: '#10b981' }); // green
        });
      }
      setActiveLandmarks(debugNodes);
    }

    // A. Estimate Head Pose (Euler & 3D Quaternion)
    const headPose = faceLandmarks ? estimateHeadPose(faceLandmarks) : null;

    // B. Category Anchoring Algorithms
    // 1. NECKLACE ALIGNMENT
    if (cat.includes('necklace') || cat.includes('pendant')) {
      if (faceLandmarks) {
        const chin = faceLandmarks[152];
        const lEar = faceLandmarks[234];
        const rEar = faceLandmarks[454];
        const leftShoulder = poseLandmarks ? poseLandmarks[11] : null;
        const rightShoulder = poseLandmarks ? poseLandmarks[12] : null;

        if (lEar && rEar) {
          const faceWidth = Math.sqrt(Math.pow(lEar.x - rEar.x, 2) + Math.pow(lEar.y - rEar.y, 2));

          // Base the visual scale directly on shoulder coordinates if visible, otherwise fall back to face coordinates
          let targetCoordScale = faceWidth * 1.85;
          if (leftShoulder && rightShoulder && leftShoulder.visibility > 0.4 && rightShoulder.visibility > 0.4) {
            const shoulderDist = Math.sqrt(Math.pow(leftShoulder.x - rightShoulder.x, 2) + Math.pow(leftShoulder.y - rightShoulder.y, 2));
            targetCoordScale = shoulderDist * 0.75; // Sized relative to actual shoulder coordinate distance
          }

          // Lock necklace coordinates to chest/collarbone positioning
          const neckYOffset = faceWidth * 0.88; 
          
          rawPosition = {
            x: chin.x,
            y: chin.y + neckYOffset,
            z: 0.02
          };

          rawScale = targetCoordScale;
          rawRotation = headPose ? headPose.quaternion : new THREE.Quaternion();
        }
      }
    }

    // 2. EARRINGS ALIGNMENT (Centered root coordinate, children meshes spaced symmetrically)
    else if (cat.includes('earring')) {
      if (faceLandmarks) {
        const lEar = faceLandmarks[234];
        const rEar = faceLandmarks[454];

        if (lEar && rEar) {
          const faceWidth = Math.sqrt(Math.pow(lEar.x - rEar.x, 2) + Math.pow(lEar.y - rEar.y, 2));

          rawPosition = {
            x: (lEar.x + rEar.x) / 2,
            y: (lEar.y + rEar.y) / 2 + 0.03, // Drop slightly for earlobe look
            z: 0.01
          };

          rawScale = faceWidth * 0.23; // Earlobe scale based directly on 2D coordinates distance
          rawRotation = headPose ? headPose.quaternion : new THREE.Quaternion();
        }
      }
    }

    // 3. RINGS ALIGNMENT (Anchored to joint PIP and finger vector rotation)
    else if (cat.includes('ring')) {
      const activeHand = rightHandLandmarks || leftHandLandmarks;
      if (activeHand) {
        const ringAlign = calculateRingAlignment(activeHand);
        if (ringAlign) {
          rawPosition = ringAlign.position;
          rawScale = ringAlign.scale.x;
          rawRotation = ringAlign.rotation;
        }
      }
    }

    // 4. BANGLES & BRACELETS ALIGNMENT (Anchored to wrist joint)
    else if (cat.includes('bangle') || cat.includes('bracelet')) {
      const activeHand = rightHandLandmarks || leftHandLandmarks;
      if (activeHand) {
        const bangleAlign = calculateBangleAlignment(activeHand);
        if (bangleAlign) {
          rawPosition = bangleAlign.position;
          rawScale = bangleAlign.scale.x;
          rawRotation = bangleAlign.rotation;
        }
      }
    }

    // C. Advanced One Euro Filtering Layer
    if (rawPosition && rawScale !== null && rawRotation) {
      // Smooth 3D Positions
      const filteredPos = positionFilter.filter(rawPosition);
      
      // Smooth Scales
      const filteredScale = scaleFilter.filter(rawScale);

      // Smooth Rotations
      let filteredRot = rawRotation;
      if (rawRotation instanceof THREE.Quaternion) {
        // Convert Quaternion to Euler angles to filter roll/pitch/yaw cleanly
        const euler = new THREE.Euler().setFromQuaternion(rawRotation, 'YXZ');
        const filteredEulerVec = rotationFilter.filter({ x: euler.x, y: euler.y, z: euler.z });
        
        filteredRot = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(filteredEulerVec.x, filteredEulerVec.y, filteredEulerVec.z, 'YXZ')
        );
      } else {
        // Filter basic numeric angles
        const eulerVec = { x: 0, y: 0, z: rawRotation };
        const filteredEulerVec = rotationFilter.filter(eulerVec);
        filteredRot = filteredEulerVec.z;
      }

      setPoseData({
        position: filteredPos,
        scale: filteredScale,
        rotation: filteredRot
      });

      // Update interactive metrics for debugging overlays
      if (debugEnabled && headPose) {
        setDebugMetrics({
          fps: currentFps,
          yaw: Math.round(headPose.yaw * (180 / Math.PI)),
          pitch: Math.round(headPose.pitch * (180 / Math.PI)),
          roll: Math.round(headPose.roll * (180 / Math.PI)),
          depth: Math.round(headPose.zDepth * 100), // in cm
          scale: Number(filteredScale.toFixed(3)),
          trackingConfidence: faceLandmarks ? 98 : (poseLandmarks ? 75 : 0)
        });
      }
    }
  };

  return (
    <AnimatePresence>
      {arModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl"
        >
          <div 
            ref={containerRef}
            className="relative w-full h-full max-w-7xl max-h-[92vh] bg-zinc-950 overflow-hidden md:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
          >
            {/* Action Bar / Utility buttons */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
              {/* Developer Debug Overlay Toggle */}
              <button
                onClick={() => setDebugEnabled(!debugEnabled)}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border backdrop-blur-md cursor-pointer ${
                  debugEnabled 
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                    : 'bg-black/50 text-zinc-400 border-white/15 hover:text-white hover:bg-black/85'
                }`}
                title="Toggle AI Debug Console"
              >
                <Bug size={20} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setArModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-red-500/20 hover:text-red-400 border border-white/15 hover:border-red-500/40 rounded-full text-white transition-all backdrop-blur-md cursor-pointer"
                title="Close Studio"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Calibration Loading Ring */}
            {isLoading && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xl">
                <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gold-500/20"></div>
                  <Loader2 size={48} className="text-gold-500 animate-spin absolute" />
                </div>
                <span className="text-gold-400 tracking-[0.25em] uppercase text-[11px] font-bold animate-pulse">
                  Configuring Neural Mirror...
                </span>
                <span className="text-zinc-500 text-[10px] tracking-wide mt-2">
                  Please align your shoulders and face center
                </span>
              </div>
            )}

            {/* Left Column: Interactive AR Camera Stage */}
            <div className="relative flex-1 h-full min-h-[50vh] md:min-h-0 bg-black flex items-center justify-center overflow-hidden">
              
              {/* Camera Raw Input Stream */}
              <CameraFeed onVideoReady={setVideoElement} isMirrored={true} />

              {/* Headless Holistic Mesh Tracker */}
              <LandmarkTracker 
                videoElement={videoElement} 
                onLandmarksUpdate={handleLandmarksUpdate} 
                enabled={arModalOpen} 
              />

              {/* Developer Landmark SVG Overlay (Rendered directly over the camera feed) */}
              {debugEnabled && activeLandmarks && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
                  {activeLandmarks.map((lm, i) => (
                    <circle
                      key={i}
                      cx={`${(1 - lm.x) * 100}%`} // mirrored horizontally
                      cy={`${lm.y * 100}%`}
                      r={4}
                      fill={lm.color || '#3b82f6'}
                      className="transition-all duration-75 ease-out shadow-sm"
                    />
                  ))}
                </svg>
              )}

              {/* Interactive Debug Card Overlay */}
              {debugEnabled && (
                <div className="absolute bottom-6 left-6 z-50 p-4 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl w-64 shadow-2xl font-mono text-[10px] text-zinc-400 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold border-b border-zinc-800 pb-2 mb-1">
                    <Zap size={12} />
                    <span>AI LANDMARK METRICS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance:</span>
                    <span className="text-emerald-400 font-bold">{debugMetrics.fps} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precision Scale:</span>
                    <span className="text-white">{debugMetrics.scale}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance (Z):</span>
                    <span className="text-white">{debugMetrics.depth} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Face Yaw (Rot Y):</span>
                    <span className={`font-bold ${Math.abs(debugMetrics.yaw) > 25 ? 'text-red-400' : 'text-zinc-200'}`}>
                      {debugMetrics.yaw}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Face Pitch (Rot X):</span>
                    <span className="text-zinc-200">{debugMetrics.pitch}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Face Roll (Rot Z):</span>
                    <span className="text-zinc-200">{debugMetrics.roll}°</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 mt-1">
                    <span>Neural Signal:</span>
                    <span className="text-sky-400 font-bold">Lock ({debugMetrics.trackingConfidence}%)</span>
                  </div>
                </div>
              )}

              {/* 3D WebGL Canvas Layer */}
              <ARCanvas activeProduct={activeProduct} poseData={poseData} />

              {/* Real-time 2D Composite Canvas (Final Display) */}
              <canvas
                ref={compositeCanvasRef}
                className="absolute inset-0 w-full h-full object-cover z-10"
              />

              {/* Brand Watermark Overlay */}
              <div className="absolute top-8 left-8 z-30 pointer-events-none select-none">
                <span className="text-xl font-serif tracking-[0.25em] uppercase text-white font-extralight drop-shadow-lg">
                  AUREA
                </span>
                <div className="text-[8px] text-gold-400 tracking-widest uppercase mt-1.5 font-semibold drop-shadow-md">
                  Live AR Studio
                </div>
              </div>

              {/* Active Product Overlay selector */}
              <ProductSelector activeProduct={activeProduct} setActiveProduct={setActiveProduct} />
              
              {/* High-quality Snapshot camera button */}
              <ScreenshotCapture compositeCanvasRef={compositeCanvasRef} />
            </div>

            {/* Right Column: Premium metadata sidebar */}
            <div className="w-full md:w-80 h-auto md:h-full bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 p-6 z-40 flex flex-col justify-between shrink-0">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-gold-400 font-bold tracking-[0.2em] uppercase">
                  Currently Trying On
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-serif font-medium text-white">
                    {activeProduct?.name || 'Luxury Diamond Halo'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    SKU: {activeProduct?.sku || 'AU-EAR-01'}
                  </p>
                </div>
                <div className="h-px bg-white/10 my-1"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Composition:</span>
                    <span className="text-zinc-200 font-medium">{activeProduct?.metal} ({activeProduct?.purity})</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Approx. Weight:</span>
                    <span className="text-zinc-200 font-medium">{activeProduct?.weight}g</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Design Concept:</span>
                    <span className="text-zinc-200 font-medium">{activeProduct?.collection} Collection</span>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400 mt-2 bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                  {activeProduct?.description || 'Classic and elegant jewellery designed for supreme visual prestige.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-8 md:mt-0">
                <button
                  className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 active:scale-[0.98] text-black text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.4)] cursor-pointer"
                  onClick={() => alert('Successfully added ornament to try-on cart stack!')}
                >
                  Confirm Choice
                </button>
                <button
                  onClick={() => setArModalOpen(false)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-zinc-300 text-xs font-medium uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Exit Atelier
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ARModal;
