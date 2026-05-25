import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

export const CameraFeed = ({ onVideoReady, isMirrored = true }) => {
  const webcamRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        onVideoReady(webcamRef.current.video);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onVideoReady]);

  return (
    <Webcam
      ref={webcamRef}
      audio={false}
      mirrored={isMirrored}
      videoConstraints={{
        width: 1280,
        height: 720,
        facingMode: "user"
      }}
      className="absolute inset-0 w-full h-full object-cover z-0"
    />
  );
};
