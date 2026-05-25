import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OccluderProps {
  position?: [number, number, number] | THREE.Vector3;
  rotation?: THREE.Quaternion | THREE.Euler;
  scale?: [number, number, number] | THREE.Vector3;
  enabled?: boolean;
}

/**
 * Invisible 3D Head Occlusion Mesh.
 * Writes to the WebGL depth buffer only, naturally masking jewelry (e.g., earrings)
 * that swivels or moves behind the head geometry.
 */
export const HeadOccluder: React.FC<OccluderProps> = ({
  position,
  rotation,
  scale,
  enabled = true
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    if (position) {
      if (position instanceof THREE.Vector3) {
        meshRef.current.position.copy(position);
      } else {
        meshRef.current.position.set(...position);
      }
    }

    if (rotation) {
      if (rotation instanceof THREE.Quaternion) {
        meshRef.current.quaternion.copy(rotation);
      } else {
        meshRef.current.rotation.copy(rotation);
      }
    }

    if (scale) {
      if (scale instanceof THREE.Vector3) {
        meshRef.current.scale.copy(scale);
      } else {
        meshRef.current.scale.set(...scale);
      }
    }
  });

  if (!enabled) return null;

  return (
    <mesh ref={meshRef}>
      {/* Dynamic head-shaped ellipsoid */}
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        colorWrite={false} // Silent invisible draw
        depthWrite={true}  // Commits to Z-depth buffer
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Invisible 3D Neck Occluder.
 * Models the throat curvature to naturally occlude the rear strings/chain of Necklaces.
 */
export const NeckOccluder: React.FC<OccluderProps> = ({
  position,
  rotation,
  scale,
  enabled = true
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    if (position) {
      if (position instanceof THREE.Vector3) {
        meshRef.current.position.copy(position);
      } else {
        meshRef.current.position.set(...position);
      }
    }

    if (rotation) {
      if (rotation instanceof THREE.Quaternion) {
        meshRef.current.quaternion.copy(rotation);
      } else {
        meshRef.current.rotation.copy(rotation);
      }
    }

    if (scale) {
      if (scale instanceof THREE.Vector3) {
        meshRef.current.scale.copy(scale);
      } else {
        meshRef.current.scale.set(...scale);
      }
    }
  });

  if (!enabled) return null;

  return (
    <mesh ref={meshRef}>
      {/* Cylindrical neck mock */}
      <cylinderGeometry args={[1, 1.1, 2, 32]} />
      <meshBasicMaterial
        colorWrite={false}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Invisible 3D Finger Occluder.
 * Clips the rear/bottom loops of Rings as the hand turns.
 */
export const FingerOccluder: React.FC<OccluderProps> = ({
  position,
  rotation,
  scale,
  enabled = true
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    if (position) {
      if (position instanceof THREE.Vector3) {
        meshRef.current.position.copy(position);
      } else {
        meshRef.current.position.set(...position);
      }
    }

    if (rotation) {
      if (rotation instanceof THREE.Quaternion) {
        meshRef.current.quaternion.copy(rotation);
      } else {
        meshRef.current.rotation.copy(rotation);
      }
    }

    if (scale) {
      if (scale instanceof THREE.Vector3) {
        meshRef.current.scale.copy(scale);
      } else {
        meshRef.current.scale.set(...scale);
      }
    }
  });

  if (!enabled) return null;

  return (
    <mesh ref={meshRef}>
      {/* Finger digit approximation capsule */}
      <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
      <meshBasicMaterial
        colorWrite={false}
        depthWrite={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
