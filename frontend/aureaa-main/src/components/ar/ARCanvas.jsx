import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { JewelleryRenderer } from './JewelleryRenderer';

export const ARCanvas = ({ activeProduct, poseData }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
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
