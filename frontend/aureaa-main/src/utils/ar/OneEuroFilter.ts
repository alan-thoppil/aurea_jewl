/**
 * A highly optimized One Euro Filter in TypeScript.
 * This is a first-order low-pass filter with an adaptive cutoff frequency.
 * It filters out high-frequency micro-jitter when the body is still,
 * while minimizing lag during rapid movement by dynamically increasing the cutoff frequency.
 */

class LowPassFilter {
  private alpha: number = 0;
  private y: number = 0;
  private initialized: boolean = false;

  constructor() {}

  public filter(value: number, alpha: number): number {
    this.alpha = alpha;
    if (!this.initialized) {
      this.y = value;
      this.initialized = true;
      return value;
    }
    this.y = this.y + alpha * (value - this.y);
    return this.y;
  }

  public reset() {
    this.initialized = false;
    this.y = 0;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastValue: number | null = null;
  private lastTimestamp: number | null = null;

  constructor(minCutoff = 0.8, beta = 0.03, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private calculateAlpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public filter(val: number, timestamp = Date.now()): number {
    if (this.lastValue === null || this.lastTimestamp === null) {
      this.lastValue = val;
      this.lastTimestamp = timestamp;
      this.xFilter.filter(val, 1.0);
      return val;
    }

    // Delta time in seconds
    const dt = Math.max((timestamp - this.lastTimestamp) / 1000.0, 0.001);
    this.lastTimestamp = timestamp;

    // Calculate instantaneous velocity (derivative)
    const dValue = (val - this.lastValue) / dt;
    this.lastValue = val;

    // Filter the derivative using a static cutoff frequency (dCutoff)
    const dAlpha = this.calculateAlpha(this.dCutoff, dt);
    const filteredDValue = this.dxFilter.filter(dValue, dAlpha);

    // Adaptive cutoff frequency based on velocity
    const cutoff = this.minCutoff + this.beta * Math.abs(filteredDValue);

    // Filter value with adaptive cutoff
    const alpha = this.calculateAlpha(cutoff, dt);
    return this.xFilter.filter(val, alpha);
  }

  public reset() {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastValue = null;
    this.lastTimestamp = null;
  }
}

/**
 * 3D Landmark OneEuroFilter for stable spatial coordinate filtering
 */
export class OneEuroFilter3D {
  private xFilter: OneEuroFilter;
  private yFilter: OneEuroFilter;
  private zFilter: OneEuroFilter;

  constructor(minCutoff = 0.5, beta = 0.02, dCutoff = 1.0) {
    this.xFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.yFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.zFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
  }

  public filter(val: { x: number; y: number; z: number }, timestamp = Date.now()) {
    return {
      x: this.xFilter.filter(val.x, timestamp),
      y: this.yFilter.filter(val.y, timestamp),
      z: this.zFilter.filter(val.z, timestamp)
    };
  }

  public reset() {
    this.xFilter.reset();
    this.yFilter.reset();
    this.zFilter.reset();
  }
}
