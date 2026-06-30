import React from 'react';
import { useGameStore } from '../store';
import { CELL_SIZE } from './Maze';

export const Minimap: React.FC = () => {
  const { playerPosition, mazeData, exitPosition, otherPlayers } = useGameStore();

  if (!mazeData || !exitPosition) return null;

  // Convert 3D world coordinates back to 2D maze array indices
  const playerGridX = Math.round(playerPosition[0] / CELL_SIZE + mazeData[0].length / 2);
  const playerGridZ = Math.round(playerPosition[1] / CELL_SIZE + mazeData.length / 2);

  // Define exit coordinate
  const exitGridX = Math.round(exitPosition[0] / CELL_SIZE + mazeData[0].length / 2);
  const exitGridZ = Math.round(exitPosition[1] / CELL_SIZE + mazeData.length / 2);

  // Other players coordinates
  const otherGridPositions = Object.values(otherPlayers).map(p => ({
    x: Math.round(p.position[0] / CELL_SIZE + mazeData[0].length / 2),
    z: Math.round(p.position[2] / CELL_SIZE + mazeData.length / 2) // p.position is [x, y, z]
  }));

  return (
    <div style={{
      width: '100%',
      maxWidth: '120px',
      aspectRatio: '1',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      border: '2px solid #00e5ff',
      borderRadius: '8px',
      padding: '4px',
      display: 'grid',
      gridTemplateRows: `repeat(${mazeData.length}, 1fr)`,
      gridTemplateColumns: `repeat(${mazeData[0].length}, 1fr)`,
      gap: '1px',
    }}>
      {mazeData.map((row, z) => 
        row.map((cell, x) => {
          let bgColor = cell === 1 ? '#b0b0b0' : 'transparent';
          let isEntity = false;
          
          // Draw Exit
          if (x === exitGridX && z === exitGridZ) {
            bgColor = '#ff00ff';
            isEntity = true;
          }
          // Draw Other Players
          else if (otherGridPositions.some(p => p.x === x && p.z === z)) {
            bgColor = '#2ecc71'; // Green color for friends
            isEntity = true;
          }
          // Draw Player
          else if (x === playerGridX && z === playerGridZ) {
            bgColor = '#00e5ff'; // Cyan color for local player
            isEntity = true;
          }

          return (
            <div 
              key={`map-${x}-${z}`} 
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: bgColor,
                borderRadius: isEntity ? '50%' : '0',
                boxShadow: isEntity ? `0 0 4px ${bgColor}` : 'none'
              }}
            />
          );
        })
      )}
    </div>
  );
};
