import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Sparkles } from '@react-three/drei';
import { useGameStore } from '../store';
import { audio } from '../audioManager';
import * as THREE from 'three';

interface TreasureProps {
  position: [number, number, number];
  id: string;
}

export const Treasure: React.FC<TreasureProps> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [collected, setCollected] = useState(false);
  const collectTreasure = useGameStore(state => state.collectTreasure);

  useFrame((state, delta) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += delta;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  if (collected) return null;

  return (
    <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={() => {
      setCollected(true);
      collectTreasure();
      audio.collectTreasure();
    }}>
      <CuboidCollider args={[0.6, 0.6, 0.6]} position={position} />
      <group ref={meshRef} position={position}>
        {/* Chest Base */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.7, 0.4, 0.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        {/* Chest Lid (Open) */}
        <mesh position={[0, 0.1, -0.25]} rotation={[-0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.1, 0.5]} />
          <meshStandardMaterial color="#A0522D" roughness={0.9} />
        </mesh>
        {/* Emerald Crystal */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#2ecc71" emissive="#27ae60" emissiveIntensity={0.8} />
        </mesh>
      </group>
      <pointLight position={[position[0], position[1] + 0.5, position[2]]} color="#2ecc71" distance={4} intensity={2} />
      <Sparkles position={position} count={25} scale={1.5} size={3} speed={1} color="#2ecc71" />
    </RigidBody>
  );
};
