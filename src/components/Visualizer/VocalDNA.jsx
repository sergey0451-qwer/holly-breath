import React, { useEffect, useRef } from 'react';

/**
 * [VOCAL DNA] - Real-time Waveform Visualizer
 */
export default function VocalDNA({ audioData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.fillStyle = '#0a192f'; // Dark Navy Background
      ctx.fillRect(0, 0, width, height);

      if (!audioData || audioData.length === 0) {
        // Draw a quiet golden line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#00D4FF33';
        ctx.stroke();
      } else {
        const barWidth = (width / audioData.length) * 2.5;
        let x = 0;

        for (let i = 0; i < audioData.length; i++) {
          const barHeight = (audioData[i] / 255) * height;

          // Golden/Neon Gradient
          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, '#00D4FF'); // Gold
          gradient.addColorStop(1, '#00FFFF'); // Cyan/Neon

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      }
      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [audioData]);

  return (
    <div className="vocal-dna-container" style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #00D4FF' }}>
      <canvas ref={canvasRef} width="400" height="120" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
