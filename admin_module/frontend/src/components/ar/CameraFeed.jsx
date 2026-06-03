import React, { useRef, useEffect } from 'react';

export const CameraFeed = ({ onVideoReady, isMirrored = true }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        const constraints = {
          audio: false,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!active) {
          // Stop stream if component unmounted while requesting
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("WebRTC camera stream initiation failed:", error);
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`WebRTC Track [${track.kind}] stopped.`);
        });
      }
    };
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      console.log("WebRTC video stream metadata loaded. Aspect ratio:", videoRef.current.videoWidth / videoRef.current.videoHeight);
      onVideoReady(videoRef.current);
    }
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      onLoadedMetadata={handleLoadedMetadata}
      className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-0"
      style={{
        transform: isMirrored ? 'scaleX(-1)' : 'none'
      }}
    />
  );
};

