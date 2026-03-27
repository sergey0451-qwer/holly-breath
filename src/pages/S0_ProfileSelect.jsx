import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainingEngine from '../logic/TrainingEngine';

const TEAM_MEMBERS = [
  { id: '1', name: 'Анна', role: 'Лидер / Вокалист' },
  { id: '2', name: 'Сергей', role: 'Вокалист / Акустика' },
  { id: '3', name: 'Ефим', role: 'Вокалист / Электрогитара' },
  { id: '4', name: 'Элай', role: 'Вокалист / Перкуссионист' },
  { id: '5', name: 'Дима', role: 'Вокалист / Клавишник' },
  { id: '6', name: 'София', role: 'Вокалист' },
  { id: '7', name: 'Ксения', role: 'Клавишник' }
];

export default function S0_ProfileSelect({ onSelect }) {
  const navigate = useNavigate();
  const [teamStatus, setTeamStatus] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Temporary engine to read localStorage states
    const engine = new TrainingEngine('1');
    setTeamStatus(engine.getTeamStatus());

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleSelect = (id) => {
    onSelect(id);
    if (!localStorage.getItem(`hb_training_progress_${id}`)) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="profile-select-screen" style={{ 
      minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', 
      background: 'var(--bg)', color: 'white' 
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem',
          height: '40px', alignItems: 'flex-end'
        }}>
          {TEAM_MEMBERS.map(m => (
            <div key={m.id} style={{
              width: '2px', height: '100%', 
              background: 'linear-gradient(to top, transparent, var(--accent))',
              boxShadow: '0 0 15px var(--accent)',
              animation: 'flicker 2s infinite ease-in-out',
              opacity: 0.6
            }} />
          ))}
        </div>
        <style>{`
          @keyframes flicker {
            0%, 100% { transform: scaleY(0.8); opacity: 0.4; }
            50% { transform: scaleY(1.2); opacity: 0.9; }
          }
          @keyframes softPulse {
            0% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.2); border-color: rgba(212, 175, 55, 0.3); }
            50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.8); border-color: rgba(212, 175, 55, 1); }
            100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.2); border-color: rgba(212, 175, 55, 0.3); }
          }
        `}</style>
        <h1 style={{ color: 'var(--accent)', letterSpacing: '4px', fontSize: '1.2rem' }}>HOLY BREATH</h1>
        <p style={{ opacity: 0.8, fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.5rem', color: '#00D4FF' }}>Единое дыхание команды</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {TEAM_MEMBERS.map(member => {
          const status = teamStatus.find(s => s.id === member.id);
          const isOnline = status && status.finished;
          return (
            <div 
              key={member.id} 
              onClick={() => handleSelect(member.id)}
              className="premium-card glow-hover"
              style={{ 
                textAlign: 'center', cursor: 'pointer', padding: '1.5rem 1rem',
                border: isOnline ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                animation: isOnline ? 'softPulse 3s infinite ease-in-out' : 'none',
                background: isOnline ? 'rgba(212,175,55,0.05)' : 'var(--glass)'
              }}
            >
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)',
                margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', border: '1px solid var(--accent)'
              }}>
                {member.name[0]}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: isOnline ? 'var(--accent)' : 'white' }}>{member.name}</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '2px', marginTop: '4px' }}>{member.role.toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      {deferredPrompt && (
        <div style={{ marginTop: '2rem', textAlign: 'center', animation: 'fadeIn 1s' }}>
          <button 
            onClick={handleInstallClick}
            className="gold-button glow-hover"
            style={{
              padding: '1rem 2rem', background: 'transparent',
              border: '1px solid var(--accent)', color: 'var(--accent)',
              borderRadius: '30px', fontWeight: 'bold', letterSpacing: '1px',
              boxShadow: '0 0 15px rgba(212,175,55,0.2)'
            }}
          >
            УСТАНОВИТЬ HOLY BREATH НА ГЛАВНЫЙ ЭКРАН 📥
          </button>
        </div>
      )}

      <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.3, fontSize: '0.6rem', letterSpacing: '1px' }}>
        [ UNITY IN DIVERSITY ]
      </div>
    </div>
  );
}
