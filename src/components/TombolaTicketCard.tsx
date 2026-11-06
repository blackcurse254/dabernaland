/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Ticket } from '../types';
import { Check, Sparkles, Trophy } from 'lucide-react';
import { SoundEngine } from '../utils/audio';

interface TombolaTicketCardProps {
  ticket: Ticket;
  drawnNumbers: number[];
  currentDrawnNumber: number | null;
  onToggleMark?: (ticketId: string, row: number, col: number) => void;
  index: number;
}

export const TombolaTicketCard: React.FC<TombolaTicketCardProps> = ({
  ticket,
  drawnNumbers,
  currentDrawnNumber,
  onToggleMark,
  index,
}) => {
  const drawnSet = new Set(drawnNumbers);

  // Check rows status
  const rowCounts = ticket.matrix.map((row, rIdx) => {
    let filled = 0;
    let marked = 0;
    row.forEach((val, cIdx) => {
      if (val > 0) {
        filled++;
        if (ticket.marked[rIdx][cIdx] || drawnSet.has(val)) {
          marked++;
        }
      }
    });
    return { filled, marked, isFull: marked === 5 };
  });

  const fullRowsCount = rowCounts.filter((r) => r.isFull).length;
  const isTombola = fullRowsCount === 3;

  const handleCellClick = (r: number, c: number, val: number) => {
    if (val === 0) return;
    SoundEngine.playMarkSound();
    if (onToggleMark) {
      onToggleMark(ticket.id, r, c);
    }
  };

  return (
    <div
      className={`relative rounded-3xl p-3.5 border transition-all ${
        isTombola
          ? 'bg-gradient-to-br from-amber-950/90 via-[#17142b] to-purple-950/90 border-amber-400 glow-gold shadow-2xl'
          : fullRowsCount > 0
          ? 'bg-gradient-to-br from-[#101733] to-[#1c1236] border-emerald-500/80 glow-emerald shadow-xl'
          : 'card-3d border-slate-800/90'
      }`}
    >
      {/* Ticket Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg ball-3d-purple text-white font-black text-xs flex items-center justify-center shadow-md">
            {index + 1}
          </span>
          <span className="text-xs font-black text-slate-200">
            کارت دبرنا #{ticket.id.slice(-4)}
          </span>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {isTombola && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black flex items-center gap-1 animate-bounce shadow-md">
              <Trophy className="w-3 h-3" />
              دبرنا کامل!
            </span>
          )}
          {!isTombola && fullRowsCount === 2 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-500/50 font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              خط دو برنده
            </span>
          )}
          {!isTombola && fullRowsCount === 1 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              خط یک برنده
            </span>
          )}
          <div className="text-slate-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
            {rowCounts.reduce((acc, r) => acc + r.marked, 0)}/15
          </div>
        </div>
      </div>

      {/* 3x9 Grid Matrix with 3D tactile number tokens */}
      <div className="grid grid-rows-3 gap-1.5 select-none">
        {ticket.matrix.map((row, rIdx) => {
          const isRowFull = rowCounts[rIdx].isFull;

          return (
            <div
              key={rIdx}
              className={`grid grid-cols-9 gap-1 sm:gap-1.5 p-1 rounded-2xl transition-all ${
                isRowFull ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-950/60'
              }`}
            >
              {row.map((val, cIdx) => {
                const isBlank = val === 0;
                const isMarked = !isBlank && (ticket.marked[rIdx][cIdx] || drawnSet.has(val));
                const isCurrentHit = val > 0 && val === currentDrawnNumber;

                if (isBlank) {
                  return (
                    <div
                      key={cIdx}
                      className="aspect-square rounded-xl bg-slate-900/40 border border-slate-800/40 flex items-center justify-center opacity-30"
                    />
                  );
                }

                return (
                  <button
                    type="button"
                    key={cIdx}
                    onClick={() => handleCellClick(rIdx, cIdx, val)}
                    className={`relative aspect-square rounded-xl font-black text-xs sm:text-sm flex items-center justify-center transition-all ${
                      isCurrentHit
                        ? 'ball-3d text-slate-950 scale-110 z-10 animate-bounce'
                        : isMarked
                        ? 'token-marked scale-100'
                        : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-100 border border-slate-700/80 shadow-md active:scale-95'
                    }`}
                  >
                    {val}
                    {isMarked && !isCurrentHit && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center border border-emerald-400">
                        <Check className="w-1.5 h-1.5 text-emerald-400 stroke-[4]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Row completion progress indicators */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 px-1 font-medium">
        <span>سطر ۱: {rowCounts[0].marked}/۵</span>
        <span>سطر ۲: {rowCounts[1].marked}/۵</span>
        <span>سطر ۳: {rowCounts[2].marked}/۵</span>
      </div>
    </div>
  );
};
