'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getLogos, saveLogo, deleteLogo } from '@/lib/supabase/mockStorage';
import { GameLogo } from '@/types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { Trophy, Plus, Edit2, Trash2, Check, X, Search } from 'lucide-react';

export default function LogosPage() {
  const [logos, setLogos] = useState<GameLogo[]>([]);
  const [search, setSearch] = useState('');
  const [editingLogo, setEditingLogo] = useState<GameLogo | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchLogos = async () => {
    const list = await getLogos();
    setLogos(list);
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const filteredLogos = useMemo(() => {
    return logos.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [logos, search]);

  const handleOpenNew = () => {
    setEditingLogo({
      id: `logo-${Date.now()}`,
      name: '',
      logo_url: '',
      is_default: false,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo || !editingLogo.name || !editingLogo.logo_url) return;

    await saveLogo(editingLogo);
    await fetchLogos();
    setEditingLogo(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโลโก้นี้?')) return;
    await deleteLogo(id);
    await fetchLogos();
  };

  return (
    <>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" /> Tournament Logos & Crests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            จัดการรูปภาพโลโก้การแข่งขันและตราสัญลักษณ์ตรงกลางจอถ่ายทอดสด
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>เพิ่มโลโก้ใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาโลโก้..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B1020] border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          ทั้งหมด: <span className="text-amber-400 font-bold">{filteredLogos.length}</span> รายการ
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1020] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-300">
                <th className="py-3.5 px-4 w-24">ภาพตัวอย่าง</th>
                <th className="py-3.5 px-4">ชื่อโลโก้</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4">รหัสอ้างอิง (ID)</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm font-medium">
              {filteredLogos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลโลโก้
                  </td>
                </tr>
              ) : (
                filteredLogos.map((lg) => (
                  <tr
                    key={lg.id}
                    onClick={() => {
                      setEditingLogo(lg);
                      setIsNew(false);
                    }}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-14 h-12 rounded-xl bg-black/80 border border-slate-800 flex items-center justify-center p-1.5 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={lg.logo_url}
                          alt={lg.name}
                          className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </td>

                    {/* Logo Name */}
                    <td className="py-3 px-4 font-bold text-white">
                      {lg.name}
                    </td>

                    {/* Type / Tag */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          lg.is_default
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                            : 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30'
                        }`}
                      >
                        {lg.is_default ? '⭐ โลโก้หลัก (Default)' : 'ตราสัญลักษณ์ (Crest)'}
                      </span>
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {lg.id}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingLogo(lg);
                            setIsNew(false);
                          }}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors border border-slate-700 hover:border-amber-400 cursor-pointer"
                          title="แก้ไขโลโก้"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lg.id)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/70 text-red-400 transition-colors border border-slate-700 hover:border-red-500 cursor-pointer"
                          title="ลบโลโก้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Edit / Create Fullscreen Backdrop Modal (Full viewport coverage) */}
      {editingLogo && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{isNew ? 'เพิ่มโลโก้ใหม่' : `แก้ไขโลโก้: ${editingLogo.name}`}</span>
              </h3>
              <button
                onClick={() => setEditingLogo(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  ชื่อโลโก้ *
                </label>
                <input
                  type="text"
                  required
                  value={editingLogo.name}
                  onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold"
                  placeholder="เช่น RoV Pro League 2026, Arena of Valor..."
                />
              </div>

              <ImageUploader
                label="รูปภาพโลโก้ (PNG โปร่งใส / SVG / GIF) *"
                value={editingLogo.logo_url}
                onChange={(url) => setEditingLogo({ ...editingLogo, logo_url: url })}
                bucket="logos"
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="logo-default"
                  checked={editingLogo.is_default || false}
                  onChange={(e) => setEditingLogo({ ...editingLogo, is_default: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#1e293b] border-slate-600 text-amber-400 cursor-pointer"
                />
                <label htmlFor="logo-default" className="text-xs font-medium text-slate-200 cursor-pointer">
                  ตั้งเป็นโลโก้หลักของการแข่งขัน (Default Logo)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLogo(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>บันทึกโลโก้</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
