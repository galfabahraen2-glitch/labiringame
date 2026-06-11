import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { CELL_SIZE } from './Maze';

interface EnemyProps {
  type: 'pocong' | 'kuntilanak' | 'animalHead';
  startPos: [number, number]; // Grid x, z
  id: string;
}

export const Enemy: React.FC<EnemyProps> = ({ type, startPos }) => {
  const body = useRef<RapierRigidBody>(null);
  const meshGroup = useRef<THREE.Group>(null);
  const { mazeData, damagePlayer, teleportPlayer, isDead } = useGameStore();

  const [targetGrid, setTargetGrid] = useState<{x: number, z: number}>({ x: startPos[0], z: startPos[1] });
  
  // Calculate world position
  const widthOffset = mazeData ? mazeData[0].length / 2 : 0;
  const heightOffset = mazeData ? mazeData.length / 2 : 0;

  useEffect(() => {
    // Basic AI Loop: Every 2 seconds, pick a new random adjacent grid to move to
    const interval = setInterval(() => {
      if (!mazeData || isDead) return;
      
      const currentX = targetGrid.x;
      const currentZ = targetGrid.z;
      
      const neighbors = [
        { x: currentX + 1, z: currentZ },
        { x: currentX - 1, z: currentZ },
        { x: currentX, z: currentZ + 1 },
        { x: currentX, z: currentZ - 1 },
      ].filter(n => 
        n.x > 0 && n.x < mazeData[0].length && 
        n.z > 0 && n.z < mazeData.length && 
        mazeData[n.z][n.x] === 0
      );

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        setTargetGrid(next);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mazeData, targetGrid, isDead]);

  useFrame((state) => {
    if (!body.current || !meshGroup.current || isDead) return;

    // Target world position
    const targetWorldX = (targetGrid.x - widthOffset) * CELL_SIZE;
    const targetWorldZ = (targetGrid.z - heightOffset) * CELL_SIZE;

    const currentPos = body.current.translation();
    const dirX = targetWorldX - currentPos.x;
    const dirZ = targetWorldZ - currentPos.z;

    const distance = Math.sqrt(dirX * dirX + dirZ * dirZ);
    
    // Move towards target
    if (distance > 0.5) {
      body.current.setLinvel({ x: (dirX / distance) * 2, y: body.current.linvel().y, z: (dirZ / distance) * 2 }, true);
      meshGroup.current.rotation.y = Math.atan2(dirX, dirZ);
    } else {
      body.current.setLinvel({ x: 0, y: body.current.linvel().y, z: 0 }, true);
    }

    // Animation
    const time = state.clock.elapsedTime * 5;
    if (type === 'pocong') {
      // Jumping
      meshGroup.current.position.y = Math.abs(Math.sin(time)) * 1.5;
    } else if (type === 'kuntilanak') {
      // Floating
      meshGroup.current.position.y = Math.sin(time * 0.5) * 0.5 + 1;
    }
  });

  const handleIntersection = () => {
    if (isDead) return;
    damagePlayer(25); // Reduce health by 25
    
    // Teleport player randomly
    if (mazeData) {
      const emptyCells = [];
      for (let z = 1; z < mazeData.length - 1; z++) {
        for (let x = 1; x < mazeData[0].length - 1; x++) {
          if (mazeData[z][x] === 0) emptyCells.push({ x, z });
        }
      }
      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const worldX = (randomCell.x - widthOffset) * CELL_SIZE;
        const worldZ = (randomCell.z - heightOffset) * CELL_SIZE;
        teleportPlayer([worldX, worldZ]);
      }
    }
  };

  const initialWorldX = (startPos[0] - widthOffset) * CELL_SIZE;
  const initialWorldZ = (startPos[1] - heightOffset) * CELL_SIZE;

  return (
    <RigidBody ref={body} colliders={false} mass={1} type="dynamic" position={[initialWorldX, 3, initialWorldZ]} enabledRotations={[false, false, false]}>
      <CuboidCollider args={[0.5, 1, 0.5]} position={[0, 1, 0]} sensor onIntersectionEnter={handleIntersection} />
      
      <group ref={meshGroup}>
        {type === 'pocong' && (
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.4, 1.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
        )}
        
        {type === 'kuntilanak' && (
          <group position={[0, 1, 0]}>
            <mesh>
              <coneGeometry args={[0.6, 2]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 0.8, 0.2]}>
              <boxGeometry args={[0.5, 0.8, 0.1]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          </group>
        )}

        {type === 'animalHead' && (
          <group position={[0, 1, 0]}>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.6, 1, 0.4]} />
              <meshStandardMaterial color="#8e44ad" />
            </mesh>
            {/* Animal Head (Pig/Cow style box) */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.8, 0.6, 0.8]} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};
