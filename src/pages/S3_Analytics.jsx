import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function S3_Analytics({ training }) {
  const navigate = useNavigate();
  const [isAtestating, setIsAtestating] = useState(false);
  const isRequired = training.isAtestationRequired();

  const handleStartAtestation = () => {
    setIsAtestating(true);
    // Future expansion: start specific recording/analysis mode
  };

  const handleFinishAtestation = () => {
    training.state.lastAtestationDay = training.state.currentDay - 1;
    training.saveState();
    setIsAtestating(false);
    navigate('/calendar');
  };

  return (
    <div className="analytics-screen" style={{ padding: '2rem', background: 'var(--bg)', minHeight: '100vh' }}>
      <header>
        <h1 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>ANALYTICS & ATESTATING</h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>WEEKLY STABILITY AUDIT</p>
      </header>

      {isRequired ? (
        <div className="premium-card" style={{ marginTop: '4rem', textAlign: 'center', border: '2px dashed var(--accent)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>WEEKLY GATE</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem' }}>
            To unlock the next stage, you must pass a 3-minute stability test.
          </p>
          <button className="gold-button" onClick={handleStartAtestation} style={{ width: '100%', padding: '1.5rem' }}>
            START ATESTATING
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <div className="premium-card">
            <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '1rem' }}>Vocal Endurance (Last 7 Days)</h3>
            <div style={{ marginTop: '1.5rem', height: '150px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
               {training.state.stats.endurance.map((val, i) => (
                 <div key={i} style={{ 
                   flex: 1, 
                   background: 'linear-gradient(to top, var(--accent) 0%, #ffeb3b 100%)', 
                   height: `${val}%`, 
                   borderRadius: '5px 5px 0 0', 
                   opacity: 0.5 + (i*0.08),
                   boxShadow: i === 6 ? '0 0 15px var(--accent)' : 'none'
                 }} />
               ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.6rem', opacity: 0.4 }}>
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="premium-card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '0.7rem', opacity: 0.6 }}>IMPROVEMENT</h3>
              <div style={{ fontSize: '1.8rem', color: '#4caf50', margin: '0.5rem 0' }}>+15.4%</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>vs PREVIOUS WEEK</div>
            </div>
            <div className="premium-card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '0.7rem', opacity: 0.6 }}>STABILITY</h3>
              <div style={{ fontSize: '1.8rem', color: 'var(--accent)', margin: '0.5rem 0' }}>94%</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>SUBGLOTTIC INDEX</div>
            </div>
          </div>
        </div>
      )}

      {isAtestating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 25, 47, 0.98)',
          zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '1rem', color: 'var(--accent)', letterSpacing: '4px', marginBottom: '2rem' }}>TESTING STABILITY</div>
          <div className="visualizer-mock" style={{ width: '200px', height: '200px', borderRadius: '50%', border: '4px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ width: '100px', height: '100px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          </div>
          <button className="gold-button" onClick={handleFinishAtestation} style={{ marginTop: '4rem' }}>
            COMPLETE TEST
          </button>
          <style>{`@keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 0; } }`}</style>
        </div>
      )}
    </div>
  );
}
