import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store';
import * as THREE from 'three';

interface ExitGateProps {
  position: [number, number, number];
}

export const ExitGate: React.FC<ExitGateProps> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const setGameState = useGameStore(state => state.setGameState);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => {
      setGameState('victory');
    }}>
      <CuboidCollider args={[1, 2, 1]} position={position} />
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[1.5, 0.2, 16, 100]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} wireframe={true} />
      </mesh>
      <pointLight position={position} color="#ff00ff" distance={5} intensity={3} />
    </RigidBody>
  );
};
