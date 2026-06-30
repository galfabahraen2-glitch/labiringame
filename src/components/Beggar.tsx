import { useRef, useState } from 'react';
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
        
        // Auto give alms if close enough and have zamrud
        if (dist < 2.0 && score >= 1) {
          handleGive();
        } else if (dist < 3.5 && score < 1) {
          if (!showPrompt) setShowPrompt(true);
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
      audio.collectTreasure(); // the miracle sound
    } else {
      audio.buttonClick(); // error sound
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
      
      {/* Floating Prompt if not enough Zamrud */}
      {showPrompt && (
        <group position={[0, 2.5, 0]}>
          <Html position={[0, 0, 0]} center transform pointerEvents="none">
            <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', width: '200px', userSelect: 'none', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '4px' }}>
              "Aku lapar... (Butuh 1 Zamrud)"
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
