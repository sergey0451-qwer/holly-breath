export const VOCAL_MODULES = [
  {
    id: "mod-1-tvf-fvf",
    title: "Истинные и Ложные Связки (TVF vs FVf)",
    focus: "Расслабление и контроль",
    description: "Анатомическое разделение истинных голосовых складок (True Vocal Folds) и ложных (False Vocal Folds). Сужение ложных связок ведет к зажиму, усталости и срыву голоса.",
    exercise: "Silent Breath (Тихий вдох). Сделайте вдох так, словно вы мягко зеваете или приятно удивляетесь. Вы не должны слышать шум воздуха. Это раздвигает ложные складки (FVf Retraction).",
    mechanics: ["FVf Retraction", "TVF Onset"]
  },
  {
    id: "mod-2-twang-aes",
    title: "Твэнг и Сфинктер Гортани (Twang & AES)",
    focus: "Яркость и пробивная сила",
    description: "Сужение черпалонадгортанного сфинктера (Aryepiglottic Sphincter). Усиливает звук на 10-20 дБ без лишнего давления воздуха (Boosts 3-4kHz - Singer's Formant).",
    exercise: "Произнесите резкое 'Ня-ня-ня' как капризный ребенок или имитируйте кряканье утки. Звук должен быть направлен жестко вперед, пронзительно, без носового призвука (это не гнусавость!).",
    mechanics: ["AES Narrowing", "High Larynx"]
  },
  {
    id: "mod-3-anchoring",
    title: "Анкеровка (Anchoring)",
    focus: "Стабилизация звука",
    description: "Подключение больших мышечных групп (Neck & Torso Anchoring) для снятия нагрузки с гортани. Правило: 'Петь телом, а не горлом'. Необходима перед высокими и мощными нотами.",
    exercise: "Активируйте широчайшие мышцы спины (потяните локти вниз), слегка подайте грудную клетку вперед и 'укорените' шею, отводя голову чуть назад (сопротивляясь воображаемому давлению сзади).",
    mechanics: ["Torso Anchor", "Neck Anchor"]
  },
  {
    id: "mod-4-belt-cry",
    title: "Бэлтинг и Всхлип (Belt & Cry)",
    focus: "Эмоция и Мощь",
    description: "Бэлтинг: Высокое положение языка (High Tongue), широкая ротовая полость, TVF Thick Mass (плотное смыкание). Cry: Наклон щитовидного хряща (Thyroid Tilt), снимает напряжение верхних нот, добавляет 'плач'.",
    exercise: "Cry: Сымитируйте тихий плач или скуление щенка (высоко и гортанно). Belt: Громкий, уверенный крик 'Гей!' вдаль с мощной опорой на живот (Subglottic pressure) в речевом режиме без срыва на фальцет.",
    mechanics: ["Thyroid Tilt", "Subglottic Pressure Control", "High Tongue"]
  }
];

export const generate90DayMarathon = () => {
  const days = [];
  for (let i = 1; i <= 90; i++) {
    // Vocal Rest: Дни тишины каждый 7-й день (как выходной)
    if (i % 7 === 0) {
      days.push({
        day: i,
        phase: "Rest",
        title: "День Тишины (Vocal Rest)",
        theory: "Голосовые связки — это мышцы и нежная слизистая. Им критически необходимо время для восстановления клеточной структуры.",
        task: "Полное молчание или минимальная речь. Пейте теплую воду. КАТЕГОРИЧЕСКИ исключите шепот (он сушит и напрягает связки сильнее обычной речи)."
      });
      continue;
    }

    let phase = "";
    let focus = "";
    let detail = "";

    if (i <= 28) {
      phase = "Foundation";
      focus = "Дыхание, расслабление челюсти, контроль TVF/FVf.";
      detail = "Сконцентрируйтесь на 'Silent Breath' и снятии зажимов с горла.";
    } else if (i <= 56) {
      phase = "Power";
      focus = "Twang & Anchoring. Старт работы с Бэлтингом.";
      detail = "Подключайте тело (Torso Anchor). Ищите частоту 3-4 кГц с помощью пронзительного Твэнга.";
    } else {
      phase = "Artistry";
      focus = "Всхлип (Cry), Вибрато, переходные ноты (Passaggio).";
      detail = "Миксуйте регистры, используйте Thyroid Tilt для смягчения высоких нот.";
    }

    days.push({
      day: i,
      phase,
      title: `День ${i}: ${phase}`,
      theory: `Фокус фазы: ${focus}`,
      task: `Отработайте распевки блока ${phase}. ${detail}`
    });
  }
  return days;
};

export const MARATHON_90 = generate90DayMarathon();
