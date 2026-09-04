'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Match, Hero, HeroRole, MatchPhase } from '@/types';
import { getPhaseInfo } from '@/config/defaultData';
import { updateMatchPhase } from '@/lib/supabase/mockStorage';
import { Ban, Check, Search, Shield, Swords, Zap, Wand2, Crosshair, HeartPulse, X, Trash2, Edit2, Sparkles, Lock } from 'lucide-react';

interface PickBanControlProps {
  match: Match;
  heroes: Hero[];
  isCompact?: boolean;
  onSlotClick?: (team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => void;
  onDirectAssign?: (heroId: string, team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => void;
  onClearSlot?: (team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => void;
}

const ROLES: (HeroRole | 'ALL')[] = ['ALL', 'Tank', 'Warrior', 'Assassin', 'Mage', 'Marksman', 'Support'];
const RoleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Tank: Shield,
  Warrior: Swords,
  Assassin: Zap,
  Mage: Wand2,
  Marksman: Crosshair,
  Support: HeartPulse,
};

export const PickBanControl: React.FC<PickBanControlProps> = ({
  match,
  heroes,
  isCompact = false,
  onSlotClick,
  onDirectAssign,
  onClearSlot,
}) => {
  const phaseInfo = getPhaseInfo(match.current_phase);

  // State for the slot-based hero picker flow
  const [activeSlot, setActiveSlot] = useState<{
    team: 'blue' | 'red';
    type: 'pick' | 'ban';
    slotIndex: number;
  } | null>(null);

  const [pendingHero, setPendingHero] = useState<Hero | null>(null);
  const [occupiedSlot, setOccupiedSlot] = useState<{
    team: 'blue' | 'red';
    type: 'pick' | 'ban';
    slotIndex: number;
    hero: Hero;
  } | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<HeroRole | 'ALL'>('ALL');
  const [quickPickMode, setQuickPickMode] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Map actions for slot display
  const actionMap = new Map<string, Hero | undefined>();
  (match.actions || []).forEach((a) => {
    const hero = a.hero || heroes.find((h) => h.id === a.hero_id);
    actionMap.set(`${a.team}_${a.action_type}_${a.slot_index}`, hero);
  });

  // Track draft status (Bans, Blue picks, Red picks)
  const draftStatus = useMemo(() => {
    const bannedHeroes = new Set<string>();
    const bluePickedHeroes = new Set<string>();
    const redPickedHeroes = new Set<string>();

    (match.actions || []).forEach((a) => {
      if (a.action_type === 'ban') {
        bannedHeroes.add(a.hero_id);
      } else if (a.team === 'blue') {
        bluePickedHeroes.add(a.hero_id);
      } else if (a.team === 'red') {
        redPickedHeroes.add(a.hero_id);
      }
    });

    return { bannedHeroes, bluePickedHeroes, redPickedHeroes };
  }, [match.actions]);

  // Helper to determine status of a hero for the currently active slot
  // Rule: Same team CANNOT pick duplicate. Opposing team CAN pick duplicate (Mirror Pick).
  // Banned heroes cannot be picked by either team.
  const getHeroSlotStatus = (heroId: string) => {
    if (!activeSlot) return { disabled: false, reason: '', opponentPicked: false };

    const isPick = activeSlot.type === 'pick';
    const isBlue = activeSlot.team === 'blue';

    const isBanned = draftStatus.bannedHeroes.has(heroId);
    const isPickedBySameTeam = isBlue
      ? draftStatus.bluePickedHeroes.has(heroId)
      : draftStatus.redPickedHeroes.has(heroId);
    const isPickedByOpponent = isBlue
      ? draftStatus.redPickedHeroes.has(heroId)
      : draftStatus.bluePickedHeroes.has(heroId);

    if (isPick) {
      if (isBanned) {
        return { disabled: true, reason: 'แบนแล้ว (BANNED)', opponentPicked: false };
      }
      if (isPickedBySameTeam) {
        return { disabled: true, reason: 'ทีมเลือกแล้ว', opponentPicked: false };
      }
      if (isPickedByOpponent) {
        // Mirror Pick ALLOWED!
        return { disabled: false, reason: 'อีกทีมเลือกแล้ว (เลือกซ้ำได้)', opponentPicked: true };
      }
      return { disabled: false, reason: '', opponentPicked: false };
    } else {
      // Ban phase
      if (isBanned) {
        return { disabled: true, reason: 'แบนแล้ว', opponentPicked: false };
      }
      if (draftStatus.bluePickedHeroes.has(heroId) || draftStatus.redPickedHeroes.has(heroId)) {
        return { disabled: true, reason: 'เลือกไปแล้ว', opponentPicked: false };
      }
      return { disabled: false, reason: '', opponentPicked: false };
    }
  };

  // Filtered heroes for the picker
  const filteredHeroes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return heroes.filter((h) => {
      if (!h.is_active) return false;
      const matchesSearch = !q || h.name.toLowerCase().includes(q) || h.slug.toLowerCase().includes(q);
      const matchesRole = selectedRole === 'ALL' || h.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [heroes, search, selectedRole]);

  // Focus search when modal opens
  useEffect(() => {
    if (activeSlot) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeSlot]);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!activeSlot) return;
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeSlot]);

  const handleSlotClick = async (team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => {
    const teamPrefix = team === 'blue' ? 'BLUE' : 'RED';
    const typeStr = type === 'pick' ? 'PICK' : 'BAN';
    const targetPhase = `${teamPrefix}_${typeStr}_${slotIndex + 1}` as MatchPhase;
    await updateMatchPhase(match.id, targetPhase);

    // Check if slot is already filled
    const existingHero = actionMap.get(`${team}_${type}_${slotIndex}`);
    if (existingHero) {
      setOccupiedSlot({ team, type, slotIndex, hero: existingHero });
      return;
    }

    setActiveSlot({ team, type, slotIndex });
    setPendingHero(null);
    setSearch('');
    setSelectedRole('ALL');

    onSlotClick?.(team, type, slotIndex);
  };

  const assignHero = (hero: Hero) => {
    if (!activeSlot) return;
    const status = getHeroSlotStatus(hero.id);
    if (status.disabled) return;

    if (onDirectAssign) {
      onDirectAssign(hero.id, activeSlot.team, activeSlot.type, activeSlot.slotIndex);
    }
    setActiveSlot(null);
    setPendingHero(null);
    setSearch('');
  };

  const handleHeroClick = (hero: Hero) => {
    const status = getHeroSlotStatus(hero.id);
    if (status.disabled) return;

    if (quickPickMode) {
      assignHero(hero);
    } else {
      setPendingHero(hero);
    }
  };

  const handleHeroDoubleClick = (hero: Hero) => {
    const status = getHeroSlotStatus(hero.id);
    if (status.disabled) return;
    assignHero(hero);
  };

  const handleConfirm = () => {
    if (!pendingHero || !activeSlot) return;
    assignHero(pendingHero);
  };

  const handleCancel = () => {
    setActiveSlot(null);
    setPendingHero(null);
    setSearch('');
    setSelectedRole('ALL');
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const renderSlot = (team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => {
    const isBlue = team === 'blue';
    const hero = actionMap.get(`${team}_${type}_${slotIndex}`);
    const isCurrentTurn =
      !hero &&
      phaseInfo.team === team &&
      phaseInfo.type === type &&
      phaseInfo.slotIndex === slotIndex;

    const isBan = type === 'ban';
    const isSelectedSlot =
      activeSlot?.team === team &&
      activeSlot?.type === type &&
      activeSlot?.slotIndex === slotIndex;

    return (
      <div
        key={`${team}-${type}-${slotIndex}`}
        onClick={() => handleSlotClick(team, type, slotIndex)}
        className={`relative rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
          isBan
            ? isCompact
              ? 'w-12 h-12 md:w-14 md:h-14'
              : 'w-14 h-14 md:w-16 md:h-16'
            : isCompact
            ? 'w-18 h-26 sm:w-20 sm:h-28 md:w-22 md:h-32'
            : 'w-22 h-32 sm:w-24 sm:h-36 md:w-28 md:h-42'
        } ${
          isSelectedSlot
            ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)] scale-105'
            : isCurrentTurn
            ? isBlue
              ? 'border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(0,217,255,0.6)] animate-pulse'
              : 'border-rose-400 ring-2 ring-rose-400 shadow-[0_0_20px_rgba(255,56,100,0.6)] animate-pulse'
            : hero
            ? isBlue
              ? 'border-cyan-700/60 bg-slate-950/80'
              : 'border-rose-700/60 bg-slate-950/80'
            : isBlue
            ? 'border-cyan-900/60 bg-slate-950/80 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(0,217,255,0.2)]'
            : 'border-rose-900/60 bg-slate-950/80 hover:border-rose-500/50 hover:shadow-[0_0_10px_rgba(255,56,100,0.2)]'
        }`}
      >
        {hero ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.portrait_url || hero.image_url}
              alt={hero.name}
              className={`w-full h-full object-cover ${isBan ? 'filter grayscale brightness-75' : ''}`}
            />
            {isBan && (
              <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-0.5 px-1 text-center">
              <span className="text-[9px] md:text-[10px] font-bold text-white uppercase block truncate">
                {hero.name}
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center text-slate-500">
            {isBan ? (
              <Ban className="w-4 h-4 opacity-40 mb-0.5" />
            ) : (
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                  isBlue ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/40' : 'bg-rose-950 text-rose-400 border border-rose-700/40'
                }`}
              >
                {slotIndex + 1}
              </div>
            )}
            <span className="text-[8px] font-mono uppercase font-bold tracking-wider opacity-70">
              {isBan ? `BAN ${slotIndex + 1}` : `PICK ${slotIndex + 1}`}
            </span>
            {!hero && (
              <span className={`text-[7px] font-mono font-bold mt-0.5 ${isCurrentTurn ? (isBlue ? 'text-cyan-300 animate-pulse' : 'text-rose-300 animate-pulse') : 'text-amber-500/60'}`}>
                {isCurrentTurn ? (isBan ? 'BAN...' : 'PICK...') : 'Select'}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full relative">
      {/* Team Panels */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${isCompact ? 'gap-3 p-2' : 'gap-4 p-3'}`}>
        {/* Blue Team Matrix */}
        <div className={`flex flex-col rounded-2xl bg-[#041628]/80 border border-cyan-500/30 shadow-xl backdrop-blur-md ${isCompact ? 'gap-2.5 p-3' : 'gap-4 p-4'}`}>
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D9FF]" />
              <h3 className="text-sm md:text-base font-black text-cyan-300 uppercase tracking-wide">
                {match.blue_team?.name || 'Blue Team'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400/80 uppercase">
              5 PICKS • 4 BANS
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              HERO PICKS
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[0, 1, 2, 3, 4].map((idx) => renderSlot('blue', 'pick', idx))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1 font-bold">
              BANNED HEROES
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[0, 1, 2, 3].map((idx) => renderSlot('blue', 'ban', idx))}
            </div>
          </div>
        </div>

        {/* Red Team Matrix */}
        <div className={`flex flex-col rounded-2xl bg-[#1A0612]/80 border border-rose-500/30 shadow-xl backdrop-blur-md ${isCompact ? 'gap-2.5 p-3' : 'gap-4 p-4'}`}>
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#FF3864]" />
              <h3 className="text-sm md:text-base font-black text-rose-300 uppercase tracking-wide">
                {match.red_team?.name || 'Red Team'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-400/80 uppercase">
              5 PICKS • 4 BANS
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1 font-bold">
              HERO PICKS
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[0, 1, 2, 3, 4].map((idx) => renderSlot('red', 'pick', idx))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1 font-bold">
              BANNED HEROES
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[0, 1, 2, 3].map((idx) => renderSlot('red', 'ban', idx))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== HERO PICKER MODAL (opens when a slot is clicked) (No Blur) ========== */}
      {activeSlot && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-100">
          <div className="bg-[#0B1020] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${
              activeSlot.team === 'blue' ? 'border-cyan-500/40 bg-cyan-950/40' : 'border-rose-500/40 bg-rose-950/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeSlot.team === 'blue' ? 'bg-cyan-600 shadow-[0_0_10px_rgba(0,217,255,0.5)]' : 'bg-rose-600 shadow-[0_0_10px_rgba(255,56,100,0.5)]'
                }`}>
                  {activeSlot.type === 'ban' ? (
                    <Ban className="w-4 h-4 text-white" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                    {activeSlot.type === 'ban' ? 'Select Hero to Ban' : 'Select Hero to Pick'}
                  </h3>
                  <span className={`text-xs font-mono font-bold uppercase ${
                    activeSlot.team === 'blue' ? 'text-cyan-400' : 'text-rose-400'
                  }`}>
                    {activeSlot.team === 'blue' ? match.blue_team?.name || 'BLUE TEAM' : match.red_team?.name || 'RED TEAM'}
                    {' • '}
                    {activeSlot.type === 'ban' ? `BAN ${activeSlot.slotIndex + 1}` : `PICK ${activeSlot.slotIndex + 1}`}
                  </span>
                </div>
              </div>

              {/* Quick Pick Toggle & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPickMode(!quickPickMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    quickPickMode
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="เมื่อเปิดโหมดนี้ คลิกรูปฮีโร่แล้วจะใส่ลงช่องและปิดหน้าต่างทันที"
                >
                  <Zap className={`w-3.5 h-3.5 ${quickPickMode ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>{quickPickMode ? '⚡ คลิกเดียวเลือก (ON)' : 'คลิกเดียวเลือก (OFF)'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search + Filters */}
            <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="ค้นหาชื่อฮีโร่... (กด Enter เพื่อเลือกทันที)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (pendingHero && !getHeroSlotStatus(pendingHero.id).disabled) {
                        assignHero(pendingHero);
                        return;
                      }
                      const firstAvailable = filteredHeroes.find((h) => !getHeroSlotStatus(h.id).disabled);
                      if (firstAvailable) {
                        assignHero(firstAvailable);
                      }
                    }
                  }}
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {ROLES.map((role) => {
                  const Icon = role !== 'ALL' ? RoleIcons[role] : null;
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        selectedRole === role
                          ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,217,255,0.4)]'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Hint Bar */}
            <div className="px-5 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                💡 <strong className="text-amber-300">ดับเบิ้ลคลิก</strong> หรือกด <strong className="text-cyan-300">Enter</strong> เพื่อเลือกทันที
              </span>
              <span className="text-[10px] text-slate-500">
                {activeSlot.type === 'pick' && '✓ ฝั่งตรงข้ามเลือกแล้วยังเลือกซ้ำได้ (Mirror Pick)'}
              </span>
            </div>

            {/* Hero Grid */}
            <div
              ref={scrollRef}
              onWheel={handleWheel}
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2">
                {filteredHeroes.map((hero) => {
                  const status = getHeroSlotStatus(hero.id);
                  const isSelected = pendingHero?.id === hero.id;
                  const RoleIcon = RoleIcons[hero.role];

                  return (
                    <button
                      key={hero.id}
                      type="button"
                      onClick={() => handleHeroClick(hero)}
                      onDoubleClick={() => handleHeroDoubleClick(hero)}
                      disabled={status.disabled}
                      title={status.disabled ? status.reason : status.opponentPicked ? 'อีกทีมเลือกแล้ว (คุณเลือกซ้ำได้)' : hero.name}
                      className={`relative rounded-xl overflow-hidden border transition-all duration-150 group flex flex-col aspect-[3/4] text-left ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105 z-10'
                          : status.disabled
                          ? 'opacity-30 filter grayscale border-slate-800 cursor-not-allowed'
                          : status.opponentPicked
                          ? 'border-amber-500/60 hover:border-cyan-400 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(0,217,255,0.3)] cursor-pointer'
                          : 'border-slate-700/60 hover:border-cyan-400 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(0,217,255,0.3)] cursor-pointer'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hero.portrait_url || hero.image_url}
                        alt={hero.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                      {/* Role badge */}
                      <div className="absolute top-1 left-1 z-10 w-4 h-4 rounded bg-black/70 flex items-center justify-center">
                        {RoleIcon && <RoleIcon className="w-2.5 h-2.5 text-slate-300" />}
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-black stroke-[3]" />
                        </div>
                      )}

                      {/* Opponent Picked Badge (Mirror pick allowed) */}
                      {!status.disabled && status.opponentPicked && (
                        <div className={`absolute top-1 right-1 z-10 px-1 py-0.2 rounded text-[7px] font-black uppercase shadow ${
                          activeSlot.team === 'blue'
                            ? 'bg-rose-950/90 text-rose-300 border border-rose-500/60'
                            : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60'
                        }`}>
                          ซ้ำได้
                        </div>
                      )}

                      {/* Disabled Overlay */}
                      {status.disabled && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 p-1 text-center">
                          {activeSlot.type === 'ban' || status.reason.includes('แบน') ? (
                            <Ban className="w-5 h-5 text-red-400 mb-0.5" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400 mb-0.5" />
                          )}
                          <span className="text-[8px] font-bold text-red-300 uppercase tracking-tight leading-tight">
                            {status.reason}
                          </span>
                        </div>
                      )}

                      {/* Hover action tooltip */}
                      {!status.disabled && !isSelected && (
                        <div className="absolute inset-0 z-10 bg-cyan-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="px-1.5 py-0.5 rounded bg-black/85 text-[8px] font-black text-white uppercase tracking-wider border border-cyan-400/50 shadow">
                            {quickPickMode ? '⚡ คลิกเลือก' : 'เลือก / ดับเบิ้ลคลิก'}
                          </span>
                        </div>
                      )}

                      {/* Name */}
                      <div className="relative z-10 mt-auto p-1.5">
                        <span className="text-[10px] font-bold text-white uppercase block truncate">
                          {hero.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredHeroes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <span className="text-sm font-mono">No heroes found</span>
                </div>
              )}
            </div>

            {/* Bottom Confirm Bar */}
            <div className="px-5 py-3 border-t border-slate-800 bg-[#070B18] flex items-center justify-between gap-3">
              {pendingHero ? (
                <>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingHero.portrait_url || pendingHero.image_url}
                      alt={pendingHero.name}
                      className="w-10 h-12 rounded-lg object-cover border border-amber-500/50"
                    />
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase">{pendingHero.role}</span>
                      <h4 className="text-lg font-black text-white uppercase">{pendingHero.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold uppercase transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-sm shadow-lg transition-all cursor-pointer ${
                        activeSlot.type === 'ban'
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          : activeSlot.team === 'blue'
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,217,255,0.5)]'
                          : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_15px_rgba(255,56,100,0.5)]'
                      }`}
                    >
                      {activeSlot.type === 'ban' ? (
                        <><Ban className="w-4 h-4" /> Confirm Ban</>
                      ) : (
                        <><Check className="w-4 h-4" /> Confirm Pick</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    คลิกรูปฮีโร่ด้านบนเพื่อเลือก หรือ ดับเบิ้ลคลิกเพื่อเลือกทันที
                  </span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold uppercase hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Occupied Slot Actions Modal (No Blur) */}
      {occupiedSlot && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0B1020] border-2 border-red-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in duration-150">
            <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={occupiedSlot.hero.portrait_url || occupiedSlot.hero.image_url}
                alt={occupiedSlot.hero.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className={`text-xs font-mono font-bold uppercase ${occupiedSlot.team === 'blue' ? 'text-cyan-400' : 'text-rose-400'}`}>
                {occupiedSlot.team === 'blue' ? match.blue_team?.name || 'BLUE TEAM' : match.red_team?.name || 'RED TEAM'}
                {' • '}
                {occupiedSlot.type.toUpperCase()} #{occupiedSlot.slotIndex + 1}
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-wide font-display mt-0.5">
                {occupiedSlot.hero.name}
              </h3>
            </div>

            <div className="w-full space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={async () => {
                  if (onClearSlot) {
                    onClearSlot(occupiedSlot.team, occupiedSlot.type, occupiedSlot.slotIndex);
                  } else {
                    const { clearSlotHero } = await import('@/lib/supabase/mockStorage');
                    await clearSlotHero(match.id, occupiedSlot.team, occupiedSlot.type, occupiedSlot.slotIndex);
                  }
                  setOccupiedSlot(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>Remove / Delete {occupiedSlot.hero.name}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSlot({ team: occupiedSlot.team, type: occupiedSlot.type, slotIndex: occupiedSlot.slotIndex });
                  setPendingHero(null);
                  setOccupiedSlot(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs uppercase flex items-center justify-center gap-2 border border-cyan-500/40 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Change Hero</span>
              </button>

              <button
                type="button"
                onClick={() => setOccupiedSlot(null)}
                className="w-full py-2 px-4 rounded-xl bg-slate-950 text-slate-400 font-bold text-xs uppercase hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
