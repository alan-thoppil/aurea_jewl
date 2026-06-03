/**
 * Advanced motion stabilization using interpolation smoothing
 */
export class MotionStabilizer {
  constructor(smoothingFactor = 0.15) {
    this.smoothingFactor = smoothingFactor;
    this.current = null;
  }

  push(target) {
    if (!this.current) {
      this.current = { ...target };
      return;
    }

    // Interpolate towards the target
    this.current.x += (target.x - this.current.x) * this.smoothingFactor;
    this.current.y += (target.y - this.current.y) * this.smoothingFactor;
    this.current.z += (target.z - this.current.z) * this.smoothingFactor;
  }

  getStabilizedData() {
    return this.current;
  }

  reset() {
    this.current = null;
  }
}
