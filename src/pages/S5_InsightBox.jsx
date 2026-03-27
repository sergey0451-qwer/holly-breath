import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function S5_InsightBox() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('prophetic_insights');
    if (saved) {
      setInsights(JSON.parse(saved).sort((a,b) => b.timestamp - a.timestamp));
    }
  }, []);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const clearInsights = () => {
    if (window.confirm("Удалить все инсайты?")) {
      localStorage.removeItem('prophetic_insights');
      setInsights([]);
    }
  };

  return (
    <div className="dashboard-scroll" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg)', color: 'white' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
        <button onClick={() => navigate('/dashboard')} className="glow-hover" style={{ position: 'absolute', left: 0, top: 0, background: 'none', border: 'none', color: 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer' }}>
          ←
        </button>
        <h2 style={{ color: '#fff', letterSpacing: '6px', fontSize: '1.8rem', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>PROPHETIC JOURNAL</h2>
        <p style={{ color: 'var(--accent)', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.5rem', letterSpacing: '2px' }}>AUDIO-TO-INSIGHT REPOSITORY</p>
      </header>
      
      {insights.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
          {insights.map(ins => (
            <div key={ins.id} className="premium-card glow-hover" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)', background: 'linear-gradient(135deg, rgba(0,25,50,0.8) 0%, transparent 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)', letterSpacing: '1px' }}>{formatDate(ins.timestamp)}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                  {ins.songId}
                </div>
              </div>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.6', fontStyle: 'italic', color: '#fff' }}>
                "{ins.text}"
              </p>
            </div>
          ))}
          <button onClick={clearInsights} style={{ background: 'none', border: 'none', color: 'rgba(255,0,0,0.5)', marginTop: '2rem', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '2px' }}>ОЧИСТИТЬ ЖУРНАЛ</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '5rem', opacity: 0.5 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
          <p>В дневнике пока пусто.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Используйте кнопку микрофона в режиме Flow State (Свободная Практика), чтобы быстро записать мысли.</p>
        </div>
      )}
    </div>
  );
}
