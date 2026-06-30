import React from 'react';
import { useGameStore } from '../store';
import { CELL_SIZE } from './Maze';

export const Minimap: React.FC = () => {
  const { playerPosition, mazeData, exitPosition, otherPlayers, currentLevel } = useGameStore();

  if (!mazeData || !exitPosition) return null;

  // Convert 3D world coordinates back to 2D maze array indices
  const playerGridX = Math.round(playerPosition[0] / CELL_SIZE + mazeData[0].length / 2);
  const playerGridZ = Math.round(playerPosition[1] / CELL_SIZE + mazeData.length / 2);

  // Define exit coordinate
  const exitGridX = Math.round(exitPosition[0] / CELL_SIZE + mazeData[0].length / 2);
  const exitGridZ = Math.round(exitPosition[1] / CELL_SIZE + mazeData.length / 2);

  // Other players coordinates
  const otherGridPositions = Object.values(otherPlayers)
    .filter(p => p.level === currentLevel)
    .map(p => ({
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
          const isExit = x === exitGridX && z === exitGridZ;
          const isOtherPlayer = otherGridPositions.some(p => p.x === x && p.z === z);
          const isLocalPlayer = x === playerGridX && z === playerGridZ;

          return (
            <div 
              key={`map-${x}-${z}`} 
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: cell === 1 ? '#b0b0b0' : 'transparent',
                position: 'relative',
              }}
            >
              {isExit && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ff00ff', borderRadius: '50%', boxShadow: '0 0 4px #ff00ff' }} />
              )}
              {isOtherPlayer && (
                <div style={{ position: 'absolute', inset: '10%', backgroundColor: '#2ecc71', borderRadius: '50%', boxShadow: '0 0 4px #2ecc71', zIndex: 1 }} />
              )}
              {isLocalPlayer && (
                <div style={{ position: 'absolute', inset: '25%', backgroundColor: '#00e5ff', borderRadius: '50%', boxShadow: '0 0 4px #00e5ff', zIndex: 2 }} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
