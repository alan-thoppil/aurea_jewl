import * as THREE from 'three';

/**
 * Premium PBR (Physically Based Rendering) Material Presets for Luxury Jewelry
 */

// 1. Polished Gold Material Preset (22K Indian Yellow Gold)
export const getGoldMaterial = (envMap?: THREE.Texture): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffd700'), // Classic vibrant gold
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMap: envMap || null,
    envMapIntensity: 1.8,
    reflectivity: 1.0,
    side: THREE.DoubleSide,
  });
};

// 2. Polished Rose Gold Material Preset
export const getRoseGoldMaterial = (envMap?: THREE.Texture): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#b76e79'), // Rich rose gold hue
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMap: envMap || null,
    envMapIntensity: 1.6,
    reflectivity: 1.0,
    side: THREE.DoubleSide,
  });
};

// 3. Polished Platinum / Silver Material Preset
export const getPlatinumMaterial = (envMap?: THREE.Texture): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#e5e4e2'), // Bright platinum
    metalness: 0.98,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMap: envMap || null,
    envMapIntensity: 2.0,
    reflectivity: 1.0,
    side: THREE.DoubleSide,
  });
};

// 4. Diamond Material (Refractive & Transmissive)
export const getDiamondMaterial = (envMap?: THREE.Texture): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    transparent: true,
    transmission: 0.95,     // High transmission for glass/diamond clarity
    opacity: 1.0,
    ior: 2.417,             // Real physical index of refraction for Diamond
    thickness: 0.5,        // Thickness for physical light refraction
    roughness: 0.0,         // Highly polished diamond facets
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMap: envMap || null,
    envMapIntensity: 3.5,   // Hyper-reflected shiny environment highlights
    reflectivity: 1.0,
    side: THREE.DoubleSide,
  });
};

// 5. Emerald Gemstone Material Preset (Transmissive Deep Green)
export const getEmeraldMaterial = (envMap?: THREE.Texture): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#046307'), // Deep emerald green
    transparent: true,
    transmission: 0.85,
    ior: 1.576,             // Index of refraction for emerald
    thickness: 0.8,
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    envMap: envMap || null,
    envMapIntensity: 2.5,
    reflectivity: 0.9,
    side: THREE.DoubleSide,
  });
};

// 6. Pearl Material Preset (Soft Subsurface Scattering Effect)
export const getPearlMaterial = (envMap?: THREE.Texture): THREE.MeshPhysicalMaterial => {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fdfcf7'), // Lustrous pearl cream
    roughness: 0.25,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transmission: 0.05,
    ior: 1.6,
    thickness: 0.1,
    sheen: 1.0,
    sheenColor: new THREE.Color('#ffd1dc'), // Pinkish pearlescent reflection
    envMap: envMap || null,
    envMapIntensity: 1.2,
    reflectivity: 0.8,
  });
};
