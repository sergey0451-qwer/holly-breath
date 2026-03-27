import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SONGS_DB } from '../data/songs';

export default function S7_DailyBlessing() {
  const navigate = useNavigate();
  const [blessing, setBlessing] = useState('');
  const [songContext, setSongContext] = useState('');

  const spiritQuotes = [
    "Твой голос должен течь, как чистый горный поток.",
    "Найди ясность в резонансе. Дыхание — это бескрайнее небо.",
    "Virtual cmH2O — это глубина океана твоего присутствия.",
    "Свет луны отражается в спокойной воде. Освободи связки.",
    "Стань руслом для своего божественного звука."
  ];

  useEffect(() => {
    const lastSongId = localStorage.getItem('lastSessionSongId');
    let contextualBlessing = null;
    let contextTitle = "";

    if (lastSongId) {
      const song = SONGS_DB.find(s => s.id === lastSongId);
      if (song) {
        contextTitle = song.title;
        // Theological Insight Engine based on song title/id
        if (song.id === "yahweh" || song.title.toLowerCase().includes("яхве")) {
          contextualBlessing = "Вчера ты призывал имя 'Яхве'. Помни, Он — Рафа (Целитель) для твоих связок и Ире (Провайдер) для твоей жизни. Дыши Его присутствием сегодня.";
        } else if (song.id === "nash-bog" || song.title.toLowerCase().includes("наш бог")) {
          contextualBlessing = "Песня 'Наш Бог' напоминает нам, что Он делает воду вином. Позволь Ему сегодня преобразить твою усталость в новую силу для поклонения.";
        } else if (song.id === "slav" || song.title.toLowerCase().includes("слав")) {
          contextualBlessing = "Вчерашняя хвала — твоя сегодняшняя броня. 'Praise', который ты пел, уже рушит стены твоих сомнений.";
        } else {
          // Generic context fallback 
          contextualBlessing = `Твоя хвала в песне "${song.title}" уже достигла Небес. Пусть отзвуки этой мелодии ведут тебя через сегодняшний день.`;
        }
      }
    }

    if (contextualBlessing) {
      setBlessing(contextualBlessing);
      setSongContext("LAST SESSION CONTEXT ACTIVE");
    } else {
      const day = new Date().getDate();
      setBlessing(spiritQuotes[day % spiritQuotes.length]);
      setSongContext("GENERAL BLESSING");
    }
  }, []);

  return (
    <div className="blessing-screen" style={{
      height: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      textAlign: 'center'
    }}>
      <header style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <button onClick={() => navigate('/dashboard')} className="glow-hover" style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer' }}>
          ←
        </button>
      </header>

      <div style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 30px var(--accent)' }}>✨</div>
      <h1 style={{ fontSize: '1.5rem', color: '#fff', letterSpacing: '6px', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>DAILY BLESSING</h1>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '3px', opacity: 0.8 }}>
        AGENT SPIRIT • {songContext}
      </div>

      <div className="premium-card glow-hover" style={{
        marginTop: '3rem',
        padding: '3rem 2.5rem',
        fontSize: '1.3rem',
        lineHeight: '1.8',
        fontStyle: 'italic',
        color: '#fff',
        maxWidth: '500px',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        background: 'rgba(0, 25, 50, 0.6)',
        boxShadow: '0 10px 40px rgba(0, 212, 255, 0.15)'
      }}>
        "{blessing}"
      </div>

      <div style={{
        marginTop: '4rem',
        width: '60px',
        height: '2px',
        background: 'var(--accent)',
        boxShadow: '0 0 10px var(--accent)'
      }}></div>
    </div>
  );
}
