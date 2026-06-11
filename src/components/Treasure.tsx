import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store';
import * as THREE from 'three';

interface TreasureProps {
  position: [number, number, number];
  id: string;
}

export const Treasure: React.FC<TreasureProps> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const addScore = useGameStore(state => state.addScore);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => {
      setCollected(true);
      addScore(1);
    }}>
      <CuboidCollider args={[0.5, 0.5, 0.5]} position={position} />
      <mesh ref={meshRef} position={position} castShadow>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#00e5ff" emissive="#0088ff" emissiveIntensity={1} wireframe={false} />
      </mesh>
      <pointLight position={position} color="#00e5ff" distance={3} intensity={2} />
    </RigidBody>
  );
};
