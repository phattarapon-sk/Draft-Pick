'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getSponsors, saveSponsor, deleteSponsor } from '@/lib/supabase/mockStorage';
import { Sponsor } from '@/types';
import { ImageUploader } from '@/components/common/ImageUploader';
import { DollarSign, Plus, Edit2, Trash2, Check, X, Search, Globe, Loader2 } from 'lucide-react';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [search, setSearch] = useState('');
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleUploadStateChange = (isUploading: boolean) => {
    setUploadingCount((prev) => Math.max(0, prev + (isUploading ? 1 : -1)));
  };

  const fetchSponsors = async () => {
    const list = await getSponsors();
    setSponsors(list);
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const filteredSponsors = useMemo(() => {
    return sponsors.filter(
      (sp) =>
        sp.name.toLowerCase().includes(search.toLowerCase()) ||
        (sp.text && sp.text.toLowerCase().includes(search.toLowerCase()))
    );
  }, [sponsors, search]);

  const handleOpenNew = () => {
    setUploadingCount(0);
    setEditingSponsor({
      id: `sponsor-${Date.now()}`,
      name: '',
      logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=NewSponsor&backgroundColor=0284c7',
      text: 'OFFICIAL TOURNAMENT PARTNER',
      url: '',
      is_active: true,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor || !editingSponsor.name) return;
    if (uploadingCount > 0) {
      alert('กรุณารอรูปภาพอัปโหลดให้เสร็จสิ้นก่อนทำการบันทึก');
      return;
    }

    setIsSaving(true);
    try {
      await saveSponsor(editingSponsor);
      await fetchSponsors();
      setEditingSponsor(null);
      setUploadingCount(0);
      setIsNew(false);
    } catch (err) {
      console.error('Save sponsor error', err);
      alert('บันทึกสปอนเซอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสปอนเซอร์นี้?')) return;
    await deleteSponsor(id);
    await fetchSponsors();
  };

  const handleToggleActive = async (sp: Sponsor) => {
    await saveSponsor({ ...sp, is_active: !sp.is_active });
    await fetchSponsors();
  };

  return (
    <>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wider flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-cyan-400" /> Sponsors & Tournament Partners
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            จัดการรายชื่อผู้สนับสนุนและโลโก้ในแถบสปอนเซอร์หมุนเวียน (Sponsor Carousel)
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>เพิ่มสปอนเซอร์ใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาผู้สนับสนุน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B1020] border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          ทั้งหมด: <span className="text-cyan-400 font-bold">{filteredSponsors.length}</span> รายการ
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0B1020] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-300">
                <th className="py-3.5 px-4 w-24">โลโก้</th>
                <th className="py-3.5 px-4">ชื่อแบรนด์ / สปอนเซอร์</th>
                <th className="py-3.5 px-4">คำโปรโมท</th>
                <th className="py-3.5 px-4">เว็บไซต์</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm font-medium">
              {filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลผู้สนับสนุน
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sp) => (
                  <tr
                    key={sp.id}
                    onClick={() => {
                      setEditingSponsor(sp);
                      setIsNew(false);
                    }}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-14 h-12 rounded-xl bg-black/80 border border-slate-800 flex items-center justify-center p-1.5 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.logo_url}
                          alt={sp.name}
                          className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </td>

                    {/* Sponsor Name */}
                    <td className="py-3 px-4 font-bold text-white">
                      {sp.name}
                    </td>

                    {/* Promo text */}
                    <td className="py-3 px-4 text-xs text-slate-300 truncate max-w-xs">
                      {sp.text || '-'}
                    </td>

                    {/* Website */}
                    <td className="py-3 px-4 text-xs">
                      {sp.url ? (
                        <a
                          href={sp.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{sp.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Active Switch */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleActive(sp)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          sp.is_active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {sp.is_active ? '✓ แสดงบนจอ' : '✕ ซ่อน'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingSponsor(sp);
                            setIsNew(false);
                          }}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors border border-slate-700 hover:border-cyan-400 cursor-pointer"
                          title="แก้ไขข้อมูลสปอนเซอร์"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sp.id)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/70 text-red-400 transition-colors border border-slate-700 hover:border-red-500 cursor-pointer"
                          title="ลบสปอนเซอร์"
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

      {/* Edit / Create Fullscreen Modal (Full viewport coverage) */}
      {editingSponsor && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'เพิ่มสปอนเซอร์ใหม่' : `แก้ไขสปอนเซอร์: ${editingSponsor.name}`}</span>
              </h3>
              <button
                onClick={() => setEditingSponsor(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  ชื่อแบรนด์ / ผู้สนับสนุน *
                </label>
                <input
                  type="text"
                  required
                  value={editingSponsor.name}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  placeholder="เช่น ShopeePay, Realme, True 5G..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  สโลแกนหรือคำโปรโมท (Promo Text)
                </label>
                <input
                  type="text"
                  value={editingSponsor.text || ''}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, text: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  placeholder="เช่น OFFICIAL PAYMENT PARTNER"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  ลิงก์เว็บไซต์ (Website URL)
                </label>
                <input
                  type="url"
                  value={editingSponsor.url || ''}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, url: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-600 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="https://..."
                />
              </div>

              <ImageUploader
                label="โลโก้สปอนเซอร์ (PNG โปร่งใส / SVG / GIF) *"
                value={editingSponsor.logo_url}
                onChange={(url) => setEditingSponsor((prev) => (prev ? { ...prev, logo_url: url } : null))}
                onUploadingChange={handleUploadStateChange}
                bucket="sponsors"
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sponsor-active"
                  checked={editingSponsor.is_active}
                  onChange={(e) => setEditingSponsor((prev) => (prev ? { ...prev, is_active: e.target.checked } : null))}
                  className="w-4 h-4 rounded bg-[#1e293b] border-slate-600 text-cyan-400 cursor-pointer"
                />
                <label htmlFor="sponsor-active" className="text-xs font-medium text-slate-200 cursor-pointer">
                  แสดงในแถบสปอนเซอร์บนหน้าจอถ่ายทอดสด (Active)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSponsor(null);
                    setUploadingCount(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingCount > 0}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : uploadingCount > 0 ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>กำลังอัปโหลดรูปภาพ ({uploadingCount} ไฟล์)...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>บันทึกสปอนเซอร์</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
