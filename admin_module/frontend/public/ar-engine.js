/**
 * AUREA × JewelPro - High-Fidelity AR Jewellery Drawing & Landmark Engine
 * Handles WebRTC feeds, MediaPipe model loops, coordinate conversions, and luxury shimmer rendering.
 */

class AREngine {
  constructor(videoElement, canvasElement, statusElement, hintElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.statusEl = statusElement;
    this.hintEl = hintElement;

    this.hands = null;
    this.faceMesh = null;
    this.camera = null;

    this.activeItem = null; // { sku, category, image }
    this.lastDetectionTime = Date.now();
    this.isTrackingActive = false;

    // Landmark cache to apply Exponential Smoothing (One Euro Filter / Lerp)
    this.smoothedPoints = {
      ring: null, // { x, y, angle, scale }
      necklace: null, // { x, y, width, yaw }
      earringL: null, // { x, y, size }
      earringR: null  // { x, y, size }
    };

    this.init();
  }

  init() {
    this.statusEl.innerText = "Status: Initializing AI tracking models...";
    
    // 1. Initialize MediaPipe Hands
    if (window.Hands) {
      this.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: window.navigator.userAgent.match(/Mobi|Android|iPhone/i) ? 0 : 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.7
      });
      this.hands.onResults((results) => this.handleHandResults(results));
    } else {
      console.error("AUREA Engine: MediaPipe Hands script not found in window.");
    }

    // 2. Initialize MediaPipe Face Mesh
    if (window.FaceMesh) {
      this.faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.75
      });
      this.faceMesh.onResults((results) => this.handleFaceResults(results));
    } else {
      console.error("AUREA Engine: MediaPipe Face Mesh script not found in window.");
    }

    // Start checking for active frames to display prompt hints
    setInterval(() => this.checkDetectionTimeout(), 500);
  }

  /**
   * Start the camera stream using MediaPipe CameraUtils.
   */
  async startCamera() {
    this.statusEl.innerText = "Status: Requesting WebRTC camera access...";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });
      this.video.srcObject = stream;
      
      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          
          // Match canvas dimensions exactly to the camera feed
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;

          // Start the MediaPipe frame sender loop
          if (window.Camera) {
            this.camera = new window.Camera(this.video, {
              onFrame: async () => {
                // Forward frame to appropriate model depending on active item category
                if (this.activeItem) {
                  if (this.activeItem.category === 'ring' && this.hands) {
                    await this.hands.send({ image: this.video });
                  } else if ((this.activeItem.category === 'necklace' || this.activeItem.category === 'earring') && this.faceMesh) {
                    await this.faceMesh.send({ image: this.video });
                  }
                } else {
                  // Fallback: simple loop to draw mirror feed if no item active
                  this.drawCameraOnly();
                }
              },
              width: this.video.videoWidth,
              height: this.video.videoHeight
            });
            this.camera.start();
            this.statusEl.innerText = "Status: Live AR Active";
            this.statusEl.classList.add('text-emerald-400');
            resolve(true);
          } else {
            this.statusEl.innerText = "Status: MediaPipe camera helper missing";
            resolve(false);
          }
        };
      });
    } catch (err) {
      console.error("AUREA Engine: Camera access denied", err);
      this.statusEl.innerText = "Status: Camera Access Denied. Please enable webcam permissions.";
      this.statusEl.classList.add('text-red-400');
      alert("Webcam Access Denied: AUREA requires camera permission for real-time try-on overlays.");
      throw err;
    }
  }

  /**
   * Set active jewellery item to overlay.
   */
  setActiveItem(sku) {
    if (!sku) {
      this.activeItem = null;
      this.smoothedPoints = { ring: null, necklace: null, earringL: null, earringR: null };
      return;
    }

    const details = window.jewelleryLoader.getDetails(sku);
    const img = window.jewelleryLoader.getImage(sku);

    if (details && img) {
      this.activeItem = {
        sku: details.sku,
        category: details.category,
        image: img
      };
      this.lastDetectionTime = Date.now();
      console.log(`AUREA Engine: Mounted active jewellery overlay ${details.name} (SKU: ${sku})`);
    }
  }

  /**
   * Helper to convert normalized coordinate (0-1) to Canvas pixels,
   * factoring in horizontal mirroring.
   */
  toCanvasCoords(lm) {
    // Invert X for mirrored webcam stream
    return {
      x: (1 - lm.x) * this.canvas.width,
      y: lm.y * this.canvas.height
    };
  }

  /**
   * Check distance between two 2D points.
   */
  getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  /**
   * Check if face/hand has been missing for >2 seconds.
   */
  checkDetectionTimeout() {
    if (!this.activeItem) {
      this.hintEl.style.display = 'none';
      return;
    }
    const elapsed = Date.now() - this.lastDetectionTime;
    if (elapsed > 2000) {
      this.hintEl.innerText = this.activeItem.category === 'ring' 
        ? "Please position your hand in the camera frame" 
        : "Please center your face in the camera frame";
      this.hintEl.style.display = 'block';
    } else {
      this.hintEl.style.display = 'none';
    }
  }

  /**
   * Draw the mirrored video feed only (used when no ornament is selected).
   */
  drawCameraOnly() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    // Mirror horizontally
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvas.width, 0);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Hands tracking pipeline results callback.
   */
  handleHandResults(results) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw mirrored background video frame
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvas.width, 0);
    this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      this.lastDetectionTime = Date.now();

      // Iterate through detected hands (up to 2)
      for (const landmarks of results.multiHandLandmarks) {
        if (this.activeItem && this.activeItem.category === 'ring') {
          this.drawRingOverlay(landmarks);
        }
      }
    }
  }

  /**
   * Draw ring on finger base MCP (13) and mid PIP (14).
   */
  drawRingOverlay(landmarks) {
    // 1. Get raw pixel coordinates for ring anchors
    const mcpRaw = this.toCanvasCoords(landmarks[13]);
    const pipRaw = this.toCanvasCoords(landmarks[14]);

    // 2. Perform Exponential smoothing to prevent coordinate jitters
    if (!this.smoothedPoints.ring) {
      this.smoothedPoints.ring = {
        mcp: mcpRaw,
        pip: pipRaw
      };
    } else {
      const alpha = 0.25; // Lerp weight (lower = smoother, higher = more responsive)
      this.smoothedPoints.ring.mcp.x += (mcpRaw.x - this.smoothedPoints.ring.mcp.x) * alpha;
      this.smoothedPoints.ring.mcp.y += (mcpRaw.y - this.smoothedPoints.ring.mcp.y) * alpha;
      this.smoothedPoints.ring.pip.x += (pipRaw.x - this.smoothedPoints.ring.pip.x) * alpha;
      this.smoothedPoints.ring.pip.y += (pipRaw.y - this.smoothedPoints.ring.pip.y) * alpha;
    }

    const mcp = this.smoothedPoints.ring.mcp;
    const pip = this.smoothedPoints.ring.pip;

    // 3. Compute geometric properties: Center, Rotation Angle, and Sizing Scale
    const centerX = (mcp.x + pip.x) / 2;
    const centerY = (mcp.y + pip.y) / 2;

    const dx = pip.x - mcp.x;
    const dy = pip.y - mcp.y;
    const angle = Math.atan2(dy, dx);

    const dist = this.getDistance(mcp, pip);
    const ringScale = dist * 1.8;

    // 4. Draw luxury PNG overlay on canvas
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    // Rotate ring perpendicular to the finger bone vector
    this.ctx.rotate(angle + Math.PI / 2);

    // Apply soft shimmer alpha pulsing
    const shimmer = Math.sin(Date.now() * 0.003) * 0.08 + 0.92;
    this.ctx.globalAlpha = shimmer;

    // Draw dropshadow for visual integration
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 5;

    this.ctx.drawImage(
      this.activeItem.image,
      -ringScale / 2,
      -ringScale / 2,
      ringScale,
      ringScale
    );

    this.ctx.restore();
  }

  /**
   * Face Mesh tracking pipeline results callback.
   */
  handleFaceResults(results) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw mirrored background video frame
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.translate(-this.canvas.width, 0);
    this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      this.lastDetectionTime = Date.now();
      const face = results.multiFaceLandmarks[0];

      if (this.activeItem) {
        if (this.activeItem.category === 'necklace') {
          this.drawNecklaceOverlay(face);
        } else if (this.activeItem.category === 'earring') {
          this.drawEarringOverlay(face);
        }
      }
    }
  }

  /**
   * Draw necklace below chin (152) and centered between cheeks (234 & 454).
   */
  drawNecklaceOverlay(face) {
    const leftCheek = this.toCanvasCoords(face[234]);
    const rightCheek = this.toCanvasCoords(face[454]);
    const chin = this.toCanvasCoords(face[152]);
    const forehead = this.toCanvasCoords(face[10]);
    const nose = this.toCanvasCoords(face[1]);

    // 1. Smooth out point positions
    if (!this.smoothedPoints.necklace) {
      this.smoothedPoints.necklace = {
        leftCheek,
        rightCheek,
        chin,
        forehead,
        nose
      };
    } else {
      const alpha = 0.25;
      const smooth = this.smoothedPoints.necklace;
      
      smooth.leftCheek.x += (leftCheek.x - smooth.leftCheek.x) * alpha;
      smooth.leftCheek.y += (leftCheek.y - smooth.leftCheek.y) * alpha;
      smooth.rightCheek.x += (rightCheek.x - smooth.rightCheek.x) * alpha;
      smooth.rightCheek.y += (rightCheek.y - smooth.rightCheek.y) * alpha;
      smooth.chin.x += (chin.x - smooth.chin.x) * alpha;
      smooth.chin.y += (chin.y - smooth.chin.y) * alpha;
      smooth.forehead.x += (forehead.x - smooth.forehead.x) * alpha;
      smooth.forehead.y += (forehead.y - smooth.forehead.y) * alpha;
      smooth.nose.x += (nose.x - smooth.nose.x) * alpha;
      smooth.nose.y += (nose.y - smooth.nose.y) * alpha;
    }

    const smooth = this.smoothedPoints.necklace;

    // 2. Compute Face height scale and Center coordinate anchors
    const faceHeight = this.getDistance(smooth.forehead, smooth.chin);
    
    // Center X should reside strictly at midpoint of the cheek boundaries
    const centerX = (smooth.leftCheek.x + smooth.rightCheek.x) / 2;
    
    // Project Y position ~1.4 times the head height downwards from the chin
    const necklaceY = smooth.chin.y + faceHeight * 0.45;

    // 3. Compute dynamic sizing and rotation angle based on face tilt
    const dx = smooth.rightCheek.x - smooth.leftCheek.x;
    const dy = smooth.rightCheek.y - smooth.leftCheek.y;
    const tiltAngle = Math.atan2(dy, dx);

    const cheekDist = this.getDistance(smooth.leftCheek, smooth.rightCheek);
    const chainWidth = cheekDist * 2.2;
    const chainHeight = chainWidth * (this.activeItem.image.height / this.activeItem.image.width);

    // 4. Calculate Face Yaw for realistic 3D perspective squishing
    const midFaceX = (smooth.leftCheek.x + smooth.rightCheek.x) / 2;
    const maxOffset = cheekDist / 2;
    const yawOffset = (smooth.nose.x - midFaceX) / maxOffset; // Range ~ [-1, 1]
    const scaleX = Math.max(0.4, 1 - Math.abs(yawOffset) * 0.45); // Scale width depending on yaw angle

    // 5. Render to Canvas
    this.ctx.save();
    this.ctx.translate(centerX, necklaceY);
    this.ctx.rotate(tiltAngle);
    this.ctx.scale(scaleX, 1.0); // Apply 3D perspective squish

    // Apply shimmer pulsing
    this.ctx.globalAlpha = Math.sin(Date.now() * 0.003) * 0.08 + 0.92;

    // Add luxury drop shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetY = 15;

    this.ctx.drawImage(
      this.activeItem.image,
      -chainWidth / 2,
      0, // Position top of chain horizontal mesh centered
      chainWidth,
      chainHeight
    );

    this.ctx.restore();
  }

  /**
   * Draw twin earrings on left lobe (234) and right lobe (454) dropped slightly.
   */
  drawEarringOverlay(face) {
    const leftEar = this.toCanvasCoords(face[234]);
    const rightEar = this.toCanvasCoords(face[454]);
    const chin = this.toCanvasCoords(face[152]);
    const forehead = this.toCanvasCoords(face[10]);

    // 1. Smooth out point coordinates
    if (!this.smoothedPoints.earringL) {
      this.smoothedPoints.earringL = leftEar;
      this.smoothedPoints.earringR = rightEar;
      this.smoothedPoints.necklace = { chin, forehead }; // Reuse cache keys for reference heights
    } else {
      const alpha = 0.25;
      
      this.smoothedPoints.earringL.x += (leftEar.x - this.smoothedPoints.earringL.x) * alpha;
      this.smoothedPoints.earringL.y += (leftEar.y - this.smoothedPoints.earringL.y) * alpha;
      this.smoothedPoints.earringR.x += (rightEar.x - this.smoothedPoints.earringR.x) * alpha;
      this.smoothedPoints.earringR.y += (rightEar.y - this.smoothedPoints.earringR.y) * alpha;
      
      this.smoothedPoints.necklace.chin.x += (chin.x - this.smoothedPoints.necklace.chin.x) * alpha;
      this.smoothedPoints.necklace.chin.y += (chin.y - this.smoothedPoints.necklace.chin.y) * alpha;
      this.smoothedPoints.necklace.forehead.x += (forehead.x - this.smoothedPoints.necklace.forehead.x) * alpha;
      this.smoothedPoints.necklace.forehead.y += (forehead.y - this.smoothedPoints.necklace.forehead.y) * alpha;
    }

    const sLeft = this.smoothedPoints.earringL;
    const sRight = this.smoothedPoints.earringR;
    const sFaceWidth = this.getDistance(sLeft, sRight);

    // 2. Compute Earring size & Aspect Ratio heights
    const earringWidth = sFaceWidth * 0.15;
    const aspectRatio = this.activeItem.image.height / this.activeItem.image.width;
    const earringHeight = earringWidth * aspectRatio;

    // Drop earring Y slightly below outer jaw border to represent earlobe gravity hang
    const leftLobeY = sLeft.y + earringWidth * 0.25;
    const rightLobeY = sRight.y + earringWidth * 0.25;

    // Soft luxury shimmer alpha pulse
    const shimmer = Math.sin(Date.now() * 0.003) * 0.08 + 0.92;

    // A. Draw Left Earring
    this.ctx.save();
    this.ctx.globalAlpha = shimmer;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 6;
    this.ctx.shadowOffsetY = 8;
    this.ctx.shadowOffsetX = 3;

    this.ctx.drawImage(
      this.activeItem.image,
      sLeft.x - earringWidth / 2,
      leftLobeY,
      earringWidth,
      earringHeight
    );
    this.ctx.restore();

    // B. Draw Right Earring (Mirrored so gems face correct inner symmetric direction)
    this.ctx.save();
    this.ctx.globalAlpha = shimmer;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 6;
    this.ctx.shadowOffsetY = 8;
    this.ctx.shadowOffsetX = -3; // Inverse shadow direction for right ear

    // Translate to center of earring, flip horizontally, and draw
    this.ctx.translate(sRight.x, rightLobeY + earringHeight / 2);
    this.ctx.scale(-1, 1); // Mirror right earring
    
    this.ctx.drawImage(
      this.activeItem.image,
      -earringWidth / 2,
      -earringHeight / 2,
      earringWidth,
      earringHeight
    );
    this.ctx.restore();
  }

  /**
   * Take high-quality transparent PNG snapshot of the combined video + overlay canvas.
   */
  takeSnapshot() {
    console.log("AUREA Engine: Capture requested. Synthesizing portrait snapshot...");
    try {
      const dataUrl = this.canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `AUREA-TryOn-${this.activeItem ? this.activeItem.sku : 'Model'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      console.log("AUREA Engine: Portrait snapshot successfully exported.");
    } catch (e) {
      console.error("AUREA Engine: Failed to generate snapshot due to canvas pollution.", e);
      alert("Snapshot Failed: Please verify camera assets are fully loaded and try again.");
    }
  }
}

// Export singleton engine setter
window.AREngineClass = AREngine;
