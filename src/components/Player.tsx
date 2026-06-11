import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { network } from '../network';

const SPEED = 5;

interface PlayerProps {
  startPos?: [number, number] | null;
}

export const Player: React.FC<PlayerProps> = ({ startPos }) => {
  const body = useRef<RapierRigidBody>(null);
  
  // Limbs for animation
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const characterGroup = useRef<THREE.Group>(null);

  const { joystickInput, gameState, setPlayerPosition, playerName, skinColor, shirtColor, isDead, teleportTarget, clearTeleport } = useGameStore();

  useFrame((state) => {
    if (!body.current || gameState !== 'playing') return;

    if (isDead) {
      // Spectator mode: Camera looks down from above at the center of the maze
      const mazeWidth = useGameStore.getState().mazeData?.[0]?.length || 20;
      const mazeHeight = useGameStore.getState().mazeData?.length || 20;
      // Fly up
      const cameraPos = new THREE.Vector3(0, Math.max(mazeWidth, mazeHeight) * 3, 0);
      state.camera.position.lerp(cameraPos, 0.05);
      state.camera.lookAt(0, 0, 0);
      return;
    }

    if (teleportTarget) {
      body.current.setTranslation({ x: teleportTarget[0], y: 3, z: teleportTarget[1] }, true);
      clearTeleport();
      return;
    }

    const velocity = body.current.linvel();
    let moveX = joystickInput.x;
    let moveZ = -joystickInput.y;

    // Normalize input
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 1) {
      moveX /= length;
      moveZ /= length;
    }

    body.current.setLinvel({ x: moveX * SPEED, y: velocity.y, z: moveZ * SPEED }, true);

    const playerPos = body.current.translation();
    
    // Update store with player position for minimap and network
    if (setPlayerPosition) {
      setPlayerPosition([playerPos.x, playerPos.z]);
    }

    // Rotate character to face movement direction
    let currentAngle = characterGroup.current ? characterGroup.current.rotation.y : 0;
    if (length > 0.1 && characterGroup.current) {
      currentAngle = Math.atan2(moveX, moveZ);
      characterGroup.current.rotation.y = currentAngle;
    }

    // Broadcast position to other players
    network.broadcastPosition([playerPos.x, playerPos.y, playerPos.z], currentAngle);

    // Animate limbs
    if (length > 0.1) {
      const time = state.clock.elapsedTime * 10;
      const swing = Math.sin(time) * 0.5;
      if (leftLeg.current) leftLeg.current.rotation.x = swing;
      if (rightLeg.current) rightLeg.current.rotation.x = -swing;
      if (leftArm.current) leftArm.current.rotation.x = -swing;
      if (rightArm.current) rightArm.current.rotation.x = swing;
    } else {
      // Return to idle
      if (leftLeg.current) leftLeg.current.rotation.x = 0;
      if (rightLeg.current) rightLeg.current.rotation.x = 0;
      if (leftArm.current) leftArm.current.rotation.x = 0;
      if (rightArm.current) rightArm.current.rotation.x = 0;
    }

    // Update camera to follow player (3rd person)
    const cameraPos = new THREE.Vector3(playerPos.x, playerPos.y + 5, playerPos.z + 6);
    state.camera.position.lerp(cameraPos, 0.1);
  });

  const initialX = startPos ? startPos[0] : 0;
  const initialZ = startPos ? startPos[1] : 0;

  if (isDead) return null; // Grim Reaper handles the dead body or we just hide

  return (
    <RigidBody ref={body} colliders={false} mass={1} type="dynamic" position={[initialX, 3, initialZ]} enabledRotations={[false, false, false]}>
      <CapsuleCollider args={[0.6, 0.4]} position={[0, 0, 0]} />
      
      {/* Blocky Character */}
      <group ref={characterGroup} position={[0, -1, 0]}>
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
        {/* Left Eye */}
        <mesh position={[-0.1, 1.55, 0.26]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Right Eye */}
        <mesh position={[0.1, 1.55, 0.26]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Mouth */}
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
    </RigidBody>
  );
};
