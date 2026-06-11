import React, { useRef } from 'react';
import { useGameStore } from '../store';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const OtherPlayer = ({ position, rotation }: { position: [number, number, number], rotation: number }) => {
  const group = useRef<THREE.Group>(null);
  
  // Limbs
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      // Basic smoothing for network updates
      group.current.position.lerp(new THREE.Vector3(...position), 0.2);
      
      // Simple rotation
      const currentRot = group.current.rotation.y;
      // Handle wrap around roughly
      group.current.rotation.y += (rotation - currentRot) * 0.2;

      // Distance moved in this frame to estimate walking
      const dist = group.current.position.distanceTo(new THREE.Vector3(...position));
      
      if (dist > 0.01) {
        const time = state.clock.elapsedTime * 10;
        const swing = Math.sin(time) * 0.5;
        if (leftLeg.current) leftLeg.current.rotation.x = swing;
        if (rightLeg.current) rightLeg.current.rotation.x = -swing;
        if (leftArm.current) leftArm.current.rotation.x = -swing;
        if (rightArm.current) rightArm.current.rotation.x = swing;
      } else {
        if (leftLeg.current) leftLeg.current.rotation.x = 0;
        if (rightLeg.current) rightLeg.current.rotation.x = 0;
        if (leftArm.current) leftArm.current.rotation.x = 0;
        if (rightArm.current) rightArm.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#e74c3c" /> {/* Different color for friends */}
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      {/* Left Arm */}
      <mesh ref={leftArm} position={[-0.4, 1.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Right Arm */}
      <mesh ref={rightArm} position={[0.4, 1.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      {/* Left Leg */}
      <mesh ref={leftLeg} position={[-0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      {/* Right Leg */}
      <mesh ref={rightLeg} position={[0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
    </group>
  );
};

export const OtherPlayers: React.FC = () => {
  const otherPlayers = useGameStore(state => state.otherPlayers);

  return (
    <>
      {Object.entries(otherPlayers).map(([id, data]) => (
        <OtherPlayer key={id} position={data.position} rotation={data.rotation} />
      ))}
    </>
  );
};
