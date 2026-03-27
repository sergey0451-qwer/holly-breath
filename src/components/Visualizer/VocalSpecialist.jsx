import React, { useEffect, useRef } from 'react';

/**
 * [THE SPECIALIST] - 3D Avatar Foundation (Canvas-based)
 * Geometric torso simulation that expands/contracts with breath phases.
 * Upgraded with Twang high-frequency analysis mode.
 */
export default function VocalSpecialist({ phaseIdx = 0, isActive, targetZone = "belly", vocalMode = "none" }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frameRef.current += 0.05;

      let targetScale = 1.0;
      if (isActive) {
        if (phaseIdx === 0) targetScale = 1.35; 
        if (phaseIdx === 1) targetScale = 1.35; 
        if (phaseIdx === 2) targetScale = 1.0;  
        if (phaseIdx === 3) targetScale = 0.95; 
      }

      const pulse = Math.sin(frameRef.current) * 0.02;
      const finalScale = targetScale + pulse;

      ctx.save();
      ctx.translate(width / 2, height / 2 + 20); // shift down slightly
      ctx.scale(finalScale, finalScale);

      const cx = 0;
      const cy = 0;

      // 3D LIGHTING & ZONE HIGHLIGHTING
      const getZoneColor = (zone) => {
        if (!isActive) return 'rgba(0, 212, 255, 0.2)';
        if (vocalMode === 'twang' && zone === 'mask') return 'rgba(255, 215, 0, 0.9)'; // Gold for Twang
        if (targetZone === zone) return 'rgba(0, 255, 255, 0.9)'; // Neon Cyan for active focus
        return 'rgba(0, 163, 255, 0.4)'; 
      };

      // HIGH FREQUENCY TWANG SPIKES (3-4 kHz simulation)
      if (vocalMode === 'twang' && isActive) {
        ctx.beginPath();
        for(let j = 0; j < 24; j++) {
          let angle = (j * Math.PI) / 12 + frameRef.current * 0.5;
          let burst = Math.random() > 0.6 ? 25 : 5; // Glitchy spike effect
          let radiusOffset = 35 + burst;
          ctx.moveTo(cx, cy - 120);
          ctx.lineTo(cx + Math.cos(angle)*radiusOffset, cy - 120 + Math.sin(angle)*radiusOffset);
        }
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Gold spikes
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // HEAD (MASK ZONE & AES)
      ctx.beginPath();
      ctx.ellipse(cx, cy - 120, 25, 35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = getZoneColor('mask');
      if (targetZone === 'mask' || vocalMode === 'twang') {
        ctx.shadowBlur = vocalMode === 'twang' ? 40 : 20;
        ctx.shadowColor = vocalMode === 'twang' ? '#FFD700' : '#00ffff';
      } else {
        ctx.shadowBlur = 0; 
      }
      ctx.lineWidth = vocalMode === 'twang' ? 3 : 2;
      ctx.stroke();

      // TORSO (BELLY/CHEST ZONE)
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 70);
      ctx.bezierCurveTo(cx - 80, cy + 50, cx + 80, cy + 50, cx + 50, cy - 70);
      ctx.closePath();
      
      ctx.shadowBlur = targetZone === 'belly' ? 30 : 10;
      ctx.shadowColor = targetZone === 'belly' ? '#00ffff' : 'rgba(0,163,255,0.5)';
      ctx.strokeStyle = getZoneColor('belly');
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner Rib lines
      for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(-30 + i*5, 0 + i*15);
        ctx.lineTo(30 - i*5, 0 + i*15);
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 + i*0.2})`;
        ctx.stroke();
      }

      ctx.restore();
      const animId = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(animId);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [phaseIdx, isActive, vocalMode, targetZone]);

  return (
    <canvas 
      ref={canvasRef} 
      width="300" 
      height="300" 
      style={{ width: '100%', height: '100%' }} 
    />
  );
}
