import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';

export const OtherPlayers: React.FC = () => {
  const otherPlayers = useGameStore(state => state.otherPlayers);

  return (
    <>
      {Object.entries(otherPlayers).map(([id, player]) => {
        if (player.isDead) return null; // Don't show dead players

        return (
          <OtherPlayer 
            key={id} 
            position={player.position} 
            rotation={player.rotation} 
            playerName={player.playerName || 'Pemain Lain'}
            skinColor={player.skinColor || '#f1c27d'}
            shirtColor={player.shirtColor || '#2ecc71'}
          />
        );
      })}
    </>
  );
};

interface OtherPlayerProps {
  position: [number, number, number];
  rotation: number;
  playerName: string;
  skinColor: string;
  shirtColor: string;
}

const OtherPlayer: React.FC<OtherPlayerProps> = ({ position, rotation, playerName, skinColor, shirtColor }) => {
  const group = useRef<THREE.Group>(null);
  
  // Limbs for animation
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  
  // Keep track of previous position for movement detection
  const prevPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!group.current) return;
    
    const currentPos = new THREE.Vector3(...position);
    
    // Lerp position for smooth movement
    group.current.position.lerp(currentPos, 0.2);
    
    // Smooth rotation
    const currentRotation = new THREE.Euler(0, rotation, 0);
    const quaternion = new THREE.Quaternion().setFromEuler(currentRotation);
    group.current.quaternion.slerp(quaternion, 0.2);

    // Calculate movement length
    const distance = prevPos.current.distanceTo(currentPos);
    
    // Animate limbs if moving
    if (distance > 0.01) {
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

    prevPos.current.copy(currentPos);
  });

  return (
    <group ref={group} position={position}>
      {/* Nametag */}
      <Billboard position={[0, 2.2, 0]}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {playerName}
        </Text>
      </Billboard>

      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Face (Eyes and Mouth) */}
      <mesh position={[-0.1, 1.55, 0.26]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 1.55, 0.26]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 1.42, 0.26]}>
        <boxGeometry args={[0.15, 0.05, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArm} position={[-0.4, 1.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArm} position={[0.4, 1.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLeg} position={[-0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLeg} position={[0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  );
};
