import { useEffect, useState, useRef } from 'react';

// Declare types for window object properties
declare global {
  interface Window {
    Holistic: any;
    Camera: any;
    globalHolisticInstance: any;
    globalHolisticLoading?: boolean;
    globalHolisticReady?: boolean;
    holisticCallbacks: Set<(results: any) => void>;
    holisticCameraInstance: any;
    holisticActiveVideo: HTMLVideoElement | null;
  }
}

/**
 * Shared orchestrator for MediaPipe Holistic to prevent double WASM loading.
 */
export const registerTrackerCallback = (
  videoElement: HTMLVideoElement | null,
  enabled: boolean,
  callback: (results: any) => void
) => {
  if (!videoElement || !enabled) return () => {};

  // 1. Initialize callback registry
  if (!window.holisticCallbacks) {
    window.holisticCallbacks = new Set();
  }
  window.holisticCallbacks.add(callback);

  let checkInterval: NodeJS.Timeout | null = null;
  let isMounted = true;

  const initHolistic = () => {
    const HolisticConstructor = window.Holistic;
    const CameraConstructor = window.Camera;
    if (!HolisticConstructor || !CameraConstructor) return false;

    // 2. Initialize the global holistic WASM instance once
    if (!window.globalHolisticInstance && !window.globalHolisticLoading) {
      window.globalHolisticLoading = true;
      const instance = new HolisticConstructor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
        }
      });

      instance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      instance.onResults((results: any) => {
        if (window.holisticCallbacks) {
          window.holisticCallbacks.forEach(cb => cb(results));
        }
      });

      instance.initialize()
        .then(() => {
          window.globalHolisticInstance = instance;
          window.globalHolisticLoading = false;
          window.globalHolisticReady = true;
          console.log("Shared MediaPipe Holistic WASM loaded successfully!");
        })
        .catch((e: any) => {
          window.globalHolisticLoading = false;
          console.error("Failed to initialize Shared Holistic WASM:", e);
        });
    }

    if (!window.globalHolisticReady) return false;

    // Guard: Ensure the heavy neural model asset pack (.data) has finished loading to prevent WASM aborts
    const performanceSupported = typeof window !== 'undefined' && window.performance && typeof window.performance.getEntriesByType === 'function';
    const isDataLoaded = !performanceSupported || window.performance.getEntriesByType('resource').some(
      (r: any) => r.name.includes('holistic_solution_packed_assets.data')
    );
    if (!isDataLoaded) {
      console.log("Shared MediaPipe Holistic WASM compiled, but neural model assets (.data) are still downloading...");
      return false; // Keep polling until download finishes
    }

    // 3. Start or update the camera stream loop
    if (window.holisticActiveVideo !== videoElement) {
      if (window.holisticCameraInstance) {
        window.holisticCameraInstance.stop();
      }

      window.holisticActiveVideo = videoElement;
      
      const camera = new CameraConstructor(videoElement, {
        onFrame: async () => {
          if (!isMounted) return;
          try {
            await window.globalHolisticInstance.send({ image: videoElement });
          } catch (e) {
            // Suppress frame send errors to avoid logging noise
          }
        },
        width: 1280,
        height: 720
      });

      window.holisticCameraInstance = camera;
      camera.start();
      console.log("Shared MediaPipe stream active!");
    }

    return true;
  };

  // Try loading holistic immediately, or poll if not yet fully loaded
  if (!initHolistic()) {
    checkInterval = setInterval(() => {
      if (initHolistic() && checkInterval) {
        clearInterval(checkInterval);
      }
    }, 300);
  }

  // Cleanup: unregister callback when hook unmounts
  return () => {
    isMounted = false;
    if (checkInterval) clearInterval(checkInterval);
    if (window.holisticCallbacks) {
      window.holisticCallbacks.delete(callback);
      
      // If there are no more active page listeners, stop camera to save GPU/power
      if (window.holisticCallbacks.size === 0) {
        if (window.holisticCameraInstance) {
          window.holisticCameraInstance.stop();
          window.holisticCameraInstance = null;
        }
        window.holisticActiveVideo = null;
      }
    }
  };
};
