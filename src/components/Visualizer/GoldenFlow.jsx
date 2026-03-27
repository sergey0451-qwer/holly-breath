import React, { useEffect, useRef } from 'react';

/**
 * [GOLDEN FLOW] Visualizer
 * SVG Wave that changes thickness and intensity with air pressure.
 */
export default function GoldenFlow({ pressure = 0.5, isActive = false, phaseIdx = 0 }) {
  const pathRef = useRef(null);

  // Phases: 0: Inhale, 1: Hold, 2: Exhale, 3: Pause
  const getOrbState = () => {
    if (!isActive) return { size: 10, color: '#333', opacity: 0.3, label: 'IDLE' };
    
    switch(phaseIdx) {
      case 0: // Inhale
        return { size: 30, color: '#007FFF', opacity: 0.8, label: 'INHALE' };
      case 1: // Hold
        return { size: 35, color: '#00D4FF', opacity: 1, label: 'HOLD', blink: true };
      case 2: // Exhale
        return { size: 15, color: '#ADD8E6', opacity: 0.9, label: 'EXHALE' };
      case 3: // Pause
        return { size: 10, color: '#333', opacity: 0.5, label: 'PAUSE' };
      default:
        return { size: 10, color: '#333', opacity: 0.3, label: 'IDLE' };
    }
  };

  const orb = getOrbState();

  useEffect(() => {
    if (!isActive) return;
    let frame = 0;
    const animate = () => {
      frame += 0.05;
      const thickness = 2 + pressure * 8;
      const points = [];
      for (let x = 0; x <= 400; x += 10) {
        const y = 80 + Math.sin(x / 50 + frame) * (5+ pressure * 15); // Shifted wave lower
        points.push(`${x},${y}`);
      }
      if (pathRef.current) {
        pathRef.current.setAttribute('d', `M ${points.join(' L ')}`);
        pathRef.current.setAttribute('stroke-width', thickness);
      }
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [pressure, isActive]);

  return (
    <div className="golden-flow-container" style={{ 
      width: '100%', 
      height: '180px', 
      overflow: 'hidden', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {isActive && (
        <div style={{ 
          color: orb.color, 
          fontSize: '0.9rem', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          textShadow: `0 0 10px ${orb.color}`
        }}>
          {orb.label}
        </div>
      )}
      
      <svg width="100%" height="100%" viewBox="0 0 400 150">
        {/* Glowing Orb */}
        <circle
          cx="200"
          cy="60"
          r={orb.size}
          fill={orb.color}
          style={{
            transition: 'all 4s ease-in-out',
            filter: `blur(5px) drop-shadow(0 0 20px ${orb.color})`,
            opacity: orb.opacity,
            animation: orb.blink ? 'blink-gold 1s infinite alternate' : 'none'
          }}
        />
        
        {/* The Wave */}
        <path
          ref={pathRef}
          fill="none"
          stroke="var(--accent)"
          strokeLinecap="round"
          className="golden-wave"
          style={{ 
            filter: 'drop-shadow(0 0 10px var(--gold-glow))', 
            opacity: isActive ? 0.6 : 0.2,
            transition: 'opacity 0.5s'
          }}
        />
        
        <style>{`
          @keyframes blink-gold {
            from { filter: blur(5px) drop-shadow(0 0 20px #00D4FF); transform: scale(1); }
            to { filter: blur(8px) drop-shadow(0 0 40px #00D4FF); transform: scale(1.1); }
          }
        `}</style>
      </svg>
    </div>
  );
}
