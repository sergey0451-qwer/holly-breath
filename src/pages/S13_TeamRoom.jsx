import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import GoldenFlow from '../components/Visualizer/GoldenFlow';
import PitchAnalyzer from '../logic/PitchAnalyzer';
import ChordEngine from '../logic/ChordEngine';
import { useGlobalPulse } from '../logic/NetworkSync';

const TEAM = [
  { id: '1', name: 'Анна', role: 'Worship Leader' },
  { id: '2', name: 'Сергей', role: 'Architect' },
  { id: '3', name: 'Ефим', role: 'Bass' },
  { id: '4', name: 'Элай', role: 'Keys' },
  { id: '5', name: 'Дима', role: 'Guitar' },
  { id: '6', name: 'София', role: 'Vocals' },
  { id: '7', name: 'Ксения', role: 'Vocals' }
];

export default function S13_TeamRoom({ userId = '2' }) {
  const navigate = useNavigate();
  const [pitches, setPitches] = useState({});
  const [currentChord, setCurrentChord] = useState("C"); 
  const pitchAnalyzer = useRef(new PitchAnalyzer());
  const chordEngine = new ChordEngine();
  const { globalState } = useGlobalPulse(userId);

  // 1. Firebase Listener for all pitches (Network Sync)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'live_pitches'), (snapshot) => {
      const data = {};
      snapshot.forEach(d => {
        // Only keep fresh data (< 2 seconds old)
        if (Date.now() - d.data().timestamp < 2000) {
          data[d.id] = d.data();
        }
      });
      setPitches(data);
    });
    return () => unsub();
  }, []);

  // 2. Local Pitch Processing (Web Audio API)
  useEffect(() => {
    pitchAnalyzer.current.start((data) => {
      if (data && data.pitch) {
        setDoc(doc(db, 'live_pitches', userId), {
          pitch: data.pitch,
          note: data.note,
          octave: data.octave,
          rms: data.rms,
          timestamp: Date.now()
        }, { merge: true }).catch(e => console.error("Pitch sync error:", e));
      }
    });

    return () => {
      pitchAnalyzer.current.stop();
    };
  }, [userId]);

  // 3. Automatic Vocal Part Identification
  const getVocalPart = (noteString) => {
     if (!noteString) return "";
     const note = noteString.replace(/[0-9]/g, '');
     const octave = parseInt(noteString.replace(/[^0-9]/g, '')) || 4;
     
     // Simplified Logic for DEMO (assuming C Major context)
     if (note === "C") return octave > 4 ? "OCTAVE UP" : (octave < 4 ? "OCTAVE DOWN" : "LEAD");
     if (note === "E") return "HIGHER 3RD";
     if (note === "G") return octave < 4 ? "LOWER 5TH" : "HIGHER 5TH";
     if (note === "A") return "6TH HARMONY";
     if (note === "B") return "MAJ 7TH";
     return "HARMONY";
  };

  const getRegister = (pitch) => {
    if (!pitch) return { label: "", color: "transparent" };
    if (pitch < 250) return { label: "CHEST", color: "#FF5555" }; 
    if (pitch < 600) return { label: "MIX", color: "#AA55FF" };   
    return { label: "HEAD", color: "#55FFFF" };                   
  };

  const getVerticalPosition = (pitch) => {
    if (!pitch) return '0%';
    // Clamp frequencies between 80Hz (E2) and 1000Hz (C6)
    const minP = Math.log2(80);
    const maxP = Math.log2(1046);
    const currP = Math.log2(Math.max(80, Math.min(pitch, 1046)));
    const percentage = ((currP - minP) / (maxP - minP)) * 100;
    return `${percentage}%`;
  };

  return (
    <div className="dashboard-scroll" style={{
      minHeight: '100vh',
      background: '#000814',
      backgroundImage: 'radial-gradient(circle at center, rgba(0,212,255,0.05) 0%, transparent 60%), linear-gradient(rgba(0,18,48,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,18,48,0.5) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      color: 'white',
      padding: '2rem',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Courier New', monospace"
    }}>
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', zIndex: 10, position: 'relative' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#00D4FF', fontSize: '1.5rem', cursor: 'pointer', textShadow: '0 0 10px #00D4FF' }}>
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.4rem', letterSpacing: '6px', color: '#FFF', textShadow: '0 0 15px #00D4FF, 0 0 30px #00D4FF', margin: 0 }}>
            TEAM ROOM: QUANTUM SYNC
          </h1>
          <div style={{ fontSize: '0.75rem', color: '#00D4FF', opacity: 0.8, letterSpacing: '3px', marginTop: '6px', background: 'rgba(0,212,255,0.1)', padding: '4px 12px', borderRadius: '10px', display: 'inline-block', border: '1px solid rgba(0,212,255,0.3)' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: globalState.active ? '#00FF00' : '#FF0000', marginRight: '6px', boxShadow: `0 0 8px ${globalState.active ? '#00FF00' : '#FF0000'}` }}></span>
            GLOBAL PULSE {globalState.active ? 'ACTIVE' : 'STANDBY'} | CHORD: {currentChord}
          </div>
        </div>
        <div style={{ width: '24px' }} />
      </header>

      {/* CENTER METRONOME (Blue Eye) */}
      <div style={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '380px', height: '380px', zIndex: 0, opacity: 0.8, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
           position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
           background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 60%)',
           boxShadow: '0 0 60px rgba(0,212,255,0.2), inset 0 0 30px rgba(0,212,255,0.1)', 
           animation: globalState.active ? 'pulseGlow 2s infinite ease-in-out' : 'none'
        }} />
        <GoldenFlow isActive={globalState.active} phaseIdx={0} pressure={0.5} />
      </div>

      {/* MULTI-USER PITCH GRID */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'stretch',
        height: '65vh',
        position: 'relative',
        zIndex: 1,
        marginTop: '2rem',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        background: 'rgba(0, 8, 20, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 40px rgba(0,212,255,0.05), 0 0 30px rgba(0,0,0,0.5)'
      }}>
        {/* Octave Reference Lines */}
        <div style={{ position: 'absolute', top: 0, bottom: '80px', left: 0, right: 0, pointerEvents: 'none', opacity: 0.4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
          {[
            { tag: 'C6', freq: '1046 Hz', pos: getVerticalPosition(1046) },
            { tag: 'C5', freq: '523 Hz', pos: getVerticalPosition(523) },
            { tag: 'C4', freq: '261 Hz', pos: getVerticalPosition(261) },
            { tag: 'C3', freq: '130 Hz', pos: getVerticalPosition(130) },
            { tag: 'E2', freq: '82 Hz', pos: getVerticalPosition(82) }
          ].map((oct, i) => (
             <div key={i} style={{ position: 'absolute', bottom: oct.pos, width: '100%', borderBottom: '1px dashed rgba(0, 212, 255, 0.3)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#00D4FF', paddingLeft: '8px', background: 'rgba(0,8,20,0.8)', padding: '2px 8px', borderRadius: '4px', transform: 'translateY(50%)', letterSpacing: '1px' }}>
                  {oct.tag} <span style={{ opacity: 0.5, marginLeft: '4px' }}>{oct.freq}</span>
                </span>
             </div>
          ))}
        </div>

        {TEAM.map((member, index) => {
          const mData = pitches[member.id] || {};
          const intensity = mData.rms ? mData.rms * 100 : 0;
          const isActive = Date.now() - (mData.timestamp || 0) < 2000;
          const reg = getRegister(mData.pitch);
          const vocalPart = getVocalPart(mData.note + mData.octave);
          const isMe = member.id === userId;

          return (
            <div key={member.id} style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderRight: index !== TEAM.length - 1 ? '1px solid rgba(0, 212, 255, 0.1)' : 'none',
              position: 'relative',
              background: isActive ? (isMe ? 'rgba(0, 212, 255, 0.08)' : 'rgba(0, 212, 255, 0.03)') : 'transparent',
              transition: 'background 0.5s',
              zIndex: 1
            }}>
              {/* Vertical Scale Window */}
              <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                {isActive && mData.pitch && (
                  <div style={{
                    position: 'absolute',
                    bottom: getVerticalPosition(mData.pitch),
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: 'bottom 0.1s linear'
                  }}>
                    {/* Glowing Pitch Indicator */}
                    <div style={{
                      width: '24px', height: '4px', borderRadius: '2px',
                      background: reg.color,
                      boxShadow: `0 0 ${15 + intensity * 20}px ${reg.color}, 0 0 5px #FFF`,
                    }} />
                    {/* Note HUD */}
                    <div style={{ 
                      fontSize: '0.7rem', fontWeight: 'bold', marginTop: '6px',
                      color: '#FFF', background: 'rgba(0,0,0,0.8)', border: `1px solid ${reg.color}`,
                      padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px',
                      boxShadow: `0 0 10px ${reg.color}40`, zIndex: 2
                    }}>
                      [{mData.note}{mData.octave}]
                    </div>
                  </div>
                )}
              </div>

              {/* User Identity Panel */}
              <div style={{ 
                height: '85px', width: '100%', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center',
                borderTop: isActive ? `2px solid ${isMe ? '#00D4FF' : 'rgba(0, 212, 255, 0.5)'}` : '2px solid rgba(0, 212, 255, 0.1)',
                background: isActive ? 'linear-gradient(0deg, rgba(0,212,255,0.15) 0%, transparent 100%)' : 'rgba(0,0,0,0.4)',
                boxShadow: isActive ? '0 -10px 20px rgba(0,212,255,0.05)' : 'none'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? '#FFF' : 'rgba(255,255,255,0.3)', textShadow: isActive ? '0 0 8px #FFF' : 'none' }}>
                  {isMe ? `> ${member.name} <` : member.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#00D4FF', opacity: isActive ? 0.8 : 0.3, marginTop: '2px', letterSpacing: '2px' }}>
                  {member.role.toUpperCase()}
                </div>
                {isActive && vocalPart ? (
                  <div style={{ 
                    marginTop: '8px', fontSize: '0.6rem', fontWeight: 'bold',
                    color: '#000', background: '#00D4FF', padding: '2px 8px', borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(0,212,255,0.8)', letterSpacing: '1px'
                  }}>
                    {vocalPart}
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', height: '16px' }}></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#00D4FF', opacity: 0.4, fontSize: '0.75rem', letterSpacing: '3px' }}>
        [ ALGORITHM: CHORD ENGINE MULTIPROCESSING ] _-_ [ REAL-TIME WEBRTC SIMULATION ]
      </div>
    </div>
  );
}
