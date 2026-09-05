'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTeams, getTemplates, getThemes, getSponsors, saveMatch } from '@/lib/supabase/mockStorage';
import { Team, Template, Theme, Sponsor, Match, BackgroundType } from '@/types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { Swords, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateMatchPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Form State
  const [name, setName] = useState('RoV Championship Series 2026 - Match 1');
  const [blueTeamId, setBlueTeamId] = useState('');
  const [redTeamId, setRedTeamId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [themeId, setThemeId] = useState('');
  const [bgType, setBgType] = useState<BackgroundType>('transparent');
  const [boFormat, setBoFormat] = useState('BO 3');
  const [bgUrl, setBgUrl] = useState('');
  const [gameLogoUrl, setGameLogoUrl] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleUploadStateChange = (isUploading: boolean) => {
    setUploadingCount((prev) => Math.max(0, prev + (isUploading ? 1 : -1)));
  };

  useEffect(() => {
    Promise.all([getTeams(), getTemplates(), getThemes(), getSponsors()]).then(
      ([t, tp, th, sp]) => {
        setTeams(t);
        setTemplates(tp);
        setThemes(th);
        setSponsors(sp);

        if (t.length >= 2) {
          setBlueTeamId(t[0].id);
          setRedTeamId(t[1].id);
        }
        if (tp.length > 0) {
          // Default to RoV Pro League official half-screen template
          const rplOfficial = tp.find((tpl) => tpl.id === 'template-rpl-official' || tpl.slug === 'rpl-official');
          setTemplateId(rplOfficial ? rplOfficial.id : tp[0].id);
        }
        if (th.length > 0) setThemeId(th[0].id);
        if (sp.length > 0) {
          setSponsorId(sp[0].id);
          // By default, select all registered sponsors so they automatically rotate on the overlay
          setSelectedSponsorIds(sp.map((s) => s.id));
        }
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !blueTeamId || !redTeamId || !templateId) {
      alert('Please complete all required fields.');
      return;
    }
    if (uploadingCount > 0) {
      alert('กรุณารอรูปภาพอัปโหลดให้เสร็จสิ้นก่อนสร้างการแข่งขัน');
      return;
    }

    if (blueTeamId === redTeamId) {
      alert('Blue Team and Red Team cannot be the same!');
      return;
    }

    setIsSubmitting(true);
    try {
      const newMatchId = `match-${Date.now()}`;
      const newMatch: Match = {
        id: newMatchId,
        name,
        blue_team_id: blueTeamId,
        red_team_id: redTeamId,
        blue_score: 0,
        red_score: 0,
        status: 'waiting',
        current_phase: 'WAITING',
        current_turn: 'blue',
        timer_seconds: 30,
        timer_running: false,
        bo_format: boFormat,
        template_id: templateId,
        theme_id: themeId || '72222222-2222-2222-2222-222222222222',
        background_type: bgType,
        background_url: bgUrl || undefined,
        game_logo_url: gameLogoUrl || undefined,
        sponsor_id: selectedSponsorIds[0] || sponsorId || undefined,
        sponsor_ids: selectedSponsorIds,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actions: [],
      };

      await saveMatch(newMatch);
      router.push(`/dashboard/matches/${newMatchId}/control`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" /> Create Tournament Match
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure broadcast draft room, select teams, template, and theme
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#0B1020] border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Match Name */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Match Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            placeholder="e.g. RoV Pro League Finals - Game 1"
          />
        </div>

        {/* Team Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Blue Team */}
          <div className="space-y-2 p-4 rounded-xl bg-[#041628]/60 border border-cyan-500/30">
            <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Blue Team (First Pick/Ban) *
            </label>
            <select
              value={blueTeamId}
              onChange={(e) => setBlueTeamId(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.short_name})
                </option>
              ))}
            </select>
          </div>

          {/* Red Team */}
          <div className="space-y-2 p-4 rounded-xl bg-[#1A0612]/60 border border-rose-500/30">
            <label className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
              Red Team (Second Pick/Ban) *
            </label>
            <select
              value={redTeamId}
              onChange={(e) => setRedTeamId(e.target.value)}
              className="w-full bg-slate-900 border border-rose-500/40 rounded-xl px-4 py-2.5 text-sm text-rose-200 focus:outline-none focus:border-rose-400"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.short_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template & Match Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Broadcast Layout Template *
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {templates.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Match Format (BO) *
            </label>
            <select
              value={boFormat}
              onChange={(e) => setBoFormat(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-cyan-400"
            >
              <option value="BO 1">Best of 1 (BO 1)</option>
              <option value="BO 2">Best of 2 (BO 2)</option>
              <option value="BO 3">Best of 3 (BO 3)</option>
              <option value="BO 5">Best of 5 (BO 5)</option>
              <option value="BO 7">Best of 7 (BO 7)</option>
            </select>
          </div>
        </div>

        {/* Background Mode */}
        <div className="pt-2">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
            Background Mode
          </label>
          <select
            value={bgType}
            onChange={(e) => setBgType(e.target.value as BackgroundType)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="transparent">Transparent (OBS Overlay - Transparent Background)</option>
            <option value="green_screen">Green Screen (Chroma Key Background)</option>
            <option value="gradient">Esports Dynamic Gradient</option>
            <option value="image">Custom Image URL</option>
            <option value="video">Custom Video Loop (MP4 / WebM)</option>
          </select>

          {(bgType === 'image' || bgType === 'video') && (
            <ImageUploader
              value={bgUrl}
              onChange={setBgUrl}
              onUploadingChange={handleUploadStateChange}
              placeholder="https://... URL or upload background file"
              bucket="backgrounds"
              className="mt-2"
            />
          )}
        </div>

        {/* Sponsor Showcase Multi-Select Carousel (Compact Chips) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Sponsor Showcase
              </label>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                เลือกแล้ว {selectedSponsorIds.length} / {sponsors.length} แบรนด์ (สลับทุก 3 วิ)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSponsorIds(sponsors.map((s) => s.id))}
                className="px-2 py-0.5 text-[10px] rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition-all font-mono font-bold"
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setSelectedSponsorIds([])}
                className="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all font-mono"
              >
                ล้าง
              </button>
            </div>
          </div>

          {sponsors.length === 0 ? (
            <div className="py-2.5 px-3 rounded-lg border border-dashed border-slate-800 bg-slate-900/40 text-center text-xs text-slate-400">
              ยังไม่มีข้อมูลสปอนเซอร์ในระบบ (สามารถเพิ่มได้ที่เมนู Sponsors ด้านซ้าย)
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sponsors.map((sp) => {
                const isSelected = selectedSponsorIds.includes(sp.id);
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setSelectedSponsorIds((prev) =>
                        isSelected ? prev.filter((id) => id !== sp.id) : [...prev, sp.id]
                      );
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 text-left transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-400/70 text-amber-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] font-black shrink-0 ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'border-slate-600 bg-slate-800 text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                    {sp.logo_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sp.logo_url}
                        alt={sp.name}
                        className="w-5 h-5 object-contain filter drop-shadow rounded bg-black/40 p-0.5 shrink-0"
                      />
                    )}
                    <span className="text-xs font-semibold truncate text-white">
                      {sp.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center Tournament Logo */}
        <ImageUploader
          label="Center Tournament / Game Logo (Optional)"
          value={gameLogoUrl}
          onChange={setGameLogoUrl}
          onUploadingChange={handleUploadStateChange}
          placeholder="https://... (Leave empty for default RoV Official Logo)"
          bucket="logos"
        />

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || uploadingCount > 0}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm uppercase shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Creating...</span>
              </>
            ) : uploadingCount > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>กำลังอัปโหลดรูปภาพ ({uploadingCount} ไฟล์)...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Create & Launch Match</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
