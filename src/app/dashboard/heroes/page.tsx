'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getHeroes, saveHero, deleteHero } from '@/lib/supabase/mockStorage';
import { Hero } from '@/types';
import { ImageUploader } from '@/components/common/ImageUploader';
import {
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Swords,
  Zap,
  Wand2,
  Crosshair,
  HeartPulse,
  Tag,
  Film,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  Crown,
  Skull,
  Sparkles,
  Target,
  Star,
  Anchor,
  Eye,
  Award,
  Layers,
  Settings2,
  Loader2,
} from 'lucide-react';

const ITEMS_PER_PAGE = 16;

// Available icon registry for categories
const AVAILABLE_ROLE_ICONS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  Shield: { label: 'เกราะ (Shield)', icon: Shield },
  Swords: { label: 'ดาบ (Swords)', icon: Swords },
  Zap: { label: 'สายฟ้า (Zap)', icon: Zap },
  Wand2: { label: 'คทาเวท (Wand)', icon: Wand2 },
  Crosshair: { label: 'เป้าเล็ง (Crosshair)', icon: Crosshair },
  HeartPulse: { label: 'หัวใจ/ซัพ (Support)', icon: HeartPulse },
  Compass: { label: 'เข็มทิศ/ป่า (Roam/Jungle)', icon: Compass },
  Flame: { label: 'เปลวไฟ (Flame)', icon: Flame },
  Crown: { label: 'มงกุฎ (Crown)', icon: Crown },
  Skull: { label: 'กะโหลก (Skull)', icon: Skull },
  Target: { label: 'เป้าหมาย (Target)', icon: Target },
  Sparkles: { label: 'ประกายดาว (Sparkles)', icon: Sparkles },
  Star: { label: 'ดาว (Star)', icon: Star },
  Anchor: { label: 'สมอเรือ (Anchor)', icon: Anchor },
  Layers: { label: 'เลเยอร์ (Layers)', icon: Layers },
  Tag: { label: 'ป้ายชื่อ (Tag)', icon: Tag },
};

interface RoleCategory {
  id: string;
  name: string;
  iconName: string;
  is_default?: boolean;
}

const DEFAULT_CATEGORIES: RoleCategory[] = [
  { id: 'cat-tank', name: 'Tank', iconName: 'Shield', is_default: true },
  { id: 'cat-warrior', name: 'Warrior', iconName: 'Swords', is_default: true },
  { id: 'cat-assassin', name: 'Assassin', iconName: 'Zap', is_default: true },
  { id: 'cat-mage', name: 'Mage', iconName: 'Wand2', is_default: true },
  { id: 'cat-marksman', name: 'Marksman', iconName: 'Crosshair', is_default: true },
  { id: 'cat-support', name: 'Support', iconName: 'HeartPulse', is_default: true },
];

export default function HeroesPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [categories, setCategories] = useState<RoleCategory[]>(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleUploadStateChange = (isUploading: boolean) => {
    setUploadingCount((prev) => Math.max(0, prev + (isUploading ? 1 : -1)));
  };

  // Category Manager Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Shield');

  const fetchHeroes = async () => {
    const list = await getHeroes();
    setHeroes(list);
  };

  useEffect(() => {
    fetchHeroes();
    try {
      const storedCats = localStorage.getItem('rov_hero_categories');
      if (storedCats) {
        setCategories(JSON.parse(storedCats));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save categories to local storage helper
  const updateCategories = (newCats: RoleCategory[]) => {
    setCategories(newCats);
    localStorage.setItem('rov_hero_categories', JSON.stringify(newCats));
  };

  // Reset pagination on search or role filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole]);

  // Handler to add a new custom category
  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('มีหมวดหมู่นี้อยู่แล้ว');
      return;
    }

    const newCat: RoleCategory = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      iconName: newCatIcon,
    };
    const updated = [...categories, newCat];
    updateCategories(updated);
    setNewCatName('');
    setNewCatIcon('Shield');
  };

  // Handler to delete a category
  const handleDeleteCategory = (catId: string) => {
    const target = categories.find((c) => c.id === catId);
    if (!target) return;
    if (target.is_default) {
      alert('ไม่สามารถลบหมวดหมู่เริ่มต้นได้');
      return;
    }
    if (!confirm(`ต้องการลบหมวดหมู่ "${target.name}" หรือไม่?`)) return;
    const updated = categories.filter((c) => c.id !== catId);
    updateCategories(updated);
  };

  // Helper to get icon component by name
  const getCategoryIcon = (roleName: string) => {
    const cat = categories.find((c) => c.name.toLowerCase() === roleName.toLowerCase());
    const iconName = cat?.iconName || 'Tag';
    return AVAILABLE_ROLE_ICONS[iconName]?.icon || Tag;
  };

  const filteredHeroes = useMemo(() => {
    return heroes.filter((h) => {
      const matchSearch =
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.slug.toLowerCase().includes(search.toLowerCase());
      const matchRole = selectedRole === 'ALL' || h.role.toLowerCase() === selectedRole.toLowerCase();
      return matchSearch && matchRole;
    });
  }, [heroes, search, selectedRole]);

  const totalPages = Math.ceil(filteredHeroes.length / ITEMS_PER_PAGE) || 1;

  const paginatedHeroes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHeroes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHeroes, currentPage]);

  const handleOpenNew = () => {
    setUploadingCount(0);
    setEditingHero({
      id: `hero-${Date.now()}`,
      name: '',
      slug: '',
      role: categories[0]?.name || 'Warrior',
      image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      portrait_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
      splash_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
      is_active: true,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero || !editingHero.name.trim()) {
      alert('กรุณากรอกชื่อฮีโร่');
      return;
    }
    if (uploadingCount > 0) {
      alert('กรุณารอรูปภาพอัปโหลดให้เสร็จสิ้นก่อนทำการบันทึก');
      return;
    }

    setIsSaving(true);
    try {
      const heroToSave = {
        ...editingHero,
        name: editingHero.name.trim(),
        slug: editingHero.slug || editingHero.name.trim().toLowerCase().replace(/\s+/g, '-'),
      };

      await saveHero(heroToSave);
      await fetchHeroes();

      // Show all heroes after save (do not filter down to the newly added hero)
      setSearch('');
      setSelectedRole('ALL');
      setCurrentPage(1);

      setEditingHero(null);
      setUploadingCount(0);
      setIsNew(false);
    } catch (err: any) {
      console.error('Save hero failed:', err);
      alert(`ไม่สามารถบันทึกฮีโร่ได้: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบฮีโร่นี้?')) return;
    await deleteHero(id);
    await fetchHeroes();
  };

  const handleToggleActive = async (hero: Hero) => {
    await saveHero({ ...hero, is_active: !hero.is_active });
    await fetchHeroes();
  };

  return (
    <>
      <div className="p-3 md:p-4 space-y-2.5 max-w-full mx-auto w-full text-white flex flex-col justify-between min-h-full font-sans">
      {/* Top Section: Header + Filter */}
      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <h1 className="text-lg md:text-xl font-bold uppercase text-white tracking-wide">
                Hero Database
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                จัดการรายชื่อฮีโร่และรูปภาพ (รองรับ GIF / WebP ภาพเคลื่อนไหว)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dedicated Button to Manage Categories with Icons */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>จัดการหมวดหมู่ (Categories)</span>
            </button>

            {/* Add Hero Button */}
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase shadow-[0_0_12px_rgba(0,217,255,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>สร้างฮีโร่ใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาฮีโร่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0B1020] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Role Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-0.5">
            <button
              onClick={() => setSelectedRole('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedRole === 'ALL'
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
              }`}
            >
              ทั้งหมด ({heroes.length})
            </button>
            {categories.map((cat) => {
              const Icon = AVAILABLE_ROLE_ICONS[cat.iconName]?.icon || Tag;
              const count = heroes.filter((h) => h.role.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedRole(cat.name)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedRole.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-cyan-500 text-black font-bold shadow'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.name}</span>
                  <span className="text-[9px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Grid (8 columns x 2 rows = exactly 16 heroes per page) */}
        {paginatedHeroes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs rounded-2xl bg-[#0B1020] border border-slate-800">
            ไม่พบข้อมูลฮีโร่ที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-2.5">
            {paginatedHeroes.map((hero) => {
              const RoleIcon = getCategoryIcon(hero.role);
              const isAnimated =
                hero.portrait_url?.toLowerCase().includes('.gif') ||
                hero.portrait_url?.toLowerCase().includes('.webp');

              return (
                <div
                  key={hero.id}
                  className={`rounded-2xl overflow-hidden bg-[#0B1020] border transition-all duration-200 flex flex-col group shadow-lg ${
                    hero.is_active ? 'border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,217,255,0.15)]' : 'border-slate-900 opacity-50'
                  }`}
                >
                  {/* Artwork */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero.portrait_url || hero.image_url}
                      alt={hero.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                    {/* Role badge */}
                    <div
                      className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 border border-cyan-500/40 backdrop-blur-sm text-[9px] font-bold text-cyan-300"
                    >
                      <RoleIcon className="w-3 h-3" />
                      <span>{hero.role}</span>
                    </div>

                    {/* Animated Badge if GIF */}
                    {isAnimated && (
                      <div
                        className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/50 text-[9px] font-bold text-cyan-300"
                        title="Animated Image"
                      >
                        <Film className="w-2.5 h-2.5" />
                        <span>GIF</span>
                      </div>
                    )}

                    {/* Active switch */}
                    <button
                      onClick={() => handleToggleActive(hero)}
                      className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                        hero.is_active ? 'bg-emerald-500 text-black shadow-md' : 'bg-red-950 text-red-400 border border-red-500/40'
                      }`}
                      title={hero.is_active ? 'Active' : 'Inactive'}
                    >
                      {hero.is_active ? '✓' : '✕'}
                    </button>
                  </div>

                  {/* Info & actions */}
                  <div className="p-2 px-2.5 flex items-center justify-between gap-1.5 bg-[#0a0f1d]">
                    <h3 className="text-xs font-bold text-white uppercase truncate flex-1 tracking-wide" title={hero.name}>
                      {hero.name}
                    </h3>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingHero(hero);
                          setIsNew(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 hover:border-cyan-400/50"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(hero.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/70 text-red-400 transition-colors cursor-pointer border border-slate-800 hover:border-red-500/50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Section: Compact Pagination Controls Bar */}
      {filteredHeroes.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0B1020]/70 p-2.5 rounded-xl mt-1">
          <div className="text-[11px] font-mono text-slate-400">
            แสดง <span className="text-white font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredHeroes.length)}</span> จาก <span className="text-cyan-400 font-bold">{filteredHeroes.length}</span> ตัวละคร
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>ก่อนหน้า</span>
            </button>

            {/* Page Number Pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-cyan-500 text-black font-black shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>

      {/* DEDICATED MODAL: CATEGORY & ROLE MANAGER WITH ICON PICKER (Full viewport coverage) */}
      {showCategoryModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-400" />
                <span>จัดการหมวดหมู่ / ตำแหน่ง (Role & Categories)</span>
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Add New Category Section */}
            <div className="p-4 rounded-xl bg-[#1e293b] border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-cyan-300 block">
                + เพิ่มหมวดหมู่ใหม่ (Create New Category)
              </span>

              {/* Name Input */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  ชื่อหมวดหมู่ / ตำแหน่ง *
                </label>
                <input
                  type="text"
                  placeholder="เช่น Jungle, Mid Lane, Roamer, Dark Slayer, Carry..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-semibold"
                />
              </div>

              {/* Icon Picker Grid */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  เลือกไอคอนประจำหมวดหมู่ (Select Icon):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#0f172a] rounded-xl border border-slate-700">
                  {Object.entries(AVAILABLE_ROLE_ICONS).map(([key, item]) => {
                    const Icon = item.icon;
                    const isSelected = newCatIcon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewCatIcon(key)}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-black font-bold shadow'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px] truncate max-w-[50px]">{key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs uppercase shadow transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึกหมวดหมู่ใหม่</span>
              </button>
            </div>

            {/* List of Existing Categories */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                รายการหมวดหมู่ทั้งหมด ({categories.length}):
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const Icon = AVAILABLE_ROLE_ICONS[cat.iconName]?.icon || Tag;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#1e293b] border border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ไอคอน: {cat.iconName} {cat.is_default && '• (ค่าเริ่มต้น)'}
                          </span>
                        </div>
                      </div>

                      {!cat.is_default && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/70 text-red-400 border border-slate-700 hover:border-red-500 transition-colors cursor-pointer"
                          title="ลบหมวดหมู่นี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                ปิดหน้าต่าง (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Clean Popup Modal (Full viewport coverage) */}
      {editingHero && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full min-h-screen z-[9999] !m-0 !p-4 flex items-center justify-center bg-black/80">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">
                {isNew ? 'สร้างฮีโร่ใหม่ (Create Hero)' : `แก้ไขฮีโร่: ${editingHero.name}`}
              </h3>
              <button
                onClick={() => setEditingHero(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Hero Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  ชื่อฮีโร่ (Hero Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editingHero.name}
                  onChange={(e) => setEditingHero({ ...editingHero, name: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  placeholder="เช่น Florentino, Tulen, Hayate..."
                />
              </div>

              {/* Role Dropdown Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    ตำแหน่ง / หมวดหมู่ (Role) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>จัดการหมวดหมู่/ไอคอน</span>
                  </button>
                </div>

                {/* Standard Clean Selector */}
                <select
                  value={editingHero.role}
                  onChange={(e) => setEditingHero({ ...editingHero, role: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-slate-900 text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Portrait Image Uploader */}
              <div>
                <ImageUploader
                  label="ภาพการ์ดฮีโร่ (Portrait) *"
                  value={editingHero.portrait_url}
                  onChange={(url) =>
                    setEditingHero((prev) =>
                      prev
                        ? {
                            ...prev,
                            portrait_url: url,
                            image_url: url,
                          }
                        : null
                    )
                  }
                  onUploadingChange={handleUploadStateChange}
                  bucket="heroes"
                />
              </div>

              {/* Splash Image Uploader */}
              <div>
                <ImageUploader
                  label="ภาพ Splash Art เต็มตัว"
                  value={editingHero.splash_url || ''}
                  onChange={(url) => setEditingHero((prev) => (prev ? { ...prev, splash_url: url } : null))}
                  onUploadingChange={handleUploadStateChange}
                  bucket="heroes"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hero-active"
                  checked={editingHero.is_active}
                  onChange={(e) => setEditingHero((prev) => (prev ? { ...prev, is_active: e.target.checked } : null))}
                  className="w-4 h-4 rounded bg-[#1e293b] border-slate-700 text-cyan-500 cursor-pointer"
                />
                <label htmlFor="hero-active" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  เปิดให้เลือกดราฟต์ในห้องแข่งขัน (Active for Drafting)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHero(null);
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : uploadingCount > 0 ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังอัปโหลดรูปภาพ ({uploadingCount} ไฟล์)...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>บันทึกฮีโร่</span>
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
