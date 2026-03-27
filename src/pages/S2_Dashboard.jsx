import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import GoldenFlow from '../components/Visualizer/GoldenFlow';
import { BREATH_PHASES } from '../agents/Architect';
import AudioEngine from '../utils/AudioEngine';
import VocalDNA from '../components/Visualizer/VocalDNA';
import VocalSpecialist from '../components/Visualizer/VocalSpecialist';
import { useGlobalPulse } from '../logic/NetworkSync';

const LevelUpModal = ({ onClose }) => {
  useEffect(() => {
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 25, 47, 0.95)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center', border: '2px solid #00D4FF'
    }}>
      <h2 style={{ color: '#00D4FF', fontSize: '2rem' }}>LEVEL UP!</h2>
      <p style={{ margin: '2rem 0', fontSize: '1.2rem' }}>VOCAL ADAPTATION COMPLETE</p>
      <div style={{ color: '#00D4FF', fontSize: '0.8rem', marginBottom: '2rem' }}>Your resonance stability has improved by 15%</div>
      <button className="gold-button" onClick={onClose} style={{ padding: '1rem 3rem' }}>
        CONTINUE EVOLUTION
      </button>
    </div>
  );
};

export default function Dashboard({ sessionTime, vocalRank, training, userId }) {
  const navigate = useNavigate();
  // GLOBAL PULSE ENGINE
  const { globalState, toggleGlobalPulse } = useGlobalPulse(userId);
  const active = globalState.active;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [currentQuote, setCurrentQuote] = useState('');
  const [bioEfficiency, setBioEfficiency] = useState(0);
  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const [audioFeedback, setAudioFeedback] = useState("");
  const [pressureCmH2O, setPressureCmH2O] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [update, setUpdate] = useState(0); 

  // Cloud Sync States
  const [liveFeed, setLiveFeed] = useState([]);
  const [globalPrayer, setGlobalPrayer] = useState(training ? training.getWeeklyPrayerFocus() : "");

  useEffect(() => {
    let unsubUsers = () => {};
    if (userId === '1' || userId === '2') {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const feed = [];
        snapshot.forEach(d => {
          if (d.data().lastActive) {
            feed.push({ id: d.id, ...d.data() });
          }
        });
        feed.sort((a,b) => b.lastActive - a.lastActive);
        setLiveFeed(feed);
      }, (error) => console.warn('Firestore offline:', error));
    }

    const unsubGlobal = onSnapshot(doc(db, 'global', 'settings'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().prayerFocus) {
        setGlobalPrayer(docSnap.data().prayerFocus);
      }
    }, (error) => console.warn('Firestore offline:', error));

    return () => {
      unsubUsers();
      unsubGlobal();
    };
  }, [userId]);

  const audioEngine = useRef(new AudioEngine());
  const currentPhase = BREATH_PHASES[phaseIdx];

  const getInsightFeedback = () => {
    if (!active) return "Ожидание Глобальной Синхронизации. Слейтесь в потоке.";
    if (phaseIdx === 2 && audioFeedback) return audioFeedback; 
    
    switch(phaseIdx) {
      case 0: return "Наполняй легкие до краев, чувствуй расширение ребер.";
      case 1: return "Расслабь плечи. Удерживай давление в центре.";
      case 2: return "Выпускай воздух тонкой струей, как через соломинку.";
      case 3: return "Пауза. Полное расслабление перед новым циклом.";
      default: return "";
    }
  };

  useEffect(() => {
    const day = training.state.currentDay;
    setCurrentQuote(training.getSpiritQuote(day));
  }, [training]);

  // ABSOLUTE MILISECOND GLOBAL SYNC CALCULATION
  useEffect(() => {
    if (!active || !globalState.startTime) {
      setPhaseIdx(0);
      return;
    }
    const interval = setInterval(() => {
      const elapsed = Date.now() - globalState.startTime;
      const totalCycleTime = BREATH_PHASES.reduce((sum, p) => sum + p.duration, 0);
      const timeInCurrentCycle = elapsed % totalCycleTime;

      let accum = 0;
      let newPhase = 0;
      for (let i = 0; i < BREATH_PHASES.length; i++) {
        accum += BREATH_PHASES[i].duration;
        if (timeInCurrentCycle < accum) {
          newPhase = i;
          break;
        }
      }
      
      setPhaseIdx(prev => {
        if (prev !== newPhase) {
          // Fire phase shift audio/haptic events exactly in sync
          if (newPhase === 0) audioEngine.current.setAtmosphereVolume(0.05); 
          if (newPhase === 2) audioEngine.current.setAtmosphereVolume(0.35); 
          if (newPhase === 1 || newPhase === 3) audioEngine.current.setAtmosphereVolume(0.1); 
          if ("vibrate" in navigator) navigator.vibrate(20);
          setBioEfficiency(pe => Math.min(pe + 5, 100));
        }
        return newPhase;
      });
    }, 50); // High precision tick
    return () => clearInterval(interval);
  }, [active, globalState.startTime]);

  useEffect(() => {
    let interval;
    if (active) {
      audioEngine.current.init().catch(() => {});
      audioEngine.current.initAtmosphere();
      const audioTickRef = { current: 0 };
      interval = setInterval(() => {
        audioTickRef.current++;
        if (audioTickRef.current % 3 === 0) {
          const data = audioEngine.current.getFrequencyData();
          setAudioData(new Uint8Array(data));
        }
        setPressureCmH2O(audioEngine.current.getPressureCmH2O());

        if (phaseIdx === 2) {
          const rms = audioEngine.current.getRMS();
          if (rms > 40) {
            setAudioFeedback("Отличный напор! Держи стабильность.");
          } else if (rms > 5 && rms < 20) {
            setAudioFeedback("Слишком много воздуха. Собери поток.");
          } else {
            setAudioFeedback("");
          }
        } else {
          setAudioFeedback("");
        }
      }, 100);
    } else {
      audioEngine.current.stop();
      audioEngine.current.stopAtmosphere();
      setAudioData(new Uint8Array(0));
    }
    return () => {
      clearInterval(interval);
      if (!active) {
        audioEngine.current.stop();
        audioEngine.current.stopAtmosphere();
      }
    };
  }, [active, phaseIdx]);


  return (
    <div className="dashboard-scroll" style={{ padding: '2rem', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto' }}>
      
      {showAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 25, 47, 0.98)', zIndex: 2000,
          padding: '2rem', overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '2px' }}>SECRET ADMIN PANEL 👁️</h2>
            <button onClick={() => setShowAdmin(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {liveFeed.map(data => {
              const isToday = data.lastActive && (Date.now() - data.lastActive < 86400000);
              const inFlow = isToday && data.inFlow;
              const completedDays = data.state?.completedDays?.length || 0;
              const currentDay = data.state?.currentDay || 1;
              const totalMins = Math.floor((data.totalSessionTime || 0) / 60);
              return (
                <div key={data.id} className="premium-card" style={{ padding: '1rem', border: inFlow ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: inFlow ? 'var(--accent)' : 'white' }}>User {data.id}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>
                        День: <span style={{color:'var(--accent)'}}>{currentDay}</span> | Завершено: <span style={{color:'var(--accent)'}}>{completedDays}</span> дн. | Время: <span style={{color:'var(--accent)'}}>{totalMins}</span> мин
                      </div>
                    </div>
                    <div>
                      {inFlow ? <span style={{color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold'}}>В ПОТОКЕ 🌊</span> : <span style={{opacity: 0.3, fontSize: '0.8rem'}}>ОФФЛАЙН</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 
            onClick={() => { if (userId === '2') setShowAdmin(true); }}
            style={{ fontSize: '1.2rem', letterSpacing: '2px', cursor: userId === '2' ? 'pointer' : 'default' }}>
            HOLY BREATH
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.8rem', fontStyle: 'italic' }}>{vocalRank}</p>
        </div>
        <div className="premium-card" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textAlign: 'right' }}>
          <div>SESSION: {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
          <div style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>EFFICIENCY: {bioEfficiency}%</div>
        </div>
      </header>
        
      <section className="premium-card" style={{ padding: '1.5rem', border: '1.2px solid var(--accent)', background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, transparent 100%)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.8rem', letterSpacing: '1.5px' }}>🙏 МОЛИТВЕННЫЙ ФОКУС НЕДЕЛИ</h2>
        <p style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.5', opacity: 0.9, marginBottom: '1rem' }}>
          {globalPrayer}
        </p>
        <button 
          className="gold-button glow-hover" 
          onClick={() => { training.setInFlow(true); setUpdate(u => u + 1); }} 
          style={{ width: '100%', padding: '1rem', fontSize: '0.9rem', borderRadius: '10px' }}>
          Я В ПОТОКЕ 🌊
        </button>
      </section>

      {/* TEAM LIVE FEED */}
      {(userId === '1' || userId === '2') && (
      <section className="premium-card" style={{ padding: '1rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
        <h2 style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>TEAM LIVE FEED</h2>
        {liveFeed.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liveFeed.slice(0, 3).map(user => {
              const minutesAgo = Math.floor((Date.now() - user.lastActive) / 60000);
              const timeText = minutesAgo < 1 ? 'только что' : `${minutesAgo} мин. назад`;
              return (
                <div key={user.id} style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Адепт №{user.id}</span> обновил прогресс ({timeText})
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Ожидание активности команды...</div>
        )}
      </section>
      )}

      {/* 3D AVATAR FOUNDATION (The Specialist) */}
      <div className="avatar-container" style={{ 
        width: '100%', 
        height: '35vh', 
        background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(10,25,47,0) 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '-1rem',
        position: 'relative'
      }}>
        <VocalSpecialist 
          phaseIdx={phaseIdx} 
          isActive={active} 
          targetZone={training.getCurrentDaySettings().targetZone} 
        />
        <div style={{ 
          position: 'absolute',
          bottom: '20px',
          color: 'var(--accent)', 
          fontSize: '0.6rem', 
          opacity: 0.5,
          letterSpacing: '2px'
        }}>
          [ BIO-MECHANIC SPECIALIST ACTIVE ]
        </div>
      </div>

      <div className="grid" style={{ 
        display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' 
      }}>

      <section className="premium-card">
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: active ? 'var(--accent)' : '#fff' }}>
            СЕТЕВОЙ ПОТОК / {active ? currentPhase.label : 'IDLE'}
          </h2>
          <GoldenFlow 
            isActive={active} 
            phaseIdx={phaseIdx}
            pressure={active ? (phaseIdx === 0 ? 0.8 : 0.4) : 0.1} 
          />
          
          <button 
            className="gold-button glow-hover" 
            onClick={() => toggleGlobalPulse(active)} 
            style={{ 
              marginTop: '1.5rem', width: '100%', height: '50px', fontSize: '0.9rem',
              background: active ? 'transparent' : 'var(--accent)', 
              color: active ? 'var(--accent)' : '#000',
              fontWeight: 'bold', border: '1px solid var(--accent)'
            }}
          >
            {active ? 'ОСТАНОВИТЬ СЕЩУЮ (Leader Override)' : 'СИНХРОНИЗАЦИЯ (Global Start)'}
          </button>
          
          <button 
            className="glow-hover" 
            onClick={() => navigate('/team')} 
            style={{ 
              marginTop: '1rem', width: '100%', height: '50px', fontSize: '0.9rem',
              background: 'linear-gradient(90deg, #00183A, #00306A)', 
              color: '#00D4FF',
              fontWeight: 'bold', border: '1px solid #00D4FF',
              borderRadius: '25px', letterSpacing: '2px', cursor: 'pointer'
            }}
          >
            ВХОД В TEAM ROOM 👥
          </button>
      </section>

      {/* MUSICAL SUITE */}
      <section className="premium-card" style={{ padding: '1rem', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
        <h2 style={{ fontSize: '0.8rem', marginBottom: '1rem', color: 'var(--accent)' }}>MUSICAL SUITE 🎹</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div onClick={() => navigate('/tuner')} className="glow-hover" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎸</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ТЮНЕР</div>
          </div>
          <div onClick={() => navigate('/warmup')} className="glow-hover" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎹</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>РАСПЕВКИ</div>
          </div>
          <div onClick={() => navigate('/metronome')} className="glow-hover" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏱️</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>МЕТРОНОМ</div>
          </div>
          <div onClick={() => navigate('/academy')} className="glow-hover" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎓</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>АКАДЕМИЯ</div>
          </div>
          <div onClick={() => navigate('/songbook')} className="glow-hover" style={{ gridColumn: '1 / -1', padding: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📖</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px' }}>БИБЛИОТЕКА ПЕСЕН (SONGBOOK)</div>
          </div>
        </div>
      </section>
        
        <section className="premium-card" style={{ padding: '1.5rem', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>ДЕНЬ {training.state.currentDay} / 90</h2>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>{training.getCurrentDaySettings().stage.toUpperCase()}</div>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1.5rem' }}>
             ЦЕЛЬ: {training.getCurrentDaySettings().goal}
          </p>
          <button 
            className="gold-button glow-hover" 
            onClick={() => navigate('/practice')} 
            style={{ 
              width: '100%', height: '80px', fontSize: '1.2rem', fontWeight: 'bold',
              borderRadius: '15px', background: 'linear-gradient(135deg, #00D4FF 0%, #0078FF 100%)', color: '#000'
            }}
          >
            ТРЕНИРОВКА ДНЯ
          </button>
        </section>

        <section className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.9rem' }}>Vocal DNA</h3>
            <div style={{ color: '#00D4FF', fontSize: '0.8rem' }}>{pressureCmH2O} cmH2O</div>
          </div>
          <VocalDNA audioData={audioData} />
        </section>

        <section className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem' }}>Insight Agent</h3>
          </div>
          <p style={{ fontSize: '1.1rem', margin: '1rem 0', color: 'var(--accent)', minHeight: '2.5rem', display: 'flex', alignItems: 'center', lineHeight: '1.4' }}>
            {getInsightFeedback()}
          </p>
        </section>

      </div>
      {showLevelUp && <LevelUpModal onClose={() => setShowLevelUp(false)} />}
    </div>
  );
}
