import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { UI } from './components/UI';
import { Maze } from './components/Maze';
import { Player } from './components/Player';
import { Treasure } from './components/Treasure';
import { ExitGate } from './components/ExitGate';

function App() {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#0a0a14']} />
        <fog attach="fog" args={['#0a0a14', 10, 40]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight 
          castShadow 
          position={[10, 20, 10]} 
          intensity={0.5} 
          shadow-mapSize={[1024, 1024]}
        />
        
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Maze />
            <Player />
            
            {/* Some test treasures */}
            <Treasure id="t1" position={[-8, 1, -8]} />
            <Treasure id="t2" position={[8, 1, -8]} />
            <Treasure id="t3" position={[0, 1, -12]} />
            <Treasure id="t4" position={[-12, 1, 0]} />
            <Treasure id="t5" position={[12, 1, 4]} />
            
            {/* Exit gate */}
            <ExitGate position={[0, 1.5, -16]} />
          </Physics>
        </Suspense>
      </Canvas>
      <UI />
    </>
  );
}

export default App;
