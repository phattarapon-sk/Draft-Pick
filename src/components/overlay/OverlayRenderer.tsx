'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Match, Hero } from '@/types';
import { Background } from './Background';
import { TeamPanel } from './TeamPanel';
import { HeroSlot } from './HeroSlot';
import { DraftTimer } from './DraftTimer';
import { Sponsor } from './Sponsor';
import { getPhaseInfo, DEFAULT_TEMPLATES, DEFAULT_THEMES } from '@/config/defaultData';
import { Swords } from 'lucide-react';

import { RPLBroadcastDock } from './RPLBroadcastDock';

interface OverlayRendererProps {
  match: Match;
  heroes?: Hero[];
  isTransparent?: boolean;
}

export const OverlayRenderer: React.FC<OverlayRendererProps> = ({
  match,
  heroes = [],
  isTransparent = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const defaultTpl = DEFAULT_TEMPLATES.find(
    (dt) =>
      dt.id === match.template_id ||
      dt.id === match.template?.id ||
      dt.slug === match.template?.slug ||
      (match.template_id === 'template-standard-16-9' && dt.slug === 'standard-16-9')
  );
  const template = defaultTpl || match.template || DEFAULT_TEMPLATES[0];
  const theme = match.theme || DEFAULT_THEMES[0];
  const config = template.config;

  // Master Canvas Dimensions
  const canvasWidth = config.canvas?.width || 1920;
  const canvasHeight = config.canvas?.height || 1080;

  // Auto-scale canvas into container viewport
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;
      const scaleX = clientWidth / canvasWidth;
      const scaleY = clientHeight / canvasHeight;
      const minScale = Math.min(scaleX, scaleY);
      setScale(minScale > 0 ? minScale : 1);
    };

    handleResize();

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasWidth, canvasHeight]);

  // Map actions to map of [team_type_slotIndex] -> Hero
  const heroActionMap = new Map<string, Hero | undefined>();
  (match.actions || []).forEach((action) => {
    const key = `${action.team}_${action.action_type}_${action.slot_index}`;
    const hero = action.hero || heroes.find((h) => h.id === action.hero_id);
    heroActionMap.set(key, hero);
  });

  const phaseInfo = getPhaseInfo(match.current_phase);
  
  // Decide layout mode: RPL Bottom Dock vs Standard Full Screen 16:9
  const isRPLHalfScreen =
    match.template_id === 'template-rpl-official' ||
    match.template_id === 'template-half-screen-caster' ||
    template?.slug === 'rpl-official-dock' ||
    template?.slug === 'half-screen-caster' ||
    template?.id === 'template-rpl-official';

  const isStandardFullScreen = !isRPLHalfScreen;

  // Standard 16:9 Full Screen Broadcast Layout Normalization
  const activeHeroSlots =
    isStandardFullScreen && (!config.heroSlots || config.heroSlots.length === 0 || config.heroSlots[0]?.y !== 190)
      ? DEFAULT_TEMPLATES[1].config.heroSlots
      : config.heroSlots;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${
        isTransparent || match.background_type === 'transparent' ? 'bg-transparent' : 'bg-[#050816]'
      }`}
    >
      {/* Scaled 1920x1080 Canvas Container */}
      <div
        className="relative origin-center shadow-2xl flex-shrink-0 transition-transform duration-75"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${scale})`,
        }}
      >
        {/* 1. Background Layer */}
        {!isTransparent && match.background_type !== 'transparent' && (
          <Background
            type={match.background_type || theme.background_type || 'gradient'}
            url={match.background_url || theme.background_url}
            theme={theme}
            showScanlines={config.decorations?.showScanlines ?? true}
          />
        )}

        {/* Official RoV Pro League Bottom Dock Mode */}
        {isRPLHalfScreen ? (
          <RPLBroadcastDock
            match={match}
            heroes={heroes}
            phaseInfo={phaseInfo}
          />
        ) : (
          <>
            {/* 2. Center VS Decoration (Compact Refined Emblem) */}
            {config.decorations?.centerVsText && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center select-none">
                {/* Ambient Radial Aura Glow */}
                <div className="absolute inset-0 -m-3 bg-gradient-to-r from-cyan-500/15 via-amber-400/20 to-rose-500/15 blur-lg rounded-full animate-pulse" />

                <Swords className="w-14 h-14 text-amber-400/90 stroke-[1.75] filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse" />
                <span className="text-3xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-amber-300 to-rose-400 -mt-1 filter drop-shadow-[0_0_15px_rgba(255,215,0,0.7)]">
                  VS
                </span>
              </div>
            )}

            {/* 3. Team Headers & Scores */}
            <TeamPanel
              team={match.blue_team}
              side="blue"
              headerPosition={isStandardFullScreen ? { x: 28, y: 40, width: 735, height: 95 } : config.blueTeamHeader}
              scorePosition={isStandardFullScreen ? { x: 775, y: 40, width: 95, height: 95 } : config.blueScore}
              score={match.blue_score}
            />
            <TeamPanel
              team={match.red_team}
              side="red"
              headerPosition={isStandardFullScreen ? { x: 1157, y: 40, width: 735, height: 95 } : config.redTeamHeader}
              scorePosition={isStandardFullScreen ? { x: 1050, y: 40, width: 95, height: 95 } : config.redScore}
              score={match.red_score}
            />

            {/* 4. Center Broadcast Module (Waiting for Start / Live Timer & Turn) */}
            <DraftTimer
              position={isStandardFullScreen ? { x: 880, y: 40, width: 160, height: 95 } : (config.timer || config.phaseIndicator)}
              seconds={match.timer_seconds ?? 30}
              isRunning={match.timer_running ?? false}
              currentTurn={match.current_turn || (phaseInfo.team as 'blue' | 'red') || 'blue'}
              phaseType={phaseInfo.type}
              phaseTitle={phaseInfo.title}
              boFormat={match.bo_format || 'BO 3'}
              phase={match.current_phase}
            />

            {/* 5. Hero Slots (Picks & Bans) */}
            {activeHeroSlots.map((slotConfig) => {
              const actionKey = `${slotConfig.team}_${slotConfig.type}_${slotConfig.slotIndex}`;
              const assignedHero = heroActionMap.get(actionKey);

              const teamObj = slotConfig.team === 'blue' ? match.blue_team : match.red_team;
              const playerObj = teamObj?.player_roster?.[slotConfig.slotIndex];
              const playerPhoto = playerObj?.photo_url;
              const playerName = playerObj?.name || (slotConfig.team === 'blue' ? match.blue_players?.[slotConfig.slotIndex] : match.red_players?.[slotConfig.slotIndex]);
              const bgOpacity = playerObj?.bg_opacity ?? teamObj?.bg_opacity ?? match.player_bg_opacity ?? 75;

              // Check if this slot is currently taking pick/ban turn
              const isSlotActiveTurn =
                !assignedHero &&
                phaseInfo.type !== 'waiting' &&
                phaseInfo.type !== 'ready' &&
                phaseInfo.team === slotConfig.team &&
                phaseInfo.type === slotConfig.type &&
                phaseInfo.slotIndex === slotConfig.slotIndex;

              return (
                <HeroSlot
                  key={slotConfig.id}
                  config={slotConfig}
                  hero={assignedHero}
                  isActiveTurn={isSlotActiveTurn}
                  themeStyle={theme.frame_style}
                  primaryColor={theme.primary_color}
                  playerPhoto={playerPhoto}
                  playerName={playerName}
                  bgOpacity={bgOpacity}
                />
              );
            })}

            {/* 6. Full-Width Sponsor Dock (Auto-rotating carousel spanning 1920px edge-to-edge) */}
            <Sponsor
              sponsor={match.sponsor}
              sponsors={match.sponsors_list}
              position={isStandardFullScreen ? { x: 0, y: 1000, width: 1920, height: 80 } : config.sponsors}
            />
          </>
        )}
      </div>
    </div>
  );
};
