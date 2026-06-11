import React from 'react';
import { RigidBody } from '@react-three/rapier';

// A simple map representation (1 = wall, 0 = empty)
export const mazeData = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const WALL_HEIGHT = 3;
const CELL_SIZE = 4;

export const Maze: React.FC = () => {
  // We can add textures later, for now we use colored materials
  
  const walls: React.ReactNode[] = [];

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
              <meshStandardMaterial color="#b0b0b0" roughness={0.7} />
            </mesh>
          </RigidBody>
        );
      }
    }
  }

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#808080" roughness={0.8} />
        </mesh>
      </RigidBody>
      
      {/* Walls */}
      {walls}
    </group>
  );
};
