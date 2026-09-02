'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, Hero } from '@/types';
import { Ban, Clock } from 'lucide-react';

interface RPLBroadcastDockProps {
  match: Match;
  heroes: Hero[];
  phaseInfo: {
    title: string;
    team: 'blue' | 'red' | 'neutral';
    type: 'pick' | 'ban' | 'waiting' | 'ready';
    slotIndex: number;
  };
}

export const RPLBroadcastDock: React.FC<RPLBroadcastDockProps> = ({
  match,
  heroes,
  phaseInfo,
}) => {
  const heroActionMap = new Map<string, Hero | undefined>();
  (match.actions || []).forEach((action) => {
    const key = `${action.team}_${action.action_type}_${action.slot_index}`;
    const hero = action.hero || heroes.find((h) => h.id === action.hero_id);
    heroActionMap.set(key, hero);
  });

  const blueTeam = match.blue_team || {
    id: 'team-blue', name: 'Team Blue', short_name: 'BLU',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=BlueTeam&backgroundColor=0284c7',
    primary_color: '#00D9FF', secondary_color: '#041628',
  };
  const redTeam = match.red_team || {
    id: 'team-red', name: 'Team Red', short_name: 'RED',
    logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=RedTeam&backgroundColor=f43f5e',
    primary_color: '#FF3864', secondary_color: '#1A0612',
  };

  const bluePlayers = match.blue_players?.length === 5 ? match.blue_players : ['SRY','EREZ','FAKEPLAYZ','MOOP','DIFOXN'];
  const redPlayers = match.red_players?.length === 5 ? match.red_players : ['NOARJE','SHARKZ','AGETSIVE','OVERONE','ASHEARTH'];

  const formattedTimer = `00:${match.timer_seconds.toString().padStart(2, '0')}`;
  const isUrgent = match.timer_seconds <= 10 && match.timer_seconds > 0;
  const isBlueTurn = match.current_turn === 'blue';
  const boFormat = match.bo_format || 'BO 5';

  const [sponsorIndex, setSponsorIndex] = React.useState(0);
  const allSponsors = match.sponsors_list?.length ? match.sponsors_list : match.sponsor ? [match.sponsor] : [];

  React.useEffect(() => {
    if (allSponsors.length <= 1) return;
    const t = setInterval(() => setSponsorIndex((p) => (p + 1) % allSponsors.length), 5000);
    return () => clearInterval(t);
  }, [allSponsors.length]);

  const currentSponsor = allSponsors[sponsorIndex] || allSponsors[0];

  /* ===== BAN SLOT ===== */
  const BanSlot = ({ team, idx }: { team: 'blue' | 'red'; idx: number }) => {
    const hero = heroActionMap.get(`${team}_ban_${idx}`);
    const active = !hero && phaseInfo.type === 'ban' && phaseInfo.team === team && phaseInfo.slotIndex === idx;
    const glow = team === 'blue' ? 'shadow-[0_0_10px_#00d9ff]' : 'shadow-[0_0_10px_#ff3864]';
    const borderColor = team === 'blue' ? 'border-cyan-400' : 'border-rose-400';

    return (
      <div className={`w-[52px] h-[42px] rounded overflow-hidden bg-[#0a0e1a] border flex-shrink-0 relative flex items-center justify-center transition-all duration-300 ${
        active ? `${borderColor} ${glow} border-2` : 'border-slate-700/50'
      }`}>
        {hero ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.portrait_url || hero.image_url} alt={hero.name} className="w-full h-full object-cover brightness-90" />
            <div className="absolute inset-0 bg-red-900/20" />
            <div className="w-[140%] h-[2px] bg-red-500 shadow-[0_0_4px_#ff0033] transform rotate-45 absolute" />
          </>
        ) : (
          <Ban className={`w-3.5 h-3.5 ${active ? (team === 'blue' ? 'text-cyan-400' : 'text-rose-400') : 'text-slate-600'}`} />
        )}
      </div>
    );
  };

  /* ===== PICK CARD ===== */
  const PickCard = ({ team, idx }: { team: 'blue' | 'red'; idx: number }) => {
    const hero = heroActionMap.get(`${team}_pick_${idx}`);
    const active = !hero && phaseInfo.type === 'pick' && phaseInfo.team === team && phaseInfo.slotIndex === idx;
    const playerObj = team === 'blue' ? match.blue_team?.player_roster?.[idx] : match.red_team?.player_roster?.[idx];
    const playerPhoto = playerObj?.photo_url;
    const playerOpacity = ((playerObj?.bg_opacity ?? (team === 'blue' ? match.blue_team?.bg_opacity : match.red_team?.bg_opacity) ?? match.player_bg_opacity ?? 75) / 100);
    const player = playerObj?.name || (team === 'blue' ? bluePlayers[idx] : redPlayers[idx]);
    const bg = team === 'blue' ? 'from-[#071428] to-[#040d1c]' : 'from-[#140714] to-[#0d040a]';

    return (
      <div className={`flex flex-col h-full rounded-lg overflow-hidden bg-[#070b14] relative transition-all ${
        active
          ? team === 'blue'
            ? 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,217,255,0.8)]'
            : 'border-2 border-rose-400 shadow-[0_0_20px_rgba(255,56,100,0.8)]'
          : 'border border-slate-800/60'
      }`}>
        <div className={`flex-1 relative overflow-hidden bg-gradient-to-b ${bg}`}>
          {/* Custom Player Card Background Photo */}
          {playerPhoto && !hero && (
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={playerPhoto}
                alt="Player Photo"
                className="w-full h-full object-cover filter brightness-95 contrast-105"
                style={{ opacity: playerOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          )}

          {hero ? (
            <div className="w-full h-full relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.splash_url || hero.image_url}
                alt={hero.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {active ? (
                <>
                  {/* Scanning line animation effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                      className={`absolute inset-x-0 h-[3px] ${
                        team === 'blue'
                          ? 'bg-cyan-400 shadow-[0_0_15px_#00d9ff]'
                          : 'bg-rose-400 shadow-[0_0_15px_#ff3864]'
                      }`}
                      style={{ animation: 'scanDown 1.8s ease-in-out infinite' }}
                    />
                  </div>
                  {/* Glowing Diamond Badge */}
                  <div
                    className={`w-10 h-10 rounded-lg border-2 ${
                      team === 'blue'
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,217,255,0.6)]'
                        : 'border-rose-400 bg-rose-950/60 shadow-[0_0_15px_rgba(255,56,100,0.6)]'
                    } flex items-center justify-center mb-2 rotate-45 animate-pulse`}
                  >
                    <span
                      className={`text-sm font-black -rotate-45 ${
                        team === 'blue' ? 'text-cyan-300' : 'text-rose-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-black tracking-widest animate-pulse ${
                      team === 'blue' ? 'text-cyan-300 drop-shadow-[0_0_8px_#00d9ff]' : 'text-rose-300 drop-shadow-[0_0_8px_#ff3864]'
                    }`}
                  >
                    PICKING...
                  </span>
                </>
              ) : (
                <>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      team === 'blue' ? 'border-cyan-800/40 text-cyan-700/40' : 'border-rose-800/40 text-rose-700/40'
                    }`}
                  >
                    <span className="text-sm font-black">{idx + 1}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="h-6 bg-slate-200 flex items-center justify-center px-1">
          <span className="text-[10px] font-black tracking-wider text-black uppercase truncate font-mono">
            {hero ? hero.name : (player || `P${idx + 1}`)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-[680px] z-20 pointer-events-none select-none flex flex-col justify-end items-center">
      {/* ═══ CENTER GAME LOGO (Transparent PNG, No Colored Circle Border) ═══ */}
      <div className="relative z-30 mb-[-26px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            match.game_logo_url ||
            'https://api.dicebear.com/7.x/shapes/svg?seed=RoVESPORTS&backgroundColor=transparent&shape1Color=fbbf24&shape2Color=f59e0b'
          }
          alt="Game Logo"
          className="h-14 max-w-[120px] object-contain filter drop-shadow-[0_0_15px_rgba(255,215,0,0.7)]"
        />
      </div>

      {/* ═══ UPPER BAR: BAN + Team Name + Score | CREST GAP | Score + Team Name + BAN ═══ */}
      <div className="w-full px-2">
        <div className="w-full h-[48px] flex items-center bg-[#0a0e1aee] border border-slate-700/40 rounded-t-lg relative">

          {/* Left: BAN label + Blue Bans + Blue Team + Score */}
          <div className="flex items-center gap-1.5 h-full px-2 flex-1">
            <span className="text-sm font-black text-white tracking-widest font-display px-2">BAN</span>
            {[0,1,2,3].map(i => <BanSlot key={`b-ban-${i}`} team="blue" idx={i} />)}

            {/* Blue Team Name + Score */}
            <div className="flex items-center gap-2 ml-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blueTeam.logo_url} alt={blueTeam.short_name} className="w-7 h-7 object-contain" />
              <span className="text-sm font-black text-cyan-300 uppercase tracking-wide font-display">{blueTeam.name}</span>
              <span className="text-lg font-black text-white bg-cyan-600/30 px-2 py-0.5 rounded">{match.blue_score}</span>
            </div>
          </div>

          {/* Center gap for crest */}
          <div className="w-[70px] flex-shrink-0" />

          {/* Right: Score + Red Team + Red Bans + BAN label */}
          <div className="flex items-center gap-1.5 h-full px-2 flex-1 justify-end">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-lg font-black text-white bg-rose-600/30 px-2 py-0.5 rounded">{match.red_score}</span>
              <span className="text-sm font-black text-rose-300 uppercase tracking-wide font-display">{redTeam.name}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={redTeam.logo_url} alt={redTeam.short_name} className="w-7 h-7 object-contain" />
            </div>
            {[0,1,2,3].map(i => <BanSlot key={`r-ban-${i}`} team="red" idx={i} />)}
            <span className="text-sm font-black text-white tracking-widest font-display px-2">BAN</span>
          </div>
        </div>
      </div>

      {/* ═══ LOWER DECK: 5 Blue Picks + CENTER BOX + 5 Red Picks ═══ */}
      <div className="w-full px-2 pb-2">
        <div className="w-full grid grid-cols-[5fr_2fr_5fr] gap-0 bg-[#070b14ee] border border-slate-700/40 border-t-0 rounded-b-lg overflow-hidden">

          {/* 5 Blue Picks */}
          <div className="grid grid-cols-5 gap-1 p-1.5 h-[260px]">
            {[0,1,2,3,4].map(i => <PickCard key={`bp-${i}`} team="blue" idx={i} />)}
          </div>

          {/* Center Score + Timer + Sponsor Box */}
          <div className="flex flex-col items-center justify-between py-3 px-2 border-x border-slate-700/30 relative">
            {/* Top gradient line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500" />

            {/* BO Format */}
            <span className="text-base font-black tracking-[0.3em] text-amber-300 font-display uppercase mt-1 z-10">
              {boFormat}
            </span>

            {/* Giant Score */}
            <div className="flex items-center gap-3 my-1">
              <span className="text-5xl font-black text-cyan-300 font-display drop-shadow-[0_0_12px_rgba(0,217,255,0.5)]">
                {match.blue_score}
              </span>
              <span className="text-4xl font-black text-slate-400 font-display">:</span>
              <span className="text-5xl font-black text-rose-400 font-display drop-shadow-[0_0_12px_rgba(255,56,100,0.5)]">
                {match.red_score}
              </span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-spin' : isBlueTurn ? 'text-cyan-400' : 'text-rose-400'}`} />
              <span className={`text-xl font-mono font-black tracking-wider ${
                isUrgent ? 'text-red-400' : isBlueTurn ? 'text-cyan-300' : 'text-rose-300'
              }`}>
                {formattedTimer}
              </span>
            </div>

            {/* Sponsor Carousel (Bottom) */}
            <div className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 shadow-lg flex items-center justify-center overflow-hidden min-h-[40px]">
              <AnimatePresence mode="wait">
                {currentSponsor ? (
                  <motion.div
                    key={currentSponsor.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-center gap-2 w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentSponsor.logo_url} alt={currentSponsor.name} className="h-6 max-w-[80px] object-contain" />
                    <span className="text-[10px] font-black text-slate-800 font-display tracking-wider uppercase truncate">
                      {currentSponsor.name}
                    </span>
                  </motion.div>
                ) : (
                  <motion.span key="def" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black text-slate-500 font-display tracking-wider uppercase">
                    DRAFT PICK SYSTEM
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 5 Red Picks */}
          <div className="grid grid-cols-5 gap-1 p-1.5 h-[260px]">
            {[0,1,2,3,4].map(i => <PickCard key={`rp-${i}`} team="red" idx={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
};
