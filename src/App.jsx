import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import S1_Intro from './pages/S1_Intro';
import S2_Dashboard from './pages/S2_Dashboard';
import S0_ProfileSelect from './pages/S0_ProfileSelect';
import S3_Analytics from './pages/S3_Analytics';
import S4_FlowState from './pages/S4_FlowState';
import S5_Schedule from './pages/S5_Schedule';
import S6_MilestoneGate from './pages/S6_MilestoneGate';
import S8_Tuner from './pages/S8_Tuner';
import S9_Warmup from './pages/S9_Warmup';
import S11_Metronome from './pages/S11_Metronome';
import S10_Academy from './pages/S10_Academy';
import S12_Songbook from './pages/S12_Songbook';
import S13_TeamRoom from './pages/S13_TeamRoom';
import S7_DailyBlessing from './pages/S7_DailyBlessing';
import TrainingEngine from './logic/TrainingEngine';

const LinkLogin = ({ onSelect }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      onSelect(id);
      if (!localStorage.getItem(`hb_training_progress_${id}`)) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [id, onSelect, navigate]);
  return <div style={{padding:'2rem', color:'var(--accent)', textAlign:'center', marginTop:'40vh'}}>Активация профиля...</div>;
};

// NAVIGATION COMPONENT
const BottomNav = () => {
  const location = useLocation();
  if (location.pathname === '/' || location.pathname === '/practice') return null; // Hide on Intro and Practice screens

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      background: 'rgba(10, 25, 47, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 215, 0, 0.2)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <span style={{ fontSize: '1.5rem' }}>💠</span>
      </NavLink>
      <NavLink to="/practice" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <span style={{ fontSize: '1.8rem' }}>🔥</span>
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <span style={{ fontSize: '1.5rem' }}>📅</span>
      </NavLink>
      <NavLink to="/analytics" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <span style={{ fontSize: '1.5rem' }}>🎯</span>
      </NavLink>
      <NavLink to="/spirit" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <span style={{ fontSize: '1.5rem' }}>✨</span>
      </NavLink>
      <NavLink to="/team" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
        <span style={{ fontSize: '1.5rem' }}>👥</span>
      </NavLink>
    </nav>
  );
};

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.toString() };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError || window.__FIREBASE_ERROR__) {
      let errMsg = window.__FIREBASE_ERROR__ ? "Firebase Error: " + window.__FIREBASE_ERROR__ : this.state.errorMessage;
      if (errMsg.includes("Missing") || errMsg.includes("API Key") || errMsg.includes("VITE_")) {
        errMsg = "API Key Missing / " + errMsg;
      }
      return (
        <div style={{ padding: '2rem', color: '#ff4d4f', background: '#0a0a0a', height: '100vh', fontFamily: 'monospace' }}>
          <h2>🚨 Врата Потока: Сбой Системы</h2>
          <h3>Критические Ошибки Окружения (Vercel Env Variables)</h3>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ffaaa5', padding: '1rem', border: '1px solid #ff4d4f' }}>
            {errMsg}
          </pre>
          <p style={{marginTop: '2rem', color: '#fff'}}>
            <strong>Действие:</strong> Перейди в Vercel Dashboard -{">"} Settings -{">"} Environment Variables и добавь все ключи (VITE_FIREBASE_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY и т.д.). Затем сделай Redeploy.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // GLOBAL STATE WITH PERSISTENCE
  const [vocalRank, setVocalRank] = useState(() => localStorage.getItem('hb_vocalRank') || 'Apprentice');

  const [userId, setUserId] = useState(() => localStorage.getItem('hb_userId') || null);
  const [engine, setEngine] = useState(() => userId ? new TrainingEngine(userId) : null);

  useEffect(() => {
    localStorage.setItem('hb_sessionTime', sessionTime);
    localStorage.setItem('hb_totalCycles', totalCycles);
    localStorage.setItem('hb_vocalRank', vocalRank);
  }, [sessionTime, totalCycles, vocalRank]);

  const handleSelectUser = (id) => {
    setUserId(id);
    localStorage.setItem('hb_userId', id);
    setEngine(new TrainingEngine(id));
  };

  const updateStats = (time, cycles) => {
    setSessionTime(prev => prev + time);
    setTotalCycles(prev => prev + cycles);
    
    // Rank logic
    const total = sessionTime + time;
    if (total > 900) setVocalRank('Master');
    else if (total > 300) setVocalRank('Resonator');
  };

  if (!userId || !engine) {
    return (
      <AppErrorBoundary>
        <Router>
          <Routes>
            <Route path="/u/:id" element={<LinkLogin onSelect={handleSelectUser} />} />
            <Route path="/*" element={<S0_ProfileSelect onSelect={handleSelectUser} />} />
          </Routes>
        </Router>
      </AppErrorBoundary>
    );
  }

  return (
    <AppErrorBoundary>
      <Router>
        <div className="app-shell" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'white', paddingBottom: '80px' }}>
        <Routes>
          <Route path="/u/:id" element={<LinkLogin onSelect={handleSelectUser} />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/onboarding" element={<S1_Intro onComplete={setVocalRank} />} />
          <Route path="/dashboard" element={<S2_Dashboard sessionTime={sessionTime} vocalRank={vocalRank} training={engine} userId={userId} />} />
          <Route path="/practice" element={<S4_FlowState onFinish={updateStats} training={engine} />} />
          <Route path="/stats" element={<S6_MilestoneGate sessionTime={sessionTime} totalCycles={totalCycles} vocalRank={vocalRank} />} />
          <Route path="/calendar" element={<S5_Schedule training={engine} />} />
          <Route path="/analytics" element={<S3_Analytics training={engine} />} />
          <Route path="/spirit" element={<S7_DailyBlessing />} />
          <Route path="/tuner" element={<S8_Tuner />} />
          <Route path="/warmup" element={<S9_Warmup />} />
          <Route path="/metronome" element={<S11_Metronome />} />
          <Route path="/academy" element={<S10_Academy />} />
          <Route path="/songbook" element={<S12_Songbook />} />
          <Route path="/team" element={<S13_TeamRoom userId={userId} />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
    </AppErrorBoundary>
  );
}
