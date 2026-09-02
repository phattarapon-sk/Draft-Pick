'use client';

import React, { useState, useEffect } from 'react';
import { Match, Hero, MatchPhase, Sponsor, GameLogo } from '@/types';
import { DRAFT_PHASE_ORDER } from '@/config/defaultData';
import { executeDraftAction, undoLastAction, resetMatchDraft, updateMatchTimer, updateMatchScores, updateMatchPhase, swapTeamSides, getLogos } from '@/lib/supabase/mockStorage';
import { uploadImageFile } from '@/lib/uploadService';
import { ImageUploader } from '@/components/common/ImageUploader';
import { PickBanControl } from './PickBanControl';
import { TimerControl } from './TimerControl';
import { OBSInstructions } from './OBSInstructions';
import { OverlayRenderer } from '@/components/overlay/OverlayRenderer';
import { RotateCcw, Undo2, Video, Eye, EyeOff, Plus, Minus, CheckCircle, Radio, Upload, Trophy, Sparkles, Settings, SlidersHorizontal, Layout, Layers, Palette, Check, ArrowLeftRight, AlertTriangle } from 'lucide-react';

interface MatchControlProps {
  match: Match;
  heroes: Hero[];
  onMatchUpdated?: (updated: Match) => void;
}

export const MatchControl: React.FC<MatchControlProps> = ({
  match,
  heroes,
  onMatchUpdated,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapConfirmType, setSwapConfirmType] = useState<'new_game' | 'keep_picks' | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showOBSModal, setShowOBSModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [availableSponsors, setAvailableSponsors] = useState<Sponsor[]>([]);
  const [availableLogos, setAvailableLogos] = useState<GameLogo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const bgFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file, 'logos');
      const updatedMatch: Match = {
        ...match,
        game_logo_url: url,
        updated_at: new Date().toISOString(),
      };
      if (onMatchUpdated) onMatchUpdated(updatedMatch);
      const { saveMatch } = await import('@/lib/supabase/mockStorage');
      await saveMatch(updatedMatch);
    } catch (err) {
      console.error('Logo upload error', err);
    }
  };

  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file, 'backgrounds');
      const updatedMatch: Match = {
        ...match,
        background_type: 'image',
        background_url: url,
        updated_at: new Date().toISOString(),
      };
      if (onMatchUpdated) onMatchUpdated(updatedMatch);
      const { saveMatch } = await import('@/lib/supabase/mockStorage');
      await saveMatch(updatedMatch);
    } catch (err) {
      console.error('BG upload error', err);
    }
  };

  useEffect(() => {
    import('@/lib/supabase/mockStorage').then(({ getSponsors, getLogos }) => {
      getSponsors().then((sps) => setAvailableSponsors(sps));
      getLogos().then((lgs) => setAvailableLogos(lgs));
    });
  }, []);

  // Handle Pick/Ban action from hero selector (old flow)
  const handleSelectHero = async (heroId: string, actionType: 'pick' | 'ban', team?: 'blue' | 'red') => {
    setIsProcessing(true);
    try {
      const res = await executeDraftAction(match.id, heroId, actionType, undefined, team);
      if (!res.success && res.message) {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle direct slot assignment (new slot-click flow)
  const handleDirectAssign = async (heroId: string, team: 'blue' | 'red', type: 'pick' | 'ban', slotIndex: number) => {
    setIsProcessing(true);
    try {
      const res = await executeDraftAction(match.id, heroId, type, slotIndex, team);
      if (!res.success && res.message) {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Undo
  const handleUndo = async () => {
    setIsProcessing(true);
    try {
      await undoLastAction(match.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset
  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const handleExecuteReset = async () => {
    setShowResetModal(false);
    setIsProcessing(true);
    try {
      const res = await resetMatchDraft(match.id);
      if (res.success && res.match && onMatchUpdated) {
        onMatchUpdated(res.match);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Timer controls
  const handleToggleTimer = async () => {
    await updateMatchTimer(match.id, match.timer_seconds, !match.timer_running);
  };

  const handleResetTimer = async () => {
    await updateMatchTimer(match.id, 30, match.timer_running);
  };

  const handleAdjustTimer = async (delta: number) => {
    await updateMatchTimer(match.id, Math.max(0, match.timer_seconds + delta), match.timer_running);
  };

  // Score controls
  const handleScoreChange = async (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      await updateMatchScores(match.id, Math.max(0, match.blue_score + delta), match.red_score);
    } else {
      await updateMatchScores(match.id, match.blue_score, Math.max(0, match.red_score + delta));
    }
  };

  // Swap Sides (Blue <-> Red)
  const handleSwapClick = () => {
    setShowSwapModal(true);
  };

  const handleExecuteSwap = async (resetDraft: boolean) => {
    setShowSwapModal(false);
    setIsProcessing(true);
    try {
      const res = await swapTeamSides(match.id, resetDraft);
      if (res.success && res.match && onMatchUpdated) {
        onMatchUpdated(res.match);
      }
    } catch (e) {
      console.error('Swap sides error', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Phase changer
  const handlePhaseChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateMatchPhase(match.id, e.target.value as MatchPhase);
  };

  return (
    <div className="w-full min-h-screen bg-[#050816] text-white flex flex-col justify-between">
      {/* 1. Broadcast Header Room Bar */}
      <header className="w-full bg-[#0B1020]/95 border-b border-white/10 px-4 py-2.5 sticky top-0 z-40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Left Match info & live status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>LIVE ROOM</span>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
              {match.name}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">
                {match.template_id === 'template-rpl-official' || match.template_id === 'template-half-screen-caster'
                  ? 'RoV Pro League Dock'
                  : match.template?.name || 'Standard 16:9'}
              </span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{match.bo_format || 'BO 3'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold uppercase">{match.background_type || 'transparent'}</span>
              <span>•</span>
              <span className="text-cyan-300 font-bold uppercase">PHASE: {match.current_phase.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Action Buttons -> SETTINGS -> Scores Box -> Timer Control */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleUndo}
            disabled={!match.actions || match.actions.length === 0 || isProcessing}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors disabled:opacity-30 cursor-pointer"
            title="Undo Last Pick/Ban"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={handleResetClick}
            disabled={isProcessing}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-red-500/30 hover:bg-red-950/40 text-red-400 text-xs font-bold transition-colors cursor-pointer"
            title="Reset Match Draft"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
              showLivePreview
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {showLivePreview ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={() => setShowOBSModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>OBS URL</span>
          </button>

          {/* SETTINGS POPUP MODAL BUTTON */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/60 hover:border-amber-400 text-amber-300 font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Open Live Broadcast Settings"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>SETTINGS</span>
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-700/60 hidden md:block mx-0.5" />

          {/* Center Scores (placed after SETTINGS) */}
          <div className="flex items-center gap-3 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-md">
            {/* Blue Score */}
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="text-xs font-mono font-bold uppercase">{match.blue_team?.short_name || 'BLU'}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleScoreChange('blue', -1)}
                  className="w-5 h-5 rounded bg-slate-900 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-950 text-xs cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-lg font-display font-black w-5 text-center">{match.blue_score}</span>
                <button
                  onClick={() => handleScoreChange('blue', 1)}
                  className="w-5 h-5 rounded bg-slate-900 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-950 text-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <span className="text-slate-600 font-black">:</span>

            {/* Swap Button between Scores */}
            <button
              type="button"
              onClick={handleSwapClick}
              className="p-1 rounded-md bg-slate-900 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
              title="สลับฝั่งทีม น้ำเงิน ⇄ แดง"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Red Score */}
            <div className="flex items-center gap-1.5 text-rose-400">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleScoreChange('red', -1)}
                  className="w-5 h-5 rounded bg-slate-900 border border-rose-500/30 flex items-center justify-center hover:bg-rose-950 text-xs cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-lg font-display font-black w-5 text-center">{match.red_score}</span>
                <button
                  onClick={() => handleScoreChange('red', 1)}
                  className="w-5 h-5 rounded bg-slate-900 border border-rose-500/30 flex items-center justify-center hover:bg-rose-950 text-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs font-mono font-bold uppercase">{match.red_team?.short_name || 'RED'}</span>
            </div>
          </div>

          {/* Timer Control Bar (placed together after Scores) */}
          <TimerControl
            seconds={match.timer_seconds}
            isRunning={match.timer_running}
            onTogglePlay={handleToggleTimer}
            onReset={handleResetTimer}
            onAdjustTime={handleAdjustTimer}
          />
        </div>
      </header>

      {/* 2. Main Middle Workspace */}
      <main className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto">
        {/* Live Overlay Preview Canvas (Collapsible) */}
        {showLivePreview && (
          <div className="w-full rounded-2xl bg-black/80 border border-slate-800 p-2.5 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between px-2 pb-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> LIVE BROADCAST PREVIEW (1920 × 1080 MASTER)
              </span>
              <span>OBS BROWSER SOURCE FEED</span>
            </div>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[620px] aspect-video rounded-xl overflow-hidden bg-[#050816] border border-slate-700/60 relative shadow-2xl">
                <OverlayRenderer match={match} heroes={heroes} />
              </div>
            </div>
          </div>
        )}

        {/* Slot Grid Matrix (click slot → pick hero → confirm) */}
        <PickBanControl
          match={match}
          heroes={heroes}
          isCompact={showLivePreview}
          onDirectAssign={handleDirectAssign}
        />
      </main>

      {/* OBS Integration Modal */}
      <OBSInstructions
        matchId={match.id}
        isOpen={showOBSModal}
        onClose={() => setShowOBSModal(false)}
      />

      {/* Sponsor Multi-Select Carousel Modal */}
      {showSponsorModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0f1e] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
                    Sponsor Carousel Management
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Select sponsor brands to automatically rotate on the overlay every 5 seconds.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSponsorModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Selected: <strong className="text-white">{(match.sponsor_ids ?? availableSponsors.map(s => s.id)).length}</strong> / {availableSponsors.length} Brands
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const allIds = availableSponsors.map((s) => s.id);
                    const updatedMatch: Match = {
                      ...match,
                      sponsor_ids: allIds,
                      sponsors_list: availableSponsors,
                      sponsor: availableSponsors[0],
                      updated_at: new Date().toISOString(),
                    };
                    if (onMatchUpdated) onMatchUpdated(updatedMatch);
                    const { saveMatch } = await import('@/lib/supabase/mockStorage');
                    await saveMatch(updatedMatch);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-cyan-500/30"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const updatedMatch: Match = {
                      ...match,
                      sponsor_ids: [],
                      sponsors_list: [],
                      sponsor: undefined,
                      updated_at: new Date().toISOString(),
                    };
                    if (onMatchUpdated) onMatchUpdated(updatedMatch);
                    const { saveMatch } = await import('@/lib/supabase/mockStorage');
                    await saveMatch(updatedMatch);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 border border-rose-500/30"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Sponsor List with Checkboxes */}
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {availableSponsors.map((sp) => {
                const currentSelected = match.sponsor_ids ?? availableSponsors.map((s) => s.id);
                const isSelected = currentSelected.includes(sp.id);

                return (
                  <label
                    key={sp.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-900/80 border-slate-800 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={async () => {
                          let nextIds: string[];
                          if (isSelected) {
                            nextIds = currentSelected.filter((id) => id !== sp.id);
                          } else {
                            nextIds = [...currentSelected, sp.id];
                          }
                          const nextList = availableSponsors.filter((s) => nextIds.includes(s.id));
                          const updatedMatch: Match = {
                            ...match,
                            sponsor_ids: nextIds,
                            sponsors_list: nextList,
                            sponsor: nextList[0],
                            updated_at: new Date().toISOString(),
                          };
                          if (onMatchUpdated) onMatchUpdated(updatedMatch);
                          const { saveMatch } = await import('@/lib/supabase/mockStorage');
                          await saveMatch(updatedMatch);
                        }}
                        className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sp.logo_url}
                        alt={sp.name}
                        className="h-7 max-w-[80px] object-contain rounded"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-wide">
                          {sp.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sp.text || 'OFFICIAL PARTNER'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSponsorModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Save & Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Logo Management Selector */}
      {showLogoModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0f1e] border-2 border-yellow-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
                    Center Tournament Logo Selector
                  </h3>
                  <p className="text-xs text-yellow-300/80">
                    Select a tournament logo or upload a custom PNG emblem to display on the broadcast overlay.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Logo Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {availableLogos.map((lg) => {
                const isSelected = match.game_logo_url === lg.logo_url;
                return (
                  <button
                    key={lg.id}
                    type="button"
                    onClick={async () => {
                      const updatedMatch: Match = {
                        ...match,
                        game_logo_url: lg.logo_url,
                        updated_at: new Date().toISOString(),
                      };
                      if (onMatchUpdated) onMatchUpdated(updatedMatch);
                      const { saveMatch } = await import('@/lib/supabase/mockStorage');
                      await saveMatch(updatedMatch);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="w-full h-14 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lg.logo_url} alt={lg.name} className="h-full object-contain filter drop-shadow" />
                    </div>
                    <span className="text-xs font-bold text-white truncate max-w-full">{lg.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Upload / Custom URL section */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5">
              <label className="text-xs font-mono font-bold text-yellow-400 uppercase">
                Upload Custom Logo Image or Paste URL:
              </label>
              <ImageUploader
                value={match.game_logo_url || ''}
                onChange={async (url) => {
                  const updatedMatch: Match = {
                    ...match,
                    game_logo_url: url || undefined,
                    updated_at: new Date().toISOString(),
                  };
                  if (onMatchUpdated) onMatchUpdated(updatedMatch);
                  const { saveMatch } = await import('@/lib/supabase/mockStorage');
                  await saveMatch(updatedMatch);
                }}
                bucket="logos"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLogoModal(false)}
                className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase cursor-pointer"
              >
                Close Selector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live Broadcast Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  ตั้งค่าการถ่ายทอดสด (Settings)
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Settings Body */}
            <div className="flex flex-col gap-3.5">
              {/* 1. Layout / Template Selector */}
              <div className="p-3.5 rounded-xl bg-[#1e293b] border border-slate-700 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Layout className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. รูปแบบหน้าจอ (Layout)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: '72222222-2222-2222-2222-222222222222', slug: 'rpl-official-dock', name: 'RoV Pro League (RPL)', desc: 'ครึ่งจอล่าง (Official Broadcast Dock)' },
                    { id: '71111111-1111-1111-1111-111111111111', slug: 'standard-16-9', name: 'Standard 16:9 Esports', desc: 'เต็มจอ (Full Screen Overlay)' },
                  ].map((tpl) => {
                    const isSelected =
                      match.template_id === tpl.id ||
                      match.template?.slug === tpl.slug ||
                      match.template?.id === tpl.id ||
                      (tpl.slug === 'rpl-official-dock' && (!match.template_id || match.template_id === 'template-rpl-official' || match.template?.slug === 'half-screen-caster'));
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={async () => {
                          const { saveMatch, getTemplates } = await import('@/lib/supabase/mockStorage');
                          const tpls = await getTemplates();
                          const selectedTpl = tpls.find((t) => t.id === tpl.id || t.slug === tpl.slug) || tpls[0];
                          const updatedMatch: Match = {
                            ...match,
                            template_id: selectedTpl.id,
                            template: selectedTpl,
                            updated_at: new Date().toISOString(),
                          };
                          if (onMatchUpdated) onMatchUpdated(updatedMatch);
                          await saveMatch(updatedMatch);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,217,255,0.3)] ring-1 ring-cyan-400'
                            : 'bg-[#0f172a] border-slate-700 text-slate-200 hover:bg-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {tpl.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-300 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] text-slate-300">
                          {tpl.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. BO Match Format */}
              <div className="p-3.5 rounded-xl bg-[#1e293b] border border-slate-700 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. รูปแบบแมตช์ (Best of)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['BO 1', 'BO 2', 'BO 3', 'BO 5', 'BO 7'].map((bo) => {
                    const isSelected = (match.bo_format || 'BO 3') === bo;
                    return (
                      <button
                        key={bo}
                        type="button"
                        onClick={async () => {
                          const updatedMatch: Match = {
                            ...match,
                            bo_format: bo,
                            updated_at: new Date().toISOString(),
                          };
                          if (onMatchUpdated) onMatchUpdated(updatedMatch);
                          const { saveMatch } = await import('@/lib/supabase/mockStorage');
                          await saveMatch(updatedMatch);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-[#0f172a] text-slate-200 border-slate-700 hover:bg-slate-700/60 hover:text-white'
                        }`}
                      >
                        {bo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Background & Chroma Key Mode */}
              <div className="p-3.5 rounded-xl bg-[#1e293b] border border-slate-700 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. พื้นหลัง (Background)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'transparent', label: 'Transparent (โปร่งใส OBS)' },
                    { id: 'green_screen', label: 'Green Screen (กรีนสกรีน)' },
                    { id: 'gradient', label: 'Dark Gradient (นีออนมืด)' },
                    { id: 'image', label: 'Custom Image (รูปภาพเอง)' },
                  ].map((bg) => {
                    const isSelected = (match.background_type || 'transparent') === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={async () => {
                          const updatedMatch: Match = {
                            ...match,
                            background_type: bg.id as any,
                            updated_at: new Date().toISOString(),
                          };
                          if (onMatchUpdated) onMatchUpdated(updatedMatch);
                          const { saveMatch } = await import('@/lib/supabase/mockStorage');
                          await saveMatch(updatedMatch);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold shadow-sm ring-1 ring-emerald-400'
                            : 'bg-[#0f172a] border-slate-700 text-slate-200 hover:bg-slate-700/60 hover:text-white'
                        }`}
                      >
                        <span>{bg.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>

                {/* Upload BG File button */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปพื้นหลัง</span>
                  </button>
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBgFileUpload}
                    className="hidden"
                  />
                  {match.background_url && (
                    <span className="text-[11px] text-slate-300 truncate max-w-[240px]">
                      {match.background_url}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Center Logo & Sponsors Quick Launch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Logo Section */}
                <div className="p-3 rounded-xl bg-[#1e293b] border border-slate-700 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-yellow-300 font-bold text-xs">
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      <span>โลโก้ตรงกลาง</span>
                    </div>
                    {match.game_logo_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={match.game_logo_url} alt="Logo" className="w-6 h-6 object-contain filter drop-shadow bg-black/40 p-0.5 rounded" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogoModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-yellow-500/60 hover:border-yellow-400 text-yellow-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>เปลี่ยนโลโก้</span>
                  </button>
                </div>

                {/* Sponsors Section */}
                <div className="p-3 rounded-xl bg-[#1e293b] border border-slate-700 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <span>👑</span>
                      <span>สปอนเซอร์</span>
                    </div>
                    <span className="text-[11px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                      {match.sponsor_ids?.length ?? (match.sponsor_id ? 1 : availableSponsors.length)} แบรนด์
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSponsorModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/60 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <span>👑</span>
                    <span>จัดการสปอนเซอร์</span>
                  </button>
                </div>
              </div>

              {/* 5. Swap Sides Tool */}
              <div className="p-3 rounded-xl bg-[#1e293b] border border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>5. สลับฝั่งทีม ({match.blue_team?.short_name || 'BLU'} ⇄ {match.red_team?.short_name || 'RED'})</span>
                </div>
                <button
                  type="button"
                  onClick={handleSwapClick}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>สลับฝั่งทันที</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/80 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg cursor-pointer"
              >
                บันทึกและปิด (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Custom Team Side Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    สลับฝั่งทีม (Swap Team Sides)
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {match.blue_team?.name || 'Blue'} ⇄ {match.red_team?.name || 'Red'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSwapConfirmType(null);
                }}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Team preview banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1e293b] border border-slate-700">
              <div className="flex items-center gap-2.5">
                {match.blue_team?.logo_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={match.blue_team.logo_url} alt="Blue" className="w-8 h-8 object-contain" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-cyan-300">{match.blue_team?.name || 'Blue Team'}</span>
                  <span className="text-[11px] text-cyan-400 font-mono font-semibold">น้ำเงิน → ย้ายไป แดง</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                <ArrowLeftRight className="w-4 h-4" />
              </div>

              <div className="flex items-center gap-2.5 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-rose-300">{match.red_team?.name || 'Red Team'}</span>
                  <span className="text-[11px] text-rose-400 font-mono font-semibold">แดง → ย้ายไป น้ำเงิน</span>
                </div>
                {match.red_team?.logo_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={match.red_team.logo_url} alt="Red" className="w-8 h-8 object-contain" />
                )}
              </div>
            </div>

            {/* Step 1: Option Selector */}
            {swapConfirmType === null ? (
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSwapConfirmType('new_game')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer shadow-lg transition-all"
                >
                  <span className="text-sm font-black">🔄 สลับฝั่ง + เริ่มดราฟต์เกมใหม่</span>
                  <span className="text-xs text-cyan-100 font-normal">ล้างตัวเลือกเดิม เพื่อเริ่มดราฟต์เกมถัดไป</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSwapConfirmType('keep_picks')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <span className="text-sm font-bold">สลับเฉพาะฝั่ง (คงตัวเลือกดราฟต์เดิมไว้)</span>
                  <span className="text-xs text-slate-300 font-normal">กรณีเลือกฝั่งผิดตั้งแต่แรก</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="w-full py-2 text-center text-xs text-slate-400 hover:text-white cursor-pointer mt-1"
                >
                  ยกเลิก (Cancel)
                </button>
              </div>
            ) : (
              /* Step 2: Explicit Confirmation (High Contrast & Clear) */
              <div className="flex flex-col gap-3.5 pt-1 animate-in fade-in duration-150">
                <div className="p-4 rounded-xl bg-[#1e293b] border border-amber-500/50 text-white text-xs space-y-2">
                  <span className="font-bold flex items-center gap-2 text-sm text-amber-300">
                    ⚠️ ยืนยันการสลับฝั่งทีม?
                  </span>
                  <div className="space-y-1 text-slate-200 text-xs leading-relaxed">
                    <p>
                      • <strong>ฝั่งน้ำเงินใหม่:</strong> <span className="text-cyan-300 font-bold">{match.red_team?.name}</span>
                    </p>
                    <p>
                      • <strong>ฝั่งแดงใหม่:</strong> <span className="text-rose-300 font-bold">{match.blue_team?.name}</span>
                    </p>
                    <p>
                      • <strong>รูปแบบ:</strong>{' '}
                      <span className="text-amber-300 font-semibold">
                        {swapConfirmType === 'new_game'
                          ? 'ล้างฮีโร่ที่เลือกเดิม เพื่อเริ่มดราฟต์เกมถัดไป'
                          : 'คงฮีโร่ที่เลือกเดิมไว้ (สลับเฉพาะฝั่ง)'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSwapConfirmType(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    ← ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteSwap(swapConfirmType === 'new_game')}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>ยืนยันสลับฝั่ง</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Custom Reset Draft Modal */}
      {showResetModal && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f172a] border border-rose-500/50 rounded-2xl p-5 shadow-[0_0_50px_rgba(244,63,94,0.2)] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  รีเซ็ตการดราฟต์ (Reset Draft)
                </h3>
                <p className="text-xs text-slate-300">
                  ล้างฮีโร่ที่เลือกและแบนทั้งหมด
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#1e293b] p-3 rounded-xl border border-slate-700 leading-relaxed">
              คุณต้องการล้างข้อมูลการ Pick และ Ban ทั้งหมดในแมตช์นี้เพื่อเริ่มต้นใหม่ใช่หรือไม่?
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg transition-all"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
