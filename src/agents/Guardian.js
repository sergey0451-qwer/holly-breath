/**
 * [GUARDIAN] - Safety Officer Agent
 * Monitors tension and enforces 4h-24h Vocal Sabbath.
 */
export const SAFETY_CONFIG = {
  maxTensionLevel: 0.8,
  mandatorySabbathHours: 4,
  criticalSabbathHours: 24,
};

export const checkVocalStrain = (hnr, tension) => {
  if (tension > SAFETY_CONFIG.maxTensionLevel) {
    return { status: "DANGER", message: "Guardian detected strain. Immediate 4h lockout recommended." };
  }
  return { status: "SAFE", message: "Vocal health within normal limits." };
};

export const getSabbathTimer = (lastSessionEnd) => {
  // Logic to calculate remaining lockout time
  const now = Date.now();
  const diff = now - lastSessionEnd;
  const fourHours = 4 * 60 * 60 * 1000;
  if (diff < fourHours) return (fourHours - diff) / (1000 * 60); // minutes remaining
  return 0;
};
