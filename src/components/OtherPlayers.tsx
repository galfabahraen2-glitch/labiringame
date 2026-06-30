import React from 'react';
import { useGameStore } from '../store';
import { BlockyCharacter } from './Player';

export const OtherPlayers: React.FC = () => {
  const { otherPlayers, currentLevel } = useGameStore();

  return (
    <>
      {Object.entries(otherPlayers).filter(([_, data]) => data.level === currentLevel).map(([id, data]) => (
        <group key={id} position={data.position} rotation={[0, data.rotation, 0]}>
          <BlockyCharacter
            avatar={data.avatar}
            name={data.name}
            showName={true}
            animPhase={Date.now() * 0.003}
          />
        </group>
      ))}
    </>
  );
};
