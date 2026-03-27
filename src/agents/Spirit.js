/**
 * [SPIRIT] - Visionary Lead Agent
 * Manages 90-day roadmap and Biblical motivation.
 */
export const SPIRITUAL_ANCHORS = [
  { day: 1, verse: "Ps. 33:9", text: "Ибо Он сказал, — и сделалось; Он повелел, — и явилось." },
  { day: 2, verse: "Ps. 150:3", text: "Хвалите Его со звуком трубным, хвалите Его на псалтири и гуслях." },
  { day: 3, verse: "Ps. 50:12", text: "Сердце чистое сотвори во мне, Боже, и дух правый обнови внутри меня." },
  { day: 4, verse: "Ps. 150:6", text: "Все дышащее да хвалит Господа! Аллилуия." },
  { day: 5, verse: "Col. 4:6", text: "Слово ваше да будет всегда с благодатию, приправлено солью..." },
];

export const getDailyBlessing = (day) => {
  const anchor = SPIRITUAL_ANCHORS.find(a => a.day === day) || SPIRITUAL_ANCHORS[0];
  return anchor;
};

export const getMissionMotivation = () => {
  return "Твой голос — это инструмент прославления и био-инженерный шедевр.";
};
