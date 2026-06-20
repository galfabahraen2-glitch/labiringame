import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store';
import { audio } from '../audioManager';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface ExitGateProps {
  position: [number, number, number];
}

export const ExitGate: React.FC<ExitGateProps> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setGameState, currentLevel, nextLevel } = useGameStore();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => {
      if (currentLevel >= 121) {
        setGameState('victory'); // Finished Crystal Palace
      } else {
        audio.portalWarp();
        setGameState('warp');
        setTimeout(() => {
          // Double check they didn't restart game during warp
          if (useGameStore.getState().gameState === 'warp') {
            nextLevel();
            useGameStore.getState().setGameState('playing');
          }
        }, 2000);
      }
    }}>
      <CuboidCollider args={[1, 2, 1]} position={position} />
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[1.5, 0.2, 16, 100]} />
        <meshStandardMaterial color={currentLevel > 120 ? "#ffffff" : "#ff00ff"} emissive={currentLevel > 120 ? "#ffffff" : "#ff00ff"} emissiveIntensity={2} wireframe={true} />
      </mesh>
      <pointLight position={position} color={currentLevel > 120 ? "#ffffff" : "#ff00ff"} distance={5} intensity={3} />
      <Sparkles position={position} count={50} scale={3} size={4} speed={2} color={currentLevel > 120 ? "#ffffff" : "#ff00ff"} />
    </RigidBody>
  );
};
