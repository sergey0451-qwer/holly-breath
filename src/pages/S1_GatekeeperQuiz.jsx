import { useState } from 'react';

const QUESTIONS = [
  {
    q: "Каков основной принцип 4-4-8-4 фазы?",
    a: ["Вдох, звук, вдох, задержка", "Вдох, задержка, выдох/звук, пауза", "Только задержка и звук"],
    correct: 1
  },
  {
    q: "Что такое SOVT?",
    a: ["Semi-Occluded Vocal Tract (Полузакрытый вокальный тракт)", "Sound Over Virtual Track", "System Of Vocal Training"],
    correct: 0
  },
  {
    q: "Что нужно делать, если почувствовал боль или дискомфорт?",
    a: ["Продолжать через силу", "Немедленно остановиться", "Спеть выше"],
    correct: 1
  },
  {
    q: "На сколько часов Guardian блокирует систему, если заметил перенапряжение?",
    a: ["1 час", "4 часа", "24 часа"],
    correct: 1
  },
  {
    q: "Как называется эстетика проекта?",
    a: ["Fire and Ice", "Living Water (Живая вода)", "Mechanical Soul"],
    correct: 1
  },
  {
    q: "Какую роль в 'Пентагоне' играет Architect?",
    a: ["Слайды и дизайн", "Вокальная биомеханика и инженерия звука", "Генерация Псалмов"],
    correct: 1
  },
  {
    q: "Что такое Vocal Sabbath?",
    a: ["Пение в церкви", "Обязательный период тишины для голоса", "Упражнение на выносливость"],
    correct: 1
  },
  {
    q: "Какой цвет является основным акцентом (Золото)?",
    a: ["#FFFFFF", "#0078FF", "#000000"],
    correct: 1
  },
  {
    q: "Что является 'двигателем' в био-механической триаде?",
    a: ["Гортань", "Дыхание (Подскладочный тиск)", "Глотка"],
    correct: 1
  },
  {
    q: "За сколько дней рассчитана полная программа HOLLY BREATH?",
    a: ["30 дней", "60 дней", "90 дней"],
    correct: 2
  }
];

export default function GatekeeperQuiz({ onPass }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (index) => {
    if (index === QUESTIONS[currentIdx].correct) {
      setScore(score + 1);
    }

    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
    }
  };

  const isPassed = score >= 8;

  if (finished) {
    return (
      <div className="quiz-container premium-card">
        <h2>Результат: {score}/10</h2>
        {isPassed ? (
          <div>
            <p>Доступ разрешен. Добро пожаловать в HOLLY BREATH.</p>
            <button className="gold-button" onClick={onPass} style={{ marginTop: '1rem' }}>Войти в систему</button>
          </div>
        ) : (
          <div>
            <p style={{ color: '#ff4d4d' }}>Доступ отклонен. Ваш результат ниже 8/10. Повторите изучение теории.</p>
            <button className="gold-button" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Попробовать снова</button>
          </div>
        )}
      </div>
    );
  }

  const currentQ = QUESTIONS[currentIdx];

  return (
    <div className="quiz-container premium-card">
      <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '1rem' }}>
        ВОПРОС {currentIdx + 1} ИЗ {QUESTIONS.length}
      </div>
      <h2 style={{ marginBottom: '2rem' }}>{currentQ.q}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentQ.a.map((ans, i) => (
          <button key={i} className="gold-button" onClick={() => handleAnswer(i)}>
            {ans}
          </button>
        ))}
      </div>
    </div>
  );
}
