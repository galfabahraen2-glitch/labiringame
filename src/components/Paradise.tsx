import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';

// ─── Simple Blocky Tree (Kurma, Anggur, etc) ───────────────────────────────
const FruitTree = ({ position, type }: { position: [number, number, number], type: 'kurma' | 'anggur' | 'pisang' | 'tin' | 'apel' | 'jeruk' }) => {
  const leafColor = {
    kurma: '#2d5a27',
    anggur: '#3e8e41',
    pisang: '#7cb342',
    tin: '#4caf50',
    apel: '#388e3c',
    jeruk: '#689f38'
  }[type];

  const fruitColor = {
    kurma: '#8b4513',
    anggur: '#8e24aa',
    pisang: '#fbc02d',
    tin: '#5e35b1',
    apel: '#e53935',
    jeruk: '#fb8c00'
  }[type];

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 3.5, 0]}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      {/* Fruits (just some colored boxes/spheres on the leaves) */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 3, 
          3 + Math.random() * 1.5, 
          (Math.random() - 0.5) * 3
        ]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color={fruitColor} emissive={fruitColor} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// ─── River of Milk ────────────────────────────────────────────────────────
const River = () => {
  return (
    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 100]} />
      <meshPhysicalMaterial color="#ffffff" transmission={0.2} opacity={0.9} transparent roughness={0.1} />
    </mesh>
  );
};

// ─── Glass Floor with Fish ────────────────────────────────────────────────
const GlassFloor = () => {
  return (
    <group>
      {/* Water under glass */}
      <mesh position={[20, -1, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0277bd" />
      </mesh>
      {/* Fish (simple moving blocks) */}
      {/* In a real scenario we'd animate them, here static abstract fish for bundle size */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} position={[20 + (Math.random() - 0.5) * 20, -0.5, 20 + (Math.random() - 0.5) * 20]} rotation={[0, Math.random() * Math.PI, 0]}>
          <coneGeometry args={[0.2, 0.6, 4]} />
          <meshStandardMaterial color="#ffb300" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Majestic Palace ──────────────────────────────────────────────────────
const Palace = ({ position, color }: { position: [number, number, number], color: string }) => {
  return (
    <group position={position}>
      {/* Main Building */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[15, 10, 15]} />
        <meshPhysicalMaterial color={color} transmission={0.5} opacity={0.9} transparent roughness={0.1} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Domes */}
      <mesh position={[0, 12, 0]}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshPhysicalMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Pillars */}
      {[-7, 7].map(x => (
        [-7, 7].map(z => (
          <mesh key={`${x}-${z}`} position={[x, 5, z]}>
            <cylinderGeometry args={[0.5, 0.5, 10, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.5} />
          </mesh>
        ))
      ))}
    </group>
  );
};

export const Paradise: React.FC = () => {
  return (
    <group>
      {/* Lighting & Environment */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[20, 40, 20]} intensity={2} color="#fff8e1" castShadow />
      
      {/* Ground (Cloud / Light platform) */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshPhysicalMaterial color="#e0f7fa" transmission={0.4} opacity={0.8} transparent />
        </mesh>
      </RigidBody>

      {/* Rivers */}
      <River />

      {/* Palaces */}
      <Palace position={[-30, 0, -30]} color="#e91e63" /> {/* Ruby / Yakut */}
      <Palace position={[30, 0, -30]} color="#00bcd4" /> {/* Coral / Marjan */}
      <Palace position={[0, 0, -60]} color="#9c27b0" />

      {/* Glass floor area */}
      <GlassFloor />

      {/* Fruit Gardens */}
      <FruitTree position={[-20, 0, 10]} type="kurma" />
      <FruitTree position={[-25, 0, 15]} type="kurma" />
      <FruitTree position={[-15, 0, 12]} type="anggur" />
      <FruitTree position={[20, 0, 10]} type="apel" />
      <FruitTree position={[25, 0, 15]} type="jeruk" />
      <FruitTree position={[15, 0, 12]} type="pisang" />
      <FruitTree position={[0, 0, 20]} type="tin" />

      {/* Calligraphy / Sky Text */}
      <group position={[0, 30, -40]}>
        <Html center transform scale={10} pointerEvents="none">
          <div style={{
            color: '#ffd700',
            textShadow: '0 0 20px #ffd700',
            fontSize: '48px',
            fontFamily: 'serif',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            الله<br/>
            محمّد
          </div>
        </Html>
      </group>
    </group>
  );
};
