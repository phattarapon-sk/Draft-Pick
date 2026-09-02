'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Swords,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sparkles,
  Play,
  Zap,
} from 'lucide-react';
import { DEMO_MATCH_ID } from '@/config/defaultData';

// Allowed system users
const VALID_USERS: Record<string, { pass: string; role: string; displayName: string }> = {
  admin: { pass: 'password123', role: 'admin', displayName: 'Administrator' },
  livemedia: { pass: 'esport001', role: 'admin', displayName: 'Live Media Operator' },
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    const matchedUser = VALID_USERS[cleanUser];
    if (!matchedUser || matchedUser.pass !== cleanPass) {
      setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Simulate authenticating to Esports Control Room
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'rov_auth_user',
          JSON.stringify({
            username: cleanUser,
            displayName: matchedUser.displayName,
            role: matchedUser.role,
            loggedInAt: Date.now(),
          })
        );
      }
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white flex flex-col justify-between items-center relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Esports Neon Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-rose-500/15 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Bar Status */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]">
            <Swords className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-white to-rose-400 bg-clip-text text-transparent">
              DRAFT PICK ESPORTS
            </span>
            <span className="text-[10px] font-mono text-cyan-400 block -mt-1 font-bold">
              BROADCAST CONTROL PLATFORM
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM READY • OBS STUDIO SYNC</span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="w-full max-w-md px-4 py-8 relative z-10 flex flex-col items-center">
        {/* Card Container */}
        <div className="w-full bg-[#0B1020]/90 border border-slate-700/80 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,217,255,0.2)] mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black uppercase text-white tracking-wide">
              เข้าสู่ระบบ (Login)
            </h1>
            <p className="text-xs text-slate-400">
              ระบบควบคุมการดราฟต์และถ่ายทอดสด Esports
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-semibold text-center animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>ชื่อผู้ใช้ / อีเมล (Username)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin หรือ username..."
                  className="w-full bg-[#131B2E] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>รหัสผ่าน (Password)</span>
                <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                  ลืมรหัสผ่าน?
                </span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131B2E] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#131B2E] border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>จดจำการเข้าสู่ระบบ</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">v2.0 PRO</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ (Sign In)</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs font-mono text-slate-500 relative z-10 border-t border-white/5">
        Draft Pick Esports Platform • RoV Pro Broadcast System © 2026
      </footer>
    </div>
  );
}
