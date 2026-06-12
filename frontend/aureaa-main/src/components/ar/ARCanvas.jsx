import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { JewelleryRenderer } from './JewelleryRenderer';

export const ARCanvas = ({ activeProduct, poseData, width = 1280, height = 720 }) => {
  return (
    <div 
      className="absolute top-0 left-0 pointer-events-none z-10 opacity-0 overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Canvas
        id="ar-webgl-canvas"
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true
        }}
        shadows="percentage"
      >
        {/* Professional three-point studio lighting to maximize luxury reflections */}
        <ambientLight intensity={1.2} />
        
        {/* High-shaft key light casting crisp reflections */}
        <directionalLight 
          position={[4, 5, 3]} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />
        
        {/* Soft fill light */}
        <pointLight position={[-4, -2, -3]} intensity={0.8} />

        {/* Dynamic environment map mapping for reflective metallic surfaces */}
        <Environment preset="studio" />

        <Suspense fallback={null}>
          {activeProduct && poseData && (
            <JewelleryRenderer
              type="texture" // Supports texture or model dynamically
              src={activeProduct.image_url || '/images/placeholder.png'}
              poseData={poseData}
              activeProduct={activeProduct}
              isMirrored={true}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
