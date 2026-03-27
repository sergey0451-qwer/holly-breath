import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

export default function S11_Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flash, setFlash] = useState(false);
  const [beat, setBeat] = useState(1);
  const [timeSignature, setTimeSignature] = useState(4);
  const loopRef = useRef(null);
  const clickRef = useRef(null); // Keep a single instance of the synth

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const toggle = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
      if (loopRef.current) {
        loopRef.current.dispose();
        loopRef.current = null;
      }
      setIsPlaying(false);
      setBeat(1);
    } else {
      // Create synth if it doesn't exist to avoid memory leaks
      if (!clickRef.current) {
          clickRef.current = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            oscillator: { type: "square" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.01 }
          }).toDestination();
      }
      
      let currentBeat = 1;

      loopRef.current = new Tone.Loop((time) => {
        // First beat is higher pitched (G3) vs others (C3)
        if (currentBeat === 1) {
          clickRef.current.triggerAttackRelease("G3", "16n", time, 1);
        } else {
          clickRef.current.triggerAttackRelease("C3", "16n", time, 0.5);
        }
        
        Tone.Draw.schedule(() => {
          setFlash(true);
          setBeat(currentBeat);
          setTimeout(() => setFlash(false), 50);
          currentBeat = (currentBeat >= timeSignature) ? 1 : currentBeat + 1;
        }, time);
      }, "4n").start(0);

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      Tone.Transport.stop();
      if (loopRef.current) loopRef.current.dispose();
      if (clickRef.current) clickRef.current.dispose();
    };
  }, []);

  return (
    <div style={{ padding: '2rem', paddingBottom: '100px', minHeight: '100vh', background: flash ? 'var(--accent)' : 'var(--bg)', color: flash ? 'black' : 'white', transition: 'background 0.05s, color 0.05s', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: flash ? 'black' : 'var(--accent)', letterSpacing: '2px', marginBottom: '3rem' }}>METRONOME</h2>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '1rem', fontVariantNumeric: 'tabular-nums' }}>{bpm}</div>
        <div style={{ fontSize: '1rem', opacity: 0.6, letterSpacing: '2px', marginBottom: '3rem' }}>BPM</div>

        <input 
          type="range" 
          min="40" max="240" 
          value={bpm} 
          onChange={(e) => setBpm(parseInt(e.target.value))}
          style={{ width: '100%', marginBottom: '2rem', accentColor: flash ? 'black' : 'var(--accent)' }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          {[3, 4, 5, 8].map(ts => (
            <button key={ts} onClick={() => { setTimeSignature(ts); setBeat(1); }} style={{ 
              padding: '0.8rem 1.5rem', borderRadius: '10px', background: timeSignature === ts ? (flash ? 'black' : 'var(--accent)') : 'rgba(255,255,255,0.1)', color: timeSignature === ts ? (flash ? 'var(--accent)' : 'black') : 'white', border: 'none', fontWeight: 'bold'
            }}>
              {ts}/4
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '3rem' }}>
          {Array.from({length: timeSignature}).map((_, i) => (
            <div key={i} style={{ 
              width: '15px', height: '15px', borderRadius: '50%', 
              background: beat === i + 1 ? (i === 0 ? '#00FF7F' : (flash ? 'black' : 'var(--accent)')) : 'rgba(200,200,200,0.2)',
              transform: beat === i + 1 ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.1s'
            }} />
          ))}
        </div>
      </div>

      <button onClick={toggle} className="gold-button glow-hover" style={{ padding: '1.5rem', borderRadius: '15px', fontSize: '1.2rem', marginBottom: '3rem' }}>
        {isPlaying ? 'СТОП' : 'ЗАПУСК'}
      </button>
    </div>
  );
}
