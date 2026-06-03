import { useEffect, useState } from 'react';
import { registerTrackerCallback } from './sharedTracker';

export const usePoseTracking = (videoElement: HTMLVideoElement | null, enabled = true) => {
  const [landmarks, setLandmarks] = useState<any[]>([]);

  useEffect(() => {
    return registerTrackerCallback(videoElement, enabled, (results) => {
      if (results.poseLandmarks) {
        setLandmarks(results.poseLandmarks);
      }
    });
  }, [videoElement, enabled]);

  return { landmarks };
};
