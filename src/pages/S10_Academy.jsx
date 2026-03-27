import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VOCAL_MODULES, MARATHON_90 } from '../data/academy_content';
import TrainingEngine from '../logic/TrainingEngine';

export default function S10_Academy() {
  const navigate = useNavigate();
  const engine = new TrainingEngine('u/1');
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' or 'marathon'

  // Update completed state
  const [, setTrigger] = useState(0); 

  const handleCompleteDay = (dayNum) => {
    if (engine.isDayUnlocked(dayNum)) {
      engine.completeDay(dayNum);
      setTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="dashboard-scroll" style={{ padding: '2rem', minHeight: '100vh', background: 'var(--bg)', color: 'white', paddingBottom: '100px' }}>
      
      {/* HEADER: CINEMATIC UI */}
      <header style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
        <button onClick={() => navigate('/dashboard')} className="glow-hover" style={{ position: 'absolute', left: 0, top: 0, background: 'none', border: 'none', color: 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer' }}>
          ←
        </button>
        <h2 style={{ color: '#fff', letterSpacing: '6px', fontSize: '2rem', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>VOCAL ACADEMY</h2>
        <p style={{ color: 'var(--accent)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '2px' }}>EVT & CVT MASTERY</p>
      </header>
      
      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <button 
          onClick={() => setActiveTab('modules')}
          style={{ background: activeTab === 'modules' ? 'var(--accent)' : 'transparent', color: activeTab === 'modules' ? '#000' : 'var(--accent)', border: '1px solid var(--accent)', padding: '0.8rem 2rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
          БАЗА ЗНАНИЙ
        </button>
        <button 
          onClick={() => setActiveTab('marathon')}
          style={{ background: activeTab === 'marathon' ? 'var(--accent)' : 'transparent', color: activeTab === 'marathon' ? '#000' : 'var(--accent)', border: '1px solid var(--accent)', padding: '0.8rem 2rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
          90-DAY MARATHON
        </button>
      </div>

      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {VOCAL_MODULES.map(mod => (
            <div key={mod.id} className="premium-card glow-hover" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>{mod.title}</h3>
                <span style={{ fontSize: '0.8rem', background: 'rgba(0,212,255,0.1)', color: 'var(--accent)', padding: '0.3rem 0.8rem', borderRadius: '15px' }}>{mod.focus}</span>
              </div>
              <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1.5rem' }}>{mod.description}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.5rem' }}>🔥 ПРАКТИКА:</strong>
                {mod.exercise}
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {mod.mechanics.map(m => (
                  <span key={m} style={{ fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.3)', padding: '0.2rem 0.6rem', borderRadius: '5px', opacity: 0.7 }}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'marathon' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ opacity: 0.7 }}>Система жестких чекпоинтов. Ты не можешь приступить к следующему дню, пока не пройдешь предыдущий.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {MARATHON_90.map(dayObj => {
              const isUnlocked = engine.isDayUnlocked(dayObj.day);
              const isCompleted = engine.state.completedDays.includes(dayObj.day);
              const isCurrent = engine.state.currentDay === dayObj.day;
              
              let borderStyle = '1px solid rgba(255,255,255,0.1)';
              let bgStyle = 'var(--glass)';
              let opacity = isUnlocked ? 1 : 0.4;
              
              if (isCompleted) {
                borderStyle = '1px solid #00FF7F'; // Green complete
              } else if (isCurrent) {
                borderStyle = '2px solid var(--accent)'; // Active blue
                bgStyle = 'rgba(0, 212, 255, 0.05)';
              }

              return (
                <div key={dayObj.day} className={isUnlocked && !isCompleted ? "premium-card glow-hover" : "premium-card"} style={{ border: borderStyle, background: bgStyle, padding: '1.5rem', opacity, transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <strong style={{ color: isCompleted ? '#00FF7F' : (isCurrent ? 'var(--accent)' : '#fff') }}>{dayObj.title}</strong>
                    {isCompleted ? <span style={{ color: '#00FF7F' }}>✅</span> : (!isUnlocked && <span>🔒</span>)}
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem', minHeight: '40px' }}>{dayObj.theory}</p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: dayObj.phase === 'Rest' ? '#FFB800' : '#fff' }}>
                    <strong>Задание:</strong> {dayObj.task}
                  </div>

                  {isUnlocked && !isCompleted && (
                    <button 
                      onClick={() => handleCompleteDay(dayObj.day)}
                      style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', background: 'rgba(0,212,255,0.1)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '10px', cursor: 'pointer' }}>
                      ОТМЕТИТЬ ВЫПОЛНЕННЫМ
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
