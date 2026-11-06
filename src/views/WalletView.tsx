/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, CreditCard, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { User, Transaction } from '../types';
import { fetchTransactions, requestWithdraw } from '../services/api';

interface WalletViewProps {
  user: User | null;
  onOpenDeposit: () => void;
  onUpdateUser: (user: Partial<User>) => void;
  onOpenAuth: () => void;
  onBack: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  onOpenDeposit,
  onUpdateUser,
  onOpenAuth,
  onBack,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [sheba, setSheba] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchTransactions(user?.id)
      .then((res) => {
        if (res.transactions) setTransactions(res.transactions);
      })
      .catch((e) => console.log('Fetch transactions error:', e));
  }, [user]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!user) {
      onOpenAuth();
      return;
    }

    if (withdrawAmount < 50000) {
      setFeedback({ type: 'error', message: 'حداقل مبلغ برداشت ۵۰،۰۰۰ تومان می‌باشد.' });
      return;
    }

    if (user.balance < withdrawAmount) {
      setFeedback({ type: 'error', message: 'موجودی کیف پول شما کافی نمی‌باشد.' });
      return;
    }

    const cleanSheba = sheba.replace(/\D/g, '');
    if (cleanSheba.length !== 24) {
      setFeedback({ type: 'error', message: 'شماره شبا باید ۲۴ رقم باشد (بدون IR).' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdraw({
        userId: user.id,
        amount: withdrawAmount,
        sheba: cleanSheba,
        cardHolder: cardHolder.trim() || user.name,
      });

      setFeedback({ type: 'success', message: res.message });
      onUpdateUser({ balance: res.balance });
      setTransactions((prev) => [res.transaction, ...prev]);
      setShowWithdrawModal(false);
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'خطا در ثبت درخواست' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* Top Header matching image_798250c3.png */}
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
            <span>کیف پول</span>
            <span>💰</span>
          </h1>
        </div>

        <div className="w-9" />
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Top Luxury Gold Total Balance Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2a1e05] via-[#3b2a07] to-[#171103] border-2 border-amber-400 p-5 sm:p-6 shadow-2xl glow-gold flex items-center justify-between gap-4">
        {/* Left: Golden Money Bag Graphic */}
        <div className="w-14 h-14 rounded-full ball-3d border border-amber-300 flex items-center justify-center text-3xl shadow-xl shrink-0">
          💰
        </div>

        {/* Right: موجودی کل & Amount */}
        <div className="text-right">
          <div className="text-xs text-amber-300/90 font-bold">موجودی کل کیف پول</div>
          <div className="text-3xl sm:text-4xl font-black text-[#FFE600] tabular-nums mt-0.5 drop-shadow-[0_2px_10px_rgba(255,230,0,0.4)]">
            {user ? user.balance.toLocaleString('fa-IR') : '۰'}
          </div>
          <div className="text-xs text-amber-200/80 font-bold mt-0.5">تومان</div>
        </div>
      </div>

      {/* 2. Middle Action Buttons (3D Tactile Buttons) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Right: + واریز (افزایش موجودی) */}
        <div
          onClick={onOpenDeposit}
          className="cursor-pointer rounded-2xl btn-3d-green p-5 sm:p-6 text-white text-center shadow-xl active:scale-[0.98] transition-all flex flex-col items-center justify-center"
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-1.5 shadow-inner">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <div className="text-base sm:text-lg font-black">+ واریز</div>
          <div className="text-[11px] opacity-90 mt-0.5 font-bold">افزایش موجودی</div>
        </div>

        {/* Left: برداشت (انتقال به حساب) */}
        <div
          onClick={() => setShowWithdrawModal(true)}
          className="cursor-pointer rounded-2xl btn-3d-gold p-5 sm:p-6 text-slate-950 text-center shadow-xl active:scale-[0.98] transition-all flex flex-col items-center justify-center border border-amber-300/40"
        >
          <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center mb-1.5 shadow-inner">
            <CreditCard className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-base sm:text-lg font-black">برداشت وجه</div>
          <div className="text-[11px] opacity-90 mt-0.5 font-bold">انتقال آنی به حساب (پایا)</div>
        </div>
      </div>

      {/* 3. Transaction History Table */}
      <div className="rounded-2xl card-3d border border-amber-500/25 p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-300 pb-2 border-b border-amber-500/20">
          <span>تاریخچه تراکنش‌ها</span>
          <span>📜</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">مبلغ (تومان)</th>
                <th className="py-2.5 px-3">نوع تراکنش</th>
                <th className="py-2.5 px-3">توضیحات</th>
                <th className="py-2.5 px-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <tr key={tx.id} className="border-b border-slate-800/60 text-slate-200">
                    <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold tabular-nums text-emerald-400">
                      {tx.amount.toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                        {tx.type === 'deposit'
                          ? 'واریز'
                          : tx.type === 'withdraw'
                          ? 'برداشت'
                          : tx.type === 'card_purchase'
                          ? 'خرید کارت'
                          : 'جایزه دبرنا'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">{tx.description}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 font-mono">{tx.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    موردی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0e162f] border border-amber-600/40 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white text-center mb-1">درخواست برداشت وجه</h3>
            <p className="text-xs text-slate-400 text-center mb-4">انتقال آنی به شماره شبای بانکی پایا</p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  مبلغ برداشت (تومان)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-4 text-center font-bold text-sm text-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  شماره شبا (۲۴ رقم بدون IR)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={24}
                    value={sheba}
                    onChange={(e) => setSheba(e.target.value.replace(/\D/g, ''))}
                    placeholder="980170000000108923456001"
                    dir="ltr"
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-11 text-center font-mono text-xs text-white outline-none"
                  />
                  <span className="absolute right-3 top-3 font-mono text-xs font-bold text-slate-400">
                    IR
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  نام صاحب حساب
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="امیرعلی یوسفی"
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-4 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'در حال ثبت...' : 'تایید و انتقال به حساب'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
