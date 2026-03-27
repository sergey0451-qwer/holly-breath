import React, { useRef, useEffect } from 'react';
import { TRAINING_CURRICULUM } from '../logic/TrainingEngine';

export default function S5_Schedule({ training }) {
  const currentDay = training.state.currentDay;
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll to current day
    if (scrollRef.current) {
      const element = document.getElementById(`day-${currentDay}`);
      if (element) {
        scrollRef.current.scrollTo({
          left: element.offsetLeft - 20,
          behavior: 'smooth'
        });
      }
    }
  }, [currentDay]);

  const progressPercent = Math.min((currentDay / 90) * 100, 100);

  return (
    <div className="schedule-screen" style={{ padding: '2rem', background: 'var(--bg)', minHeight: '100vh', color: 'white' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>ROAD TO VOCAL GOD</h1>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>
            <span>PROGRESS: DAY {currentDay} / 90</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 1s ease-out' }} />
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          gap: '1rem', 
          overflowX: 'auto', 
          paddingBottom: '2rem',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none'
        }}
      >
        {TRAINING_CURRICULUM.map((item) => {
          const isCompleted = training.state.completedDays.includes(item.day);
          const isCurrent = item.day === currentDay;
          const isLocked = item.day > currentDay;

          return (
            <div 
              key={item.day}
              id={`day-${item.day}`}
              className="premium-card"
              style={{
                minWidth: '220px',
                scrollSnapAlign: 'start',
                border: isCurrent ? '2px solid var(--accent)' : isCompleted ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
                opacity: isLocked ? 0.3 : 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: isCurrent ? 'var(--accent)' : 'inherit', opacity: 0.6 }}>DAY {item.day}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{item.goal}</div>
                <p style={{ fontSize: '0.7rem', opacity: 0.5, lineHeight: '1.4' }}>{item.description}</p>
              </div>
              
              <div style={{ marginTop: '2rem', fontSize: '0.6rem', fontWeight: 'bold', letterSpacing: '2px', color: isCurrent ? 'var(--accent)' : 'inherit' }}>
                {isCompleted ? '✓ COMPLETED' : isCurrent ? '⚡ CURRENT' : '🔒 LOCKED'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>RANK PROGRESSION</h3>
        <div style={{ position: 'relative', height: '60px', background: 'rgba(255,215,0,0.05)', borderRadius: '10px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.4 }}>
            <span>APPRENTICE</span>
            <span>RESONATOR</span>
            <span>MASTER</span>
            <span>VOCAL GOD</span>
          </div>
          <div style={{ position: 'absolute', left: `${progressPercent}%`, top: '30px', transform: 'translateX(-50%)' }}>
             <span style={{ fontSize: '1.2rem' }}>💎</span>
          </div>
        </div>
      </div>

      <style>{`.schedule-screen div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
