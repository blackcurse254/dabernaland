/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Headphones, Gift, Volume2, VolumeX, ShieldCheck, X, Mic, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { SoundEngine } from '../utils/audio';

interface HeaderProps {
  user: User | null;
  isConnected: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onNavigateTab: (tab: 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isConnected,
  isMuted,
  onToggleMute,
  onOpenDeposit,
  onOpenAuth,
  onNavigateTab,
}) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);

  const handleTestVoice = () => {
    setIsVoiceTesting(true);
    SoundEngine.testPersianVoice();
    setTimeout(() => setIsVoiceTesting(false), 3000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#06070a]/95 backdrop-blur-xl border-b border-amber-500/25 px-3 py-2.5 shadow-xl shadow-black/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left Buttons: پشتیبانی & کد معرف */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#181b22] to-[#0d0e12] hover:from-[#222630] hover:to-[#14161d] text-slate-200 border border-amber-500/30 text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">پشتیبانی</span>
            </button>

            <button
              onClick={() => setShowReferralModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#2a1e06] to-[#161003] hover:from-[#3a2b0a] hover:to-[#221804] text-amber-300 border border-amber-500/50 text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <span>کد معرف</span>
              <Gift className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Center Brand Title & Logo (دبرنا لند) */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl ball-3d flex items-center justify-center font-black text-slate-950 text-base shadow-lg border border-amber-300">
              د
            </div>
            <div className="text-right">
              <span className="text-sm sm:text-base font-black bg-gradient-to-r from-[#ffe066] via-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent drop-shadow-sm">
                دبرنا لند
              </span>
              <span className="text-[9px] text-amber-300/80 font-bold block -mt-0.5">آنلاین زنده VIP</span>
            </div>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Persian Voice Announcer Tester */}
            <button
              onClick={handleTestVoice}
              title="تست گوینده صوتی فارسی"
              className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
                isVoiceTesting
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse'
                  : 'bg-[#111319] text-slate-300 border-amber-500/25 hover:border-amber-500/50'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تست گوینده</span>
            </button>

            {/* Audio Mute/Unmute */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'روشن کردن صدای گوینده' : 'قطع صدای گوینده'}
              className="w-8 h-8 rounded-xl bg-[#111319] border border-amber-500/25 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Connection Indicator */}
            <span
              title={isConnected ? 'متصل به سرور دبرنا لند' : 'در حال اتصال به سرور...'}
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-rose-500 animate-pulse'}`}
            />
          </div>
        </div>

        {/* Marquee Strip */}
        <div className="mt-2 max-w-4xl mx-auto">
          <div className="py-1 px-3 rounded-xl bg-gradient-to-r from-[#1c1404] via-[#2a1d06] to-[#1c1404] border border-amber-500/40 text-amber-300 text-[11px] font-bold text-center truncate flex items-center justify-center gap-1.5 shadow-inner">
            <span>📢</span>
            <span>**اطلاعیه مهم دبرنا لند: ۲۴ ساعت یک بار و مبلغ برداشت نیز نامحدود می‌باشد**</span>
          </div>
        </div>
      </header>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm card-3d rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-3">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center">پشتیبانی آنلاین دبرنا لند</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed text-center">
              کارشناسان پشتیبانی پلتفرم آنلاین دبرنا لند به صورت ۲۴ ساعته آماده راهنمایی شما در زمینه بازی‌ها، خرید کارت و تسویه حساب هستند.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xs text-emerald-400">
              تلگرام پشتیبانی: @DebernaLand_Support
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm card-3d rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center">کد معرف و دریافت هدیه دبرنا لند</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed text-center">
              با دعوت دوستان خود به دبرنا لند، ۱۰٪ کمیسیون نقدی دائمی از هر دست بازی آن‌ها دریافت کنید!
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-center font-mono text-sm font-bold text-amber-400 select-all">
              DEBERNA-{user ? user.username.toUpperCase() : 'VIP88'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
