/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Landmark, Play, Users, Sparkles, ChevronLeft, Crown, Coins } from 'lucide-react';
import { User, GameRoom } from '../types';

interface DashboardViewProps {
  user: User | null;
  rooms: GameRoom[];
  onOpenDeposit: () => void;
  onGoToLobby: () => void;
  onNavigateTab: (tab: 'wheel' | 'wallet' | 'rules' | 'profile') => void;
  onOpenAuth: () => void;
  onSelectRoom: (roomId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  rooms,
  onOpenDeposit,
  onGoToLobby,
  onNavigateTab,
  onOpenAuth,
  onSelectRoom,
}) => {
  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* 1. User Profile Card (Royal Black & Gold Foil Style) */}
      <div
        onClick={() => onNavigateTab('profile')}
        className="cursor-pointer card-3d rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:border-amber-400/60 border border-amber-500/30 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          {!user ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuth();
              }}
              className="px-3.5 py-1.5 rounded-xl btn-3d-gold text-slate-950 font-black text-xs shadow-md"
            >
              ورود با پیامک (OTP)
            </button>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              عضو VIP دبرنا لند
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <h2 className="text-base sm:text-lg font-black text-white">
              {user ? user.name : 'امیرعلی یوسفی'}
            </h2>
            <span className="text-[11px] text-amber-400 font-mono font-bold">
              {user ? `@${user.username}` : '@sosis'}
            </span>
          </div>

          {/* 3D Gold Ball Avatar */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full ball-3d p-0.5 shadow-xl flex items-center justify-center shrink-0 border border-amber-300">
            <div className="w-full h-full rounded-full bg-[#120e04] flex items-center justify-center text-amber-300 font-black text-xl">
              {user?.name ? user.name[0] : 'ا'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Luxury Casino Gold Vault Card */}
      <div className="rounded-3xl p-5 sm:p-6 shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden bg-gradient-to-r from-[#2d2006] via-[#3a2907] to-[#1c1303] border-2 border-amber-500/70 glow-gold">
        {/* Subtle metallic shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-amber-400/10 pointer-events-none" />

        {/* Left: + افزایش (3D Green Chip Button with High Contrast) */}
        <button
          onClick={onOpenDeposit}
          className="relative z-10 h-11 sm:h-12 px-5 sm:px-6 rounded-2xl btn-3d-green font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 text-white active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>افزایش</span>
        </button>

        {/* Right: موجودی حساب & Amount & 3D Gold Bank Badge */}
        <div className="relative z-10 flex items-center gap-3 text-right">
          <div>
            <div className="text-xs sm:text-sm font-bold text-amber-300/90 flex items-center justify-end gap-1">
              <span>موجودی کیف پول</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tabular-nums mt-0.5 text-[#FFE600] drop-shadow-[0_2px_10px_rgba(255,230,0,0.4)]">
              {user ? user.balance.toLocaleString('fa-IR') : '۰'}{' '}
              <span className="text-xs font-bold text-amber-200/80 mr-1">تومان</span>
            </div>
          </div>

          {/* 3D Gold Bank Badge */}
          <div className="w-12 h-12 rounded-full ball-3d text-slate-950 flex items-center justify-center shadow-xl shrink-0 border border-amber-200">
            <Landmark className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. Bottom 3D Luxury Gold Start Game Button */}
      <div
        onClick={onGoToLobby}
        className="cursor-pointer rounded-3xl p-6 sm:p-7 text-center transition-all flex flex-col items-center justify-center space-y-1 relative overflow-hidden btn-3d-gold border-2 border-amber-300/50 shadow-2xl active:scale-98"
      >
        <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black text-slate-950 drop-shadow-sm">
          <span>شروع بازی در دبرنا لند</span>
          <span className="text-2xl">🎮</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-900 font-bold opacity-90">
          ورود زنده به تالارهای بازی و رقابت با بازیکنان آنلاین
        </p>
      </div>

      {/* 4. Live Rooms Fast Access Cards (Real-time WebSockets preview) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-white px-1">
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            اتاق‌های زنده دبرنا لند
          </span>
          <button
            onClick={onGoToLobby}
            className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-bold"
          >
            <span>مشاهده همه تالارها</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {rooms.slice(0, 2).map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="cursor-pointer card-3d-interactive rounded-2xl p-3.5 border border-amber-500/25 text-right flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span className="text-xs font-black text-white">{room.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                قیمت کارت: <span className="font-bold text-amber-400">{room.cardPrice.toLocaleString('fa-IR')} ت</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                <span>{room.status === 'playing' ? 'در حال قرعه‌کشی' : `شروع تا ${room.countdown}ث`}</span>
                <Users className="w-3 h-3 text-amber-400/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
