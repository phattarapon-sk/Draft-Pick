'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_HEROES, DEFAULT_TEAMS, DEFAULT_THEMES, DEFAULT_TEMPLATES, DEFAULT_SPONSORS, DEFAULT_LOGOS } from '@/config/defaultData';
import {
  Settings,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Check,
  Zap,
  Monitor,
  Shield,
  Clock,
  Music,
  Database,
  Activity,
  Wifi,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Server,
  Globe,
} from 'lucide-react';

export default function SettingsPage() {
  // Audio & Sound FX State
  const [masterVolume, setMasterVolume] = useState(80);
  const [enableSoundFx, setEnableSoundFx] = useState(true);
  const [enableTimerBeep, setEnableTimerBeep] = useState(true);
  const [enableFanfare, setEnableFanfare] = useState(true);

  // Default Match Settings
  const [defaultTimer, setDefaultTimer] = useState(30);
  const [defaultBoFormat, setDefaultBoFormat] = useState('BO 3');
  const [autoAdvancePhase, setAutoAdvancePhase] = useState(true);
  const [requireConfirmPick, setRequireConfirmPick] = useState(true);

  // Performance & OBS Display Settings
  const [targetFps, setTargetFps] = useState('60');
  const [enableGlowEffects, setEnableGlowEffects] = useState(true);
  const [chromaKeyColor, setChromaKeyColor] = useState('#00FF00');

  // Backup & Reset State
  const [resetSuccess, setResetSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Supabase Keep-Alive State
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'checking' | 'active' | 'error' | 'unconfigured'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [pingMessage, setPingMessage] = useState<string>('');
  const [autoPingEnabled, setAutoPingEnabled] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [originUrl, setOriginUrl] = useState<string>('');

  // Load stored settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rov_platform_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.masterVolume !== undefined) setMasterVolume(parsed.masterVolume);
        if (parsed.enableSoundFx !== undefined) setEnableSoundFx(parsed.enableSoundFx);
        if (parsed.enableTimerBeep !== undefined) setEnableTimerBeep(parsed.enableTimerBeep);
        if (parsed.enableFanfare !== undefined) setEnableFanfare(parsed.enableFanfare);
        if (parsed.defaultTimer !== undefined) setDefaultTimer(parsed.defaultTimer);
        if (parsed.defaultBoFormat !== undefined) setDefaultBoFormat(parsed.defaultBoFormat);
        if (parsed.autoAdvancePhase !== undefined) setAutoAdvancePhase(parsed.autoAdvancePhase);
        if (parsed.requireConfirmPick !== undefined) setRequireConfirmPick(parsed.requireConfirmPick);
        if (parsed.targetFps !== undefined) setTargetFps(parsed.targetFps);
        if (parsed.enableGlowEffects !== undefined) setEnableGlowEffects(parsed.enableGlowEffects);
        if (parsed.chromaKeyColor !== undefined) setChromaKeyColor(parsed.chromaKeyColor);
      }

      if (typeof window !== 'undefined') {
        setOriginUrl(window.location.origin);
        const savedAutoPing = localStorage.getItem('rov_supabase_auto_ping');
        if (savedAutoPing !== null) {
          setAutoPingEnabled(savedAutoPing === 'true');
        }
        const savedLastPing = localStorage.getItem('rov_supabase_last_ping');
        if (savedLastPing) {
          setLastPingTime(savedLastPing);
        }
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
  }, []);

  const handlePingSupabase = async () => {
    setSupabaseStatus('checking');
    try {
      const res = await fetch('/api/keep-alive', { method: 'POST', cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.status === 'active') {
        setSupabaseStatus('active');
        setPingLatency(data.durationMs);
        setPingMessage(data.message || 'Database actively responding');
        const nowStr = new Date().toLocaleString('th-TH');
        setLastPingTime(nowStr);
        localStorage.setItem('rov_supabase_last_ping', nowStr);
      } else if (data.status === 'unconfigured') {
        setSupabaseStatus('unconfigured');
        setPingMessage('Supabase ยังไม่ได้ตั้งค่าใน .env (ระบบใช้งานผ่าน LocalStorage ออฟไลน์)');
      } else {
        setSupabaseStatus('error');
        setPingMessage(data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase');
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setPingMessage(err?.message || 'Network connection error');
    }
  };

  // Browser auto-ping interval (every 30 minutes if dashboard tab is open and enabled)
  useEffect(() => {
    if (!autoPingEnabled) return;
    handlePingSupabase();
    const interval = setInterval(() => {
      handlePingSupabase();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoPingEnabled]);

  const handleToggleAutoPing = (enabled: boolean) => {
    setAutoPingEnabled(enabled);
    localStorage.setItem('rov_supabase_auto_ping', String(enabled));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSettings = () => {
    const settingsObj = {
      masterVolume,
      enableSoundFx,
      enableTimerBeep,
      enableFanfare,
      defaultTimer,
      defaultBoFormat,
      autoAdvancePhase,
      requireConfirmPick,
      targetFps,
      enableGlowEffects,
      chromaKeyColor,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('rov_platform_settings', JSON.stringify(settingsObj));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = () => {
    try {
      const exportObj = {
        heroes: JSON.parse(localStorage.getItem('rov_esports_heroes') || JSON.stringify(DEFAULT_HEROES)),
        teams: JSON.parse(localStorage.getItem('rov_esports_teams') || JSON.stringify(DEFAULT_TEAMS)),
        themes: JSON.parse(localStorage.getItem('rov_esports_themes') || JSON.stringify(DEFAULT_THEMES)),
        templates: JSON.parse(localStorage.getItem('rov_esports_templates') || JSON.stringify(DEFAULT_TEMPLATES)),
        sponsors: JSON.parse(localStorage.getItem('rov_esports_sponsors') || JSON.stringify(DEFAULT_SPONSORS)),
        logos: JSON.parse(localStorage.getItem('rov_esports_logos') || JSON.stringify(DEFAULT_LOGOS)),
        matches: JSON.parse(localStorage.getItem('rov_esports_matches') || '[]'),
        exported_at: new Date().toISOString(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `rov-esports-backup-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Failed to export data');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.heroes) localStorage.setItem('rov_esports_heroes', JSON.stringify(parsed.heroes));
        if (parsed.teams) localStorage.setItem('rov_esports_teams', JSON.stringify(parsed.teams));
        if (parsed.themes) localStorage.setItem('rov_esports_themes', JSON.stringify(parsed.themes));
        if (parsed.templates) localStorage.setItem('rov_esports_templates', JSON.stringify(parsed.templates));
        if (parsed.sponsors) localStorage.setItem('rov_esports_sponsors', JSON.stringify(parsed.sponsors));
        if (parsed.logos) localStorage.setItem('rov_esports_logos', JSON.stringify(parsed.logos));
        if (parsed.matches) localStorage.setItem('rov_esports_matches', JSON.stringify(parsed.matches));
        alert('Tournament data backup successfully imported!');
        window.location.reload();
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (!confirm('Are you sure you want to restore default seed data for all teams, heroes, and templates?')) return;
    localStorage.setItem('rov_esports_heroes', JSON.stringify(DEFAULT_HEROES));
    localStorage.setItem('rov_esports_teams', JSON.stringify(DEFAULT_TEAMS));
    localStorage.setItem('rov_esports_themes', JSON.stringify(DEFAULT_THEMES));
    localStorage.setItem('rov_esports_templates', JSON.stringify(DEFAULT_TEMPLATES));
    localStorage.setItem('rov_esports_sponsors', JSON.stringify(DEFAULT_SPONSORS));
    localStorage.setItem('rov_esports_logos', JSON.stringify(DEFAULT_LOGOS));
    localStorage.setItem('rov_esports_matches', JSON.stringify([]));
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <Settings className="w-7 h-7 text-cyan-400" /> Platform & Broadcast Settings
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure broadcast audio, default match rules, OBS rendering parameters, and backup hub
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all cursor-pointer"
        >
          {saveSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <Zap className="w-4 h-4 stroke-[3]" />}
          <span>{saveSuccess ? 'Settings Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Grid Layout of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Broadcast Audio & Sound Effects */}
        <div className="rounded-2xl bg-[#0B1020] border border-slate-800 p-6 space-y-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2.5">
              <Music className="w-5 h-5 text-cyan-400" /> Audio & Sound Effects
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              AUDIO ENGINE
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 font-bold mb-1.5">
                <span>Master Broadcast Volume:</span>
                <span className="text-cyan-400">{masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-bold text-slate-200">Pick & Ban Sound Effects</span>
                <input
                  type="checkbox"
                  checked={enableSoundFx}
                  onChange={(e) => setEnableSoundFx(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-bold text-slate-200">5-Second Countdown Warning Beep</span>
                <input
                  type="checkbox"
                  checked={enableTimerBeep}
                  onChange={(e) => setEnableTimerBeep(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-bold text-slate-200">Draft Complete Fanfare Sound</span>
                <input
                  type="checkbox"
                  checked={enableFanfare}
                  onChange={(e) => setEnableFanfare(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 2. Default Match Engine Rules */}
        <div className="rounded-2xl bg-[#0B1020] border border-slate-800 p-6 space-y-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400" /> Match Engine Defaults
            </h3>
            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
              RULES
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 font-bold uppercase block mb-1.5">
                  Default Draft Timer
                </label>
                <select
                  value={defaultTimer}
                  onChange={(e) => setDefaultTimer(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={15}>15 Seconds (Rapid)</option>
                  <option value={30}>30 Seconds (Standard)</option>
                  <option value={45}>45 Seconds (Extended)</option>
                  <option value={60}>60 Seconds (Pro Classic)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 font-bold uppercase block mb-1.5">
                  Default Best-Of Format
                </label>
                <select
                  value={defaultBoFormat}
                  onChange={(e) => setDefaultBoFormat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="BO 1">BO 1</option>
                  <option value="BO 2">BO 2</option>
                  <option value="BO 3">BO 3 (Official RPL)</option>
                  <option value="BO 5">BO 5 (Playoffs)</option>
                  <option value="BO 7">BO 7 (Grand Finals)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-bold text-slate-200">Auto-Advance Turn on Click</span>
                <input
                  type="checkbox"
                  checked={autoAdvancePhase}
                  onChange={(e) => setAutoAdvancePhase(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-bold text-slate-200">Require Confirmation Before Locking Hero</span>
                <input
                  type="checkbox"
                  checked={requireConfirmPick}
                  onChange={(e) => setRequireConfirmPick(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 3. OBS Display & Rendering Performance */}
        <div className="rounded-2xl bg-[#0B1020] border border-slate-800 p-6 space-y-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2.5">
              <Monitor className="w-5 h-5 text-emerald-400" /> OBS & Display Performance
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              GRAPHICS
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 font-bold uppercase block mb-1.5">
                  Target Framerate (FPS)
                </label>
                <select
                  value={targetFps}
                  onChange={(e) => setTargetFps(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="60">60 FPS (Ultra Smooth)</option>
                  <option value="120">120 FPS (High Refresh Rate)</option>
                  <option value="30">30 FPS (Low CPU Usage)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 font-bold uppercase block mb-1.5">
                  Chroma Key Hex Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={chromaKeyColor}
                    onChange={(e) => setChromaKeyColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={chromaKeyColor}
                    onChange={(e) => setChromaKeyColor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="text-xs font-bold text-slate-200">Cyberpunk Neon Glow & Light Lighting</span>
              <input
                type="checkbox"
                checked={enableGlowEffects}
                onChange={(e) => setEnableGlowEffects(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-400 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 4. Data Backup & Reset Hub */}
        <div className="rounded-2xl bg-[#0B1020] border border-slate-800 p-6 space-y-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-purple-400" /> Data Backup & Restore Hub
            </h3>
            <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/30">
              BACKUP
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs uppercase transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (.JSON)</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import Backup</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-red-500/40 hover:bg-red-950/60 text-red-400 font-bold text-xs uppercase transition-all cursor-pointer"
              >
                {resetSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <RotateCcw className="w-4 h-4" />}
                <span>{resetSuccess ? 'Default Seed Restored!' : 'Reset All Local Mock Database'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Supabase Anti-Sleep & Keep-Alive System */}
        <div className="md:col-span-2 rounded-2xl bg-[#0B1020] border border-emerald-500/30 p-6 space-y-6 shadow-[0_0_30px_rgba(16,185,129,0.08)] relative overflow-hidden group">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  Supabase Anti-Sleep & Keep-Alive System
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ระบบป้องกันฐานข้อมูล Supabase Free Tier หยุดทำงาน (Auto-Pause) เมื่อไม่มีการใช้งานเกิน 7 วัน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> 24/7 ANTI-PAUSE SHIELD
              </span>
            </div>
          </div>

          {/* Live Status & Ping Control Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Indicator */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                สถานะการเชื่อมต่อ (Status)
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  supabaseStatus === 'active' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' :
                  supabaseStatus === 'checking' ? 'bg-amber-400 animate-ping' :
                  supabaseStatus === 'error' ? 'bg-red-400' :
                  supabaseStatus === 'unconfigured' ? 'bg-slate-500' :
                  'bg-emerald-400/60'
                }`} />
                <span className="text-sm font-black text-white">
                  {supabaseStatus === 'active' && 'Active (ฐานข้อมูลออนไลน์)'}
                  {supabaseStatus === 'checking' && 'กำลังยิง Ping...'}
                  {supabaseStatus === 'error' && 'พบข้อผิดพลาด'}
                  {supabaseStatus === 'unconfigured' && 'Offline / LocalStorage Mode'}
                  {supabaseStatus === 'idle' && 'พร้อมทำงาน (Standby)'}
                </span>
              </div>
              {pingLatency !== null && (
                <div className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Latency: {pingLatency}ms
                </div>
              )}
            </div>

            {/* Last Ping Timestamp */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                ส่งสัญญาณกระตุ้นล่าสุด (Last Ping)
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {lastPingTime || 'ยังไม่มีการทดสอบในรอบนี้'}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500 font-mono truncate">
                {pingMessage || 'ส่งสัญญาณเพื่อรีเซ็ต Inactivity Timer'}
              </p>
            </div>

            {/* Manual Ping Action Button */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center">
              <button
                onClick={handlePingSupabase}
                disabled={supabaseStatus === 'checking'}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${supabaseStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>{supabaseStatus === 'checking' ? 'Pinging Supabase...' : 'Ping Supabase Now (ยิงกระตุ้นทันที)'}</span>
              </button>
            </div>
          </div>

          {/* 3 Protection Strategies */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> ช่องทางการป้องกัน Supabase ดับ 3 ระดับ
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Method 1: GitHub Actions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-cyan-400" /> 1. GitHub Actions
                  </span>
                  <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/50">
                    แนะนำ (ฟรี 100%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ตั้งเวลาผ่าน Cloud อัตโนมัติทุกๆ 3 วัน ไม่ต้องเปิดคอมหรือเว็บไซต์ทิ้งไว้ ติดตั้งไฟล์ <code className="text-cyan-300 font-mono text-[10px]">.github/workflows/supabase-keepalive.yml</code> ให้เรียบร้อยแล้ว
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => copyToClipboard('npm run keep-alive', 'npm-script')}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
                  >
                    <span>npm run keep-alive</span>
                    {copiedKey === 'npm-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Method 2: Browser Auto-Ping */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> 2. Browser Auto-Ping
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/50">
                    อัตโนมัติในแท็บนี้
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  เมื่อเปิดหน้า Dashboard แท็บนี้ทิ้งไว้ ระบบจะส่งสัญญาณ Ping อัตโนมัติทุกๆ 30 นาทีเพื่อกระตุ้น Database
                </p>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-300">เปิด Auto-Ping ในแท็บนี้</span>
                  <input
                    type="checkbox"
                    checked={autoPingEnabled}
                    onChange={(e) => handleToggleAutoPing(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-400 cursor-pointer"
                  />
                </label>
              </div>

              {/* Method 3: External Cron Job */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-400" /> 3. External Cron Job
                  </span>
                  <span className="text-[9px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50">
                    cron-job.org / Vercel
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  มี API Route <code className="text-purple-300 font-mono text-[10px]">/api/keep-alive</code> พร้อมใช้ สามารถนำ URL ไปใส่ในเว็บฟรี เช่น cron-job.org หรือ UptimeRobot
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => copyToClipboard(`${originUrl || 'https://your-domain.com'}/api/keep-alive`, 'api-url')}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500/50 text-[11px] font-mono text-purple-300 transition-all cursor-pointer truncate"
                  >
                    <span className="truncate">/api/keep-alive</span>
                    {copiedKey === 'api-url' ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
