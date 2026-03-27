import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  { id: 'exp', q: "Как давно вы занимаетесь вокалом?", opts: ["Новичок", "1-3 года", "Профи"] },
  { id: 'goal', q: "Что для вас сейчас важнее?", opts: ["Устойчивость опоры", "Снятие зажимов", "Сила звука"] },
  { id: 'ribs', q: "Чувствуете ли вы расширение нижних ребер при вдохе?", opts: ["Да", "Нет", "Не уверен(а)"] },
  { id: 'lump', q: "Бывает ли ощущение кома в горле после пения?", opts: ["Часто", "Редко", "Никогда"] },
  { id: 'capacity', q: "На сколько секунд вы можете растянуть ровный выдох без звука?", type: 'number' },
  { id: 'appoggio', q: "Знакомы ли вы с концепцией 'Appoggio' (Опора)?", opts: ["Да", "Слышал(а)", "Нет"] },
  { id: 'time', q: "Сколько минут в день вы готовы уделять практике?", opts: ["10", "20", "30+"] },
  { id: 'freq', q: "Как часто вы поете в течение недели?", opts: ["Каждый день", "2-3 раза", "Редко"] },
  { id: 'yoga', q: "Занимаетесь ли вы йогой или растяжкой?", sub: "(Это влияет на эластичность диафрагмы)", opts: ["Да", "Нет"] },
  { id: 'comfort', q: "Есть ли у вас сейчас дискомфорт в связках?", opts: ["Да", "Нет"] }
];

export default function S1_Intro({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1 is the initial splash, 0-9 are questions
  const [profile, setProfile] = useState({});
  const [fade, setFade] = useState(false);

  const handleAnswer = (val) => {
    const q = QUESTIONS[step];
    const newProfile = { ...profile, [q.id]: val };
    setProfile(newProfile);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishSurvey(newProfile);
    }
  };

  const finishSurvey = (finalProfile) => {
    // Calculate initial status
    let status = "Apprentice II";
    if (finalProfile.exp === "Новичок" || finalProfile.comfort === "Да" || finalProfile.lump === "Часто") {
      status = "Apprentice I";
    }

    localStorage.setItem('hb_userProfile', JSON.stringify(finalProfile));
    localStorage.setItem('hb_vocalRank', status);
    if (onComplete) onComplete(status);
    
    setFade(true);
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  if (step === -1) {
    const adeptId = localStorage.getItem('hb_userId') || '?';
    return (
      <div className="intro-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--accent)', letterSpacing: '8px', animation: 'breath 4s infinite' }}>HOLLY BREATH</h1>
        <p style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.8rem', maxWidth: '250px' }}>ПРОФЕССИОНАЛЬНАЯ СИСТЕМА ВОКАЛЬНОЙ БИО-ИНЖЕНЕРИИ</p>
        
        <div style={{ marginTop: '2.5rem', color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 'bold', fontStyle: 'italic', letterSpacing: '1px' }}>
          Ты — Адепт №{adeptId}.<br/>Твой путь начинается здесь.
        </div>
        
        <button className="gold-button glow-hover" onClick={() => setStep(0)} style={{ marginTop: '4rem', padding: '1.5rem 3rem' }}>НАЧАТЬ АНАЛИЗ</button>
      </div>
    );
  }

  const currentQ = QUESTIONS[step];

  return (
    <div className={`survey-screen ${fade ? 'fade-out' : ''}`} style={{ 
      height: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'white' 
    }}>
      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', marginBottom: '4rem' }}>
        <div style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
        <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.6rem', opacity: 0.4, letterSpacing: '2px' }}>{step + 1} / 10</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', lineHeight: '1.4', marginBottom: '1rem' }}>{currentQ.q}</h2>
        {currentQ.sub && <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '2rem' }}>{currentQ.sub}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          {currentQ.type === 'number' ? (
            <div style={{ textAlign: 'center' }}>
              <input 
                type="number" 
                placeholder="СЕКУНД" 
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAnswer(e.target.value)}
                style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--accent)', color: 'var(--accent)', fontSize: '3rem', textAlign: 'center', width: '150px', outline: 'none' }}
              />
              <button className="gold-button" style={{ marginTop: '2rem', width: '100%' }} onClick={(e) => handleAnswer(document.querySelector('input').value)}>ДАЛЕЕ</button>
            </div>
          ) : (
            currentQ.opts.map((opt, i) => (
              <button 
                key={i} 
                className="gold-button glow-hover" 
                onClick={() => handleAnswer(opt)}
                style={{ 
                  textAlign: 'left', padding: '1.5rem', borderRadius: '15px', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', fontSize: '1rem', textTransform: 'none'
                }}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      </div>

      <style>{`
        .fade-out { opacity: 0; transition: opacity 1s; }
        @keyframes breath { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; text-shadow: 0 0 30px rgba(255,215,0,0.8); } }
      `}</style>
    </div>
  );
}
