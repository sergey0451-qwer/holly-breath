import React, { useState, useEffect, useRef } from 'react';
import PitchAnalyzer from '../logic/PitchAnalyzer';

export default function S8_Tuner() {
  const [pitchData, setPitchData] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const analyzerRef = useRef(null);

  const toggleTuner = async () => {
    if (isActive) {
      if (analyzerRef.current) analyzerRef.current.stop();
      setIsActive(false);
      setPitchData(null);
    } else {
      analyzerRef.current = new PitchAnalyzer();
      await analyzerRef.current.start((data) => {
        if (data && data.error) setError(data.error);
        else setPitchData(data);
      });
      setIsActive(true);
      setError('');
    }
  };

  useEffect(() => {
    return () => { if (analyzerRef.current) analyzerRef.current.stop(); };
  }, []);

  const cents = pitchData ? pitchData.cents : 0;
  // Rotation calculation: -50 cents = -90deg, +50 cents = +90deg
  const rotation = Math.max(-90, Math.min(90, (cents / 50) * 90));

  return (
    <div style={{ padding: '2rem', paddingBottom: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'white', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--accent)', letterSpacing: '2px', marginBottom: '2rem' }}>UNIVERSAL TUNER</h2>
      
      <div style={{
        margin: '0 auto 3rem', width: '250px', height: '150px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Dial Scale */}
        <div style={{ 
          width: '250px', height: '250px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', 
          borderTop: '2px solid var(--accent)', position: 'absolute', top: 0, left: 0
        }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '0.8rem', opacity: 0.5 }}>-50</div>
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', color: 'var(--accent)' }}>0</div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.8rem', opacity: 0.5 }}>+50</div>
        
        {/* Needle */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', width: '4px', height: '120px', 
          background: pitchData?.isPerfect ? '#00FF7F' : 'var(--accent)',
          transformOrigin: 'bottom center',
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          transition: 'transform 0.1s linear, background 0.3s'
        }} />
        <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--accent)' }} />
      </div>

      <div style={{ height: '100px', marginBottom: '2rem' }}>
        {pitchData ? (
          <>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: pitchData.isPerfect ? '#00FF7F' : 'white' }}>
              {pitchData.note}<span style={{ fontSize: '2rem', opacity: 0.6 }}>{pitchData.octave}</span>
            </div>
            <div style={{ fontSize: '1rem', color: pitchData.isPerfect ? '#00FF7F' : (cents < 0 ? '#FFA500' : '#FF4500') }}>
              {cents > 0 ? `+${cents}` : cents} cents
            </div>
          </>
        ) : (
          <div style={{ fontSize: '1.5rem', opacity: 0.5, paddingTop: '1rem' }}>{isActive ? 'Слушаю...' : '---'}</div>
        )}
      </div>

      {error && <div style={{ color: '#FF4500', marginBottom: '1rem' }}>{error}</div>}

      <button onClick={toggleTuner} className="gold-button glow-hover" style={{ padding: '1.5rem 3rem', borderRadius: '30px', width: '100%' }}>
        {isActive ? 'ОСТАНОВИТЬ' : 'ВКЛЮЧИТЬ ТЮНЕР'}
      </button>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6, lineHeight: 1.5 }}>
        Поддерживает вокал, гитару (Standard/Drop), бас, скрипку, виолончель.
      </div>
    </div>
  );
}
