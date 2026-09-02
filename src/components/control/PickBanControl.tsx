'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Match, Hero, HeroRole, MatchPhase } from '@/types';
import { getPhaseInfo } from '@/config/defaultData';
import { updateMatchPhase } from '@/lib/supabase/mockStorage';
import { Ban, Check, Search, Shield, Swords, Zap, Wand2, Crosshair, HeartPulse, X, Trash2, Edit2 } from 'lucide-react';

interface PickBanControlProps {
  match: Match;
  heroes: Hero[];
  isCompact?: boolean;
  onSlotClick?: (team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => void;
  onDirectAssign?: (heroId: string, team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => void;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map actions
  const actionMap = new Map<string, Hero | undefined>();
  (match.actions || []).forEach((a) => {
    const hero = a.hero || heroes.find((h) => h.id === a.hero_id);
    actionMap.set(`${a.team}_${a.action_type}_${a.slot_index}`, hero);
  });

  // Map used heroes (for disabling)
  const usedHeroMap = useMemo(() => {
    const map = new Map<string, { type: 'pick' | 'ban'; team: 'blue' | 'red' }>();
    (match.actions || []).forEach((a) => {
      map.set(a.hero_id, { type: a.action_type, team: a.team });
    });
    return map;
  }, [match.actions]);

  // Filtered heroes for the picker
  const filteredHeroes = useMemo(() => {
    return heroes.filter((h) => {
      if (!h.is_active) return false;
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = selectedRole === 'ALL' || h.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [heroes, search, selectedRole]);

  const handleSlotClick = async (team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => {
    // Automatically switch current phase to the clicked slot
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

    // Also fire the callback if present
    onSlotClick?.(team, type, slotIndex);
  };

  const handleHeroSelect = (hero: Hero) => {
    if (usedHeroMap.has(hero.id) && pendingHero?.id !== hero.id) return;
    setPendingHero(hero);
  };

  const handleConfirm = () => {
    if (!pendingHero || !activeSlot) return;
    if (onDirectAssign) {
      onDirectAssign(pendingHero.id, activeSlot.team, activeSlot.type, activeSlot.slotIndex);
    }
    setActiveSlot(null);
    setPendingHero(null);
  };

  const handleClearSlot = async () => {
    if (!activeSlot) return;
    const { clearSlotHero } = await import('@/lib/supabase/mockStorage');
    await clearSlotHero(match.id, activeSlot.team, activeSlot.type, activeSlot.slotIndex);
    setActiveSlot(null);
    setPendingHero(null);
  };

  const handleCancel = () => {
    setActiveSlot(null);
    setPendingHero(null);
    setSearch('');
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
                  activeSlot.team === 'blue' ? 'bg-cyan-600' : 'bg-rose-600'
                }`}>
                  {activeSlot.type === 'ban' ? (
                    <Ban className="w-4 h-4 text-white" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
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
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Search + Filters */}
            <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hero by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {ROLES.map((role) => {
                  const Icon = role !== 'ALL' ? RoleIcons[role] : null;
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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

            {/* Hero Grid */}
            <div
              ref={scrollRef}
              onWheel={handleWheel}
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2">
                {filteredHeroes.map((hero) => {
                  const used = usedHeroMap.get(hero.id);
                  const isSelected = pendingHero?.id === hero.id;
                  const RoleIcon = RoleIcons[hero.role];

                  return (
                    <button
                      key={hero.id}
                      onClick={() => handleHeroSelect(hero)}
                      disabled={Boolean(used)}
                      className={`relative rounded-xl overflow-hidden border transition-all duration-150 group flex flex-col aspect-[3/4] ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105 z-10'
                          : used
                          ? 'opacity-30 filter grayscale border-slate-800 cursor-not-allowed'
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
                        <div className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}

                      {/* Used overlay */}
                      {used && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                          <Ban className="w-5 h-5 text-red-400" />
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
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold uppercase transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase text-sm shadow-lg transition-all ${
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
                    Select a hero above to assign to this slot:
                  </span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
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
                  const { clearSlotHero } = await import('@/lib/supabase/mockStorage');
                  await clearSlotHero(match.id, occupiedSlot.team, occupiedSlot.type, occupiedSlot.slotIndex);
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
                className="w-full py-2 px-4 rounded-xl bg-slate-950 text-slate-400 font-bold text-xs uppercase hover:text-white transition-colors"
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
