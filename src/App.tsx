import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { UI } from './components/UI';
import { Maze, CELL_SIZE } from './components/Maze';
import { Player } from './components/Player';
import { OtherPlayers } from './components/OtherPlayers';
import { Treasure } from './components/Treasure';
import { ExitGate } from './components/ExitGate';
import { EnemySpawner } from './components/Enemy';
import { DeathScreen } from './components/DeathScreen';
import { LevelMap } from './components/LevelMap';
import { SettingsScreen, TrackRecordScreen } from './components/SettingsScreen';
import { useGameStore } from './store';
import { generateMaze } from './utils/mazeGenerator';
import { audio } from './audioManager';

function GameScene() {
  const { currentLevel, setMazeData, treasures, exitPosition, playerStartPosition, setTotalTreasures } = useGameStore();

  useEffect(() => {
    const result = generateMaze(currentLevel);
    const widthOffset = result.data[0].length / 2;
    const heightOffset = result.data.length / 2;

    const worldStart: [number, number] = [
      (result.startX - widthOffset) * CELL_SIZE,
      (result.startZ - heightOffset) * CELL_SIZE
    ];
    const worldExit: [number, number] = [
      (result.exitX - widthOffset) * CELL_SIZE,
      (result.exitZ - heightOffset) * CELL_SIZE
    ];
    const worldTreasures = result.treasures.map((t, i) => ({
      x: (t.x - widthOffset) * CELL_SIZE,
      z: (t.z - heightOffset) * CELL_SIZE,
      id: `treasure-${currentLevel}-${i}`
    }));

    setMazeData(result.data, worldExit, worldStart, worldTreasures);
    setTotalTreasures(worldTreasures.length);
  }, [currentLevel, setMazeData, setTotalTreasures]);

  if (!exitPosition) return null;

  return (
    <Physics gravity={[0, -9.81, 0]} key={currentLevel}>
      <Maze />
      <Player key={`player-${currentLevel}`} startPos={playerStartPosition} />
      <OtherPlayers />
      {treasures.map((t: any) => (
        <Treasure key={t.id} id={t.id} position={[t.x, 1, t.z]} />
      ))}
      <ExitGate position={[exitPosition[0], 1.5, exitPosition[1]]} />
      <EnemySpawner key={`enemies-${currentLevel}`} />
    </Physics>
  );
}

function App() {
  const { gameState, currentLevel, isDead, setGameState, addTrackRecord, score, timeLeft } = useGameStore();
  const isCrystalPalace = currentLevel > 120;

  // Handle player death → switch to dead state
  useEffect(() => {
    if (isDead && gameState === 'playing') {
      const record = {
        level: currentLevel,
        timeUsed: Math.floor(60 * 9 - timeLeft), // approximate time used
        treasures: score,
        survived: false,
        date: new Date().toLocaleDateString('id-ID'),
      };
      addTrackRecord(record);
      // After 1s, switch to dead screen
      const t = setTimeout(() => setGameState('dead'), 800);
      return () => clearTimeout(t);
    }
  }, [isDead, gameState]);

  // Play audio on victory
  useEffect(() => {
    if (gameState === 'victory') {
      if (isCrystalPalace) audio.grandVictory();
      else audio.levelComplete();
    }
  }, [gameState, isCrystalPalace]);

  return (
    <>
      {/* 3D Canvas — only show when playing or on death/victory screens */}
      {(gameState === 'playing' || gameState === 'dead' || gameState === 'victory') && (
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}
          style={{ position: 'fixed', inset: 0 }}>
          <color attach="background" args={[isCrystalPalace ? '#f0f8ff' : '#0a0a14']} />
          {!isCrystalPalace && <fog attach="fog" args={['#0a0a14', 10, 40]} />}
          <ambientLight intensity={isCrystalPalace ? 1.5 : 0.6} />
          <directionalLight castShadow position={[10, 20, 10]}
            intensity={isCrystalPalace ? 2.0 : 1.0}
            shadow-mapSize={[1024, 1024]} />
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
      )}

      {/* Overlay Screens */}
      {gameState === 'dead' && <DeathScreen />}
      {gameState === 'levelmap' && <LevelMap />}
      {gameState === 'settings' && <SettingsScreen />}
      {gameState === 'trackrecord' && <TrackRecordScreen />}

      {/* HUD / Menu — always on top */}
      <UI />
    </>
  );
}

export default App;
