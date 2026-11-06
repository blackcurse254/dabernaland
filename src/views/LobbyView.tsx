/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Trophy, Sparkles, Users, Clock, Crown } from 'lucide-react';
import { GameRoom } from '../types';

interface LobbyViewProps {
  rooms: GameRoom[];
  onSelectRoom: (roomId: string) => void;
  onBack: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  rooms,
  onSelectRoom,
  onBack,
}) => {
  const goldRoom = rooms.find((r) => r.id === 'gold_vip') || rooms[0];
  const regularRooms = rooms.filter((r) => r.id !== 'gold_vip');

  const roomMeta: Record<string, { stakeText: string; activeGames: number; soldCards: number }> = {
    room_5k: { stakeText: '۵،۰۰۰ تومان', activeGames: 14, soldCards: 5 },
    room_10k: { stakeText: '۱۰،۰۰۰ تومان', activeGames: 3, soldCards: 0 },
    room_20k: { stakeText: '۲۰،۰۰۰ تومان', activeGames: 8, soldCards: 12 },
    room_50k: { stakeText: '۵۰،۰۰۰ تومان', activeGames: 4, soldCards: 9 },
  };

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* Top Header */}
      <div className="relative flex items-center justify-between pb-2 mb-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#111319] border border-amber-500/30 text-amber-400 hover:text-white flex items-center justify-center transition-colors shadow-sm"
          title="بازگشت به خانه"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center absolute inset-x-0 pointer-events-none">
          <h1 className="text-base sm:text-lg font-black text-white">تالارهای بازی دبرنا لند</h1>
          <p className="text-[11px] text-amber-300/80 font-bold">اتاق مورد نظر خود را انتخاب کنید</p>
        </div>

        <div className="w-9" />
      </div>

      {/* 1. 3D Golden VIP Room (Luxury Casino Style) */}
      {goldRoom && (
        <div
          onClick={() => onSelectRoom(goldRoom.id)}
          className="cursor-pointer rounded-3xl bg-gradient-to-r from-[#2a1d04] via-[#453109] to-[#1c1303] border-2 border-amber-400 p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden transition-all hover:border-amber-300 glow-gold-luxury"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/15 blur-2xl pointer-events-none" />

          {/* Left: 3D Gold Button "ورود" */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectRoom(goldRoom.id);
            }}
            className="h-11 px-7 rounded-2xl btn-3d-gold text-slate-950 font-black text-xs sm:text-sm shadow-xl active:scale-95"
          >
            ورود به تالار
          </button>

          {/* Right: Gold Trophy Icon, Title & Badges */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm sm:text-base font-black text-[#FFE600] drop-shadow-sm">
                  اتاق دبرنا طلایی VIP
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black shadow-sm flex items-center gap-0.5">
                  <Crown className="w-3 h-3" />
                  ویژه
                </span>
              </div>
              <div className="text-[11px] text-amber-200 mt-0.5 flex items-center justify-end gap-1 font-bold">
                <span>جایزه بزرگ تا ۲،۰۰۰،۰۰۰ تومان</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>

            {/* 3D Gold Trophy Sphere */}
            <div className="w-13 h-13 rounded-full ball-3d border-2 border-amber-300 flex items-center justify-center text-slate-950 text-2xl shadow-xl shrink-0">
              🏆
            </div>
          </div>
        </div>
      )}

      {/* 2. Regular 3D Rooms List (Obsidian & Gold Edges) */}
      <div className="space-y-3">
        {regularRooms.map((room) => {
          const meta = roomMeta[room.id] || {
            stakeText: `${room.cardPrice.toLocaleString('fa-IR')} تومان`,
            activeGames: 5,
            soldCards: 6,
          };
          const isPlaying = room.status === 'playing';

          const soldCards = room.participants?.reduce((sum, p) => sum + p.cardsCount, 0) ?? meta.soldCards;

          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="group cursor-pointer card-3d-interactive rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 border border-amber-500/25 hover:border-amber-400/60"
            >
              {/* Left Column: Capsule badge + 3D Green "ورود" Button */}
              <div className="flex flex-col items-start gap-2.5">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {soldCards.toLocaleString('fa-IR')} از ۳۰ کارت
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(room.id);
                  }}
                  className="h-10 px-7 rounded-xl btn-3d-green text-white font-black text-xs sm:text-sm active:scale-95 shadow-md"
                >
                  ورود
                </button>
              </div>

              {/* Right Column: 3D Stake Card & Real-time games badge */}
              <div className="flex flex-col items-end gap-1.5">
                {/* 3D Banknote graphic with gold tint */}
                <div className="w-40 sm:w-48 h-16 rounded-xl overflow-hidden border border-amber-500/35 bg-gradient-to-r from-[#171308] via-[#241c0a] to-[#120e05] flex items-center justify-between px-3 shadow-inner">
                  <div className="w-9 h-9 rounded-full ball-3d flex items-center justify-center text-xs font-black text-slate-950 border border-amber-300">
                    دبرنا
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">بهای هر کارت</div>
                    <div className="text-xs sm:text-sm font-black text-[#FFE600] tabular-nums">
                      {room.cardPrice.toLocaleString('fa-IR')} <span className="text-[9px] text-amber-300/80">تومان</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Status */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {isPlaying ? (
                      <span className="text-amber-300 font-bold">در حال بازی</span>
                    ) : (
                      <span>شروع: {room.countdown}ث</span>
                    )}
                  </span>
                  <span>·</span>
                  <span>{meta.activeGames} بازی در حال انجام</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
