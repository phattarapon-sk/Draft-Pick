'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getMatches, getHeroes, getTeams, getTemplates, deleteMatch } from '@/lib/supabase/mockStorage';
import { Match, Hero, Team, Template } from '@/types';
import {
  Swords,
  Video,
  Play,
  Plus,
  Radio,
  Shield,
  Users,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'waiting' | 'in_progress' | 'completed'>('ALL');
  const [deleteConfirmMatch, setDeleteConfirmMatch] = useState<Match | null>(null);

  const fetchAllData = () => {
    Promise.all([getMatches(), getHeroes(), getTeams(), getTemplates()]).then(
      ([m, h, t, tp]) => {
        setMatches(m);
        setHeroes(h);
        setTeams(t);
        setTemplates(tp);
      }
    );
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const copyOBSUrl = (matchId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/overlay/${matchId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(matchId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMatch = async (matchId: string) => {
    await deleteMatch(matchId);
    setDeleteConfirmMatch(null);
    fetchAllData();
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        (m.blue_team?.name && m.blue_team.name.toLowerCase().includes(search.toLowerCase())) ||
        (m.red_team?.name && m.red_team.name.toLowerCase().includes(search.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === 'waiting') matchStatus = m.status === 'waiting';
      else if (statusFilter === 'in_progress') matchStatus = m.status === 'pick_phase' || m.status === 'ban_phase';
      else if (statusFilter === 'completed') matchStatus = m.status === 'completed';

      return matchSearch && matchStatus;
    });
  }, [matches, search, statusFilter]);

  return (
    <>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <Swords className="w-7 h-7 text-cyan-400" /> Esports Match Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            จัดการห้องแมตช์การแข่งขัน, ควบคุมการดราฟต์ฮีโร่แบบเรียลไทม์ และเปิด Overlay สำหรับ OBS
          </p>
        </div>

        <Link
          href="/dashboard/matches/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>สร้างห้องแข่งขันใหม่ (New Match)</span>
        </Link>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0B1020] border border-cyan-500/20 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-mono font-bold uppercase">ห้องแมตช์ทั้งหมด</span>
            <Radio className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{matches.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1020] border border-rose-500/20 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-mono font-bold uppercase">ฮีโร่ที่พร้อมดราฟต์</span>
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{heroes.filter((h) => h.is_active).length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1020] border border-emerald-500/20 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-mono font-bold uppercase">ทีมที่ลงทะเบียน</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{teams.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1020] border border-amber-500/20 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-mono font-bold uppercase">เทมเพลต Overlay</span>
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-white">{templates.length}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาห้องแมตช์ หรือชื่อทีม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B1020] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-cyan-500 text-black font-black shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            ทั้งหมด ({matches.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-red-500 text-white font-black shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            กำลังแข่งขัน ({matches.filter((m) => m.status === 'pick_phase' || m.status === 'ban_phase').length})
          </button>
          <button
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'waiting'
                ? 'bg-amber-400 text-black font-black shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            รอเริ่ม ({matches.filter((m) => m.status === 'waiting').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-500 text-black font-black shadow'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            จบแล้ว ({matches.filter((m) => m.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs rounded-2xl bg-[#0B1020] border border-slate-800">
            ไม่พบห้องแมตช์ที่ตรงกับเงื่อนไข
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isWaiting = match.status === 'waiting';
            const isCompleted = match.status === 'completed';

            return (
              <div
                key={match.id}
                className="rounded-2xl bg-[#0B1020] border border-slate-800 hover:border-cyan-500/40 p-4 sm:p-5 shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
              >
                {/* Match Title & Teams */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                        isCompleted
                          ? 'bg-slate-900 text-slate-400 border-slate-700'
                          : isWaiting
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          : 'bg-red-950/80 text-red-300 border-red-500/40 animate-pulse'
                      }`}
                    >
                      {match.status === 'completed' ? 'จบการแข่งขัน' : match.status === 'waiting' ? 'รอเริ่มดราฟต์' : 'กำลังดราฟต์'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">ID: {match.id}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                    {match.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
                    <span className="text-cyan-400">{match.blue_team?.name || 'Blue Team'}</span>
                    <span className="text-slate-500 font-mono">VS</span>
                    <span className="text-rose-400">{match.red_team?.name || 'Red Team'}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300 font-mono font-bold">สกอร์: {match.blue_score} - {match.red_score}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono text-[11px]">{match.bo_format || 'BO 3'}</span>
                  </div>
                </div>

                {/* Actions: Control Room, View Overlay, OBS URL, DELETE */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <Link
                    href={`/dashboard/matches/${match.id}/control`}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase shadow-[0_0_12px_rgba(0,217,255,0.3)] transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Control Room</span>
                  </Link>

                  <Link
                    href={`/overlay/${match.id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Overlay</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>

                  <button
                    onClick={() => copyOBSUrl(match.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    title="คัดลอก OBS Browser Source URL"
                  >
                    {copiedId === match.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === match.id ? 'Copied' : 'OBS URL'}</span>
                  </button>

                  {/* Dedicated Delete Button */}
                  <button
                    onClick={() => setDeleteConfirmMatch(match)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/70 text-red-400 border border-slate-700 hover:border-red-500/60 transition-colors cursor-pointer"
                    title="ลบห้องแข่งขันนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

      {/* Delete Confirmation Modal (Full viewport coverage) */}
      {deleteConfirmMatch && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0f172a] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 font-sans">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ลบห้องแข่งขัน?</h3>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">{deleteConfirmMatch.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบห้องแข่งขันนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setDeleteConfirmMatch(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMatch(deleteConfirmMatch.id)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-lg transition-all cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
