import { calculateDistance } from './landmarkMath';

/**
 * Calculates scale factor based on shoulder width or face width.
 * Maps the 2D pixel distance to an appropriate 3D scale.
 */
export const calculateScale = (leftShoulder, rightShoulder, baseShoulderDistance = 0.5) => {
  if (!leftShoulder || !rightShoulder) return 1;
  
  // Get 2D distance between shoulders (MediaPipe returns normalized coordinates [0, 1])
  const currentDistance = calculateDistance(leftShoulder, rightShoulder);
  
  // Base shoulder distance in normalized coordinates is typically ~0.4 - 0.6 for an average person at ideal camera distance
  const scale = currentDistance / baseShoulderDistance;
  
  // Return clamped scale to prevent wild explosions in size
  return Math.min(Math.max(scale, 0.3), 3.0);
};

export const computeDepthCorrection = (landmarks) => {
    // If z-coordinates are reliable, we could adjust depth. 
    // Usually MediaPipe Pose z-coords are relative to hips.
    return 0;
};
