/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, Gift, Disc3, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { spinWheel } from '../services/api';
import { SoundEngine } from '../utils/audio';

interface LuckyWheelViewProps {
  user: User | null;
  onUpdateUser: (user: Partial<User>) => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onBack: () => void;
}

interface Sector {
  label: string;
  color: string;
  textColor: string;
}

// Exact 12 segments from image_ee3ba40b.png
const SECTORS_12: Sector[] = [
  { label: 'چرخش مجدد', color: '#10B981', textColor: '#FFFFFF' },
  { label: 'پوچ', color: '#06B6D4', textColor: '#FFFFFF' },
  { label: '۱۰ هزار', color: '#EAB308', textColor: '#000000' },
  { label: 'پوچ', color: '#10B981', textColor: '#FFFFFF' },
  { label: '۵ هزار', color: '#EC4899', textColor: '#FFFFFF' },
  { label: 'پوچ', color: '#06B6D4', textColor: '#FFFFFF' },
  { label: '۱۰ هزار', color: '#EAB308', textColor: '#000000' },
  { label: 'پوچ', color: '#EC4899', textColor: '#FFFFFF' },
  { label: '۵ هزار', color: '#8B5CF6', textColor: '#FFFFFF' },
  { label: 'چرخش مجدد', color: '#10B981', textColor: '#FFFFFF' },
  { label: '۲۵ هزار', color: '#EC4899', textColor: '#FFFFFF' },
  { label: 'چرخش مجدد', color: '#06B6D4', textColor: '#FFFFFF' },
];

export const LuckyWheelView: React.FC<LuckyWheelViewProps> = ({
  user,
  onUpdateUser,
  onOpenDeposit,
  onOpenAuth,
  onBack,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<{ label: string; value: number; type: string } | null>(null);
  const [history, setHistory] = useState<{ id: string; label: string; date: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSpin = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (isSpinning) return;

    if (user.spinsLeft <= 0 && user.balance < 10000) {
      setError('شما شانس رایگان ندارید و موجودی کافی برای خرید شانس (۱۰،۰۰۰ تومان) موجود نیست.');
      return;
    }

    setError(null);
    setWonPrize(null);
    setIsSpinning(true);

    try {
      const res = await spinWheel(user.id);
      // Map server response to one of the 12 sectors
      const sliceDeg = 360 / 12;
      const targetIndex = Math.floor(Math.random() * 12);

      const extraRounds = 5 + Math.floor(Math.random() * 3);
      const targetDeg = extraRounds * 360 + (360 - (targetIndex * sliceDeg + sliceDeg / 2));

      let ticks = 0;
      const tickInterval = setInterval(() => {
        SoundEngine.playTick();
        ticks++;
        if (ticks > 28) clearInterval(tickInterval);
      }, 150);

      setRotation((prev) => prev + targetDeg);

      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        const sector = SECTORS_12[targetIndex];
        const prizeInfo = {
          label: sector.label,
          value: sector.label.includes('هزار') ? parseInt(sector.label) * 1000 : 0,
          type: sector.label === 'پوچ' ? 'empty' : 'win',
        };
        setWonPrize(prizeInfo);
        setHistory((prev) => [
          {
            id: `h_${Date.now()}`,
            label: sector.label,
            date: 'هم‌اکنون',
          },
          ...prev,
        ]);

        onUpdateUser({
          balance: res.user.balance,
          spinsLeft: res.user.spinsLeft,
        });

        if (prizeInfo.type !== 'empty') {
          SoundEngine.playWinFanfare();
          try {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }
      }, 4500);
    } catch (err: unknown) {
      setIsSpinning(false);
      setError(err instanceof Error ? err.message : 'خطا در چرخاندن گردونه');
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* Top Header matching image_ee3ba40b.png */}
      <div className="relative flex items-center justify-between pb-2 mb-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          title="بازگشت"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center absolute inset-x-0 pointer-events-none">
          <h1 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
            <span>گردونه شانس</span>
            <span>🎡</span>
          </h1>
        </div>

        <div className="w-9" />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Top Remaining Spins Indicator (Matching image_ee3ba40b.png) */}
      <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-4 shadow-lg text-center flex flex-col items-center justify-center space-y-2">
        <div className="text-xs text-slate-400 font-medium">شانس باقیمانده</div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">🎯</span>
          <div className="w-8 h-8 rounded-full bg-[#f4a222] text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
            {user ? user.spinsLeft : 1}
          </div>
        </div>
      </div>

      {/* 2. Middle 12-Segment Wheel */}
      <div className="rounded-3xl card-3d border border-amber-500/30 p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden glow-gold">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-6">
          {/* Top Gold Pointer */}
          <div className="absolute -top-3.5 z-30 flex flex-col items-center">
            <div className="w-5 h-6 bg-amber-400 border-2 border-amber-100 rounded-b shadow-xl transform rotate-180" />
          </div>

          {/* Wheel Frame */}
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-2xl relative border-4 border-amber-500/50"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.12, 0.8, 0.15, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {SECTORS_12.map((sector, i) => {
                const angle = 360 / 12;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;

                const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const tx = 50 + 33 * Math.cos((Math.PI * (midAngle - 90)) / 180);
                const ty = 50 + 33 * Math.sin((Math.PI * (midAngle - 90)) / 180);

                return (
                  <g key={i}>
                    <path d={pathData} fill={sector.color} stroke="#070B14" strokeWidth="0.7" />
                    <text
                      x={tx}
                      y={ty}
                      fill={sector.textColor}
                      fontSize="3.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                    >
                      {sector.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Gold Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full ball-3d border-2 border-amber-200 shadow-xl flex items-center justify-center text-slate-950 text-xl">
              🎰
            </div>
          </div>
        </div>

        {/* Full-width Big 3D Gold Button: 🎲 بچرخون! */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full h-14 rounded-2xl btn-3d-gold text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <span>🎲</span>
          <span>{isSpinning ? 'در حال چرخش...' : 'بچرخون!'}</span>
        </button>

        {/* Won Prize Message */}
        {wonPrize && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#241a05] via-[#352607] to-[#140e03] border-2 border-amber-400 text-center text-xs text-white shadow-xl glow-gold">
            نتیجه گردونه: <span className="font-black text-[#FFE600] text-sm mr-1">{wonPrize.label}</span>
          </div>
        )}
      </div>

      {/* 3. Prize History Card */}
      <div className="rounded-2xl card-3d border border-amber-500/25 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-300 pb-2 border-b border-amber-500/20">
          <span>تاریخچه جوایز</span>
          <span>📜</span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{h.label}</span>
                <span className="text-[11px] text-slate-500">{h.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl opacity-60">🎡</span>
            <p>هنوز گردونه رو نچرخوندی!</p>
          </div>
        )}
      </div>
    </div>
  );
};
