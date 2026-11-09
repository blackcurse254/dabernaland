/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, User as UserIcon, LogOut, Edit2, Check } from 'lucide-react';
import { User } from '../types';
import { updateProfile } from '../services/api';

interface ProfileViewProps {
  user: User | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onUpdateUser: (u: Partial<User>) => void;
  onBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  isMuted,
  onToggleMute,
  onLogout,
  onOpenAuth,
  onUpdateUser,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  const displayName = user?.name || 'کاربر دبرنا لند';
  const displayPhone = user?.phone || '—';
  const displayUsername = user?.username || 'player';
  const displayDate = user?.createdAt || 'هم‌اکنون';
  const gamesPlayed = user?.stats.gamesPlayed || 0;
  const wins = user?.stats.wins || 0;
  const winPercent = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await updateProfile({
        userId: user.id,
        name: editName.trim(),
        username: editUsername.trim(),
      });
      onUpdateUser({ name: res.user.name, username: res.user.username });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* Top Header matching image_4e14e8a8.png */}
      <div className="relative flex items-center justify-between pb-2 mb-1">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="text-center absolute inset-x-0 pointer-events-none">
          <h1 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
            <span>پروفایل من</span>
            <span>👤</span>
          </h1>
        </div>

        <div className="w-9" />
      </div>

      {/* 1. Top User Card */}
      <div className="rounded-3xl card-3d border border-amber-500/35 p-6 shadow-2xl text-center flex flex-col items-center justify-center space-y-2 glow-gold">
        {/* Gold Ball Avatar */}
        <div className="w-16 h-16 rounded-full ball-3d p-0.5 shadow-xl flex items-center justify-center mb-1 border-2 border-amber-300">
          <div className="w-full h-full rounded-full bg-[#120e04] flex items-center justify-center text-amber-300 font-black text-2xl">
            {displayName[0] || 'ا'}
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-black text-white">{displayName}</h2>
        <div className="text-xs text-slate-400 font-mono">{displayPhone}</div>
        <div className="text-xs text-[#FFE600] font-mono font-bold">@{displayUsername}</div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#08090d] border border-amber-500/25 text-[11px] text-amber-300/90 font-bold mt-2">
          <span>🗓️</span>
          <span>عضو از {displayDate}</span>
        </div>
      </div>

      {/* 2. Middle 3 Metric Boxes (🎮 بازی, 🏆 برد, 📈 درصد برد) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Right: 🎮 بازی */}
        <div className="rounded-2xl card-3d border border-amber-500/25 p-3 sm:p-4 text-center">
          <span className="text-lg block mb-1">🎮</span>
          <div className="text-base sm:text-lg font-black text-[#FFE600]">{gamesPlayed}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-bold">بازی</div>
        </div>

        {/* Middle: 🏆 برد */}
        <div className="rounded-2xl card-3d border border-amber-500/25 p-3 sm:p-4 text-center">
          <span className="text-lg block mb-1">🏆</span>
          <div className="text-base sm:text-lg font-black text-[#FFE600]">{wins}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-bold">برد</div>
        </div>

        {/* Left: 📈 درصد برد */}
        <div className="rounded-2xl card-3d border border-amber-500/25 p-3 sm:p-4 text-center">
          <span className="text-lg block mb-1">📈</span>
          <div className="text-base sm:text-lg font-black text-[#FFE600]">%{winPercent}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-bold">درصد برد</div>
        </div>
      </div>

      {/* 3. Section: اطلاعات شخصی */}
      <div className="rounded-2xl card-3d border border-amber-500/25 p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-300 pb-2 border-b border-amber-500/20">
          <span>اطلاعات شخصی</span>
          <span>📜</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">نام و نام خانوادگی</span>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white text-xs"
              />
            ) : (
              <span className="font-bold text-white">{displayName}</span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">شماره موبایل</span>
            <span className="font-mono text-slate-200">{displayPhone}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">نام کاربری</span>
            {isEditing ? (
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white text-xs font-mono"
              />
            ) : (
              <span className="font-mono font-bold text-purple-400">{displayUsername}</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Section: تنظیمات (Matching image_4e14e8a8.png) */}
      <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-5 shadow-lg space-y-2">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-white pb-2 border-b border-slate-800">
          <span>تنظیمات</span>
          <span>⚙️</span>
        </div>

        {/* ویرایش اطلاعات */}
        <div
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <span>{isEditing ? 'ذخیره تغییرات' : 'ویرایش اطلاعات'}</span>
            <span>👤</span>
          </div>
        </div>

        {/* خروج از حساب (Red) */}
        <div
          onClick={onLogout}
          className="cursor-pointer p-3.5 rounded-xl bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800/80 flex items-center justify-between transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-rose-400" />
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <span>خروج از حساب</span>
            <LogOut className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
