import React from 'react';
import { useGameStore } from '../store';
import { Joystick } from 'react-joystick-component';
import { Gem, Trophy } from 'lucide-react';

export const UI: React.FC = () => {
  const { gameState, score, totalTreasures, setGameState, setJoystickInput, resetGame } = useGameStore();

  const handleJoystickMove = (e: any) => {
    // e.x and e.y are values between -1 and 1
    setJoystickInput(e.x || 0, e.y || 0);
  };

  const handleJoystickStop = () => {
    setJoystickInput(0, 0);
  };

  return (
    <div className="ui-container">
      {gameState === 'menu' && (
        <div className="menu-overlay interactive">
          <h1 className="title">Labyrinth Quest</h1>
          <button className="btn-start" onClick={() => setGameState('playing')}>
            Mulai Petualangan
          </button>
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
