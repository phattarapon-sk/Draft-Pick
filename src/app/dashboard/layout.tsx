'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, Users, Shield, Layers, Palette, DollarSign, Settings, Radio, Plus, Home, Trophy } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview & Matches', href: '/dashboard', icon: Swords },
  { label: 'Logo Manager', href: '/dashboard/logos', icon: Trophy },
  { label: 'Hero Database', href: '/dashboard/heroes', icon: Shield },
  { label: 'Team Management', href: '/dashboard/teams', icon: Users },
  { label: 'Templates & Editor', href: '/dashboard/templates', icon: Layers },
  { label: 'Sponsors & Brands', href: '/dashboard/sponsors', icon: DollarSign },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050816] text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation (Fixed / Sticky) */}
      <aside className="w-full md:w-64 h-auto md:h-screen bg-[#0B1020] border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col justify-between flex-shrink-0 z-30 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]">
              <Swords className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-sm font-black tracking-wider uppercase text-white block">
                ROV OVERLAY
              </span>
              <span className="text-[9px] font-mono text-cyan-400 block -mt-0.5 font-bold">
                BROADCAST HUB
              </span>
            </div>
          </Link>

          {/* Quick Create Match Button */}
          <Link
            href="/dashboard/matches/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Match</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,217,255,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Home link */}
        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Homepage</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area (Independent scrollable) */}
      <div className="flex-1 h-full overflow-y-auto flex flex-col min-w-0 bg-[#050816]">
        {children}
      </div>
    </div>
  );
}
