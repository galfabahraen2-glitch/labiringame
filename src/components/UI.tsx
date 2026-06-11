import React, { useState } from 'react';
import { useGameStore } from '../store';
import { network } from '../network';
import { Joystick } from 'react-joystick-component';
import { Gem, Trophy, Users } from 'lucide-react';
import { Minimap } from './Minimap';

export const UI: React.FC = () => {
  const { gameState, score, totalTreasures, setGameState, setJoystickInput, resetGame } = useGameStore();
  
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

  return (
    <div className="ui-container">
      {gameState === 'menu' && (
        <div className="menu-overlay interactive" style={{ gap: '1rem' }}>
          <h1 className="title">Labyrinth Quest</h1>
          
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
              <button className="btn-start" onClick={() => setGameState('playing')}>
                Main Sendiri
              </button>
              
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
        <div className="menu-overlay interactive">
          <h1 className="title" style={{ color: '#00e5ff', textShadow: '0 0 20px #00e5ff' }}>
            <Trophy size={64} style={{ display: 'block', margin: '0 auto 1rem' }} />
            Level Selesai!
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>
            Anda berhasil mengumpulkan {score} / {totalTreasures} Harta Karun.
          </p>
          <button className="btn-start" onClick={resetGame}>
            Main Lagi
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="hud">
            <div className="score-panel">
              <Gem size={24} color="#00e5ff" />
              <span>{score} / {totalTreasures}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
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
              stickColor="rgba(206, 147, 216, 0.8)" 
              move={handleJoystickMove} 
              stop={handleJoystickStop} 
            />
          </div>
        </>
      )}
    </div>
  );
};
