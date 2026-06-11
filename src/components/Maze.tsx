import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../store';

const WALL_HEIGHT = 3;
export const CELL_SIZE = 4;

export const Maze: React.FC = () => {
  const mazeData = useGameStore(state => state.mazeData);
  const currentLevel = useGameStore(state => state.currentLevel);

  if (!mazeData) return null;

  const walls: React.ReactNode[] = [];
  
  // Crystal Palace (Level 121) special materials
  const isCrystalPalace = currentLevel > 120;
  
  const wallColor = isCrystalPalace ? "#ffffff" : "#b0b0b0";
  const floorColor = isCrystalPalace ? "#e0f7fa" : "#808080";
  const wallRoughness = isCrystalPalace ? 0.1 : 0.7;
  const floorRoughness = isCrystalPalace ? 0.1 : 0.8;
  const transmission = isCrystalPalace ? 0.9 : 0;

  for (let z = 0; z < mazeData.length; z++) {
    for (let x = 0; x < mazeData[z].length; x++) {
      if (mazeData[z][x] === 1) {
        walls.push(
          <RigidBody key={`wall-${x}-${z}`} type="fixed">
            <mesh 
              position={[(x - mazeData[0].length / 2) * CELL_SIZE, WALL_HEIGHT / 2, (z - mazeData.length / 2) * CELL_SIZE]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
              {isCrystalPalace ? (
                <meshPhysicalMaterial color={wallColor} roughness={wallRoughness} transmission={transmission} thickness={1} />
              ) : (
                <meshStandardMaterial color={wallColor} roughness={wallRoughness} />
              )}
            </mesh>
          </RigidBody>
        );
      }
    }
  }

  // Calculate floor size dynamically
  const width = mazeData[0].length * CELL_SIZE;
  const height = mazeData.length * CELL_SIZE;

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[width * 1.5, height * 1.5]} />
          {isCrystalPalace ? (
            <meshPhysicalMaterial color={floorColor} roughness={floorRoughness} transmission={0.5} />
          ) : (
            <meshStandardMaterial color={floorColor} roughness={floorRoughness} />
          )}
        </mesh>
      </RigidBody>
      
      {/* Walls */}
      {walls}
    </group>
  );
};
