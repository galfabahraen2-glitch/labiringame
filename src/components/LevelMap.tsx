import React from 'react';
import { useGameStore } from '../store';
import { audio } from '../audioManager';

const T = {
  id: {
    title: 'Peta Perjalanan Hidup',
    subtitle: 'Setiap langkah adalah ujian. Setiap level adalah babak kehidupan.',
    easy: 'Mudah',
    medium: 'Menengah',
    expert: 'Expert',
    current: 'Anda di sini',
    locked: 'Terkunci',
    completed: 'Selesai',
    crystalPalace: 'Istana Kristal',
    back: 'Kembali',
    start: 'Mulai Perjalanan',
  },
  en: {
    title: 'Map of Life\'s Journey',
    subtitle: 'Every step is a test. Every level is a chapter of life.',
    easy: 'Easy',
    medium: 'Medium',
    expert: 'Expert',
    current: 'You are here',
    locked: 'Locked',
    completed: 'Done',
    crystalPalace: 'Crystal Palace',
    back: 'Back',
    start: 'Begin Journey',
  }
};

export const LevelMap: React.FC = () => {
  const { currentLevel, setGameState, setLevel, trackRecord, language } = useGameStore();
  const t = T[language];

  const categories = [
    { label: t.easy,   range: [1, 40],   color: '#27ae60', bg: 'rgba(39,174,96,0.15)' },
    { label: t.medium, range: [41, 80],  color: '#f39c12', bg: 'rgba(243,156,18,0.15)' },
    { label: t.expert, range: [81, 120], color: '#e74c3c', bg: 'rgba(231,76,60,0.15)' },
  ];

  const completedLevels = new Set(trackRecord.filter(r => r.survived).map(r => r.level));

  const handleLevelClick = (level: number) => {
    if (level > currentLevel) return; // locked
    audio.buttonClick();
    setLevel(level);
    setGameState('playing');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0a0a14 0%, #0d1a2e 50%, #0a0a14 100%)',
      overflowY: 'auto',
      fontFamily: 'Inter, sans-serif',
      zIndex: 20,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '2rem 1rem 1rem' }}>
        <h1 style={{ color: '#00e5ff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          🗺️ {t.title}
        </h1>
        <p style={{ color: '#aaa', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
          {t.subtitle}
        </p>
        {/* Progress bar */}
        <div style={{ margin: '1rem auto', maxWidth: '400px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', height: '12px', overflow: 'hidden' }}>
            <div style={{
              width: `${((currentLevel - 1) / 120) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #27ae60, #00e5ff, #f39c12)',
              borderRadius: '20px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.3rem' }}>
            {currentLevel - 1} / 120 level selesai
          </p>
        </div>
      </div>

      {/* Level Grid per Category */}
      <div style={{ padding: '0 1rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        {categories.map(cat => (
          <div key={cat.label} style={{
            marginBottom: '2rem',
            background: cat.bg,
            borderRadius: '16px',
            padding: '1.25rem',
            border: `1px solid ${cat.color}40`,
          }}>
            <h2 style={{ color: cat.color, marginBottom: '1rem', fontSize: '1.1rem', letterSpacing: '1px' }}>
              ● {cat.label} (Level {cat.range[0]} – {cat.range[1]})
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
              gap: '6px',
            }}>
              {Array.from({ length: cat.range[1] - cat.range[0] + 1 }, (_, i) => {
                const level = cat.range[0] + i;
                const isCurrent = level === currentLevel;
                const isCompleted = completedLevels.has(level);
                const isLocked = level > currentLevel;
                return (
                  <button
                    key={level}
                    onClick={() => handleLevelClick(level)}
                    disabled={isLocked}
                    title={isCurrent ? t.current : isCompleted ? t.completed : isLocked ? t.locked : `Level ${level}`}
                    style={{
                      width: '100%', aspectRatio: '1',
                      border: isCurrent ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      background: isLocked
                        ? 'rgba(255,255,255,0.03)'
                        : isCompleted
                          ? `${cat.color}40`
                          : isCurrent
                            ? cat.color
                            : 'rgba(255,255,255,0.08)',
                      color: isLocked ? '#444' : isCurrent ? '#fff' : isCompleted ? cat.color : '#ddd',
                      fontSize: '0.65rem',
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.1s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '1px',
                      transform: isCurrent ? 'scale(1.1)' : undefined,
                    }}
                  >
                    <span>{isLocked ? '🔒' : isCompleted ? '⭐' : level}</span>
                    {isCurrent && <span style={{ fontSize: '0.5rem' }}>●</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Crystal Palace */}
        <div style={{
          textAlign: 'center', padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(200,200,255,0.1))',
          borderRadius: '16px',
          border: `1px solid rgba(255,255,255,0.2)`,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏰</div>
          <h2 style={{ color: currentLevel > 120 ? '#f1c40f' : '#444', marginBottom: '0.5rem' }}>
            {t.crystalPalace}
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            {currentLevel > 120 ? '✅ Tercapai!' : '🔒 Selesaikan 120 Level'}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1rem 1rem 2rem' }}>
        <button
          onClick={() => { audio.buttonClick(); setGameState('menu'); }}
          style={{
            padding: '0.75rem 2rem', borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#aaa', cursor: 'pointer', fontSize: '1rem',
          }}
        >
          ← {t.back}
        </button>
        <button
          onClick={() => { audio.buttonClick(); setGameState('playing'); }}
          style={{
            padding: '0.75rem 2.5rem', borderRadius: '30px',
            background: 'linear-gradient(45deg, #00b4d8, #0077b6)',
            border: 'none', color: '#fff',
            cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
          }}
        >
          {t.start} →
        </button>
      </div>
    </div>
  );
};
