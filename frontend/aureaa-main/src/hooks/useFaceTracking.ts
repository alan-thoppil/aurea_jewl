import { useEffect, useState } from 'react';
import { registerTrackerCallback } from './sharedTracker';

export const useFaceTracking = (videoElement: HTMLVideoElement | null, enabled = true) => {
  const [landmarks, setLandmarks] = useState<any[]>([]);

  useEffect(() => {
    return registerTrackerCallback(videoElement, enabled, (results) => {
      if (results.faceLandmarks) {
        setLandmarks(results.faceLandmarks);
      }
    });
  }, [videoElement, enabled]);

  return { landmarks };
};
