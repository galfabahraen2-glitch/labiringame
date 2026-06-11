import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { UI } from './components/UI';
import { Maze, CELL_SIZE } from './components/Maze';
import { Player } from './components/Player';
import { OtherPlayers } from './components/OtherPlayers';
import { Treasure } from './components/Treasure';
import { ExitGate } from './components/ExitGate';
import { useGameStore } from './store';
import { generateMaze } from './utils/mazeGenerator';

function GameScene() {
  const { currentLevel, setMazeData, treasures, exitPosition, playerStartPosition, setTotalTreasures } = useGameStore();

  useEffect(() => {
    // Generate new maze when level changes
    const result = generateMaze(currentLevel);
    
    // Calculate world coordinates based on grid center offset
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
    // Optionally teleport player to start (needs Player component refactoring to force reset rigid body, 
    // or we just trust the component remounts or handles it. For now, Rapier might keep the old position.
    // We can force remount using key={currentLevel})
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
    </Physics>
  );
}

function App() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const isCrystalPalace = currentLevel > 120;

  return (
    <>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={[isCrystalPalace ? '#ffffff' : '#0a0a14']} />
        {!isCrystalPalace && <fog attach="fog" args={['#0a0a14', 10, 40]} />}
        
        <ambientLight intensity={isCrystalPalace ? 1.5 : 0.6} />
        <directionalLight 
          castShadow 
          position={[10, 20, 10]} 
          intensity={isCrystalPalace ? 2.0 : 1.0} 
          shadow-mapSize={[1024, 1024]}
        />
        
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      <UI />
    </>
  );
}

export default App;
