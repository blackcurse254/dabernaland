/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Trophy,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  Grid,
  Send,
  Users,
  Plus,
  Minus,
  Clock,
  Coins,
  Zap,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameRoom, Ticket, User } from '../types';
import { BallBoardModal } from '../components/BallBoardModal';
import { SoundEngine, numberToPersianWords } from '../utils/audio';
import { socket } from '../services/socket';
import { VoiceCaller } from '../components/VoiceCaller';

interface GameRoomViewProps {
  room: GameRoom;
  user: User | null;
  onLeaveRoom: () => void;
  onBuyTickets: (count: number) => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

// Convert seconds to Persian MM:SS (e.g. 172 -> ۰۲:۵۲)
function formatSecondsToPersianTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  const raw = `${mStr}:${sStr}`;
  return raw.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
}

export const GameRoomView: React.FC<GameRoomViewProps> = ({
  room,
  user,
  onLeaveRoom,
  onBuyTickets,
  onOpenDeposit,
  onOpenAuth,
}) => {
  const [ticketBuyCount, setTicketBuyCount] = useState(1);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(SoundEngine.getMuted());

  // Trigger celebration on tombola (full deberna) win
  useEffect(() => {
    if (room.winners?.tombola) {
      SoundEngine.playWinFanfare();
      try {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [room.winners?.tombola]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    SoundEngine.setMuted(next);
  };

  const handleFastStart = () => {
    socket.emit('start:game_now', { roomId: room.id });
  };

  const totalCardsSold = room.participants?.reduce((sum, p) => sum + p.cardsCount, 0) || 0;
  const maxCards = room.maxCards || 30;
  const isPlaying = room.status === 'playing';
  const isEnded = room.status === 'ended';
  const isWaiting = room.status === 'waiting';

  const userTickets = room.tickets.filter((t) => t.userId === user?.id);
  const drawnSet = new Set(room.drawnNumbers || []);

  // ---------------------------------------------------------------------------
  // RENDER PHASE 1: PRE-GAME WAITING ROOM / LOBBY (image_a0dd3853.png)
  // ---------------------------------------------------------------------------
  if (isWaiting) {
    return (
      <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
        {/* Top Header Bar: Balance & Deposit */}
        <div className="flex items-center justify-between card-3d p-3 rounded-2xl border border-amber-500/25">
          <div className="flex items-center gap-2">
            <button
              onClick={onLeaveRoom}
              className="w-9 h-9 rounded-xl bg-[#111319] border border-amber-500/30 text-amber-400 hover:text-white flex items-center justify-center transition-colors"
              title="بازگشت به فهرست اتاق‌ها"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenDeposit}
              className="h-9 px-4 rounded-xl btn-3d-green text-white font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>افزایش</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left">
              <span className="text-sm font-black text-[#FFE600] font-mono">
                {(user?.balance || 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-xs text-amber-200/80 mr-1 font-bold">تومان</span>
            </div>
            <div className="w-9 h-9 rounded-xl ball-3d border border-amber-300 text-slate-950 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Big Digital Countdown Card */}
        <div className="card-3d rounded-3xl p-6 border-2 border-amber-500/40 text-center relative overflow-hidden shadow-2xl glow-gold">
          <div className="flex items-center justify-center gap-2 text-amber-300/90 text-xs sm:text-sm font-bold mb-1">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>شروع بازی تا</span>
          </div>

          {/* Large Amber Digital Timer */}
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-[#FFD700] drop-shadow-[0_0_25px_rgba(255,215,0,0.5)] my-2">
            {formatSecondsToPersianTime(room.countdown)}
          </div>

          {/* Metrics: Sold Cards & Room Capacity */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-amber-500/25">
            {/* Left in RTL: ظرفیت اتاق */}
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium mb-1">ظرفیت اتاق</div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {maxCards.toLocaleString('fa-IR')} کارت
              </div>
            </div>

            {/* Right in RTL: کارت‌های فروخته شده */}
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium mb-1">کارت‌های فروخته شده</div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {totalCardsSold.toLocaleString('fa-IR')} کارت
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Purchase Card */}
        <div className="card-3d rounded-3xl p-5 border border-amber-500/30 shadow-xl space-y-4">
          <div className="text-center text-xs sm:text-sm font-black text-white">
            خرید کارت ({room.cardPrice.toLocaleString('fa-IR')} تومان هر کارت)
          </div>

          {/* Stepper with Green Plus and Crimson Minus */}
          <div className="flex items-center justify-between bg-[#08090d] border border-amber-500/30 rounded-2xl p-1.5 shadow-inner">
            <button
              onClick={() => setTicketBuyCount((prev) => Math.min(6, prev + 1))}
              className="w-12 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center transition-all active:scale-95 shadow-md"
              title="افزایش تعداد کارت"
            >
              <Plus className="w-5 h-5" />
            </button>

            <span className="text-xl font-black text-[#FFE600] font-mono px-4">
              {ticketBuyCount.toLocaleString('fa-IR')}
            </span>

            <button
              onClick={() => setTicketBuyCount((prev) => Math.max(1, prev - 1))}
              className="w-12 h-11 rounded-xl bg-rose-900/90 hover:bg-rose-800 text-white font-black flex items-center justify-center transition-all active:scale-95 shadow-md"
              title="کاهش تعداد کارت"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Price Summary */}
          <div className="flex items-center justify-between text-xs sm:text-sm px-1 font-bold">
            <span className="text-slate-400">مبلغ کل:</span>
            <span className="text-[#FFE600] font-mono text-base font-black">
              {(ticketBuyCount * room.cardPrice).toLocaleString('fa-IR')} تومان
            </span>
          </div>

          {/* Large Gold Purchase Button */}
          {user ? (
            <button
              onClick={() => onBuyTickets(ticketBuyCount)}
              className="w-full h-13 rounded-2xl btn-3d-gold text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xl"
            >
              <span>🎮 خرید کارت</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full h-13 rounded-2xl btn-3d-gold text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xl"
            >
              <span>🔐 ورود با پیامک جهت خرید کارت</span>
            </button>
          )}

          {/* Instant Start Testing Trigger */}
          <button
            onClick={handleFastStart}
            className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>تکمیل فوری ظرفیت (۳۰ کارت) و شروع زنده بازی</span>
          </button>
        </div>

        {/* Pre-game Persian Voice Caller Settings & Test */}
        <VoiceCaller
          roomId={room.id}
          currentNumber={null}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          variant="stage"
          autoAnnounce={false}
        />

        {/* Participants List */}
        <div className="card-3d rounded-3xl p-5 border border-amber-500/25 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-white font-black text-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span>👥 شرکت‌کنندگان</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">
              {(room.participants?.length || 0).toLocaleString('fa-IR')} نفر
            </span>
          </div>

          {/* Scrollable list */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {room.participants?.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#080a0f] border border-amber-500/20 hover:border-amber-400/50 transition-all"
              >
                {/* Left in RTL: Card count badge */}
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black font-mono">
                  {p.cardsCount.toLocaleString('fa-IR')} کارت
                </span>

                {/* Right in RTL: User avatar & Name */}
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-100">
                    {p.name}
                    {p.id === user?.id && (
                      <span className="mr-1.5 text-[10px] text-amber-400 font-bold">(شما)</span>
                    )}
                  </span>
                  <div className="w-9 h-9 rounded-full ball-3d text-slate-950 font-black text-xs flex items-center justify-center shadow-md border border-amber-300">
                    {p.avatar || p.name.slice(0, 1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER PHASE 2: IN-GAME PLAY ARENA (image_5a30d6d0.png)
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-24 pt-1 max-w-5xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* Top Bar with Prize Boxes & Audio Control (Matching image_5a30d6d0.png) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 card-3d p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onLeaveRoom}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="خروج از بازی"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={toggleMute}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
            title={isMuted ? 'روشن کردن صدای گوینده فارسی' : 'قطع صدای گوینده'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Prize Boxes */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          {/* جایزه دبرنا خطی */}
          <div className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-[#0d1017] border-2 border-amber-500/40 text-center min-w-[130px] shadow-lg">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-300">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>جایزه دبرنا خطی</span>
            </div>
            <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
              {room.line1Prize.toLocaleString('fa-IR')}
              <span className="text-[10px] text-amber-200/70 font-normal mr-1">تومان</span>
            </div>
          </div>

          {/* جایزه دبرنا پر */}
          <div className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-gradient-to-br from-[#241a05] via-[#1a1304] to-[#0c0902] border-2 border-amber-400 text-center min-w-[140px] shadow-xl glow-gold">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>جایزه دبرنا پر</span>
            </div>
            <div className="text-sm sm:text-base font-black text-[#FFE600] font-mono mt-0.5">
              {room.tombolaPrize.toLocaleString('fa-IR')}
              <span className="text-[10px] text-amber-200/80 font-normal mr-1">تومان</span>
            </div>
          </div>
        </div>
      </div>

      {/* Large Yellow Center Drawn Ball */}
      <div className="text-center py-2">
        <div className="inline-block relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ball-3d text-slate-950 flex items-center justify-center font-black text-4xl sm:text-5xl shadow-[0_0_40px_rgba(245,158,11,0.55)] border-4 border-amber-300 animate-bounce transition-all">
            {room.currentDrawnNumber || '...'}
          </div>
        </div>

        {/* Persian Voice Caller Component Stage */}
        <div className="max-w-xl mx-auto mt-3 space-y-2">
          <VoiceCaller
            roomId={room.id}
            currentNumber={room.currentDrawnNumber}
            drawnNumbers={room.drawnNumbers}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            variant="stage"
            autoAnnounce={isPlaying}
          />

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsBoardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#111319] hover:bg-[#1a1d26] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span>تابلوی کامل ۹۰ شماره ({room.drawnNumbers?.length || 0} شماره خارج شده)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Winning Milestones Alert Banner */}
      {room.winners?.line1 && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1f1704] via-[#2c2006] to-[#1f1704] border-2 border-amber-400 text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-between animate-pulse shadow-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>
              تبریک! جایزه خط اول (دبرنا خطی) توسط <strong>{room.winners.line1.name}</strong> برنده شد!
            </span>
          </div>
          <span className="font-mono text-amber-300 font-black">
            {room.winners.line1.prize.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      )}

      {room.winners?.tombola && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2e1f04] via-[#473007] to-[#2e1f04] border-2 border-amber-300 text-amber-100 text-sm font-black flex items-center justify-between shadow-2xl glow-gold-luxury">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>
              🎉 دبرنا پر! برنده بزرگ مسابقه: <strong>{room.winners.tombola.name}</strong>
            </span>
          </div>
          <span className="font-mono text-[#FFE600] text-base font-black">
            {room.winners.tombola.prize.toLocaleString('fa-IR')} تومان
          </span>
        </div>
      )}

      {/* Multi-Ticket Arena Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-medium">
          <span>کارت‌های بازی ({room.tickets.length} کارت فعال)</span>
          <span className="text-emerald-400 font-bold">خانه سبز = شماره قرعه‌کشی شده</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {room.tickets.map((ticket, tIdx) => {
            const isUserTicket = ticket.userId === user?.id;

            return (
              <div
                key={ticket.id || tIdx}
                className={`rounded-2xl p-3 border transition-all ${
                  isUserTicket
                    ? 'bg-[#121622] border-2 border-amber-400 shadow-xl glow-gold'
                    : 'bg-[#08090d] border border-amber-500/20'
                }`}
              >
                {/* Ticket Top Name */}
                <div className="text-center pb-2 mb-2 border-b border-amber-500/20 flex items-center justify-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-200">
                    {ticket.userName}
                  </span>
                  {isUserTicket && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-black border border-amber-500/50">
                      کارت شما 👤
                    </span>
                  )}
                </div>

                {/* 3 Rows x 9 Columns Matrix */}
                <div className="grid grid-rows-3 gap-1.5 select-none">
                  {ticket.matrix.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-9 gap-1 sm:gap-1.5">
                      {row.map((val, cIdx) => {
                        const isBlank = val === 0;
                        const isHit = val > 0 && drawnSet.has(val);

                        if (isBlank) {
                          return (
                            <div
                              key={cIdx}
                              className="aspect-square rounded-lg bg-slate-900/40 opacity-20"
                            />
                          );
                        }

                        return (
                          <div
                            key={cIdx}
                            className={`aspect-square rounded-lg font-black text-xs sm:text-sm flex items-center justify-center transition-all ${
                              isHit
                                ? 'bg-[#00a859] text-white shadow-md scale-102 font-black' // Green matched cell as in image_5a30d6d0.png
                                : 'bg-[#232733] text-slate-200' // Dark slate cell
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 90 Ball Board Modal */}
      <BallBoardModal
        isOpen={isBoardOpen}
        onClose={() => setIsBoardOpen(false)}
        drawnNumbers={room.drawnNumbers}
        currentDrawnNumber={room.currentDrawnNumber}
      />
    </div>
  );
};
