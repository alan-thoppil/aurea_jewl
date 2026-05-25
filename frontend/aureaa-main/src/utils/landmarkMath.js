/**
 * Math utilities for landmark processing
 */

export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

export const calculateMidpoint = (point1, point2) => {
  if (!point1 || !point2) return { x: 0, y: 0, z: 0 };
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    z: (point1.z + point2.z) / 2
  };
};

export const calculateRotation = (leftShoulder, rightShoulder) => {
  if (!leftShoulder || !rightShoulder) return 0;
  // Calculate angle between shoulders
  return Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  );
};
