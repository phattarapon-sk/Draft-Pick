'use client';

import React from 'react';
import { HeroSlotConfig, Hero } from '@/types';
import { HeroCard } from './HeroCard';

interface HeroSlotProps {
  config: HeroSlotConfig;
  hero?: Hero | null;
  isActiveTurn?: boolean;
  themeStyle?: string;
  primaryColor?: string;
  playerPhoto?: string;
  playerName?: string;
  bgOpacity?: number;
}

export const HeroSlot: React.FC<HeroSlotProps> = ({
  config,
  hero,
  isActiveTurn = false,
  themeStyle,
  primaryColor,
  playerPhoto,
  playerName,
  bgOpacity,
}) => {
  const { x, y, width, height, rotation, scale, zIndex } = config;

  return (
    <div
      id={config.id}
      className="absolute transition-all duration-300"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `${rotation ? `rotate(${rotation}deg)` : ''} ${scale ? `scale(${scale})` : ''}`,
        zIndex: zIndex || (isActiveTurn ? 20 : 10),
      }}
    >
      <HeroCard
        hero={hero}
        team={config.team}
        type={config.type}
        slotIndex={config.slotIndex}
        isActiveTurn={isActiveTurn}
        themeStyle={themeStyle}
        primaryColor={primaryColor}
        playerPhoto={playerPhoto}
        playerName={playerName}
        bgOpacity={bgOpacity}
      />
    </div>
  );
};
