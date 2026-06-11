import React from 'react';
import { useGameStore } from '../store';
import { mazeData } from './Maze';

export const Minimap: React.FC = () => {
  const { playerPosition } = useGameStore();
  const CELL_SIZE = 4; // Should match Maze.tsx CELL_SIZE

  // Convert 3D world coordinates back to 2D maze array indices
  const playerGridX = Math.round(playerPosition[0] / CELL_SIZE + mazeData[0].length / 2);
  const playerGridZ = Math.round(playerPosition[1] / CELL_SIZE + mazeData.length / 2);

  // Define exit coordinate roughly (from ExitGate position [0, 1.5, -16])
  const exitGridX = Math.round(0 / CELL_SIZE + mazeData[0].length / 2);
  const exitGridZ = Math.round(-16 / CELL_SIZE + mazeData.length / 2);

  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      border: '2px solid #00e5ff',
      borderRadius: '8px',
      padding: '5px',
      display: 'grid',
      gridTemplateRows: `repeat(${mazeData.length}, 10px)`,
      gridTemplateColumns: `repeat(${mazeData[0].length}, 10px)`,
      gap: '1px',
    }}>
      {mazeData.map((row, z) => 
        row.map((cell, x) => {
          let bgColor = cell === 1 ? '#b0b0b0' : 'transparent';
          
          // Draw Exit
          if (x === exitGridX && z === exitGridZ) {
            bgColor = '#ff00ff';
          }
          
          // Draw Player
          if (x === playerGridX && z === playerGridZ) {
            bgColor = '#00e5ff';
          }

          return (
            <div 
              key={`map-${x}-${z}`} 
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: bgColor,
                borderRadius: bgColor === '#00e5ff' || bgColor === '#ff00ff' ? '50%' : '0'
              }}
            />
          );
        })
      )}
    </div>
  );
};
