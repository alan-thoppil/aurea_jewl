/**
 * Basic exponential smoothing
 */
export const lerp = (start, end, factor) => {
  if (start === undefined || end === undefined) return 0;
  return start + (end - start) * factor;
};

export const smoothVector3 = (current, target, factor = 0.2) => {
  if (!current) return target;
  if (!target) return current;
  
  return {
    x: lerp(current.x, target.x, factor),
    y: lerp(current.y, target.y, factor),
    z: lerp(current.z, target.z, factor),
  };
};

export const smoothAngle = (current, target, factor = 0.2) => {
  if (current === undefined) return target;
  if (target === undefined) return current;

  // Handle angle wrapping (e.g., from -PI to PI)
  let diff = target - current;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;

  return current + diff * factor;
};
