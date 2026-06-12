import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { audio } from '../audioManager';

// Angel of Death - Malaikat Izrail
const AngelOfDeath: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const wingRef1 = useRef<THREE.Group>(null);
  const wingRef2 = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t.current * 0.8) * 0.15;
      groupRef.current.rotation.y = Math.sin(t.current * 0.3) * 0.1;
    }
    if (wingRef1.current) wingRef1.current.rotation.z = -0.5 + Math.sin(t.current * 2) * 0.3;
    if (wingRef2.current) wingRef2.current.rotation.z = 0.5 - Math.sin(t.current * 2) * 0.3;
  });

  return (
    <group ref={groupRef} position={[0, 2, -3]}>
      {/* Body — dark robes */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.6, 2, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} transparent opacity={0.9} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 0.7, 0.4]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.5]} />
        <meshStandardMaterial color="#0f0f1a" />
      </mesh>
      {/* Glowing golden eyes */}
      <mesh position={[-0.12, 2.12, 0.26]}>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0.12, 2.12, 0.26]}>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={4} />
      </mesh>

      {/* Wings - Left */}
      <group ref={wingRef1} position={[-0.35, 1.5, 0]} rotation={[0, 0, -0.5]}>
        {[0, 0.2, 0.4, 0.6].map((offset, i) => (
          <mesh key={i} position={[-offset * 0.6 - 0.2, offset * 0.2, 0]}>
            <boxGeometry args={[0.5 - i * 0.08, 0.08, 0.04]} />
            <meshStandardMaterial color="#e8e0ff" transparent opacity={0.85} emissive="#a0a0ff" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
      {/* Wings - Right */}
      <group ref={wingRef2} position={[0.35, 1.5, 0]} rotation={[0, 0, 0.5]}>
        {[0, 0.2, 0.4, 0.6].map((offset, i) => (
          <mesh key={i} position={[offset * 0.6 + 0.2, offset * 0.2, 0]}>
            <boxGeometry args={[0.5 - i * 0.08, 0.08, 0.04]} />
            <meshStandardMaterial color="#e8e0ff" transparent opacity={0.85} emissive="#a0a0ff" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Holy light */}
      <pointLight color="#c0a0ff" intensity={5} distance={6} />
      <Sparkles count={40} scale={3} size={5} speed={1.5} color="#e8e0ff" />
    </group>
  );
};

// The resting place scene
const RestingPlaceScene: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 5, 25]} />
      <ambientLight intensity={0.3} color="#8080ff" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} color="#c0a0ff" />
      
      {/* Ground — ethereal misty plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0d0d1a" transparent opacity={0.9} />
      </mesh>

      {/* Floating tombstone markers */}
      {[[-3, 0, 0], [3, 0, 0], [-6, 0, -3], [6, 0, -3]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.5, 1.2, 0.15]} />
            <meshStandardMaterial color="#3a3a4a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.08, 16]} />
            <meshStandardMaterial color="#3a3a4a" />
          </mesh>
        </group>
      ))}

      {/* Mist particles */}
      <Sparkles count={60} scale={[20, 3, 20]} size={8} speed={0.2} color="#6060aa" opacity={0.4} />

      {/* Dawn light in the distance */}
      <mesh position={[0, 3, -12]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      <pointLight position={[0, 3, -12]} color="#f0c040" intensity={3} distance={15} />

      <AngelOfDeath />
    </>
  );
};

// The full death screen overlay
export const DeathScreen: React.FC = () => {
  const { language, gameState } = useGameStore();

  const isId = language === 'id';

  React.useEffect(() => {
    if (gameState === 'dead') {
      audio.playerDeath();
    }
  }, [gameState]);

  const handleReturn = () => {
    audio.buttonClick();
    useGameStore.getState().setGameState('menu');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10
    }}>
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 3, 6], fov: 60 }} style={{ flex: 1 }}>
        <RestingPlaceScene />
      </Canvas>

      {/* Overlay text */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '2rem 3rem',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid rgba(160,160,255,0.3)',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px',
          pointerEvents: 'auto',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👼</div>
          <h1 style={{
            color: '#c0a0ff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.8rem',
            marginBottom: '0.75rem',
          }}>
            {isId ? 'Jiwa Telah Dijemput' : 'Soul Has Been Taken'}
          </h1>
          <p style={{ color: '#a0a0cc', fontSize: '1rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
            {isId
              ? '"Setiap jiwa pasti akan merasakan mati. Tiada seorang pun yang mengetahui kapan waktunya tiba, selain Dia yang Maha Mengetahui."'
              : '"Every soul shall taste death. No one knows when their time will come, except He who knows all."'
            }
          </p>
          <p style={{ color: '#8080aa', fontSize: '0.9rem', marginTop: '1rem', fontFamily: 'Inter, sans-serif' }}>
            {isId ? 'Menunggu sesama pejalan lainnya...' : 'Waiting for fellow travelers...'}
          </p>
          <button onClick={handleReturn}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
              border: '1px solid #c0a0ff',
              background: 'rgba(192,160,255,0.2)',
              color: '#e8e0ff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'Inter, sans-serif'
            }}>
            🏠 {isId ? 'Kembali ke Menu Utama' : 'Return to Menu'}
          </button>
        </div>
      </div>
    </div>
  );
};
