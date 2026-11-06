/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  Trophy,
  Crown,
  Sparkles,
  X,
  ArrowRight,
  RotateCcw,
  Coins,
  CheckCircle2,
  Bell,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameRoom, User } from '../types';

interface CelebratoryWinnerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  room: GameRoom;
  currentUser: User | null;
  onPlayNextRound?: () => void;
  onLeaveToLobby: () => void;
}

const SPARKLE_CONFIGS = [
  { top: '8%', left: '12%', size: 26, delay: '0.1s', duration: '2.4s' },
  { top: '15%', right: '14%', size: 34, delay: '0.5s', duration: '3.1s' },
  { top: '28%', left: '6%', size: 20, delay: '1.2s', duration: '2.7s' },
  { top: '35%', right: '8%', size: 28, delay: '0.9s', duration: '2.5s' },
  { bottom: '26%', left: '10%', size: 32, delay: '1.6s', duration: '3.3s' },
  { bottom: '12%', right: '12%', size: 24, delay: '0.3s', duration: '2.6s' },
  { bottom: '38%', right: '6%', size: 26, delay: '1.8s', duration: '2.9s' },
  { top: '6%', right: '35%', size: 22, delay: '1.4s', duration: '2.2s' },
  { bottom: '8%', left: '38%', size: 30, delay: '0.7s', duration: '3.0s' },
  { top: '55%', left: '4%', size: 24, delay: '2.0s', duration: '2.8s' },
  { top: '48%', right: '5%', size: 22, delay: '1.1s', duration: '2.4s' },
];

export const CelebratoryWinnerOverlay: React.FC<CelebratoryWinnerOverlayProps> = ({
  isOpen,
  onClose,
  room,
  currentUser,
  onPlayNextRound,
  onLeaveToLobby,
}) => {
  // Fire multi-stage celebratory confetti cannons
  useEffect(() => {
    if (!isOpen) return;

    try {
      // Left side golden burst
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#ffe600', '#f59e0b', '#d4af37', '#ffffff'],
      });

      // Right side golden burst
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#ffe600', '#f59e0b', '#d4af37', '#ffffff'],
      });

      // Big center shower after 400ms
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ffe600', '#f59e0b', '#10b981', '#ffffff'],
        });
      }, 400);

      return () => clearTimeout(timeout);
    } catch {
      // Confetti fallback
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tombolaWinner = room.winners?.tombola;
  const lineWinner = room.winners?.line1;

  // Check if current logged in user won any prize
  const isUserTombolaWinner = !!(currentUser && tombolaWinner && tombolaWinner.name === currentUser.name);
  const isUserLineWinner = !!(currentUser && lineWinner && lineWinner.name === currentUser.name);
  const isUserWinner = isUserTombolaWinner || isUserLineWinner;

  const tombolaPrize = tombolaWinner?.prize || room.tombolaPrize || 114750;
  const linePrize = lineWinner?.prize || room.line1Prize || 12750;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 winner-overlay-backdrop overflow-y-auto animate-fade-in font-['Vazirmatn',sans-serif]">
      {/* 1. Rotating Golden Sunburst Rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[850px] h-[850px] sm:w-[1100px] sm:h-[1100px] rounded-full gold-rays-spin opacity-45 pointer-events-none" />
      </div>

      {/* 2. Pulsing Radial Gold Glow Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full gold-radial-aura pointer-events-none" />
      </div>

      {/* 3. Floating Twinkling Golden Sparkles */}
      {SPARKLE_CONFIGS.map((sp, idx) => (
        <div
          key={idx}
          className="gold-sparkle text-[#FFE600] flex items-center justify-center"
          style={{
            top: sp.top,
            left: sp.left,
            right: sp.right,
            bottom: sp.bottom,
            animationDelay: sp.delay,
            animationDuration: sp.duration,
          }}
        >
          <Sparkles style={{ width: sp.size, height: sp.size }} className="fill-amber-300" />
        </div>
      ))}

      {/* 4. Main Celebratory Winner Card */}
      <div className="relative z-10 w-full max-w-lg card-3d rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.45)] text-center my-auto">
        {/* Close Button to view background tickets */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center transition-colors shadow-md"
          title="مشاهده کارت‌ها"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 3D Gold Trophy Pop Element with Crown */}
        <div className="inline-block relative mb-4 gold-trophy-pop">
          {/* Golden Crown Perched on Top */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 drop-shadow-[0_0_12px_rgba(255,230,0,0.8)] animate-bounce">
            <Crown className="w-9 h-9 fill-amber-400" />
          </div>

          {/* 3D Trophy Sphere */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ball-3d border-4 border-[#FFE600] shadow-[0_0_45px_rgba(255,215,0,0.65)] flex items-center justify-center text-slate-950 mx-auto">
            <Trophy className="w-12 h-12 sm:w-14 sm:h-14 fill-slate-950" />
          </div>

          {/* Golden Sparkle accents on sides */}
          <div className="absolute -right-2 top-2 text-[#FFE600] animate-spin">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div className="absolute -left-2 top-4 text-amber-300 animate-pulse">
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Celebratory Headlines */}
        <div className="space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[#FFE600] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پایان بازی • برندگان جوایز بزرگ</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#FFE600] to-amber-300 tracking-tight pt-1">
            تبریک به قهرمانان این دور!
          </h2>
          <p className="text-xs text-amber-200/80 font-medium">
            رقابت با هیجان به پایان رسید و جوایز به برندگان اهدا گردید
          </p>
        </div>

        {/* Personal Winner Banner if Current User Won */}
        {isUserWinner && (
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0a3821] to-emerald-950 border-2 border-emerald-400 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xl animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              🎉 تبریک ویژه! شما در این مسابقه برنده شدید و جایزه به حسابتان منظور شد!
            </span>
          </div>
        )}

        {/* Winners Showcase Grid */}
        <div className="space-y-3 mb-6">
          {/* 1. Grand Tombola Champion Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#2e2007] via-[#1a1304] to-[#0c0902] border-2 border-amber-400 shadow-xl relative overflow-hidden text-right">
            {/* Shimmering Ribbon Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 gold-banner-shimmer" />

            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-black text-[#FFE600]">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>قهرمان دبرنا پر (کارت کامل)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 text-[11px] font-black">
                جایزه اصلی
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              {/* Winner Identity */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full ball-3d text-slate-950 font-black text-sm flex items-center justify-center border-2 border-amber-300 shadow-md">
                  {tombolaWinner?.name?.slice(0, 1) || '🏆'}
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                    <span>{tombolaWinner?.name || 'ملینا'}</span>
                    {isUserTombolaWinner && (
                      <span className="text-[10px] text-amber-400 font-bold">(شما)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-200/70 font-medium">
                    تکمیل کامل خانه کارت دبرنا
                  </div>
                </div>
              </div>

              {/* Prize Amount */}
              <div className="text-left">
                <div className="text-lg sm:text-xl font-black font-mono text-[#FFE600] drop-shadow-[0_0_10px_rgba(255,230,0,0.5)]">
                  {tombolaPrize.toLocaleString('fa-IR')}
                </div>
                <div className="text-[10px] text-amber-300/80 font-bold">تومان</div>
              </div>
            </div>
          </div>

          {/* 2. First Line Winner Card */}
          <div className="rounded-2xl p-3.5 bg-[#0e1118] border border-amber-500/30 text-right">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>برنده دبرنا خط اول</span>
              </span>
              <span className="text-xs font-black font-mono text-amber-400">
                {linePrize.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 font-bold flex items-center justify-center border border-amber-500/30 text-xs">
                  {lineWinner?.name?.slice(0, 1) || '🔔'}
                </div>
                <span className="font-bold text-slate-200">
                  {lineWinner?.name || 'ساناز'}
                  {isUserLineWinner && (
                    <span className="mr-1 text-[10px] text-amber-400 font-bold">(شما)</span>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">تکمیل ۵ خانه در یک سطر</span>
            </div>
          </div>
        </div>

        {/* Actions & Next Round */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              if (onPlayNextRound) onPlayNextRound();
              else onClose();
            }}
            className="w-full h-13 rounded-2xl btn-3d-gold text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xl"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🎮 بازی در دور جدید / دست بعدی</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onClose}
              className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors"
            >
              مشاهده کارت‌ها و اعداد
            </button>
            <button
              onClick={onLeaveToLobby}
              className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>فهرست اتاق‌ها</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
