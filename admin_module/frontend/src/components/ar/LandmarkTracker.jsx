import { useEffect, useRef } from 'react';

/**
 * Headless component that tracks body landmarks using MediaPipe Holistic
 */
export const LandmarkTracker = ({ videoElement, onLandmarksUpdate, enabled = true }) => {
  const cameraRef = useRef(null);
  const onLandmarksUpdateRef = useRef(onLandmarksUpdate);

  useEffect(() => {
    onLandmarksUpdateRef.current = onLandmarksUpdate;
  }, [onLandmarksUpdate]);

  useEffect(() => {
    if (!videoElement || !enabled) return;

    let isMounted = true;
    let checkInterval = null;

    const initHolistic = () => {
      const HolisticConstructor = window.Holistic;
      const CameraConstructor = window.Camera;
      if (!HolisticConstructor || !CameraConstructor) return false;

      if (!window.globalHolisticInstance) {
        if (window.globalHolisticLoading) return false;

        window.globalHolisticLoading = true;
        const instance = new HolisticConstructor({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
          }
        });

        instance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          refineFaceLandmarks: true,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        instance.onResults((results) => {
          if (window.globalOnLandmarksUpdateRef?.current) {
            window.globalOnLandmarksUpdateRef.current({
              poseLandmarks: results.poseLandmarks || null,
              faceLandmarks: results.faceLandmarks || null,
              leftHandLandmarks: results.leftHandLandmarks || null,
              rightHandLandmarks: results.rightHandLandmarks || null,
            });
          }
        });

        instance.initialize()
          .then(() => {
            window.globalHolisticInstance = instance;
            window.globalHolisticLoading = false;
            window.globalHolisticReady = true;
            console.log("MediaPipe Holistic WebAssembly assets loaded and ready!");
          })
          .catch(e => {
            window.globalHolisticLoading = false;
            console.error("Failed to initialize Holistic WASM:", e);
          });

        return false; // Wait for the asynchronous initialize promise to resolve
      }

      if (!window.globalHolisticReady) return false;

      // Guard: Ensure the heavy neural model asset pack (.data) has finished loading to prevent WASM aborts
      const performanceSupported = typeof window !== 'undefined' && window.performance && typeof window.performance.getEntriesByType === 'function';
      const isDataLoaded = !performanceSupported || window.performance.getEntriesByType('resource').some(
        r => r.name.includes('holistic_solution_packed_assets.data')
      );
      if (!isDataLoaded) {
        console.log("MediaPipe Holistic WASM compiled, but neural model assets (.data) are still downloading...");
        return false; // Keep polling until download finishes
      }

      // Always update the global reference to the latest React component callback
      window.globalOnLandmarksUpdateRef = onLandmarksUpdateRef;

      const holistic = window.globalHolisticInstance;
      if (!holistic) return false;



      const camera = new CameraConstructor(videoElement, {
        onFrame: async () => {
          if (!isMounted) return;
          try {
            await holistic.send({ image: videoElement });
          } catch (e) {
            console.error("Error sending frame to holistic WASM:", e);
          }
        },
        width: 1280,
        height: 720
      });
      
      cameraRef.current = camera;
      console.log("MediaPipe Holistic ready! Starting Camera stream...");
      camera.start();

      return true;
    };

    // Try to initialize immediately
    if (!initHolistic()) {
      console.log("Waiting for MediaPipe Holistic script to load...");
      // Poll every 500ms until the script has loaded
      checkInterval = setInterval(() => {
        if (initHolistic()) {
          clearInterval(checkInterval);
          console.log("MediaPipe Holistic successfully loaded and initialized!");
        }
      }, 500);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      // Do NOT close the globalHolisticInstance so it survives Strict Mode remounts!
    };
  }, [videoElement, enabled]);

  return null;
};
