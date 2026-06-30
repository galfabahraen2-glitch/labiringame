import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { audio } from '../audioManager';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function Beggar({ id, position }: { id: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  const { playerWorldPos, giveAlms, score } = useGameStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [given, setGiven] = useState(false);

  // Bob up and down slightly
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Look at player
      const dx = playerWorldPos[0] - position[0];
      const dz = playerWorldPos[2] - position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (!given) {
        meshRef.current.rotation.y = Math.atan2(dx, dz);
        
        // Show prompt if player is near
        if (dist < 3.5 && !showPrompt) {
          setShowPrompt(true);
        } else if (dist >= 3.5 && showPrompt) {
          setShowPrompt(false);
        }
      }
    }
  });

  const handleGive = () => {
    if (given) return;
    const success = giveAlms(id);
    if (success) {
      setGiven(true);
      setShowPrompt(false);
      audio.holyAura(); // the miracle sound
    } else {
      audio.buttonClick(); // Maybe error sound, but button click for now
    }
  };

  if (given) {
    // When given, they disappear (or we can render a light burst)
    return null;
  }

  return (
    <group ref={meshRef} position={position}>
      {/* Body: simple brown cloak */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#f1c27d" roughness={0.6} />
      </mesh>
      {/* Small bowl in hand */}
      <mesh position={[0, 0.8, 0.4]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#666" metalness={0.5} roughness={0.8} />
      </mesh>
      
      {/* Floating Prompt */}
      {showPrompt && (
        <group position={[0, 2.5, 0]}>
          <mesh onClick={handleGive} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
            <planeGeometry args={[2, 0.8]} />
            <meshBasicMaterial color={score >= 1 ? "#2ecc71" : "#e74c3c"} transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, 0, 0.05]} center transform pointerEvents="none">
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', width: '200px', userSelect: 'none' }}>
              {score >= 1 ? "Sedekah 1 Zamrud" : "Butuh 1 Zamrud"}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
