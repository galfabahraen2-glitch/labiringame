import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store';

const SPEED = 5;

export const Player: React.FC = () => {
  const body = useRef<RapierRigidBody>(null);
  const { joystickInput, gameState } = useGameStore();

  useFrame((state) => {
    if (!body.current || gameState !== 'playing') return;

    const velocity = body.current.linvel();

    // Use joystick input
    // joystick up means positive Y, which means negative Z in 3D (forward)
    // joystick right means positive X, which means positive X in 3D (right)
    
    let moveX = joystickInput.x;
    let moveZ = -joystickInput.y;

    // Optional: Add basic keyboard fallback for desktop testing
    // const [, get] = useKeyboardControls()
    // const { forward, backward, left, right } = get()
    // if (forward) moveZ -= 1;
    // if (backward) moveZ += 1;
    // if (left) moveX -= 1;
    // if (right) moveX += 1;

    // Normalize
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 1) {
      moveX /= length;
      moveZ /= length;
    }

    body.current.setLinvel({ x: moveX * SPEED, y: velocity.y, z: moveZ * SPEED }, true);

    // Update camera to follow player (basic 3rd person)
    const playerPos = body.current.translation();
    const cameraPos = new THREE.Vector3(playerPos.x, playerPos.y + 4, playerPos.z + 5);
    state.camera.position.lerp(cameraPos, 0.1);
    state.camera.lookAt(playerPos.x, playerPos.y, playerPos.z);
  });

  return (
    <RigidBody ref={body} colliders={false} mass={1} type="dynamic" position={[0, 2, 0]} enabledRotations={[false, false, false]}>
      <CapsuleCollider args={[0.5, 0.5]} />
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#8a2be2" emissive="#4b0082" emissiveIntensity={0.5} />
      </mesh>
    </RigidBody>
  );
};
