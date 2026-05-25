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
        window.globalHolisticInstance = new HolisticConstructor({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
          }
        });

        window.globalHolisticInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          refineFaceLandmarks: true,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        window.globalHolisticInstance.onResults((results) => {
          if (window.globalOnLandmarksUpdateRef?.current) {
            window.globalOnLandmarksUpdateRef.current({
              poseLandmarks: results.poseLandmarks || null,
              faceLandmarks: results.faceLandmarks || null,
              leftHandLandmarks: results.leftHandLandmarks || null,
              rightHandLandmarks: results.rightHandLandmarks || null,
            });
          }
        });

        window.globalHolisticInstance.initialize().catch(e => console.error("Failed to initialize:", e));
      }

      // Always update the global reference to the latest React component callback
      window.globalOnLandmarksUpdateRef = onLandmarksUpdateRef;

      const holistic = window.globalHolisticInstance;



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
