export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function getShimmerPulse(time: number, speed: number = 2): number {
  return Math.abs(Math.sin(time * speed));
}
