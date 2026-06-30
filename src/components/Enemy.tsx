import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { audio } from '../audioManager';
import { CELL_SIZE } from './Maze';

export type EnemyType = 'pocong' | 'kuntilanak' | 'genderuwo' | 'iblis' | 'berkepala_binatang';

interface EnemyProps {
  type: EnemyType;
  initialPosition: [number, number, number];
}

// ─── Pocong (White jumping bundle) ─────────────────────────────────────────
const PocongBody: React.FC = () => (
  <group>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.5, 1.0, 0.4]} />
      <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.4]} />
      <meshStandardMaterial color="#e8e8e8" />
    </mesh>
    {/* Tied top knot */}
    <mesh position={[0, 1.5, 0]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial color="#d0d0d0" />
    </mesh>
    {/* Creepy black eyes */}
    <mesh position={[-0.1, 1.2, 0.21]}><boxGeometry args={[0.1, 0.08, 0.02]} /><meshStandardMaterial color="#1a1a1a" emissive="#ff0000" emissiveIntensity={0.5} /></mesh>
    <mesh position={[0.1, 1.2, 0.21]}><boxGeometry args={[0.1, 0.08, 0.02]} /><meshStandardMaterial color="#1a1a1a" emissive="#ff0000" emissiveIntensity={0.5} /></mesh>
  </group>
);

// ─── Kuntilanak (Long-haired floating ghost) ────────────────────────────────
const KuntilanakBody: React.FC = () => (
  <group>
    {/* Dress/body */}
    <mesh position={[0, 0.5, 0]}>
      <coneGeometry args={[0.45, 1.2, 8]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={0.1} />
    </mesh>
    {/* Torso */}
    <mesh position={[0, 1.1, 0]}>
      <boxGeometry args={[0.4, 0.4, 0.3]} />
      <meshStandardMaterial color="#f5f5f5" />
    </mesh>
    {/* Head */}
    <mesh position={[0, 1.55, 0]}>
      <boxGeometry args={[0.45, 0.45, 0.4]} />
      <meshStandardMaterial color="#f5f0e8" />
    </mesh>
    {/* Long black hair strands */}
    {[-0.15, 0, 0.15].map((x, i) => (
      <mesh key={i} position={[x, 1.0, -0.2]}>
        <boxGeometry args={[0.08, 1.2, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    ))}
    {/* Hollow eyes */}
    <mesh position={[-0.1, 1.58, 0.21]}><boxGeometry args={[0.1, 0.12, 0.02]} /><meshStandardMaterial color="#000000" emissive="#8B0000" emissiveIntensity={1} /></mesh>
    <mesh position={[0.1, 1.58, 0.21]}><boxGeometry args={[0.1, 0.12, 0.02]} /><meshStandardMaterial color="#000000" emissive="#8B0000" emissiveIntensity={1} /></mesh>
  </group>
);

// ─── Genderuwo (Big dark blocky creature) ───────────────────────────────────
const GenderuwoBody: React.FC = () => (
  <group>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.9, 1.1, 0.7]} />
      <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[0.75, 0.65, 0.6]} />
      <meshStandardMaterial color="#3d2b1f" />
    </mesh>
    {/* Small horns */}
    <mesh position={[-0.2, 1.75, 0]} rotation={[0, 0, -0.3]}>
      <coneGeometry args={[0.07, 0.25, 6]} />
      <meshStandardMaterial color="#2c1f14" />
    </mesh>
    <mesh position={[0.2, 1.75, 0]} rotation={[0, 0, 0.3]}>
      <coneGeometry args={[0.07, 0.25, 6]} />
      <meshStandardMaterial color="#2c1f14" />
    </mesh>
    {/* Glowing eyes */}
    <mesh position={[-0.18, 1.35, 0.31]}><boxGeometry args={[0.14, 0.1, 0.02]} /><meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} /></mesh>
    <mesh position={[0.18, 1.35, 0.31]}><boxGeometry args={[0.14, 0.1, 0.02]} /><meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} /></mesh>
    {/* Arms */}
    <mesh position={[-0.65, 0.8, 0]}><boxGeometry args={[0.3, 0.9, 0.3]} /><meshStandardMaterial color="#3d2b1f" /></mesh>
    <mesh position={[0.65, 0.8, 0]}><boxGeometry args={[0.3, 0.9, 0.3]} /><meshStandardMaterial color="#3d2b1f" /></mesh>
  </group>
);

// ─── Iblis (Red devil with horns & tail) ────────────────────────────────────
const IblisBody: React.FC = () => (
  <group>
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[0.55, 0.9, 0.4]} />
      <meshStandardMaterial color="#c0392b" />
    </mesh>
    <mesh position={[0, 1.15, 0]}>
      <boxGeometry args={[0.55, 0.55, 0.45]} />
      <meshStandardMaterial color="#c0392b" />
    </mesh>
    {/* Horns */}
    <mesh position={[-0.18, 1.55, 0]} rotation={[0, 0, -0.4]}>
      <coneGeometry args={[0.07, 0.35, 6]} />
      <meshStandardMaterial color="#922b21" />
    </mesh>
    <mesh position={[0.18, 1.55, 0]} rotation={[0, 0, 0.4]}>
      <coneGeometry args={[0.07, 0.35, 6]} />
      <meshStandardMaterial color="#922b21" />
    </mesh>
    {/* Tail */}
    <mesh position={[0, 0.3, -0.3]} rotation={[0.5, 0, 0]}>
      <coneGeometry args={[0.06, 0.5, 6]} />
      <meshStandardMaterial color="#922b21" />
    </mesh>
    {/* Yellow eyes */}
    <mesh position={[-0.13, 1.18, 0.23]}><boxGeometry args={[0.1, 0.09, 0.02]} /><meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={2} /></mesh>
    <mesh position={[0.13, 1.18, 0.23]}><boxGeometry args={[0.1, 0.09, 0.02]} /><meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={2} /></mesh>
  </group>
);

// ─── Manusia Berkepala Binatang (Human body + animal head) ──────────────────
const BerkepalaBody: React.FC = () => (
  <group>
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[0.5, 0.9, 0.35]} />
      <meshStandardMaterial color="#e8c49a" />
    </mesh>
    {/* Goat/animal head */}
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[0.55, 0.5, 0.6]} />
      <meshStandardMaterial color="#8B7355" roughness={0.8} />
    </mesh>
    {/* Snout */}
    <mesh position={[0, 1.1, 0.38]}>
      <boxGeometry args={[0.3, 0.2, 0.2]} />
      <meshStandardMaterial color="#7a6248" />
    </mesh>
    {/* Horns */}
    <mesh position={[-0.2, 1.55, 0]} rotation={[0, 0, -0.5]}>
      <cylinderGeometry args={[0.04, 0.02, 0.35, 6]} />
      <meshStandardMaterial color="#6b5b45" />
    </mesh>
    <mesh position={[0.2, 1.55, 0]} rotation={[0, 0, 0.5]}>
      <cylinderGeometry args={[0.04, 0.02, 0.35, 6]} />
      <meshStandardMaterial color="#6b5b45" />
    </mesh>
    {/* Creepy eyes */}
    <mesh position={[-0.14, 1.25, 0.31]}><boxGeometry args={[0.1, 0.1, 0.02]} /><meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={1} /></mesh>
    <mesh position={[0.14, 1.25, 0.31]}><boxGeometry args={[0.1, 0.1, 0.02]} /><meshStandardMaterial color="#f0c040" emissive="#f0c040" emissiveIntensity={1} /></mesh>
    {/* Legs */}
    <mesh position={[-0.14, 0.07, 0]}><boxGeometry args={[0.2, 0.5, 0.2]} /><meshStandardMaterial color="#6e5a38" /></mesh>
    <mesh position={[0.14, 0.07, 0]}><boxGeometry args={[0.2, 0.5, 0.2]} /><meshStandardMaterial color="#6e5a38" /></mesh>
  </group>
);

// ─── Enemy config ───────────────────────────────────────────────────────────
const ENEMY_CONFIG = {
  pocong:            { speed: 2.5,  detectionRange: 7,  damage: 10, color: '#ccccff', jumpAnim: true  },
  kuntilanak:        { speed: 3.5,  detectionRange: 10, damage: 15, color: '#cc99ff', jumpAnim: false },
  genderuwo:         { speed: 1.5,  detectionRange: 8,  damage: 20, color: '#ff6633', jumpAnim: false },
  iblis:             { speed: 4.0,  detectionRange: 9,  damage: 25, color: '#ff0000', jumpAnim: false },
  berkepala_binatang:{ speed: 2.0,  detectionRange: 6,  damage: 10, color: '#ffcc66', jumpAnim: false },
};

// ─── Main Enemy Component ───────────────────────────────────────────────────
export const Enemy: React.FC<EnemyProps> = ({ type, initialPosition }) => {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(...initialPosition));
  const dirRef = useRef(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize());
  const alertedRef = useRef(false);
  const alertTimerRef = useRef(0);
  const animTime = useRef(0);
  const patrolTimer = useRef(Math.random() * 3);

  const { playerWorldPos, takeDamage, teleportPlayer, mazeData, playerStartPosition, isDead } = useGameStore();

  const cfg = ENEMY_CONFIG[type];

  const teleportPlayer = () => {
    if (!mazeData || !playerStartPosition) return;
    // Find random open cell
    const openCells: [number, number][] = [];
    for (let z = 0; z < mazeData.length; z++) {
      for (let x = 0; x < mazeData[z].length; x++) {
        if (mazeData[z][x] === 0) openCells.push([x, z]);
      }
    }
    if (openCells.length === 0) return;
    const cell = openCells[Math.floor(Math.random() * openCells.length)];
    const wx = (cell[0] - mazeData[0].length / 2) * CELL_SIZE;
    const wz = (cell[1] - mazeData.length / 2) * CELL_SIZE;
    teleportPlayer([wx, 1, wz]);
    takeDamage(cfg.damage);
    audio.playerHit();
  };

  useEffect(() => {
    posRef.current.set(...initialPosition);
  }, [initialPosition]);

  useFrame((_, delta) => {
    if (!groupRef.current || isDead) return;

    animTime.current += delta;
    alertTimerRef.current -= delta;
    patrolTimer.current -= delta;

    const playerPos3 = new THREE.Vector3(playerWorldPos[0], playerWorldPos[1], playerWorldPos[2]);
    const dist = posRef.current.distanceTo(playerPos3);
    const isChasing = dist < cfg.detectionRange;

    // Alert sound
    if (isChasing && !alertedRef.current) {
      alertedRef.current = true;
      audio.enemyAlert();
    } else if (!isChasing) {
      alertedRef.current = false;
    }

    // Movement
    let moveDir = new THREE.Vector3();
    const { isHolyAuraActive } = useGameStore.getState();

    if (isHolyAuraActive && dist < cfg.detectionRange * 2) {
      // Run away from player
      moveDir = posRef.current.clone().sub(playerPos3).normalize();
    } else if (isChasing && !isHolyAuraActive) {
      moveDir = playerPos3.clone().sub(posRef.current).normalize();
    } else {
      // Patrol: change direction randomly
      if (patrolTimer.current <= 0) {
        dirRef.current.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        patrolTimer.current = 2 + Math.random() * 2;
      }
      moveDir = dirRef.current.clone();
    }

    posRef.current.addScaledVector(moveDir, cfg.speed * delta);
    posRef.current.y = initialPosition[1]; // keep Y fixed (kuntilanak floats)

    // Kuntilanak floats up and down
    const floatY = type === 'kuntilanak' 
      ? initialPosition[1] + Math.sin(animTime.current * 2) * 0.4 + 0.5
      : initialPosition[1];

    // Pocong jumps
    const jumpY = (type === 'pocong' && cfg.jumpAnim)
      ? initialPosition[1] + Math.abs(Math.sin(animTime.current * 3)) * 0.6
      : floatY;

    groupRef.current.position.set(posRef.current.x, jumpY, posRef.current.z);

    // Face movement direction
    if (moveDir.length() > 0.01) {
      const angle = Math.atan2(moveDir.x, moveDir.z);
      groupRef.current.rotation.y = angle;
    }

    // Genderuwo sways
    if (type === 'genderuwo') {
      groupRef.current.rotation.z = Math.sin(animTime.current * 1.5) * 0.1;
    }

    // Check if enemy touched player (within 1.5 units)
    if (dist < 1.5 && alertTimerRef.current <= 0) {
      alertTimerRef.current = 3; // cooldown 3s before next hit
      teleportPlayer();
    }
  });

  const Body = {
    pocong: PocongBody,
    kuntilanak: KuntilanakBody,
    genderuwo: GenderuwoBody,
    iblis: IblisBody,
    berkepala_binatang: BerkepalaBody,
  }[type];

  return (
    <group ref={groupRef} position={initialPosition}>
      <Body />
      {/* Spooky aura glow */}
      <pointLight color={cfg.color} intensity={2} distance={4} />
      <Sparkles count={15} scale={2} size={3} speed={0.8} color={cfg.color} />
    </group>
  );
};

// ─── Enemy Spawner: manages all enemies for current level ───────────────────
export const EnemySpawner: React.FC = () => {
  const { currentLevel, mazeData, isDead } = useGameStore();
  const enemies = useRef<Array<{ type: EnemyType; pos: [number, number, number] }>>([]);
  const initialized = useRef(false);

  if (!initialized.current && mazeData) {
    initialized.current = true;
    if (currentLevel >= 3) {
      const numEnemies = Math.min(2 + Math.floor(currentLevel / 10), 8);
    const types: EnemyType[] = ['pocong', 'kuntilanak', 'genderuwo', 'iblis', 'berkepala_binatang'];
    const openCells: [number, number][] = [];
    for (let z = 0; z < mazeData.length; z++) {
      for (let x = 0; x < mazeData[z].length; x++) {
        if (mazeData[z][x] === 0) openCells.push([x, z]);
      }
    }
    enemies.current = [];
    for (let i = 0; i < numEnemies; i++) {
      if (openCells.length === 0) break;
      const idx = Math.floor(Math.random() * openCells.length);
      const [cx, cz] = openCells.splice(idx, 1)[0];
      const wx = (cx - mazeData[0].length / 2) * CELL_SIZE;
      const wz = (cz - mazeData.length / 2) * CELL_SIZE;
      enemies.current.push({
        type: types[i % types.length],
        pos: [wx, 1, wz]
      });
    }
    } // end level >= 3 check
  }

  if (isDead) return null;

  return (
    <>
      {enemies.current.map((e, i) => (
        <Enemy key={i} type={e.type} initialPosition={e.pos} />
      ))}
    </>
  );
};
