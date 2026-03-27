import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function S6_MilestoneGate({ sessionTime, totalCycles, vocalRank }) {
  const navigate = useNavigate();

  const achievements = [
    { title: "Стальные Ребра", condition: totalCycles > 50, icon: "🛡️" },
    { title: "Золотой Резонанс", condition: vocalRank === "Master", icon: "💎" },
    { title: "Первый Шаг", condition: sessionTime > 60, icon: "👟" }
  ];

  return (
    <div className="milestone-screen" style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <header>
        <h1 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>VICTORY GATE</h1>
        <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>YOUR VOCAL EVOLUTION SUMMARY</p>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="premium-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--accent)' }}>{Math.floor(sessionTime / 60)}m</div>
          <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>TOTAL TIME</div>
        </div>
        <div className="premium-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--accent)' }}>{totalCycles}</div>
          <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>CYCLES COMPLETED</div>
        </div>
      </div>

      <section>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>ACHIEVEMENTS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {achievements.map((ach, idx) => (
            <div key={idx} className="premium-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1rem',
              opacity: ach.condition ? 1 : 0.3,
              filter: ach.condition ? 'none' : 'grayscale(1)',
              borderStyle: ach.condition ? 'solid' : 'dashed'
            }}>
              <span style={{ fontSize: '2rem' }}>{ach.icon}</span>
              <div>
                <div style={{ fontWeight: 'bold', color: ach.condition ? 'var(--accent)' : 'inherit' }}>{ach.title}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{ach.condition ? "UNLOCKED" : "LOCKED"}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button 
        className="gold-button" 
        style={{ marginTop: 'auto', width: '100%' }}
        onClick={() => navigate('/dashboard')}
      >
        BACK TO DASHBOARD
      </button>
    </div>
  );
}
