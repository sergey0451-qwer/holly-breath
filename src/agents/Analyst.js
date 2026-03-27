/**
 * [ANALYST] - Data Scientist Agent
 * Tracks KPIs and validates Gate readiness.
 */
export const PROGRESS_GATES = {
  IGNITION: { day: 30, stabilityRequired: 0.95 },
  CRUISING: { day: 60, stabilityRequired: 0.95 },
  MASTERY: { day: 90, stabilityRequired: 0.98 },
};

export const validateGateAccess = (currentDay, currentStability) => {
  if (currentDay >= 90) return { status: "MASTERY", canUnlock: currentStability >= 0.98 };
  if (currentDay >= 60) return { status: "CRUISING", canUnlock: currentStability >= 0.95 };
  if (currentDay >= 30) return { status: "IGNITION", canUnlock: currentStability >= 0.95 };
  return { status: "PREPARING", canUnlock: false };
};

export const getGrowthStats = (history) => {
  // Placeholder for data visualization logic
  return {
    pitchStability: "88%",
    pressureConsistency: "92%",
    overallGrowth: "+12%"
  };
};
