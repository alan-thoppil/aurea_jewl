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
  faceLandmarks?: any;
  poseLandmarks?: any;
}

interface Component {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  pixelCount: number;
}

/**
 * Keys out white background pixels dynamically to ensure transparent alpha overlay.
 */
const keyOutBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Key out solid white backgrounds
    if (r > 235 && g > 235 && b > 235) {
      data[i + 3] = 0; // Seamless transparency
    } else if (r > 215 && g > 215 && b > 215) {
      data[i + 3] = 100; // Soft edge blending
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Runs a fast Breadth-First Search (BFS) on downscaled image pixels to detect separate non-white jewelry components (islands).
 */
const findConnectedComponents = (img: HTMLImageElement): Component[] => {
  const downscaledSize = 256;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = downscaledSize;
  tempCanvas.height = downscaledSize;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return [];

  tempCtx.drawImage(img, 0, 0, downscaledSize, downscaledSize);
  const imgData = tempCtx.getImageData(0, 0, downscaledSize, downscaledSize);
  const pixels = imgData.data;

  const visited = new Uint8Array(downscaledSize * downscaledSize);
  const components: Component[] = [];

  const isBg = (x: number, y: number) => {
    const idx = (y * downscaledSize + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    return r > 235 && g > 235 && b > 235;
  };

  for (let y = 0; y < downscaledSize; y++) {
    for (let x = 0; x < downscaledSize; x++) {
      const idx = y * downscaledSize + x;
      if (visited[idx] || isBg(x, y)) continue;

      // Found a new island component!
      let minX = x, maxX = x, minY = y, maxY = y;
      const queue = [x, y];
      let head = 0;
      visited[idx] = 1;

      while (head < queue.length) {
        const cx = queue[head++];
        const cy = queue[head++];

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < downscaledSize && ny >= 0 && ny < downscaledSize) {
            const nIdx = ny * downscaledSize + nx;
            if (!visited[nIdx] && !isBg(nx, ny)) {
              visited[nIdx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      const cWidth = maxX - minX + 1;
      const cHeight = maxY - minY + 1;
      const pixelCount = queue.length / 2;

      // Filter out small noise components
      if (pixelCount > 15) {
        components.push({
          minX,
          maxX,
          minY,
          maxY,
          width: cWidth,
          height: cHeight,
          pixelCount
        });
      }
    }
  }

  // Sort components by pixelCount descending (largest element first)
  components.sort((a, b) => b.pixelCount - a.pixelCount);
  return components;
};

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
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  
  // Custom materials based on product metal/gems
  const [activeMaterial, setActiveMaterial] = useState<THREE.MeshPhysicalMaterial | null>(null);
  const [textureData, setTextureData] = useState<{ texture: THREE.Texture; aspect: number; cropScale?: number } | null>(null);
  const [earringTexture, setEarringTexture] = useState<THREE.Texture | null>(null);
  const [dynamicSetEarrings, setDynamicSetEarrings] = useState<boolean>(false);

  const category = activeProduct?.category?.toLowerCase() || '';
  const metal = activeProduct?.metal?.toLowerCase() || 'gold';

  // Dynamically substitute double-bangle catalog images with single-bangle AR assets
  const displaySrc = (category.includes('bangle') && src.includes('bangle.png')) ? '/images/bangle_single.png' : src;

  // Treat as combo set ONLY if we dynamically detected matching earrings in the product image
  const activeIsSet = dynamicSetEarrings;

  useEffect(() => {
    console.log("AUREA AR - JewelleryRenderer mounted. Product:", activeProduct?.name, "Category:", category, "activeIsSet:", activeIsSet);
  }, [activeProduct, category, activeIsSet]);

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

  // 2. Dynamic 2D Texture Alpha-Keying, Matte Removal, and connected-component segmentation
  useEffect(() => {
    if (type !== 'texture' || !displaySrc) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const components = findConnectedComponents(img);
      console.log("AUREA AR - CCA: Found components count:", components.length);

      const scaleX = img.width / 256;
      const scaleY = img.height / 256;

      // Treat as a combo set ONLY if it has 3+ components AND the smaller components are horizontally off-center (symmetrical earrings).
      // This prevents multi-loop layered chains (e.g. Lightweight Chain) from being incorrectly split into earrings!
      const isComboSet = category.includes('necklace') && 
        components.length >= 3 && 
        Math.abs(((components[1].minX + components[1].maxX) / 2) - 128) > 16 &&
        Math.abs(((components[2].minX + components[2].maxX) / 2) - 128) > 16;

      if (isComboSet) {
        console.log("AUREA AR - CCA: Multi-component SET detected from image islands!");

        const mainComp = components[0]; // Necklace is largest component
        const earringComp = components[1]; // Earring is second largest component

        // Create a parent size canvas to host the composite set
        const neckCanvas = document.createElement("canvas");
        neckCanvas.width = img.width;
        neckCanvas.height = img.height;
        const neckCtx = neckCanvas.getContext("2d");
        if (neckCtx) {
          neckCtx.drawImage(img, 0, 0);
          keyOutBackground(neckCtx, img.width, img.height);

          // CRITICAL ERASURE: Clear/erase all OTHER components (earrings) from the necklace canvas!
          // This completely prevents them from duplicating on the neck.
          for (let i = 1; i < components.length; i++) {
            const comp = components[i];
            const ex = Math.max(0, Math.floor(comp.minX * scaleX));
            const ey = Math.max(0, Math.floor(comp.minY * scaleY));
            const ew = Math.min(img.width - ex, Math.ceil(comp.width * scaleX));
            const eh = Math.min(img.height - ey, Math.ceil(comp.height * scaleY));
            neckCtx.clearRect(ex, ey, ew, eh);
          }

          // Recompute tight bounding box of the remaining necklace pixels
          const neckData = neckCtx.getImageData(0, 0, img.width, img.height).data;
          let tightMinX = img.width, tightMaxX = 0, tightMinY = img.height, tightMaxY = 0;
          let hasNeckPixels = false;
          
          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const idx = (y * img.width + x) * 4;
              if (neckData[idx + 3] > 0) {
                hasNeckPixels = true;
                if (x < tightMinX) tightMinX = x;
                if (x > tightMaxX) tightMaxX = x;
                if (y < tightMinY) tightMinY = y;
                if (y > tightMaxY) tightMaxY = y;
              }
            }
          }

          const tW = hasNeckPixels ? (tightMaxX - tightMinX + 1) : img.width;
          const tH = hasNeckPixels ? (tightMaxY - tightMinY + 1) : img.height;
          const tX = hasNeckPixels ? tightMinX : 0;
          const tY = hasNeckPixels ? tightMinY : 0;

          // Draw cropped necklace into final canvas
          const finalNeckCanvas = document.createElement("canvas");
          finalNeckCanvas.width = tW;
          finalNeckCanvas.height = tH;
          const finalNeckCtx = finalNeckCanvas.getContext("2d");
          if (finalNeckCtx) {
            finalNeckCtx.drawImage(neckCanvas, tX, tY, tW, tH, 0, 0, tW, tH);

            const neckTex = new THREE.CanvasTexture(finalNeckCanvas);
            neckTex.colorSpace = THREE.SRGBColorSpace;
            neckTex.minFilter = THREE.LinearFilter;
            
            // CRITICAL SCALE CORRECTION: Multiply the model scale by tW / img.width to preserve proportions
            const cropScale = tW / img.width;
            setTextureData({ 
              texture: neckTex, 
              aspect: tW / tH,
              cropScale: cropScale
            });
            console.log("AUREA AR - CCA: Erased earrings and cropped necklace with cropScale:", cropScale);
          }
        }

        // B. Crop and load Earring segment
        const earX = Math.max(0, Math.floor(earringComp.minX * scaleX));
        const earY = Math.max(0, Math.floor(earringComp.minY * scaleY));
        const earW = Math.min(img.width - earX, Math.ceil(earringComp.width * scaleX));
        const earH = Math.min(img.height - earY, Math.ceil(earringComp.height * scaleY));

        const earCanvas = document.createElement("canvas");
        earCanvas.width = earW;
        earCanvas.height = earH;
        const earCtx = earCanvas.getContext("2d");
        if (earCtx) {
          earCtx.drawImage(img, earX, earY, earW, earH, 0, 0, earW, earH);
          keyOutBackground(earCtx, earW, earH);

          // Center the earring inside a square transparent canvas to prevent stretching in Three.js
          const sqSize = Math.max(earW, earH);
          const sqCanvas = document.createElement("canvas");
          sqCanvas.width = sqSize;
          sqCanvas.height = sqSize;
          const sqCtx = sqCanvas.getContext("2d");
          if (sqCtx) {
            const offsetX = (sqSize - earW) / 2;
            const offsetY = (sqSize - earH) / 2;
            sqCtx.drawImage(earCanvas, offsetX, offsetY);

            const earTex = new THREE.CanvasTexture(sqCanvas);
            earTex.colorSpace = THREE.SRGBColorSpace;
            earTex.minFilter = THREE.LinearFilter;
            setEarringTexture(earTex);
            setDynamicSetEarrings(true);
            console.log("AUREA AR - CCA: Segmented and squared earring texture from set photo.");
          }
        }
      } else {
        // Single ornament. Crop to tightest bounding box to eliminate empty catalog margins
        setDynamicSetEarrings(false);
        const comp = components[0] || { minX: 0, maxX: 255, minY: 0, maxY: 255, width: 256, height: 256 };

        const cX = Math.max(0, Math.floor(comp.minX * scaleX));
        const cY = Math.max(0, Math.floor(comp.minY * scaleY));
        const cW = Math.min(img.width - cX, Math.ceil(comp.width * scaleX));
        const cH = Math.min(img.height - cY, Math.ceil(comp.height * scaleY));

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = cW;
        cropCanvas.height = cH;
        const cropCtx = cropCanvas.getContext("2d");
        if (cropCtx) {
          cropCtx.drawImage(img, cX, cY, cW, cH, 0, 0, cW, cH);
          keyOutBackground(cropCtx, cW, cH);

          const tex = new THREE.CanvasTexture(cropCanvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          
          // CRITICAL SCALE CORRECTION:
          const cropScale = cW / img.width;
          setTextureData({ 
            texture: tex, 
            aspect: cW / cH,
            cropScale: cropScale
          });
          console.log(`AUREA AR - CCA: Cropped single item to bounds: ${cW}x${cH}, cropScale: ${cropScale}`);
        }
      }
    };
    img.src = displaySrc;

    return () => {
      if (textureData?.texture) textureData.texture.dispose();
    };
  }, [displaySrc, type, category]);

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

    // D. Multi-layer set-splitting alignment (Earrings tracking for sets)
    if (activeIsSet) {
      if (!poseData.faceLandmarks) {
        // Log once in a while to not flood console
        if (Math.random() < 0.01) console.warn("AUREA AR - faceLandmarks missing in poseData");
      } else {
        const face = poseData.faceLandmarks;
        const lEar = face[234];
        const rEar = face[454];
        if (lEar && rEar) {
          // Left Ear 3D Projection
          let targetXL = (lEar.x - 0.5) * viewport.width;
          if (isMirrored) targetXL = -targetXL;
          const targetYL = -(lEar.y + 0.07 - 0.5) * viewport.height;
          const targetZL = poseData.position.z ? -poseData.position.z * 1.5 - 0.05 : -0.05;
          
          leftEarRef.current?.position.lerp(new THREE.Vector3(targetXL, targetYL, targetZL), 0.25);
          
          // Right Ear 3D Projection
          let targetXR = (rEar.x - 0.5) * viewport.width;
          if (isMirrored) targetXR = -targetXR;
          const targetYR = -(rEar.y + 0.07 - 0.5) * viewport.height;
          const targetZR = poseData.position.z ? -poseData.position.z * 1.5 - 0.05 : -0.05;
          
          rightEarRef.current?.position.lerp(new THREE.Vector3(targetXR, targetYR, targetZR), 0.25);
          
          // Apply quaternion rotation to earrings
          if (poseData.rotation instanceof THREE.Quaternion) {
            if (isMirrored) {
              const euler = new THREE.Euler().setFromQuaternion(poseData.rotation, 'YXZ');
              euler.y = -euler.y;
              euler.z = -euler.z;
              const mirrorQuat = new THREE.Quaternion().setFromEuler(euler);
              leftEarRef.current?.quaternion.slerp(mirrorQuat, 0.25);
              rightEarRef.current?.quaternion.slerp(mirrorQuat, 0.25);
            } else {
              leftEarRef.current?.quaternion.slerp(poseData.rotation, 0.25);
              rightEarRef.current?.quaternion.slerp(poseData.rotation, 0.25);
            }
          }
          
          // Scale earrings appropriately based on faceWidth
          const faceWidth = Math.sqrt(Math.pow(lEar.x - rEar.x, 2) + Math.pow(lEar.y - rEar.y, 2));
          // Proportional scale (increased to match physical set sizing relative to necklace)
          const earringScale = faceWidth * 0.45 * viewport.width;
          leftEarRef.current?.scale.lerp(new THREE.Vector3(earringScale, earringScale, earringScale), 0.25);
          rightEarRef.current?.scale.lerp(new THREE.Vector3(earringScale, earringScale, earringScale), 0.25);
        } else {
          if (Math.random() < 0.01) console.warn("AUREA AR - lEar or rEar missing in faceLandmarks");
        }
      }
    }
  });

  if (!displaySrc) return null;

  const renderEarringMesh = () => {
    if (!earringTexture) return null;
    const aspect = 1.0; // earrings are square cropped
    return (
      <mesh>
        <planeGeometry args={[aspect, 1]} />
        <meshPhysicalMaterial
          map={earringTexture}
          transparent={true}
          roughness={0.2}
          metalness={0.0}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          reflectivity={0.5}
          envMapIntensity={1.0}
          side={THREE.DoubleSide}
          alphaTest={0.01}
        />
      </mesh>
    );
  };

  // 4. Mesh Materials setup with dynamic aspect-ratio self-calibration
  const renderMesh = () => {
    if (type === 'texture') {
      if (!textureData) return null;
      
      const aspect = textureData.aspect;
      // Retrieve the crop-aware scale multiplier to maintain exact physical sizing
      const cropScale = textureData.cropScale ?? 1.0;
      const relativeScale = 1.0 * cropScale;

      // Compute visual scale dividing by aspect ratio to ensure uniform rendered width
      const calibrationScale = relativeScale / aspect;
      
      // Upgrade standard 2D plane with realistic PBR properties
      return (
        <mesh scale={[calibrationScale, calibrationScale, calibrationScale]}>
          <planeGeometry args={[aspect, 1]} />
          <meshPhysicalMaterial
            map={textureData.texture}
            transparent={true}
            roughness={0.2}
            metalness={0.0} // Restored true color by avoiding dark environment map reflections on 2D texture
            clearcoat={0.3}
            clearcoatRoughness={0.1}
            reflectivity={0.5}
            envMapIntensity={1.0}
            side={THREE.DoubleSide}
            alphaTest={0.01}
          />
        </mesh>
      );
    } else {
      // 3D GLB/GLTF renderer
      return <GLBModel src={displaySrc} material={activeMaterial} />;
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
            <group position={[-2.174, -0.22, 0]}>
              {renderMesh()}
            </group>
            {/* Right Ear Placement */}
            <group position={[2.174, -0.22, 0]}>
              {renderMesh()}
            </group>
          </group>
        ) : (
          // Default single centered body anchor (Necklace, Ring, Bangle)
          renderMesh()
        )}
      </group>

      {/* Symmetrical Spliced Earrings (For multi-item sets try-on) */}
      {activeIsSet && (
        <group>
          {/* Left Ear lobe placement */}
          <group ref={leftEarRef}>
            {renderEarringMesh()}
          </group>
          {/* Right Ear lobe placement */}
          <group ref={rightEarRef}>
            {renderEarringMesh()}
          </group>
        </group>
      )}
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
