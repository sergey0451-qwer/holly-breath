import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tone from 'tone';
import PitchAnalyzer from '../logic/PitchAnalyzer';
import VocalSpecialist from '../components/Visualizer/VocalSpecialist';

const WARMUPS = [
  {
    id: 1,
    title: "Разогрев (Lip Trill)",
    desc: "Мягкий старт. Вибрация губами. Снимает зажимы с гортани.",
    notes: ["C4", "D4", "E4", "F4", "G4", "F4", "E4", "D4", "C4"],
    speed: "4n", mode: "none"
  },
  {
    id: 2,
    title: "Мажорная Гамма (Ми-Мэ-Ма)",
    desc: "Глубокая проработка. Главное правило — не задирать подбородок.",
    notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"],
    speed: "4n", mode: "none"
  },
  {
    id: 3,
    title: "EVT Twang: Стаккато (Няяя)",
    desc: "ПРОДВИНУТАЯ ТЕХНИКА: Сужение сфинктера гортани (AES). Яркие, пронзительные звуки 'Ня-ня-ня'. Кварто-квинтовый шаг, стаккато (отрывисто). Ловите звон на 3-4 кГц.",
    notes: ["C4", "G4", "C5", "G4", "C4"], // Smart Preset: 1, 5, 8, 5, 1 pattern
    speed: "8n", mode: "twang"
  },
  {
    id: 4,
    title: "EVT Cry: Всхлип (Glissando)",
    desc: "ПРОДВИНУТАЯ ТЕХНИКА: Наклон щитовидного хряща (Thyroid Tilt). Плавное глиссандо. Имитируйте тихий плач или скуление (легато). Смягчает переходные ноты.",
    notes: ["F5", "E5", "D#5", "D5", "C#5", "C5", "B4", "A#4", "A4"], // Descending half-steps
    speed: "2n", mode: "cry"
  }
];

export default function S9_Warmup() {
  const navigate = useNavigate();
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const activeExercise = WARMUPS[activeExerciseIdx];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [sungNote, setSungNote] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const synthRef = useRef(null);
  const analyzerRef = useRef(null);
  const seqRef = useRef(null);

  const initAudio = async () => {
    await Tone.start();
    if (!synthRef.current) {
      synthRef.current = new Tone.Sampler({
         urls: {
          A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
          A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
          A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
          A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
          A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
          A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
          A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
          A7: "A7.mp3", C8: "C8.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination();
    }
    
    if (!analyzerRef.current) {
      analyzerRef.current = new PitchAnalyzer();
      analyzerRef.current.start((data) => {
        if (data) setSungNote(`${data.note}${data.octave}`);
        else setSungNote(null);
      });
    }
    setInitialized(true);
  };

  const playSequence = async () => {
    if (isPlaying) { stopAll(); return; }
    await initAudio();
    setIsPlaying(true);
    
    const scale = activeExercise.notes;
    let idx = 0;
    
    // Twang uses short staccato bursts, Cry uses long smooth legato
    const noteDuration = activeExercise.mode === 'twang' ? "16n" : activeExercise.mode === 'cry' ? "1m" : "8n";

    seqRef.current = new Tone.Sequence((time, note) => {
      synthRef.current.triggerAttackRelease(note, noteDuration, time);
      Tone.Draw.schedule(() => {
        setCurrentNote(note);
        if (idx === scale.length - 1) {
          setTimeout(() => { setIsPlaying(false); setCurrentNote(''); }, 1500);
        }
        idx++;
      }, time);
    }, scale, activeExercise.speed);
    
    Tone.Transport.start();
    seqRef.current.start(0);
    seqRef.current.loop = false;
  };

  const stopAll = () => {
    Tone.Transport.stop();
    if (seqRef.current) {
      seqRef.current.stop();
      seqRef.current.dispose();
      seqRef.current = null;
    }
    setIsPlaying(false);
    setCurrentNote('');
  };

  useEffect(() => {
    stopAll();
  }, [activeExerciseIdx]);

  useEffect(() => {
    return () => {
      stopAll();
      if (analyzerRef.current) analyzerRef.current.stop();
    };
  }, []);

  const isMatch = sungNote && currentNote && sungNote.replace(/[0-9]/g, '') === currentNote.replace(/[0-9]/g, '');

  return (
    <div className="dashboard-scroll" style={{ padding: '2rem', paddingBottom: '100px', minHeight: '100vh', background: 'var(--bg)', color: 'white' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
        <button onClick={() => navigate('/dashboard')} className="glow-hover" style={{ position: 'absolute', left: 0, top: 0, background: 'none', border: 'none', color: 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer' }}>
          ←
        </button>
        <h2 style={{ color: '#fff', letterSpacing: '6px', fontSize: '2rem', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>VOCAL WARMUP</h2>
        <p style={{ color: 'var(--accent)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '2px' }}>EVT PATTERNS</p>
      </header>

      {/* Выбор упражнения */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '1rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
        {WARMUPS.map((w, idx) => (
          <button 
            key={w.id} 
            onClick={() => setActiveExerciseIdx(idx)}
            className="glow-hover"
            style={{ 
              whiteSpace: 'nowrap', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s',
              background: activeExerciseIdx === idx ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              color: activeExerciseIdx === idx ? 'black' : 'var(--accent)',
              border: '1px solid var(--accent)'
            }}
          >
            {w.title}
          </button>
        ))}
      </div>

      {/* Описание */}
      <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)' }}>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.9 }}>{activeExercise.desc}</p>
      </div>

      {/* Интеграция 3D Аватара + Питч-трекера */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 300px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)' }}>
           <VocalSpecialist 
              isActive={isPlaying} 
              vocalMode={activeExercise.mode} 
              targetZone={activeExercise.mode === 'twang' || activeExercise.mode === 'cry' ? 'mask' : 'belly'} 
           />
        </div>

        <div className="premium-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', border: isMatch ? '2px solid #00FF7F' : '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ opacity: 0.6, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>ПАТТЕРН</p>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{currentNote || '---'}</div>
            </div>
            <div style={{ width: '1px', height: '80px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ opacity: 0.6, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>ТВОЙ ГОЛОС</p>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: isMatch ? '#00FF7F' : '#fff' }}>{sungNote || '---'}</div>
            </div>
          </div>
          {isMatch && <div style={{ color: '#00FF7F', textAlign: 'center', marginTop: '1.5rem', letterSpacing: '2px', fontWeight: 'bold' }}>СИНХРОНИЗАЦИЯ УСТАНОВЛЕНА ✨</div>}
        </div>
      </div>

      <button onClick={playSequence} className="glow-hover" style={{ width: '100%', padding: '1.5rem', borderRadius: '15px', background: isPlaying ? 'transparent' : 'var(--accent)', border: '1px solid var(--accent)', color: isPlaying ? 'var(--accent)' : '#000', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
        {isPlaying ? 'ОСТАНОВИТЬ ⏸' : 'НАЧАТЬ РАСПЕВКУ ▶'}
      </button>

      {!initialized && <p style={{ marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem', textAlign: 'center' }}>* Primera init Tone.js delay ~1s.</p>}
    </div>
  );
}
