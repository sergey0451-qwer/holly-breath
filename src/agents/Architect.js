/**
 * [ARCHITECT] - Lead Engineer Agent
 * Responsible for FFT, PitchAnalysis, and 4-4-8-4 Breathing Logic.
 */

export const BREATH_PHASES = [
  { label: "ВДОХ", duration: 4000, color: "#0078FF", scale: 1.4 },
  { label: "ЗАДЕРЖКА", duration: 4000, color: "#C0C0C0", scale: 1.4 },
  { label: "ВЫДОХ / ЗВУК", duration: 8000, color: "#001F3F", scale: 0.85 },
  { label: "ПАУЗА", duration: 4000, color: "#888", scale: 0.85 },
];

export const VOCAL_ENGINE_CONFIG = {
  subglotticPressureLimit: 10, // cmH2O
  goldenCorridorTolerance: 0.1, // 10%
  sampleRate: 44100
};

export const getArchitectAdvice = (phase) => {
  // Логика технических подсказок на основе фазы
  if (phase === "IGNITION") return "Сосредоточьтесь на стабильности подскладочного давления.";
  return "Двигайтесь плавно по Золотому Коридору.";
};
