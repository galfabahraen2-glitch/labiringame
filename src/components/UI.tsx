import React, { useState } from 'react';
import { useGameStore } from '../store';
import { network } from '../network';
import { Joystick } from 'react-joystick-component';
import { Gem, Trophy, Users, Map, Heart, Clock, Settings, ArrowLeft } from 'lucide-react';
import { Minimap } from './Minimap';

export const UI: React.FC = () => {
  const { 
    gameState, score, totalTreasures, currentLevel, isDead, health, timeRemaining, 
    playerName, skinColor, shirtColor,
    setGameState, setLevel, setJoystickInput, resetGame, setPlayerConfig 
  } = useGameStore();
  
  const [roomIdInput, setRoomIdInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [myRoomId, setMyRoomId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const [tempName, setTempName] = useState(playerName);
  const [tempSkin, setTempSkin] = useState(skinColor);
  const [tempShirt, setTempShirt] = useState(shirtColor);

  const handleJoystickMove = (e: any) => {
    setJoystickInput(e.x || 0, e.y || 0);
  };

  const handleJoystickStop = () => {
    setJoystickInput(0, 0);
  };

  const createRoom = async () => {
    setConnectionStatus('Membuat ruangan...');
    try {
      const id = await network.initHost();
      setMyRoomId(id);
      setConnectionStatus('Ruangan dibuat! Bagikan kode ini: ' + id);
    } catch (e: any) {
      setConnectionStatus('Gagal membuat: ' + e.message);
    }
  };

  const joinRoom = async () => {
    if (!roomIdInput) return;
    setConnectionStatus('Menghubungkan ke ' + roomIdInput + '...');
    try {
      await network.joinRoom(roomIdInput);
      setConnectionStatus('Berhasil terhubung!');
      setGameState('playing');
    } catch (e: any) {
      setConnectionStatus('Gagal bergabung: ' + e.message);
    }
  };

  const startNewGame = () => {
    setLevel(1);
    setGameState('playing');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCrystalPalace = currentLevel > 120;

  if (showSettings) {
    return (
      <div className="ui-container">
        <div className="menu-overlay interactive">
          <h2 className="title" style={{ fontSize: '2.5rem' }}>Pengaturan Pemain</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '10px' }}>
            <div>
              <label style={{ color: '#00e5ff' }}>Nama Pemain:</label>
              <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
            </div>
            
            <div>
              <label style={{ color: '#00e5ff' }}>Warna Kulit:</label>
              <input type="color" value={tempSkin} onChange={e => setTempSkin(e.target.value)} style={{ width: '100%', height: '40px', marginTop: '0.5rem' }} />
            </div>

            <div>
              <label style={{ color: '#00e5ff' }}>Warna Baju:</label>
              <input type="color" value={tempShirt} onChange={e => setTempShirt(e.target.value)} style={{ width: '100%', height: '40px', marginTop: '0.5rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-start" style={{ flex: 1, background: 'gray' }} onClick={() => setShowSettings(false)}>Batal</button>
              <button className="btn-start" style={{ flex: 1 }} onClick={() => {
                setPlayerConfig(tempName, tempSkin, tempShirt);
                setShowSettings(false);
              }}>Simpan</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showMap) {
    return (
      <div className="ui-container">
        <div className="menu-overlay interactive" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <h2 className="title" style={{ fontSize: '2.5rem', color: '#f1c40f' }}>Peta Perjalanan Hidup</h2>
          <p style={{ color: '#ccc', marginBottom: '1rem' }}>Anda berada di Level {currentLevel} dari 120</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', width: '80%', maxWidth: '600px', maxHeight: '50vh', overflowY: 'auto', padding: '1rem', background: '#222', borderRadius: '10px' }}>
            {Array.from({ length: 120 }).map((_, i) => {
              const lvl = i + 1;
              const isCurrent = lvl === currentLevel;
              const isPassed = lvl < currentLevel;
              return (
                <div key={lvl} style={{
                  width: '30px', height: '30px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrent ? '#00e5ff' : isPassed ? '#2ecc71' : '#555',
                  color: isCurrent ? '#000' : '#fff',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {lvl}
                </div>
              );
            })}
            <div style={{ width: '100%', textAlign: 'center', marginTop: '10px', color: '#f1c40f', fontWeight: 'bold' }}>
              ISTANA KRISTAL
            </div>
          </div>

          <button className="btn-start" style={{ marginTop: '2rem' }} onClick={() => setShowMap(false)}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-container">
      {gameState === 'menu' && (
        <div className="menu-overlay interactive" style={{ gap: '1rem' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '1rem' }}>
            <button className="btn-icon" onClick={() => setShowMap(true)} title="Peta Perjalanan"><Map /></button>
            <button className="btn-icon" onClick={() => setShowSettings(true)} title="Pengaturan"><Settings /></button>
          </div>

          <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Labyrinth Quest</h1>
          {currentLevel > 1 && <p style={{ color: '#00e5ff', fontSize: '1.2rem', marginBottom: '1rem' }}>Progres Tersimpan: Level {currentLevel}</p>}
          
          {myRoomId ? (
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ color: '#00e5ff', fontSize: '1.2rem' }}>Kode Ruangan Anda:</p>
              <h2 style={{ color: '#fff', letterSpacing: '2px', userSelect: 'all' }}>{myRoomId}</h2>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Menunggu teman bergabung...</p>
              <button className="btn-start" onClick={() => setGameState('playing')} style={{ marginTop: '1rem' }}>
                Mulai Bermain
              </button>
            </div>
          ) : (
            <>
              {currentLevel > 1 ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-start" onClick={() => setGameState('playing')}>
                    Lanjutkan (Lv. {currentLevel})
                  </button>
                  <button className="btn-start" onClick={startNewGame} style={{ background: 'linear-gradient(45deg, #e74c3c, #c0392b)' }}>
                    Mulai Baru
                  </button>
                </div>
              ) : (
                <button className="btn-start" onClick={() => setGameState('playing')}>
                  Mulai Perjalanan
                </button>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-start" style={{ fontSize: '1rem', padding: '0.5rem 1.5rem', background: 'linear-gradient(45deg, #2980b9, #2c3e50)' }} onClick={createRoom}>
                  Buat Ruangan
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Kode Ruangan Teman" 
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #00e5ff', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                  />
                  <button className="btn-start" style={{ fontSize: '1rem', padding: '0.5rem 1.5rem', background: 'linear-gradient(45deg, #27ae60, #2c3e50)' }} onClick={joinRoom}>
                    Gabung
                  </button>
                </div>
              </div>
            </>
          )}

          {connectionStatus && <p style={{ color: '#f1c40f', marginTop: '1rem' }}>{connectionStatus}</p>}
        </div>
      )}

      {gameState === 'victory' && (
        <div className="menu-overlay interactive" style={{ background: isCrystalPalace ? 'rgba(255,255,255,0.9)' : undefined }}>
          {isCrystalPalace ? (
            <>
              <h1 className="title" style={{ color: '#f1c40f', textShadow: '0 0 20px #f1c40f' }}>
                <Trophy size={80} style={{ display: 'block', margin: '0 auto 1rem', color: '#f1c40f' }} />
                GELAR SUCI: MASTER LABYRINTH
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#333', marginBottom: '2rem', maxWidth: '600px', textAlign: 'center' }}>
                Selamat! Anda telah menaklukkan ke-120 level Labyrinth Quest dan mencapai Istana Kristal legendaris. 
                Anda mengumpulkan total {score} bekal amal (Harta Karun) di sepanjang perjalanan Anda!
              </p>
              <button className="btn-start" onClick={() => { setLevel(1); resetGame(); }} style={{ background: 'linear-gradient(45deg, #f1c40f, #e67e22)' }}>
                Mulai Perjalanan Baru
              </button>
            </>
          ) : (
            <>
              <h1 className="title" style={{ color: '#00e5ff', textShadow: '0 0 20px #00e5ff' }}>
                <Trophy size={64} style={{ display: 'block', margin: '0 auto 1rem' }} />
                Level {currentLevel - 1} Selesai!
              </h1>
              <p style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>
                Total Harta Karun: {score}
              </p>
              <button className="btn-start" onClick={() => setGameState('playing')}>
                Lanjut ke Level {currentLevel}
              </button>
            </>
          )}
        </div>
      )}

      {gameState === 'playing' && isDead && (
        <div className="menu-overlay interactive" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <h1 className="title" style={{ color: '#e74c3c', textShadow: '0 0 20px #e74c3c' }}>
            PERJALANAN BERAKHIR
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem', maxWidth: '600px', textAlign: 'center' }}>
            Malaikat Pencabut Nyawa telah menjemput Anda. Anda tidak memiliki cukup bekal waktu atau kesehatan untuk melanjutkan perjalanan di labirin dunia ini.
          </p>
          <p style={{ color: '#f1c40f', marginBottom: '2rem' }}>
            Beristirahatlah di alam Limbo sambil menunggu takdir pemain lain...
          </p>
          <button className="btn-start" onClick={resetGame}>
            Ulangi Level Ini
          </button>
          <button className="btn-start" style={{ marginTop: '1rem', background: 'gray' }} onClick={() => setGameState('menu')}>
            Kembali ke Menu
          </button>
        </div>
      )}

      {gameState === 'playing' && !isDead && (
        <>
          <button className="btn-icon interactive" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100 }} onClick={() => setGameState('menu')} title="Kembali ke Menu">
            <ArrowLeft />
          </button>

          <div className="hud">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="score-panel" style={{ background: isCrystalPalace ? 'rgba(255,255,255,0.8)' : undefined, color: isCrystalPalace ? '#000' : undefined }}>
                <Map size={24} color={isCrystalPalace ? "#f1c40f" : "#f1c40f"} />
                <span>{isCrystalPalace ? 'Crystal Palace' : `Level ${currentLevel}`}</span>
              </div>
              <div className="score-panel" style={{ background: isCrystalPalace ? 'rgba(255,255,255,0.8)' : undefined, color: isCrystalPalace ? '#000' : undefined }}>
                <Gem size={24} color="#00e5ff" />
                <span>{score} / Total: {totalTreasures}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="score-panel" style={{ color: health > 30 ? '#2ecc71' : '#e74c3c' }}>
                <Heart size={24} fill={health > 30 ? '#2ecc71' : '#e74c3c'} />
                <span>{health}%</span>
              </div>
              {!isCrystalPalace && (
                <div className="score-panel" style={{ color: timeRemaining > 60 ? '#f1c40f' : '#e74c3c' }}>
                  <Clock size={24} />
                  <span>Usia: {formatTime(timeRemaining)}</span>
                </div>
              )}
              {network.connections.length > 0 && (
                <div className="score-panel" style={{ color: '#9b59b6' }}>
                  <Users size={24} />
                  <span>{network.connections.length} Teman</span>
                </div>
              )}
              <Minimap />
            </div>
          </div>
          <div className="joystick-zone interactive">
            <Joystick 
              size={100} 
              baseColor="rgba(255, 255, 255, 0.2)" 
              stickColor={isCrystalPalace ? "rgba(255, 215, 0, 0.8)" : "rgba(206, 147, 216, 0.8)"} 
              move={handleJoystickMove} 
              stop={handleJoystickStop} 
            />
          </div>
        </>
      )}
    </div>
  );
};
