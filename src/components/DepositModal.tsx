/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { requestDeposit } from '../services/api';

interface DepositModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onProceedToCheckout: (trackingCode: string, amount: number, gateway: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  userId,
  onClose,
  onProceedToCheckout,
}) => {
  const [amount, setAmount] = useState<number>(100000);
  const [gateway, setGateway] = useState<'zibal' | 'zarinpal' | 'saman'>('zibal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < 10000) {
      setError('حداقل مبلغ شارژ ۱۰،۰۰۰ تومان می‌باشد.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestDeposit({
        userId,
        amount,
        gateway,
      });
      onProceedToCheckout(res.trackingCode, res.amount, gateway);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در اتصال به درگاه');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm glass-card border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-2 mb-2 text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">افزایش موجودی کیف پول</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            مبلغ مورد نظر خود را جهت شارژ آنی انتخاب یا وارد فرمایید
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Amounts */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              مبالغ پیشنهادی (تومان)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.slice(0, 3).map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                    amount === amt
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {amt.toLocaleString('fa-IR')}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {quickAmounts.slice(3).map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                    amount === amt
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {amt.toLocaleString('fa-IR')}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              یا مبلغ دلخواه (تومان)
            </label>
            <input
              type="number"
              min={10000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-12 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 text-center font-bold text-base text-emerald-400 outline-none transition-colors"
            />
          </div>

          {/* Gateway selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              انتخاب درگاه پرداخت
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'zibal', name: 'زیبال' },
                { id: 'zarinpal', name: 'زرین‌پال' },
                { id: 'saman', name: 'بانک سامان' },
              ].map((gw) => (
                <button
                  type="button"
                  key={gw.id}
                  onClick={() => setGateway(gw.id as 'zibal' | 'zarinpal' | 'saman')}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    gateway === gw.id
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {gw.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>پرداخت توسط کلیه کارت‌های عضو شبکه شتاب با امنیت بالا</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'در حال اتصال...' : 'انتقال به درگاه پرداخت'}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
