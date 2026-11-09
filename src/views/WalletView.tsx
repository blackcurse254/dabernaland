/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Trophy,
  Copy,
  Check,
  RotateCcw,
  Receipt,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { User, Transaction } from '../types';
import { fetchTransactions, requestWithdraw } from '../services/api';

interface WalletViewProps {
  user: User | null;
  onOpenDeposit: () => void;
  onUpdateUser: (user: Partial<User>) => void;
  onOpenAuth: () => void;
  onBack: () => void;
}

type FilterType = 'all' | 'deposit' | 'withdraw' | 'prize';

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  onOpenDeposit,
  onUpdateUser,
  onOpenAuth,
  onBack,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [sheba, setSheba] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadTransactions = (showLoader = false) => {
    if (!user?.id) return;
    if (showLoader) setIsRefreshing(true);
    fetchTransactions(user.id)
      .then((res) => {
        if (res.transactions) setTransactions(res.transactions);
      })
      .catch((e) => console.log('Fetch transactions error:', e))
      .finally(() => {
        if (showLoader) {
          setTimeout(() => setIsRefreshing(false), 300);
        }
      });
  };

  useEffect(() => {
    loadTransactions();
  }, [user?.id]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
      setSheba('');
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'خطا در ثبت درخواست برداشت' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'deposit') return tx.type === 'deposit';
    if (activeFilter === 'withdraw') return tx.type === 'withdraw';
    if (activeFilter === 'prize') return tx.type === 'game_prize' || tx.type === 'wheel_prize';
    return true;
  });

  // Calculate summary metrics
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'successful')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdraw' && t.status !== 'failed')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'successful':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>موفق</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#FFE600] border border-amber-500/40 text-[11px] font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>در حال بررسی (پایا)</span>
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>ناموفق</span>
          </span>
        );
    }
  };

  const getTransactionTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'withdraw':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[#FFE600] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'game_prize':
      case 'wheel_prize':
        return (
          <div className="w-9 h-9 rounded-xl ball-3d text-slate-950 flex items-center justify-center shrink-0 border border-amber-300 shadow-md">
            <Trophy className="w-4 h-4 fill-slate-950" />
          </div>
        );
      case 'card_purchase':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
    }
  };

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'واریز به کیف پول';
      case 'withdraw':
        return 'برداشت وجه (پایا)';
      case 'game_prize':
        return 'جایزه دبرنا';
      case 'wheel_prize':
        return 'جایزه گردونه شانس';
      case 'card_purchase':
        return 'خرید کارت بازی';
      default:
        return 'تراکنش';
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right font-['Vazirmatn',sans-serif]">
      {/* Top Header */}
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
            <span>کیف پول و مدیریت مالی</span>
            <span>💰</span>
          </h1>
        </div>

        <button
          onClick={() => loadTransactions(true)}
          disabled={isRefreshing}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
          title="بروزرسانی تراکنش‌ها"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
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
          <div className="text-xs text-amber-300/90 font-bold">موجودی قابل استفاده کیف پول</div>
          <div className="text-3xl sm:text-4xl font-black text-[#FFE600] font-mono mt-0.5 drop-shadow-[0_2px_10px_rgba(255,230,0,0.4)]">
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
          <div className="text-base sm:text-lg font-black">+ واریز وجه</div>
          <div className="text-[11px] opacity-90 mt-0.5 font-bold">شارژ آنلاین با شتاب</div>
        </div>

        {/* Left: برداشت (انتقال به حساب) */}
        <div
          onClick={() => (user ? setShowWithdrawModal(true) : onOpenAuth())}
          className="cursor-pointer rounded-2xl btn-3d-gold p-5 sm:p-6 text-slate-950 text-center shadow-xl active:scale-[0.98] transition-all flex flex-col items-center justify-center border border-amber-300/40"
        >
          <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center mb-1.5 shadow-inner">
            <CreditCard className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-base sm:text-lg font-black">برداشت وجه</div>
          <div className="text-[11px] opacity-90 mt-0.5 font-bold">واریز به شبا بانکی (پایا)</div>
        </div>
      </div>

      {/* 3. Financial Metrics Quick Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl card-3d border border-amber-500/20 text-center">
          <span className="text-[11px] text-slate-400 font-medium">مجموع واریزی‌ها</span>
          <div className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">
            {totalDeposits.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl card-3d border border-amber-500/20 text-center">
          <span className="text-[11px] text-slate-400 font-medium">مجموع برداشت‌ها</span>
          <div className="text-sm sm:text-base font-black text-[#FFE600] font-mono mt-0.5">
            {totalWithdrawals.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl card-3d border border-amber-500/20 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 font-medium">تعداد کل تراکنش‌ها</span>
          <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
            {transactions.length.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">عملیات</span>
          </div>
        </div>
      </div>

      {/* 4. Transaction History Section with Filter Tabs & Rich Details */}
      <div className="rounded-3xl card-3d border border-amber-500/25 p-4 sm:p-5 shadow-xl space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">تاریخچه تراکنش‌های اخیر</h2>
              <p className="text-[11px] text-slate-400">ریز جزئیات واریزها، برداشت‌ها و وضعیت بانکی</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              همه ({transactions.length})
            </button>
            <button
              onClick={() => setActiveFilter('deposit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'deposit'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              واریزها
            </button>
            <button
              onClick={() => setActiveFilter('withdraw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'withdraw'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              برداشت‌ها
            </button>
            <button
              onClick={() => setActiveFilter('prize')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === 'prize'
                  ? 'bg-[#FFE600] text-slate-950 font-black shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              جوایز
            </button>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'game_prize' || tx.type === 'wheel_prize';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="cursor-pointer p-3.5 rounded-2xl bg-[#080a0f] hover:bg-[#0e121a] border border-amber-500/15 hover:border-amber-400/50 transition-all flex items-center justify-between gap-3 group"
                >
                  {/* Left (in RTL): Amount & Status Badge */}
                  <div className="text-left shrink-0">
                    <div
                      className={`text-sm sm:text-base font-black font-mono tabular-nums ${
                        isCredit ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {tx.amount.toLocaleString('fa-IR')}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">تومان</span>
                    </div>
                    <div className="mt-1 flex justify-end">{getStatusBadge(tx.status)}</div>
                  </div>

                  {/* Right (in RTL): Icon, Title, Description, Date & Tracking Code */}
                  <div className="flex items-center gap-3 overflow-hidden text-right">
                    {getTransactionTypeIcon(tx.type)}
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {tx.title || getTransactionTypeLabel(tx.type)}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="font-mono">{tx.date}</span>
                        {tx.trackingCode && (
                          <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300/80 border border-amber-500/20">
                            کد: {tx.trackingCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-slate-500 mx-auto flex items-center justify-center text-2xl">
              🧾
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300">
              هیچ تراکنشی در این دسته‌بندی یافت نشد
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              تراکنش‌های واریز، برداشت وجه و جوایز دبرنا به محض انجام با کد پیگیری در این بخش ثبت می‌گردند.
            </p>
            <button
              onClick={onOpenDeposit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-3d-green text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزایش موجودی (واریز)</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Detailed Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Vazirmatn',sans-serif]">
          <div className="relative w-full max-w-md card-3d rounded-3xl p-6 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-right">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center transition-colors"
              title="بستن رسید"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center mb-5 pb-4 border-b border-amber-500/20">
              <div className="w-12 h-12 rounded-2xl ball-3d mx-auto flex items-center justify-center mb-2 shadow-lg border border-amber-300">
                <Receipt className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-base font-black text-white">رسید دیجیتال تراکنش</h3>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">سامانه مالی دبرنا لند</p>
            </div>

            {/* Status and Big Amount */}
            <div className="p-4 rounded-2xl bg-[#090b10] border border-amber-500/30 text-center mb-4 space-y-2">
              <div className="text-xs text-slate-400 font-medium">مبلغ تراکنش</div>
              <div className="text-2xl sm:text-3xl font-black text-[#FFE600] font-mono drop-shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                {selectedTx.amount.toLocaleString('fa-IR')}{' '}
                <span className="text-xs text-amber-300 font-normal">تومان</span>
              </div>
              <div className="pt-1">{getStatusBadge(selectedTx.status)}</div>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">نوع عملیات:</span>
                <span className="font-bold text-white">{getTransactionTypeLabel(selectedTx.type)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">کد پیگیری بانکی:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(selectedTx.trackingCode)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                    title="کپی کد پیگیری"
                  >
                    {copiedCode === selectedTx.trackingCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="font-mono font-bold text-[#FFE600]">{selectedTx.trackingCode}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">تاریخ و زمان:</span>
                <span className="font-mono text-slate-200">{selectedTx.date}</span>
              </div>

              {selectedTx.sheba && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">شماره شبا مقصد:</span>
                  <span className="font-mono text-emerald-400 text-[11px]">{selectedTx.sheba}</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">توضیحات:</span>
                <span className="text-slate-200 font-medium text-[11px] leading-relaxed">
                  {selectedTx.description}
                </span>
              </div>
            </div>

            {/* Trust Seal */}
            <div className="mt-5 pt-3 border-t border-amber-500/20 flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>تایید شده توسط پروتکل رمزنگاری بانکی شتاب / پایا</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['Vazirmatn',sans-serif]">
          <div className="relative w-full max-w-sm bg-[#0e162f] border border-amber-600/40 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white text-center mb-1">درخواست برداشت وجه</h3>
            <p className="text-xs text-slate-400 text-center mb-4">انتقال به شماره شبای بانکی در چرخه پایا</p>

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
                  placeholder="نام و نام خانوادگی صاحب حساب"
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
