import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, type AvatarConfig } from '../store';
import { network } from '../network';

const SPEED = 5;

// ─── Minecraft-style blocky head with face ─────────────────────────────────
export const BlockyFace: React.FC<{
  skinColor: string;
  eyeColor?: string;
  mouthColor?: string;
  scale?: number;
}> = ({ skinColor, eyeColor = '#1a1a1a', mouthColor = '#8B4513', scale = 1 }) => {
  const s = scale;
  return (
    <group>
      {/* Head base */}
      <mesh>
        <boxGeometry args={[0.6 * s, 0.6 * s, 0.6 * s]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.15 * s, 0.08 * s, 0.31 * s]}>
        <boxGeometry args={[0.12 * s, 0.1 * s, 0.02 * s]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.15 * s, 0.08 * s, 0.31 * s]}>
        <boxGeometry args={[0.12 * s, 0.1 * s, 0.02 * s]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, -0.12 * s, 0.31 * s]}>
        <boxGeometry args={[0.28 * s, 0.07 * s, 0.02 * s]} />
        <meshStandardMaterial color={mouthColor} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.01 * s, 0.32 * s]}>
        <boxGeometry args={[0.08 * s, 0.06 * s, 0.02 * s]} />
        <meshStandardMaterial color={new THREE.Color(skinColor).addScalar(-0.1).getHexString().padStart(6,'0') && skinColor} />
      </mesh>
    </group>
  );
};

// ─── Accessory / Hat ───────────────────────────────────────────────────────
const Accessory: React.FC<{ type: AvatarConfig['accessory']; color?: string }> = ({ type, color = '#8B4513' }) => {
  if (type === 'none') return null;
  if (type === 'hat') return (
    <group position={[0, 0.38, 0]}>
      <mesh><cylinderGeometry args={[0.25, 0.32, 0.15, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.15, 0.15, 0.3, 8]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
  if (type === 'crown') return (
    <group position={[0, 0.38, 0]}>
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5} />
        </mesh>
      ))}
      <mesh><boxGeometry args={[0.55, 0.1, 0.3]} /><meshStandardMaterial color="#f1c40f" /></mesh>
    </group>
  );
  if (type === 'turban') return (
    <mesh position={[0, 0.35, 0]}>
      <torusGeometry args={[0.28, 0.1, 8, 16]} />
      <meshStandardMaterial color="#27ae60" />
    </mesh>
  );
  if (type === 'bandana') return (
    <mesh position={[0, 0.12, 0.32]}>
      <boxGeometry args={[0.55, 0.12, 0.02]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
  );
  return null;
};

// ─── Full Blocky Human Body ─────────────────────────────────────────────────
export const BlockyCharacter: React.FC<{
  avatar: AvatarConfig;
  name?: string;
  showName?: boolean;
  animPhase?: number;
}> = ({ avatar, name, showName = false, animPhase = 0 }) => {
  const legSwing = Math.sin(animPhase) * 0.4;
  const armSwing = Math.sin(animPhase) * 0.35;

  return (
    <group>
      {/* Nametag */}
      {showName && name && (
        <Html position={[0, 1.8, 0]} center distanceFactor={10} occlude>
          <div style={{
            background: 'rgba(0,0,0,0.65)',
            color: '#00e5ff',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
            border: '1px solid rgba(0,229,255,0.4)',
            pointerEvents: 'none',
          }}>
            {name}
          </div>
        </Html>
      )}

      {/* Head */}
      <group position={[0, 1.2, 0]}>
        <BlockyFace skinColor={avatar.skinColor} />
        <Accessory type={avatar.accessory} />
      </group>

      {/* Body / Shirt */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.55, 0.6, 0.3]} />
        <meshStandardMaterial color={avatar.shirtColor} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.38, 0.55, 0]} rotation={[armSwing, 0, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color={avatar.skinColor} />
        </mesh>
      </group>
      {/* Right arm */}
      <group position={[0.38, 0.55, 0]} rotation={[-armSwing, 0, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color={avatar.skinColor} />
        </mesh>
      </group>

      {/* Left leg */}
      <group position={[-0.15, 0.2, 0]} rotation={[-legSwing, 0, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.22, 0.5, 0.22]} />
          <meshStandardMaterial color={avatar.pantsColor} />
        </mesh>
      </group>
      {/* Right leg */}
      <group position={[0.15, 0.2, 0]} rotation={[legSwing, 0, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.22, 0.5, 0.22]} />
          <meshStandardMaterial color={avatar.pantsColor} />
        </mesh>
      </group>
    </group>
  );
};

// ─── Keyboard Hook ─────────────────────────────────────────────────────────
function useKeyboardControls() {
  const keys = useRef({ forward: false, backward: false, left: false, right: false, lookLeft: false, lookRight: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w': case 'W': case 'ArrowUp': keys.current.forward = true; break;
        case 's': case 'S': case 'ArrowDown': keys.current.backward = true; break;
        case 'a': case 'A': keys.current.left = true; break;
        case 'd': case 'D': keys.current.right = true; break;
        case 'ArrowLeft': keys.current.lookLeft = true; break;
        case 'ArrowRight': keys.current.lookRight = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w': case 'W': case 'ArrowUp': keys.current.forward = false; break;
        case 's': case 'S': case 'ArrowDown': keys.current.backward = false; break;
        case 'a': case 'A': keys.current.left = false; break;
        case 'd': case 'D': keys.current.right = false; break;
        case 'ArrowLeft': keys.current.lookLeft = false; break;
        case 'ArrowRight': keys.current.lookRight = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}

// ─── The main Player component ─────────────────────────────────────────────
interface PlayerProps {
  startPos?: [number, number] | null;
}

export const Player: React.FC<PlayerProps> = ({ startPos }) => {
  const body = useRef<RapierRigidBody>(null);
  const characterGroup = useRef<THREE.Group>(null);
  const animPhase = useRef(0);

  const { joystickInput, joystickLookInput, joystickMode, cameraView, gameState, isDead, setPlayerPosition, setPlayerWorldPos, playerName, avatarConfig, tickTime } = useGameStore();
  const keys = useKeyboardControls();

  useFrame((state, delta) => {
    if (!body.current || gameState !== 'playing' || isDead) return;

    // Tick down the time
    tickTime(delta);

    const velocity = body.current.linvel();
    let { x: jx, y: jy } = joystickInput;
    let lx = joystickLookInput.x;

    // Apply keyboard overrides
    const k = keys.current;
    if (k.forward) jy = 1;
    if (k.backward) jy = -1;
    
    if (joystickMode === 'single') {
      if (k.left || k.lookLeft) jx = -1;
      if (k.right || k.lookRight) jx = 1;
    } else {
      if (k.left) jx = -1;
      if (k.right) jx = 1;
      if (k.lookLeft) lx = -1;
      if (k.lookRight) lx = 1;
    }

    // Normalize diagonal movement if using keyboard
    if ((k.forward || k.backward) && (k.left || k.right || k.lookLeft || k.lookRight)) {
      const len = Math.sqrt(jx * jx + jy * jy);
      if (len > 0) {
        jx /= len;
        jy /= len;
      }
    }

    let moveX = 0;
    let moveZ = 0;
    let targetRotY = characterGroup.current ? characterGroup.current.rotation.y : 0;
    let length = 0;

    if (cameraView === 'isometric') {
      moveX = jx * SPEED;
      moveZ = -jy * SPEED;
      length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      if (length > 0.1 && characterGroup.current) {
        targetRotY = Math.atan2(moveX, moveZ);
        characterGroup.current.rotation.y = targetRotY;
      }
    } else {
      let rotSpeed = 0;
      let fwd = 0;
      let strafe = 0;
      
      if (joystickMode === 'single') {
        rotSpeed = -jx * 3.5 * delta;
        fwd = jy * SPEED;
      } else {
        rotSpeed = -lx * 3.5 * delta;
        fwd = jy * SPEED;
        strafe = jx * SPEED;
      }
      
      targetRotY += rotSpeed;
      if (characterGroup.current) {
        characterGroup.current.rotation.y = targetRotY;
      }
      
      moveX = Math.sin(targetRotY) * fwd - Math.cos(targetRotY) * strafe;
      moveZ = Math.cos(targetRotY) * fwd + Math.sin(targetRotY) * strafe;
      length = Math.sqrt(fwd * fwd + strafe * strafe);
    }

    body.current.setLinvel({ x: moveX, y: velocity.y, z: moveZ }, true);

    const playerPos = body.current.translation();
    setPlayerWorldPos([playerPos.x, playerPos.y, playerPos.z]);
    setPlayerPosition([playerPos.x, playerPos.z]);

    // Animate limbs
    if (length > 0.1) {
      animPhase.current += delta * length * 2;
    }

    network.broadcastPosition([playerPos.x, playerPos.y, playerPos.z], targetRotY);

    // Camera follow
    if (cameraView === 'first-person') {
      if (characterGroup.current && characterGroup.current.children[1]) {
        characterGroup.current.children[1].visible = false; // Hide head
      }
      const cameraPos = new THREE.Vector3(playerPos.x, playerPos.y + 1.2, playerPos.z);
      state.camera.position.lerp(cameraPos, 0.2);
      const lookAtPos = new THREE.Vector3(
        playerPos.x + Math.sin(targetRotY) * 5,
        playerPos.y + 1.2,
        playerPos.z + Math.cos(targetRotY) * 5
      );
      state.camera.lookAt(lookAtPos);
    } else {
      if (characterGroup.current && characterGroup.current.children[1]) {
        characterGroup.current.children[1].visible = true; // Show head
      }
      if (cameraView === 'third-person') {
        const cameraPos = new THREE.Vector3(
          playerPos.x - Math.sin(targetRotY) * 4,
          playerPos.y + 3,
          playerPos.z - Math.cos(targetRotY) * 4
        );
        state.camera.position.lerp(cameraPos, 0.1);
        state.camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z);
      } else {
        // isometric
        const cameraPos = new THREE.Vector3(playerPos.x, playerPos.y + 5, playerPos.z + 6);
        state.camera.position.lerp(cameraPos, 0.1);
        state.camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z);
      }
    }
  });

  const initialX = startPos ? startPos[0] : 0;
  const initialZ = startPos ? startPos[1] : 0;

  return (
    <RigidBody ref={body} colliders={false} mass={1} type="dynamic" position={[initialX, 3, initialZ]} enabledRotations={[false, false, false]}>
      <CapsuleCollider args={[0.6, 0.4]} position={[0, 0, 0]} />
      <group ref={characterGroup}>
        <BlockyCharacter
          avatar={avatarConfig}
          name={playerName}
          showName={true}
          animPhase={animPhase.current}
        />
      </group>
    </RigidBody>
  );
};
