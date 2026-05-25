import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { HeadOccluder, NeckOccluder, FingerOccluder } from './occlusion/OcclusionMasks';
import {
  getGoldMaterial,
  getPlatinumMaterial,
  getDiamondMaterial,
  getEmeraldMaterial,
  getPearlMaterial
} from '../../utils/ar/diamondShader';

interface PoseData {
  position: { x: number; y: number; z: number };
  rotation: THREE.Quaternion | number;
  scale: number;
  // Category-specific landmarks for individual ears / joints
  landmarks?: any;
}

interface JewelleryRendererProps {
  type?: 'texture' | 'model';
  src: string;
  poseData: PoseData;
  activeProduct: any;
  isMirrored?: boolean;
}

/**
 * Core component that renders 2D/3D jewelry ornaments with full 3D posture,
 * dynamic occluders, and high-fidelity PBR metallic shading.
 */
export const JewelleryRenderer: React.FC<JewelleryRendererProps> = ({
  type = 'texture',
  src,
  poseData,
  activeProduct,
  isMirrored = true
}) => {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  // Custom materials based on product metal/gems
  const [activeMaterial, setActiveMaterial] = useState<THREE.MeshPhysicalMaterial | null>(null);
  const [textureData, setTextureData] = useState<{ texture: THREE.Texture; aspect: number } | null>(null);

  const category = activeProduct?.category?.toLowerCase() || '';
  const metal = activeProduct?.metal?.toLowerCase() || 'gold';

  // 1. Dynamic PBR Material Selection
  useEffect(() => {
    let mat: THREE.MeshPhysicalMaterial;
    if (metal.includes('gold')) {
      mat = getGoldMaterial();
    } else if (metal.includes('platinum') || metal.includes('silver')) {
      mat = getPlatinumMaterial();
    } else if (metal.includes('pearl')) {
      mat = getPearlMaterial();
    } else {
      mat = getGoldMaterial(); // Default fallback
    }
    setActiveMaterial(mat);
  }, [metal]);

  // 2. Dynamic 2D Texture Alpha-Keying & Matte Removal
  useEffect(() => {
    if (type !== 'texture' || !src) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Extract ornament by stripping out high-brightness white backgrounds
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r > 238 && g > 238 && b > 238) {
          data[i + 3] = 0; // Seamless transparency
        } else if (r > 215 && g > 215 && b > 215) {
          data[i + 3] = 100; // Soft edge blending
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      setTextureData({ texture: tex, aspect: img.width / img.height });
    };
    img.src = src;

    return () => {
      if (textureData?.texture) textureData.texture.dispose();
    };
  }, [src, type]);

  // 3. Dynamic R3F Frame Projection Loop
  useFrame(() => {
    if (!groupRef.current || !poseData || !poseData.position) return;

    // A. 3D Camera Projection (Normalized screen coordinates -> 3D Viewport units)
    let targetX = (poseData.position.x - 0.5) * viewport.width;
    if (isMirrored) {
      targetX = -targetX; // Mirror X plane to match video mirrored stream
    }
    const targetY = -(poseData.position.y - 0.5) * viewport.height;
    
    // Position slightly closer/further based on dynamic depth approximations
    const targetZ = poseData.position.z ? -poseData.position.z * 1.5 : 0;

    groupRef.current.position.lerp(
      new THREE.Vector3(targetX, targetY, targetZ),
      0.25 // Smooth motion interpolation
    );

    // B. Apply Quaternion Orientation (Pitch, Yaw, Roll)
    if (poseData.rotation instanceof THREE.Quaternion) {
      // Create mirror-aware rotation if mirrored
      if (isMirrored) {
        const euler = new THREE.Euler().setFromQuaternion(poseData.rotation, 'YXZ');
        euler.y = -euler.y; // Invert yaw
        euler.z = -euler.z; // Invert roll
        const mirrorQuat = new THREE.Quaternion().setFromEuler(euler);
        groupRef.current.quaternion.slerp(mirrorQuat, 0.25);
      } else {
        groupRef.current.quaternion.slerp(poseData.rotation, 0.25);
      }
    } else if (typeof poseData.rotation === 'number') {
      const zRot = isMirrored ? -poseData.rotation : poseData.rotation;
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), zRot);
      groupRef.current.quaternion.slerp(targetQuat, 0.25);
    }

    // C. 3D Aspect-Ratio-Independent Scale Integration
    // Convert faceWidth in normalized coords directly to Three.js scene units
    const faceWidthScene = poseData.scale * viewport.width;
    groupRef.current.scale.lerp(
      new THREE.Vector3(faceWidthScene, faceWidthScene, faceWidthScene),
      0.25 // Smooth movement scale interpolation
    );
  });

  if (!src) return null;

  // 4. Mesh Materials setup with dynamic aspect-ratio self-calibration
  const renderMesh = () => {
    if (type === 'texture') {
      if (!textureData) return null;
      
      const aspect = textureData.aspect;
      let relativeScale = 1.0;

      // Compute visual scale dividing by aspect ratio to ensure uniform rendered width
      const calibrationScale = relativeScale / aspect;
      
      // Upgrade standard 2D plane with realistic PBR properties
      return (
        <mesh scale={[calibrationScale, calibrationScale, calibrationScale]}>
          <planeGeometry args={[aspect, 1]} />
          <meshPhysicalMaterial
            map={textureData.texture}
            transparent={true}
            roughness={activeMaterial?.roughness ?? 0.1}
            metalness={activeMaterial?.metalness ?? 0.8}
            clearcoat={activeMaterial?.clearcoat ?? 1.0}
            clearcoatRoughness={activeMaterial?.clearcoatRoughness ?? 0.05}
            reflectivity={activeMaterial?.reflectivity ?? 1.0}
            envMapIntensity={activeMaterial?.envMapIntensity ?? 1.5}
            side={THREE.DoubleSide}
            alphaTest={0.01}
          />
        </mesh>
      );
    } else {
      // 3D GLB/GLTF renderer
      return <GLBModel src={src} material={activeMaterial} />;
    }
  };

  return (
    <group>
      {/* Occlusion Meshes Layer */}
      {category.includes('earring') && poseData.position && (
        <HeadOccluder
          position={
            new THREE.Vector3(
              (poseData.position.x - 0.5) * -viewport.width,
              -(poseData.position.y - 0.5) * viewport.height,
              poseData.position.z ? -poseData.position.z * 1.5 - 0.12 : -0.12
            )
          }
          rotation={poseData.rotation instanceof THREE.Quaternion ? poseData.rotation : undefined}
          scale={new THREE.Vector3(poseData.scale * 0.65, poseData.scale * 0.85, poseData.scale * 0.65)}
        />
      )}

      {category.includes('necklace') && poseData.position && (
        <NeckOccluder
          position={
            new THREE.Vector3(
              (poseData.position.x - 0.5) * -viewport.width,
              -(poseData.position.y - 0.5) * viewport.height - 0.08,
              poseData.position.z ? -poseData.position.z * 1.5 - 0.15 : -0.15
            )
          }
          scale={new THREE.Vector3(poseData.scale * 0.35, poseData.scale * 0.6, poseData.scale * 0.35)}
        />
      )}

      {category.includes('ring') && poseData.position && (
        <FingerOccluder
          position={
            new THREE.Vector3(
              (poseData.position.x - 0.5) * -viewport.width,
              -(poseData.position.y - 0.5) * viewport.height,
              poseData.position.z ? -poseData.position.z * 1.5 - 0.03 : -0.03
            )
          }
          rotation={poseData.rotation instanceof THREE.Quaternion ? poseData.rotation : undefined}
          scale={new THREE.Vector3(poseData.scale * 0.12, poseData.scale * 0.35, poseData.scale * 0.12)}
        />
      )}

      {/* Primary Ornament Group */}
      <group ref={groupRef}>
        {category.includes('earring') ? (
          // DUAL EAR RENDERER: Splitting earrings into symmetrical left and right instances
          <group>
            {/* Left Ear Placement */}
            <group position={[-0.5, -0.05, 0]}>
              {renderMesh()}
            </group>
            {/* Right Ear Placement */}
            <group position={[0.5, -0.05, 0]}>
              {renderMesh()}
            </group>
          </group>
        ) : (
          // Default single centered body anchor (Necklace, Ring, Bangle)
          renderMesh()
        )}
      </group>
    </group>
  );
};

/**
 * GLB Loader that applies dynamic physical properties/materials
 */
const GLBModel: React.FC<{ src: string; material: THREE.MeshPhysicalMaterial | null }> = ({ src, material }) => {
  const { scene } = useGLTF(src);

  // Apply PBR luxury materials on all children meshes
  useEffect(() => {
    if (!scene || !material) return;
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = material;
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [scene, material]);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
};
