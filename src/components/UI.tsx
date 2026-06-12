import React, { useState, useEffect } from 'react';
import { useGameStore, getTimeForLevel } from '../store';
import { network } from '../network';
import { Joystick } from 'react-joystick-component';
import { Users, Settings, Map, BookOpen, Home } from 'lucide-react';
import { Minimap } from './Minimap';
import { audio } from '../audioManager';

const T = {
  id: {
    singlePlayer: 'Main Sendiri',
    createRoom: 'Buat Ruangan',
    joinRoom: 'Gabung Ruangan',
    joinPlaceholder: 'Kode Ruangan',
    waitingFriend: 'Menunggu teman bergabung...',
    startPlay: 'Mulai Bermain',
    continue: 'Lanjutkan',
    newGame: 'Mulai Baru',
    levelMap: 'Peta Level',
    settings: 'Pengaturan',
    records: 'Rekam Jejak',
    philosophy: '"Dunia adalah labirin gelap. Harta karun adalah amalan. Hantu adalah godaan. Pintu keluar adalah keselamatan. Istana Kristal adalah surga."',
    back: 'Kembali',
    levelComplete: 'Level Selesai!',
    nextLevel: 'Lanjut',
    finalVictory: 'GELAR SUCI: MASTER LABYRINTH',
    finalSubtitle: 'Anda telah menyelesaikan perjalanan agung 120 Level! Semua rintangan telah dilalui.',
    startFresh: 'Mulai Petualangan Baru',
    timeLeft: 'Sisa Waktu',
    health: 'Kesehatan',
    lifeForce: 'Kekuatan Jiwa',
    collected: 'Dikumpulkan',
    pause: 'Jeda',
    resume: 'Lanjut Main',
    returnMenu: 'Menu Utama',
    connecting: 'Menghubungkan...',
    connected: 'Berhasil terhubung!',
    failConnect: 'Gagal: ',
    friends: 'Teman',
  },
  en: {
    singlePlayer: 'Play Solo',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    joinPlaceholder: 'Room Code',
    waitingFriend: 'Waiting for friend...',
    startPlay: 'Start Game',
    continue: 'Continue',
    newGame: 'New Game',
    levelMap: 'Level Map',
    settings: 'Settings',
    records: 'Records',
    philosophy: '"Life is a dark labyrinth. Treasures are good deeds. Ghosts are temptations. The exit is salvation. The Crystal Palace is paradise."',
    back: 'Back',
    levelComplete: 'Level Complete!',
    nextLevel: 'Next',
    finalVictory: 'SACRED TITLE: MASTER LABYRINTH',
    finalSubtitle: 'You have completed the grand 120-level journey! All obstacles have been overcome.',
    startFresh: 'Start New Adventure',
    timeLeft: 'Time Left',
    health: 'Health',
    lifeForce: 'Life Force',
    collected: 'Collected',
    pause: 'Pause',
    resume: 'Resume',
    returnMenu: 'Main Menu',
    connecting: 'Connecting...',
    connected: 'Connected!',
    failConnect: 'Failed: ',
    friends: 'Friends',
  }
};

// ─── Timer component ────────────────────────────────────────────────────────
const Timer: React.FC = () => {
  const { timeLeft, currentLevel, language } = useGameStore();
  const maxTime = getTimeForLevel(currentLevel);
  const pct = timeLeft / maxTime;
  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);
  const color = pct > 0.5 ? '#27ae60' : pct > 0.25 ? '#f39c12' : '#e74c3c';
  const t = T[language];

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      borderRadius: '12px',
      padding: '0.5rem 0.8rem',
      backdropFilter: 'blur(6px)',
      border: `1px solid ${color}50`,
      minWidth: '120px',
    }}>
      <div style={{ color: '#aaa', fontSize: '0.65rem', marginBottom: '3px' }}>⏳ {t.timeLeft}</div>
      <div style={{ color, fontSize: '1.4rem', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 1s linear' }} />
      </div>
    </div>
  );
};

// ─── Bar component ──────────────────────────────────────────────────────────
const StatusBar: React.FC<{ value: number; max: number; color: string; icon: string; label: string }> = ({ value, max, color, icon, label }) => (
  <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '10px', padding: '0.4rem 0.7rem', backdropFilter: 'blur(6px)', minWidth: '100px' }}>
    <div style={{ color: '#aaa', fontSize: '0.6rem', marginBottom: '2px' }}>{icon} {label}</div>
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
      <div style={{
        width: `${(value / max) * 100}%`, height: '100%',
        background: color, borderRadius: '3px',
        transition: 'width 0.3s ease',
        boxShadow: `0 0 6px ${color}80`,
      }} />
    </div>
    <div style={{ color, fontSize: '0.7rem', marginTop: '2px', fontWeight: 'bold' }}>{Math.round(value)}</div>
  </div>
);

// ─── Pause Menu ─────────────────────────────────────────────────────────────
const PauseMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setGameState, language } = useGameStore();
  const t = T[language];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        background: 'rgba(10,10,20,0.95)',
        border: '1px solid rgba(0,229,255,0.3)',
        borderRadius: '20px',
        padding: '2.5rem',
        textAlign: 'center',
        minWidth: '250px',
        boxShadow: '0 0 40px rgba(0,229,255,0.1)',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏸</div>
        <h2 style={{ color: '#00e5ff', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif' }}>{t.pause}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={onClose} style={btnStyle('#00e5ff')}>▶ {t.resume}</button>
          <button onClick={() => { audio.buttonClick(); setGameState('settings'); }} style={btnStyle('#8e44ad')}>⚙️ {t.settings}</button>
          <button onClick={() => { audio.buttonClick(); setGameState('levelmap'); }} style={btnStyle('#f39c12')}>🗺️ {t.levelMap}</button>
          <button onClick={() => { audio.buttonClick(); setGameState('menu'); }} style={btnStyle('#e74c3c')}>🏠 {t.returnMenu}</button>
        </div>
      </div>
    </div>
  );
};

const btnStyle = (color: string) => ({
  padding: '0.7rem 1.5rem', borderRadius: '20px',
  border: `1px solid ${color}60`,
  background: `${color}20`,
  color: color, cursor: 'pointer',
  fontSize: '0.95rem', fontWeight: 'bold',
  width: '100%',
  transition: 'background 0.15s',
  fontFamily: 'Inter, sans-serif',
} as React.CSSProperties);

// ─── Main UI ────────────────────────────────────────────────────────────────
export const UI: React.FC = () => {
  const { gameState, score, totalTreasures, currentLevel, hp, age, language, joystickMode,
    setGameState, setLevel, setJoystickInput, setJoystickLookInput, resetGame, playerName } = useGameStore();

  const [roomIdInput, setRoomIdInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [myRoomId, setMyRoomId] = useState('');
  const [showPause, setShowPause] = useState(false);

  const t = T[language];
  const isCrystalPalace = currentLevel > 120;

  useEffect(() => {
    if (gameState === 'playing') {
      audio.startAmbientMusic();
    } else {
      audio.stopAmbientMusic();
    }
  }, [gameState]);

  const createRoom = async () => {
    audio.buttonClick();
    setIsConnecting(true);
    setConnectionError('');
    setConnectionStatus('⏳ Membuat ruangan...');
    try {
      const id = await network.initHost();
      setMyRoomId(id);
      setConnectionStatus('');
    } catch (e: any) {
      setConnectionError(e.message || 'Gagal membuat ruangan. Coba lagi.');
      setConnectionStatus('');
    } finally {
      setIsConnecting(false);
    }
  };

  const joinRoom = async () => {
    if (!roomIdInput.trim() || isConnecting) return;
    audio.buttonClick();
    setIsConnecting(true);
    setConnectionError('');
    setConnectionStatus('⏳ Menghubungkan ke ruangan...');
    try {
      await network.joinRoom(roomIdInput);
      setConnectionStatus('✅ Berhasil terhubung!');
      setTimeout(() => setGameState('playing'), 800);
    } catch (e: any) {
      setConnectionError(e.message || 'Gagal terhubung. Pastikan kode ruangan benar dan host masih online.');
      setConnectionStatus('');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyRoomId = () => {
    if (myRoomId) {
      navigator.clipboard.writeText(myRoomId).catch(() => {});
      audio.buttonClick();
    }
  };

  const NavBtn: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color?: string }> = ({ icon, label, onClick, color = '#00e5ff' }) => (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      padding: '0.5rem 0.8rem',
      borderRadius: '12px',
      border: `1px solid ${color}30`,
      background: `${color}10`,
      color,
      cursor: 'pointer', fontSize: '0.65rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      {icon}
      {label}
    </button>
  );

  return (
    <div className="ui-container">
      {/* ── MENU ── */}
      {gameState === 'menu' && (
        <div className="menu-overlay interactive" style={{ gap: '1rem', maxWidth: '420px' }}>
          <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Labyrinth Quest</h1>
          <p style={{ color: '#7f8c8d', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5, padding: '0 1rem' }}>
            {t.philosophy}
          </p>
          {currentLevel > 1 && <p style={{ color: '#00e5ff', fontSize: '1rem' }}>👤 {playerName} — Level {currentLevel}</p>}

          {myRoomId ? (
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '1.25rem', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(0,229,255,0.2)', width: '100%', maxWidth: '380px' }}>
              <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '0.5rem' }}>📡 Kode Ruangan Anda:</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <h2 style={{ color: '#00e5ff', letterSpacing: '3px', fontFamily: 'monospace', fontSize: '1.1rem', userSelect: 'all', wordBreak: 'break-all' }}>
                  {myRoomId}
                </h2>
                <button
                  onClick={copyRoomId}
                  title="Salin kode"
                  style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '8px', color: '#00e5ff', cursor: 'pointer', padding: '4px 8px', fontSize: '1rem' }}>
                  📋
                </button>
              </div>
              <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                {t.waitingFriend} Bagikan kode ini ke teman Anda.
              </p>
              <button className="btn-start" onClick={() => { audio.buttonClick(); setGameState('playing'); }} style={{ fontSize: '1rem', padding: '0.7rem 2rem' }}>
                {t.startPlay}
              </button>
              <button
                onClick={() => { setMyRoomId(''); network.disconnect(); }}
                style={{ display: 'block', margin: '0.6rem auto 0', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem' }}>
                ✕ Batalkan
              </button>
            </div>
          ) : (
            <>
              {/* Play buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {currentLevel > 1 && (
                  <button className="btn-start" onClick={() => { audio.buttonClick(); setGameState('playing'); }}>
                    ▶ {t.continue} Lv.{currentLevel}
                  </button>
                )}
                <button className="btn-start" style={{ background: 'linear-gradient(45deg, #16a085, #1abc9c)' }}
                  onClick={() => { audio.buttonClick(); setLevel(1); setGameState('playing'); }}>
                  🆕 {t.newGame}
                </button>
              </div>

              {/* Multiplayer section */}
              <div style={{ width: '100%', maxWidth: '380px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: '#aaa', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.75rem' }}>👥 Multiplayer</p>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <button
                    className="btn-start"
                    disabled={isConnecting}
                    style={{ background: 'linear-gradient(45deg, #2980b9, #1a5276)', fontSize: '0.85rem', padding: '0.5rem 1rem', flex: 1, opacity: isConnecting ? 0.6 : 1 }}
                    onClick={createRoom}>
                    🔗 {t.createRoom}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder={t.joinPlaceholder}
                    value={roomIdInput}
                    onChange={e => setRoomIdInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && joinRoom()}
                    disabled={isConnecting}
                    style={{
                      padding: '0.5rem 0.75rem', borderRadius: '8px',
                      border: '1px solid rgba(0,229,255,0.4)',
                      background: 'rgba(0,0,0,0.5)', color: 'white',
                      flex: 1, fontSize: '0.85rem', fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                  <button
                    className="btn-start"
                    disabled={isConnecting || !roomIdInput.trim()}
                    style={{ background: 'linear-gradient(45deg, #27ae60, #1e8449)', fontSize: '0.85rem', padding: '0.5rem 1rem', opacity: (isConnecting || !roomIdInput.trim()) ? 0.6 : 1 }}
                    onClick={joinRoom}>
                    {isConnecting ? '⏳' : t.joinRoom}
                  </button>
                </div>
              </div>

              {/* Status / Error messages */}
              {connectionStatus && (
                <p style={{ color: '#f1c40f', fontSize: '0.85rem', textAlign: 'center' }}>{connectionStatus}</p>
              )}
              {connectionError && (
                <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '10px', padding: '0.75rem 1rem', maxWidth: '380px', textAlign: 'center' }}>
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠️ {connectionError}</p>
                  <button
                    onClick={() => { setConnectionError(''); setRoomIdInput(''); }}
                    style={{ background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c', borderRadius: '20px', padding: '0.3rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                    🔄 Coba Lagi
                  </button>
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <NavBtn icon={<Map size={18} />} label={t.levelMap} onClick={() => { audio.buttonClick(); setGameState('levelmap'); }} color="#00e5ff" />
            <NavBtn icon={<Settings size={18} />} label={t.settings} onClick={() => { audio.buttonClick(); setGameState('settings'); }} color="#8e44ad" />
            <NavBtn icon={<BookOpen size={18} />} label={t.records} onClick={() => { audio.buttonClick(); setGameState('trackrecord'); }} color="#f1c40f" />
          </div>
        </div>
      )}

      {/* ── PLAYING HUD ── */}
      {gameState === 'playing' && (
        <>
          {/* ── TOP CENTER: Always-visible HOME & PAUSE buttons ── */}
          <div className="hud-buttons">
            <button
              onClick={() => { audio.buttonClick(); setGameState('menu'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(231,76,60,0.85)',
                border: '2px solid rgba(231,76,60,0.6)',
                borderRadius: '30px',
                padding: '8px 18px',
                color: '#fff', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 'bold',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(231,76,60,0.4)',
                fontFamily: 'Inter, sans-serif',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              🏠 {t.returnMenu}
            </button>
            <button
              onClick={() => { audio.buttonClick(); setShowPause(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(0,0,0,0.75)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '30px',
                padding: '8px 18px',
                color: '#fff', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 'bold',
                backdropFilter: 'blur(8px)',
                fontFamily: 'Inter, sans-serif',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              ⏸ {t.pause}
            </button>
          </div>

          <div className="hud">
            {/* Left side status bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Timer />
              <StatusBar value={hp} max={100} color="#e74c3c" icon="❤️" label={t.health} />
              <StatusBar value={age} max={100} color="#f1c40f" icon="✨" label={t.lifeForce} />
              <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '10px', padding: '0.4rem 0.7rem', backdropFilter: 'blur(6px)' }}>
                <div style={{ color: '#aaa', fontSize: '0.6rem' }}>💎 {t.collected}</div>
                <div style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '0.9rem' }}>{score} / {totalTreasures}</div>
              </div>
            </div>
            {/* Right side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
              {network.connections.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '10px', padding: '0.4rem 0.7rem', color: '#2ecc71', fontSize: '0.8rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Users size={14} />{network.connections.length} {t.friends}
                </div>
              )}
              <div style={{ background: isCrystalPalace ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.6)', borderRadius: '10px', padding: '0.4rem 0.7rem', color: isCrystalPalace ? '#f1c40f' : '#00e5ff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {isCrystalPalace ? '🏰 Crystal Palace' : `📍 Level ${currentLevel}`}
              </div>
              <Minimap />
            </div>
          </div>
          {joystickMode === 'single' ? (
            <div className="joystick-zone-center interactive">
              <Joystick size={100}
                baseColor="rgba(255,255,255,0.15)"
                stickColor={isCrystalPalace ? "rgba(255,215,0,0.8)" : "rgba(206,147,216,0.8)"}
                move={(e) => setJoystickInput(e.x || 0, e.y || 0)}
                stop={() => setJoystickInput(0, 0)} />
            </div>
          ) : (
            <>
              <div className="joystick-zone interactive">
                <Joystick size={100}
                  baseColor="rgba(255,255,255,0.15)"
                  stickColor={isCrystalPalace ? "rgba(255,215,0,0.8)" : "rgba(206,147,216,0.8)"}
                  move={(e) => setJoystickInput(e.x || 0, e.y || 0)}
                  stop={() => setJoystickInput(0, 0)} />
              </div>
              <div className="joystick-zone-right interactive">
                <Joystick size={100}
                  baseColor="rgba(255,255,255,0.15)"
                  stickColor="rgba(0,229,255,0.6)"
                  move={(e) => setJoystickLookInput(e.x || 0, e.y || 0)}
                  stop={() => setJoystickLookInput(0, 0)} />
              </div>
            </>
          )}
          {showPause && <PauseMenu onClose={() => setShowPause(false)} />}
        </>
      )}

      {/* ── VICTORY (level complete or final) ── */}
      {gameState === 'victory' && (
        <div className="menu-overlay interactive" style={{ background: isCrystalPalace ? 'rgba(255,255,255,0.9)' : undefined, maxWidth: '500px' }}>
          {isCrystalPalace ? (
            <>
              <div style={{ fontSize: '4rem' }}>🏆</div>
              <h1 style={{ color: '#f1c40f', fontSize: '1.6rem', textShadow: '0 0 20px #f1c40f', textAlign: 'center' }}>
                {t.finalVictory}
              </h1>
              <p style={{ color: '#555', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.6 }}>{t.finalSubtitle}</p>
              <button className="btn-start" style={{ background: 'linear-gradient(45deg, #f1c40f, #e67e22)' }}
                onClick={() => { audio.grandVictory(); setLevel(1); resetGame(); }}>
                🌟 {t.startFresh}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem' }}>🚪</div>
              <h1 className="title" style={{ color: '#00e5ff' }}>{t.levelComplete}</h1>
              <p style={{ color: '#aaa', fontSize: '1rem' }}>💎 {score} {t.collected}</p>
              <button className="btn-start" onClick={() => { audio.levelComplete(); setGameState('playing'); }}>
                {t.nextLevel} →
              </button>
              <button onClick={() => { audio.buttonClick(); setGameState('menu'); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', padding: '0.5rem 1.5rem', borderRadius: '20px', cursor: 'pointer', marginTop: '0.5rem' }}>
                <Home size={14} style={{ marginRight: '4px' }} />{t.returnMenu}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
