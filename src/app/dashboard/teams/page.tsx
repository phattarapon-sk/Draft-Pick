'use client';

import React, { useEffect, useState } from 'react';
import { getTeams, saveTeam, deleteTeam } from '@/lib/supabase/mockStorage';
import { Team } from '@/types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { Users, Plus, Edit2, Trash2, Check, X, Shield, Loader2 } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleUploadStateChange = (isUploading: boolean) => {
    setUploadingCount((prev) => Math.max(0, prev + (isUploading ? 1 : -1)));
  };

  const fetchTeams = async () => {
    const list = await getTeams();
    setTeams(list);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenNew = () => {
    setUploadingCount(0);
    setEditingTeam({
      id: `team-${Date.now()}`,
      name: '',
      short_name: '',
      logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=NewTeam&backgroundColor=0284c7',
      primary_color: '#00D9FF',
      secondary_color: '#041628',
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editingTeam.name || !editingTeam.short_name) return;
    if (uploadingCount > 0) {
      alert('กรุณารอรูปภาพอัปโหลดให้เสร็จสิ้นก่อนทำการบันทึก');
      return;
    }

    setIsSaving(true);
    try {
      await saveTeam(editingTeam);
      await fetchTeams();
      setEditingTeam(null);
      setUploadingCount(0);
      setIsNew(false);
    } catch (err) {
      console.error('Save team error', err);
      alert('บันทึกข้อมูลทีมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    await deleteTeam(id);
    await fetchTeams();
  };

  return (
    <>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <Users className="w-7 h-7 text-cyan-400" /> Pro Esports Team Management
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage tournament teams, broadcast logos, brand colors, and team tags
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-2xl bg-[#0B1020] border border-slate-800 hover:border-cyan-500/40 p-5 shadow-xl transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
          >
            {/* Top Color Accent Bar */}
            <div
              className="absolute top-0 inset-x-0 h-1.5"
              style={{ backgroundColor: team.primary_color }}
            />

            <div className="flex items-center gap-4">
              {/* Team Logo */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center p-2 border shadow-lg overflow-hidden bg-black/60"
                style={{
                  borderColor: `${team.primary_color}60`,
                  boxShadow: `0 0 20px ${team.primary_color}30`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>

              <div>
                <span
                  className="text-xs font-mono font-bold tracking-widest uppercase"
                  style={{ color: team.primary_color }}
                >
                  TAG: {team.short_name}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wide truncate">
                  {team.name}
                </h3>
              </div>
            </div>

            {/* Colors Preview & Actions */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow"
                  style={{ backgroundColor: team.primary_color }}
                  title={`Primary: ${team.primary_color}`}
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow"
                  style={{ backgroundColor: team.secondary_color }}
                  title={`Secondary: ${team.secondary_color}`}
                />
                <span className="text-[10px] font-mono text-slate-400">Team Theme</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditingTeam(team);
                    setIsNew(false);
                  }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/60 text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* Edit / Create Team Modal (Full viewport coverage) */}
      {editingTeam && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0B1020] border-2 border-cyan-500/40 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black uppercase text-white font-display tracking-wide">
                  {isNew ? 'Register New Esports Team' : `Edit Team: ${editingTeam.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
              {/* Left Column: Team Identity (Name, Tag, Logo, Colors) */}
              <div className="w-full md:w-80 flex-shrink-0 space-y-4 overflow-y-auto pr-1">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase block tracking-wider">
                  1. Team Details & Branding
                </span>

                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    placeholder="e.g. Talon Esports"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase block mb-1">
                    Short Tag (Max 5 chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={editingTeam.short_name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, short_name: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white uppercase focus:outline-none focus:border-cyan-400 font-mono"
                    placeholder="e.g. TLN"
                  />
                </div>

                <ImageUploader
                  label="Team Logo Artwork *"
                  value={editingTeam.logo_url}
                  onChange={(url) => setEditingTeam((prev) => (prev ? { ...prev, logo_url: url } : null))}
                  onUploadingChange={handleUploadStateChange}
                  bucket="teams"
                />

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Primary Color</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={editingTeam.primary_color}
                        onChange={(e) => setEditingTeam((prev) => (prev ? { ...prev, primary_color: e.target.value } : null))}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{editingTeam.primary_color}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 uppercase block mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={editingTeam.secondary_color}
                        onChange={(e) => setEditingTeam((prev) => (prev ? { ...prev, secondary_color: e.target.value } : null))}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-300">{editingTeam.secondary_color}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Player Roster & Card Background Photos (P1 - P5) */}
              <div className="flex-1 flex flex-col min-w-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                      2. Player Roster & Card Background Photos (P1 - P5)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Set player IGN & upload individual card background photo
                    </span>
                  </div>

                  {/* Team-wide Player Background Opacity Slider */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap">BG OPACITY:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={editingTeam.bg_opacity ?? 75}
                      onChange={(e) => setEditingTeam((prev) => (prev ? { ...prev, bg_opacity: Number(e.target.value) } : null))}
                      className="w-20 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-black text-white w-8 text-right">
                      {editingTeam.bg_opacity ?? 75}%
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const roster = editingTeam.player_roster || [
                      { name: editingTeam.players?.[0] || 'Player 1' },
                      { name: editingTeam.players?.[1] || 'Player 2' },
                      { name: editingTeam.players?.[2] || 'Player 3' },
                      { name: editingTeam.players?.[3] || 'Player 4' },
                      { name: editingTeam.players?.[4] || 'Player 5' },
                    ];
                    const player = roster[i] || { name: `Player ${i + 1}` };

                    return (
                      <div
                        key={`p-roster-input-wide-${i}`}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                            P{i + 1}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={player.name || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingTeam((prev) => {
                                  if (!prev) return null;
                                  const currentRoster = prev.player_roster || [
                                    { name: prev.players?.[0] || 'Player 1' },
                                    { name: prev.players?.[1] || 'Player 2' },
                                    { name: prev.players?.[2] || 'Player 3' },
                                    { name: prev.players?.[3] || 'Player 4' },
                                    { name: prev.players?.[4] || 'Player 5' },
                                  ];
                                  const newRoster = [...currentRoster];
                                  newRoster[i] = { ...newRoster[i], name: val };
                                  return {
                                    ...prev,
                                    players: newRoster.map((p) => p.name),
                                    player_roster: newRoster,
                                  };
                                });
                              }}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                              placeholder={`Player ${i + 1} IGN`}
                            />
                          </div>
                        </div>

                        <ImageUploader
                          label={`P${i + 1} Player Card Background Photo`}
                          value={player.photo_url || ''}
                          onChange={(url) => {
                            setEditingTeam((prev) => {
                              if (!prev) return null;
                              const currentRoster = prev.player_roster || [
                                { name: prev.players?.[0] || 'Player 1' },
                                { name: prev.players?.[1] || 'Player 2' },
                                { name: prev.players?.[2] || 'Player 3' },
                                { name: prev.players?.[3] || 'Player 4' },
                                { name: prev.players?.[4] || 'Player 5' },
                              ];
                              const newRoster = [...currentRoster];
                              newRoster[i] = { ...newRoster[i], photo_url: url };
                              return {
                                ...prev,
                                player_roster: newRoster,
                              };
                            });
                          }}
                          onUploadingChange={handleUploadStateChange}
                          placeholder="https://... or upload custom player background image"
                          bucket="teams"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Submit / Cancel Footer Buttons */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 mt-auto">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setEditingTeam(null);
                      setUploadingCount(0);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || uploadingCount > 0}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Saving...</span>
                      </>
                    ) : uploadingCount > 0 ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>กำลังอัปโหลดรูปภาพ ({uploadingCount} ไฟล์)...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Team & Roster</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
