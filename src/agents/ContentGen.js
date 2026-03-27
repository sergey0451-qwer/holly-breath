/**
 * [CONTENT GEN] - Creative Director Agent
 * Generates exercises and manages the Worship Flow audio engine.
 */
export const EXERCISES = [
  { id: "SOVT_1", title: "Virtual SOVT Pipe", type: "Rehab", difficulty: "Easy" },
  { id: "BREATH_1", title: "4-4-8-4 Calibration", type: "Core", difficulty: "Easy" },
  { id: "TWANG_1", title: "Resonance Pulse", type: "Power", difficulty: "Medium" },
];

export const getWorshipFlowSettings = (phase) => {
  switch (phase) {
    case "INHALATION": return { padVolume: 0.8, pulseFreq: 60, texture: "Airy" };
    case "HOLD": return { padVolume: 0.5, pulseFreq: 528, texture: "Resonant" };
    case "EXHALATION": return { padVolume: 1.0, pulseFreq: 30, texture: "Flowing" };
    default: return { padVolume: 0.2, pulseFreq: 0, texture: "Still" };
  }
};
