import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SONGS_DB } from '../data/songs';
import { processLyrics } from '../logic/ChordEngine';

// MOCK: VocalDNA / PitchAnalyzer optimal keys for today based on recent warmups
const getTodayVocalDNAKeys = () => ['G', 'A', 'Bm', 'C'];

const ChordLyricLine = ({ text, transpose, isRich, baseKey }) => {
  if (!text) return <div style={{ height: '1rem' }} />;
  if (!text.includes('[')) return <div style={{ minHeight: '1.5rem', opacity: 0.9, lineHeight: '1.5', fontSize: '1.1rem' }}>{text}</div>;

  const processedText = processLyrics(text, transpose, isRich, baseKey);
  const segments = processedText.split(/(?=\[)/g);
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1.2rem', marginBottom: '0.2rem' }}>
      {segments.map((seg, idx) => {
        const match = seg.match(/\[(.*?)\](.*)/);
        if (match) {
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', marginRight: '0px' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1rem', height: '1.2rem', paddingRight: '0.3rem', letterSpacing: '0.5px' }}>{match[1]}</span>
              <span style={{ fontSize: '1.2rem', whiteSpace: 'pre', opacity: 0.9 }}>{match[2] || ' '}</span>
            </div>
          );
        }
        return <span key={idx} style={{ fontSize: '1.2rem', paddingTop: '1.2rem', whiteSpace: 'pre', opacity: 0.9 }}>{seg}</span>;
      })}
    </div>
  );
};

// VIRTUAL SCROLLING HOOK & COMPONENT
const VirtualList = ({ items, renderItem, itemHeight = 100, containerHeight = 600 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 6;
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div 
      style={{ height: `${containerHeight}px`, overflowY: 'auto', position: 'relative' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
      className="dashboard-scroll"
    >
      <div style={{ height: `${items.length * itemHeight}px`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: `${startIndex * itemHeight}px`, width: '100%' }}>
          {visibleItems.map((item, idx) => renderItem(item, startIndex + idx))}
        </div>
      </div>
    </div>
  );
};

export default function S12_Songbook() {
  const navigate = useNavigate();
  const [activeSong, setActiveSong] = useState(null);
  const [search, setSearch] = useState('');
  
  const [transpose, setTranspose] = useState(0);
  const [isRich, setIsRich] = useState(false);

  // Auto-Key Suggestion Intelligence
  const optimalKeys = useMemo(() => getTodayVocalDNAKeys(), []);

  const filteredSongs = useMemo(() => {
    return SONGS_DB.filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.artist.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const openSong = (song) => {
    setActiveSong(song);
    setTranspose(0);
    setIsRich(false);
    localStorage.setItem('lastSessionSongId', song.id);
  };

  return (
    <div style={{ padding: '0', minHeight: '100vh', background: 'var(--bg)', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* CINEMATIC HEADER */}
      <header style={{ padding: '2rem 2rem 1rem 2rem', position: 'relative', textAlign: 'center', background: 'linear-gradient(180deg, rgba(0,25,50,0.8) 0%, transparent 100%)' }}>
        <button onClick={() => activeSong ? setActiveSong(null) : navigate('/dashboard')} className="glow-hover" style={{ position: 'absolute', left: '2rem', top: '2rem', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer' }}>
          ←
        </button>
        <h2 style={{ color: '#fff', letterSpacing: '6px', fontSize: '2rem', margin: 0, textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>
          {activeSong ? 'ЧТЕНИЕ' : 'ВИРТУАЛЬНЫЙ СОНГБУК'}
        </h2>
        {!activeSong && <p style={{ color: 'var(--accent)', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.5rem', letterSpacing: '2px' }}>VIRTUAL ENGINE ACTIVE • {filteredSongs.length} SONGS</p>}
      </header>

      {activeSong ? (
        <div className="dashboard-scroll" style={{ flex: 1, padding: '0 2rem 120px 2rem', overflowY: 'auto' }}>
          {/* Controls Bar */}
          <div className="premium-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10, 25, 47, 0.9)', position: 'sticky', top: '0px', zIndex: 10, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px' }}>TONE</div>
              <button className="gold-button glow-hover" onClick={() => setTranspose(p => p - 1)} style={{ padding: '0.5rem 1rem', borderRadius: '5px' }}>-</button>
              <div style={{ fontWeight: 'bold', width: '25px', textAlign: 'center', color: 'var(--accent)' }}>{transpose > 0 ? `+${transpose}` : transpose}</div>
              <button className="gold-button glow-hover" onClick={() => setTranspose(p => p + 1)} style={{ padding: '0.5rem 1rem', borderRadius: '5px' }}>+</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ fontSize: '0.8rem', color: isRich ? 'var(--accent)' : 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: '1px' }}>RICH CHORDS</div>
              <div 
                onClick={() => setIsRich(!isRich)} 
                style={{ width: '50px', height: '26px', background: isRich ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
              >
                <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: isRich ? '26px' : '2px', transition: '0.3s' }} />
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white', textShadow: '0px 4px 20px rgba(0,0,0,0.5)' }}>{activeSong.title}</h1>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                <span>🎸 Base Key: <strong style={{color:'var(--accent)'}}>{activeSong.defaultKey}</strong></span>
                <span>⏱️ Темп: <strong>{activeSong.bpm} BPM</strong></span>
              </div>
            </div>

            <div style={{ fontFamily: 'sans-serif' }}>
              {activeSong.standardLyrics.split('\n').map((line, i) => (
                <ChordLyricLine key={i} text={line} transpose={transpose} isRich={isRich} baseKey={activeSong.defaultKey} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <input 
            type="text" 
            placeholder="Поиск по базе 130+ песен..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '1.2rem', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.3)', color: 'white', marginBottom: '2rem', fontSize: '1rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
          />

          <div style={{ flex: 1, position: 'relative' }}>
            {filteredSongs.length > 0 ? (
              <VirtualList 
                items={filteredSongs} 
                itemHeight={95} 
                containerHeight={window.innerHeight - 250} // Rough approx to fill remaining space
                renderItem={(song, index) => {
                  const isOptimal = optimalKeys.includes(song.defaultKey);
                  return (
                    <div 
                      key={song.id} 
                      className="premium-card glow-hover" 
                      onClick={() => openSong(song)}
                      style={{ 
                        height: '80px', 
                        marginBottom: '15px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0 1.5rem',
                        border: isOptimal ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.05)',
                        background: isOptimal ? 'rgba(255, 215, 0, 0.05)' : 'var(--glass)',
                        boxShadow: isOptimal ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.2rem', color: isOptimal ? '#FFD700' : 'white' }}>
                          {song.title} {isOptimal && '✨'}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{song.artist}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.8rem', opacity: 0.7 }}>
                        <div style={{ color: isOptimal ? '#FFD700' : 'var(--accent)', fontWeight: 'bold', marginBottom: '2px' }}>{song.defaultKey}</div>
                        <div>{song.bpm} BPM</div>
                      </div>
                    </div>
                  );
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: '3rem' }}>🎵 Резонанс не найден</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
