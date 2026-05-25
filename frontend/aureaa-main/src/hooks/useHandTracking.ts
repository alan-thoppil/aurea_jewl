import { useEffect, useState } from 'react';
import { registerTrackerCallback } from './sharedTracker';

export const useHandTracking = (videoElement: HTMLVideoElement | null, enabled = true) => {
  const [landmarks, setLandmarks] = useState<any[]>([]);

  useEffect(() => {
    return registerTrackerCallback(videoElement, enabled, (results) => {
      const activeHand = results.rightHandLandmarks || results.leftHandLandmarks || [];
      setLandmarks(activeHand);
    });
  }, [videoElement, enabled]);

  return { landmarks };
};
