/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Grid } from 'lucide-react';

interface BallBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawnNumbers: number[];
  currentDrawnNumber: number | null;
}

export const BallBoardModal: React.FC<BallBoardModalProps> = ({
  isOpen,
  onClose,
  drawnNumbers,
  currentDrawnNumber,
}) => {
  if (!isOpen) return null;

  const drawnSet = new Set(drawnNumbers);

  const numbers: number[] = [];
  for (let i = 1; i <= 90; i++) numbers.push(i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card border border-slate-700/80 rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تابلوی کلی ۹۰ شماره دبرنا</h3>
              <p className="text-[11px] text-slate-400">
                {drawnNumbers.length} شماره از ۹۰ شماره خوانده شده است
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10 x 9 Grid */}
        <div className="overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
            {numbers.map((num) => {
              const isDrawn = drawnSet.has(num);
              const isCurrent = num === currentDrawnNumber;

              return (
                <div
                  key={num}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow-lg shadow-amber-400/40 z-10 animate-pulse'
                      : isDrawn
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              خوانده شده
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              شماره جاری
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700" />
              باقیمانده
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
