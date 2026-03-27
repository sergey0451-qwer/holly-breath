import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GoldenFlow from '../components/Visualizer/GoldenFlow';
import VocalSpecialist from '../components/Visualizer/VocalSpecialist';
import { BREATH_PHASES } from '../agents/Architect';
import AudioEngine from '../utils/AudioEngine';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function S4_FlowState({ onFinish, training }) {
  const navigate = useNavigate();
  const settings = training.getCurrentDaySettings();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isGroupRehearsal, setIsGroupRehearsal] = useState(false);
  const audioEngine = useRef(new AudioEngine());
  const [startTime] = useState(Date.now());

  // Prophetic Journal / Voice-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Sync Group Rehearsal from Firestore
    const unsub = onSnapshot(doc(db, 'global', 'rehearsal'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.active && (Date.now() - data.startTime < 15 * 60000)) {
          setIsGroupRehearsal(true);
        } else {
          setIsGroupRehearsal(false);
        }
      }
    });

    audioEngine.current.initAtmosphere();

    // Prepare Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setLastTranscript(transcript);
        saveInsight(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }

    return () => {
      audioEngine.current.stopAtmosphere();
      unsub();
    };
  }, []);

  const saveInsight = (text) => {
    const existing = JSON.parse(localStorage.getItem('prophetic_insights') || '[]');
    const songId = localStorage.getItem('lastSessionSongId') || 'Неизвестная песня';
    existing.push({
      id: Date.now(),
      text,
      timestamp: Date.now(),
      songId
    });
    localStorage.setItem('prophetic_insights', JSON.stringify(existing));
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      if ("vibrate" in navigator) navigator.vibrate([50, 50, 50]);
    }
  };

  const toggleGroupRehearsal = async () => {
    const newState = !isGroupRehearsal;
    setIsGroupRehearsal(newState);
    try {
      await setDoc(doc(db, 'global', 'rehearsal'), {
        active: newState,
        startTime: newState ? Date.now() : 0,
        startedBy: training.userId
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync rehearsal state:", e);
    }
  };

  useEffect(() => {
    const duration = settings.targetCycle[phaseIdx];
    
    if ("vibrate" in navigator) {
      if (phaseIdx === 0 || phaseIdx === 2) navigator.vibrate(40); 
      else navigator.vibrate(10); 
    }

    if (phaseIdx === 0) audioEngine.current.setAtmosphereVolume(0.05); 
    if (phaseIdx === 2) audioEngine.current.setAtmosphereVolume(0.4); 
    if (phaseIdx === 1 || phaseIdx === 3) audioEngine.current.setAtmosphereVolume(0.15); 

    if (isGroupRehearsal) {
      const osc = audioEngine.current.audioContext.createOscillator();
      const g = audioEngine.current.audioContext.createGain();
      osc.connect(g);
      g.connect(audioEngine.current.audioContext.destination);
      osc.frequency.value = 440;
      g.gain.setValueAtTime(0.1, audioEngine.current.audioContext.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioEngine.current.audioContext.currentTime + 0.1);
      osc.start();
      osc.stop(audioEngine.current.audioContext.currentTime + 0.1);
    }

    if (duration === 0) {
      const nextIdx = (phaseIdx + 1) % BREATH_PHASES.length;
      if (nextIdx === 0) setCycles(prev => prev + 1);
      setPhaseIdx(nextIdx);
      return;
    }

    const timer = setTimeout(() => {
      const nextIdx = (phaseIdx + 1) % BREATH_PHASES.length;
      if (nextIdx === 0) setCycles(prev => prev + 1);
      setPhaseIdx(nextIdx);
    }, duration);
    return () => clearTimeout(timer);
  }, [phaseIdx, settings, isGroupRehearsal]);

  const handleFinish = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    training.completeDay(training.state.currentDay);
    onFinish(duration, cycles);
    navigate('/calendar');
  };

  const getGroupTimer = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, (15 * 60) - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bgColors = [
    '#00102A', 
    '#00183A', 
    '#00204A', 
    '#000B18'  
  ];

  return (
    <div className="flow-state-screen" style={{
      height: '100vh',
      background: bgColors[phaseIdx],
      transition: 'background 4s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '40px', fontSize: '0.8rem', opacity: 0.4, letterSpacing: '4px' }}>
        {isGroupRehearsal ? `GROUP REHEARSAL | ${getGroupTimer()}` : 'DEEP IMMERSION MODE'}
      </div>

      <div style={{ height: '40vh', width: '100%' }}>
        <VocalSpecialist phaseIdx={phaseIdx} isActive={true} targetZone={settings.targetZone} />
      </div>

      <GoldenFlow isActive={true} phaseIdx={phaseIdx} pressure={0.5} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={toggleGroupRehearsal}
          className="glow-hover"
          style={{
            background: isGroupRehearsal ? 'linear-gradient(135deg, #00A3FF 0%, #00D4FF 100%)' : 'transparent',
            border: '2px solid var(--accent)',
            color: isGroupRehearsal ? 'black' : 'var(--accent)',
            padding: '1rem 2rem',
            borderRadius: '50px',
            fontSize: '1rem',
            letterSpacing: '2px',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            boxShadow: isGroupRehearsal ? '0 0 20px rgba(212,175,55,0.6)' : 'none'
          }}
        >
          {isGroupRehearsal ? 'ОБЩИЙ ВДОХ [АКТИВЕН]' : 'НАЧАТЬ ОБЩИЙ ВДОХ'}
        </button>
        {isGroupRehearsal && (
          <div style={{ marginTop: '1rem', color: '#00D4FF', fontSize: '0.8rem', letterSpacing: '2px', fontStyle: 'italic', animation: 'fadeIn 1s' }}>
            Семь голосов — один Источник
          </div>
        )}
      </div>

      <div style={{
        fontSize: '1.5rem',
        color: 'var(--accent)',
        letterSpacing: '3px',
        textTransform: 'uppercase'
      }}>
        {BREATH_PHASES[phaseIdx].label}
      </div>

      {lastTranscript && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', fontSize: '0.8rem', fontStyle: 'italic', maxWidth: '300px', textAlign: 'center', color: '#00D4FF' }}>
          "{lastTranscript}"
        </div>
      )}

      {/* PROPHETIC JOURNAL VOICE BUTTON */}
      <button 
        onClick={handleMicClick}
        style={{
          position: 'absolute',
          bottom: '100px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: isRecording ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 212, 255, 0.2)',
          border: `2px solid ${isRecording ? '#ff0000' : 'var(--accent)'}`,
          color: 'white',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isRecording ? '0 0 20px rgba(255, 0, 0, 0.8)' : '0 0 10px rgba(0, 212, 255, 0.3)',
          transition: 'all 0.3s',
          animation: isRecording ? 'pulse 1s infinite' : 'none'
        }}
        title="Record Prophetic Insight"
      >
        🎙️
      </button>

      <button 
        onClick={handleFinish}
        className="glow-hover"
        style={{
          position: 'absolute',
          bottom: '30px',
          background: 'none',
          border: '1px solid rgba(255,215,0,0.3)',
          color: 'rgba(255,215,0,0.5)',
          padding: '0.5rem 2rem',
          borderRadius: '20px',
          fontSize: '0.7rem'
        }}
      >
        FINISH SESSION
      </button>

    </div>
  );
}
