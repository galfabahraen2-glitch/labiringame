import React, { useState } from 'react';
import { useGameStore } from '../store';
import { network } from '../network';
import { Joystick } from 'react-joystick-component';
import { Gem, Trophy, Users, Map } from 'lucide-react';
import { Minimap } from './Minimap';

export const UI: React.FC = () => {
  const { gameState, score, totalTreasures, currentLevel, setGameState, setLevel, setJoystickInput, resetGame } = useGameStore();
  
  const [roomIdInput, setRoomIdInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [myRoomId, setMyRoomId] = useState('');

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

  const isCrystalPalace = currentLevel > 120;

  return (
    <div className="ui-container">
      {gameState === 'menu' && (
        <div className="menu-overlay interactive" style={{ gap: '1rem' }}>
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
                  Main Sendiri
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
                Anda mengumpulkan total {score} harta karun di sepanjang perjalanan Anda!
              </p>
              <button className="btn-start" onClick={() => { setLevel(1); resetGame(); }} style={{ background: 'linear-gradient(45deg, #f1c40f, #e67e22)' }}>
                Mulai Petualangan Baru
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

      {gameState === 'playing' && (
        <>
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
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {network.connections.length > 0 && (
                <div className="score-panel" style={{ color: '#2ecc71', textShadow: '0 0 10px rgba(46, 204, 113, 0.5)' }}>
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
