import * as THREE from 'three';

export interface HeadPose {
  pitch: number; // up/down nod
  yaw: number;   // left/right turn
  roll: number;  // head tilt
  quaternion: THREE.Quaternion;
  depthScale: number; // metric depth multiplier
  zDepth: number; // estimated distance from camera
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/**
 * Robust Head Pose Estimation and Metric Coordinate Projector
 */
export const estimateHeadPose = (faceLandmarks: Landmark[]): HeadPose => {
  if (!faceLandmarks || faceLandmarks.length < 468) {
    return {
      pitch: 0,
      yaw: 0,
      roll: 0,
      quaternion: new THREE.Quaternion(),
      depthScale: 1.0,
      zDepth: 5.0
    };
  }

  // 1. Key landmarks for orientation:
  // 1 = Nose Tip
  // 152 = Chin
  // 10 = Forehead top center
  // 33 = Right Eye outer corner (standard FaceMesh indexing)
  // 263 = Left Eye outer corner
  const nose = faceLandmarks[1];
  const chin = faceLandmarks[152];
  const forehead = faceLandmarks[10];
  const rEye = faceLandmarks[33];
  const lEye = faceLandmarks[263];

  // 2. Roll Calculation: Angle between eyes in 2D
  const roll = Math.atan2(lEye.y - rEye.y, lEye.x - rEye.x);

  // 3. Yaw Calculation: Relative horizontal distance of nose tip between the eyes
  const eyeCenter = {
    x: (lEye.x + rEye.x) / 2,
    y: (lEye.y + rEye.y) / 2,
    z: (lEye.z + rEye.z) / 2
  };
  const eyeDist = Math.sqrt(Math.pow(lEye.x - rEye.x, 2) + Math.pow(lEye.y - rEye.y, 2));
  
  // Normalized displacement of nose tip from vertical bisector
  const yawDisplacement = (nose.x - eyeCenter.x) / eyeDist;
  const yaw = yawDisplacement * -1.5; // Scale multiplier for natural feel

  // 4. Pitch Calculation: Relative vertical distance of nose to eye-level vs. face height
  const faceHeight = Math.sqrt(Math.pow(forehead.x - chin.x, 2) + Math.pow(forehead.y - chin.y, 2));
  const noseProjY = nose.y - eyeCenter.y;
  const pitchDisplacement = noseProjY / faceHeight;
  const pitch = (pitchDisplacement - 0.12) * 2.2; // Calibrated offset and scale

  // 5. Build Quaternion from Pitch, Yaw, Roll
  // Using 'YXZ' rotation order to handle swivels cleanly
  const euler = new THREE.Euler(pitch, yaw, roll, 'YXZ');
  const quaternion = new THREE.Quaternion().setFromEuler(euler);

  // 6. Metric Depth Estimation (interpupillary distance mapping)
  // The farther the user, the smaller the eyeDist in screen space.
  // Standard IPD is ~6.3cm. We map screen-space eye distance to camera depth.
  const baselineEyeDist = 0.18; // Eye distance at ~50cm distance from camera
  const zDepth = Math.max(0.5, Math.min(8.0, (baselineEyeDist / eyeDist) * 3.5));
  const depthScale = baselineEyeDist / eyeDist;

  return {
    pitch,
    yaw,
    roll,
    quaternion,
    depthScale,
    zDepth
  };
};

/**
 * Calculates local 3D offsets for left and right earlobes
 */
export const calculateEarPositions = (
  faceLandmarks: Landmark[], 
  headPose: HeadPose
): { leftEar: THREE.Vector3; rightEar: THREE.Vector3 } => {
  // landmarks 234 and 454 represent the base of the earlobes
  const leftEarLM = faceLandmarks[234];
  const rightEarLM = faceLandmarks[454];

  const leftPos = new THREE.Vector3(leftEarLM.x, leftEarLM.y, leftEarLM.z || 0);
  const rightPos = new THREE.Vector3(rightEarLM.x, rightEarLM.y, rightEarLM.z || 0);

  // Add subtle Z depth offsets using the head rotation yaw for perspective correction
  const halfHeadWidth = 0.08; 
  leftPos.z = (leftEarLM.z || 0) - Math.sin(headPose.yaw) * halfHeadWidth;
  rightPos.z = (rightEarLM.z || 0) + Math.sin(headPose.yaw) * halfHeadWidth;

  return {
    leftEar: leftPos,
    rightEar: rightPos
  };
};

/**
 * Computes correct positioning, rotation, and scaling vectors for Rings
 */
export const calculateRingAlignment = (
  handLandmarks: Landmark[]
): { position: THREE.Vector3; rotation: THREE.Quaternion; scale: THREE.Vector3 } | null => {
  if (!handLandmarks || handLandmarks.length < 21) return null;

  // Ring Finger Joints:
  // 13 = MCP (Knuckle)
  // 14 = PIP (Middle joint)
  // 15 = DIP (Tip joint)
  const mcp = handLandmarks[13];
  const pip = handLandmarks[14];

  // Knuckle position in screen space
  const position = new THREE.Vector3(pip.x, pip.y, pip.z || 0);

  // Finger direction vector
  const dir = new THREE.Vector3(pip.x - mcp.x, pip.y - mcp.y, (pip.z || 0) - (mcp.z || 0)).normalize();
  
  // Calculate relative finger scale based on joint-to-joint length
  const jointLength = Math.sqrt(Math.pow(pip.x - mcp.x, 2) + Math.pow(pip.y - mcp.y, 2));
  const scaleVal = jointLength * 0.7; // Clamped multiplier to match standard ring width
  const scale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);

  // Derive finger orientation quaternion
  const up = new THREE.Vector3(0, 1, 0);
  const rotation = new THREE.Quaternion().setFromUnitVectors(up, dir);

  return {
    position,
    rotation,
    scale
  };
};

/**
 * Calculates aligned bangle/bracelet coordinates along the wrist vector
 */
export const calculateBangleAlignment = (
  handLandmarks: Landmark[]
): { position: THREE.Vector3; rotation: THREE.Quaternion; scale: THREE.Vector3 } | null => {
  if (!handLandmarks || handLandmarks.length < 21) return null;

  // 0 = Wrist center
  // 5 = Index MCP joint
  // 17 = Pinky MCP joint
  const wrist = handLandmarks[0];
  const index = handLandmarks[5];
  const pinky = handLandmarks[17];

  const wristPos = new THREE.Vector3(wrist.x, wrist.y, wrist.z || 0);

  const vWrist = new THREE.Vector3(wrist.x, wrist.y, wrist.z || 0);
  const vIndex = new THREE.Vector3(index.x, index.y, index.z || 0);
  const vPinky = new THREE.Vector3(pinky.x, pinky.y, pinky.z || 0);

  // X axis: pinky to index vector (wrist width direction)
  const xAxis = new THREE.Vector3().subVectors(vIndex, vPinky).normalize();

  // Y axis: wrist to palm center vector (arm direction)
  const palmCenter = new THREE.Vector3(
    (vIndex.x + vPinky.x) / 2,
    (vIndex.y + vPinky.y) / 2,
    (vIndex.z + vPinky.z) / 2
  );
  const yAxis = new THREE.Vector3().subVectors(palmCenter, vWrist).normalize();

  // Make X and Y perfectly orthogonal
  // Z = X cross Y
  const zAxis = new THREE.Vector3().crossVectors(xAxis, yAxis).normalize();
  // Re-project Y to ensure complete orthogonality
  yAxis.crossVectors(zAxis, xAxis).normalize();

  // Construct standard 3D rotation matrix and extract its quaternion orientation
  const matrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
  const rotation = new THREE.Quaternion().setFromRotationMatrix(matrix);

  // Wrist width indicator (distance between index base and pinky base)
  const wristWidth = Math.sqrt(Math.pow(index.x - pinky.x, 2) + Math.pow(index.y - pinky.y, 2));
  const scaleVal = wristWidth * 1.85;
  const scale = new THREE.Vector3(scaleVal, scaleVal * 0.85, scaleVal); // Slightly elliptical Bangle projection

  return {
    position: wristPos,
    rotation,
    scale
  };
};

/**
 * Calculates aligned anklet coordinates along the ankle/leg vector
 */
export const calculateAnkletAlignment = (
  poseLandmarks: Landmark[]
): { position: THREE.Vector3; rotation: THREE.Quaternion; scale: THREE.Vector3 } | null => {
  if (!poseLandmarks || poseLandmarks.length < 33) return null;

  // 27 = Left Ankle, 28 = Right Ankle
  // 25 = Left Knee, 26 = Right Knee
  // 29 = Left Heel, 30 = Right Heel
  const lAnkle = poseLandmarks[27];
  const rAnkle = poseLandmarks[28];
  
  const lVisible = lAnkle && (lAnkle.visibility === undefined || lAnkle.visibility > 0.5);
  const rVisible = rAnkle && (rAnkle.visibility === undefined || rAnkle.visibility > 0.5);
  
  if (!lVisible && !rVisible) return null;

  // Track the ankle with higher visibility
  const isLeft = (lVisible && rVisible) 
    ? ((lAnkle.visibility ?? 0) > (rAnkle.visibility ?? 0))
    : !!lVisible;

  const ankle = isLeft ? lAnkle : rAnkle;
  const knee = isLeft ? poseLandmarks[25] : poseLandmarks[26];
  const heel = isLeft ? poseLandmarks[29] : poseLandmarks[30];

  if (!ankle) return null;

  const anklePos = new THREE.Vector3(ankle.x, ankle.y, ankle.z || 0);

  // Leg direction vector (from knee to ankle)
  let legDir = new THREE.Vector3(0, -1, 0); // default pointing down
  if (knee) {
    legDir = new THREE.Vector3(ankle.x - knee.x, ankle.y - knee.y, (ankle.z || 0) - (knee.z || 0)).normalize();
  }

  // Ankle scale estimation (based on ankle-to-heel distance, or standard fallback)
  let scaleVal = 0.08;
  if (heel) {
    const ankleToHeel = Math.sqrt(Math.pow(ankle.x - heel.x, 2) + Math.pow(ankle.y - heel.y, 2));
    scaleVal = ankleToHeel * 2.2; // Proportional scale for comfortable fit
  }

  const scale = new THREE.Vector3(scaleVal, scaleVal * 0.75, scaleVal); // slightly elliptical ankle projection

  const up = new THREE.Vector3(0, 1, 0);
  const baseRotation = new THREE.Quaternion().setFromUnitVectors(up, legDir);

  // Apply a 90-degree (PI/2) roll rotation to align the anklet perpendicular to the leg vector
  const rollAdjustment = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  const rotation = baseRotation.multiply(rollAdjustment);

  return {
    position: anklePos,
    rotation,
    scale
  };
};
