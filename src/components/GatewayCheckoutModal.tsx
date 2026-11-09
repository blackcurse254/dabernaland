/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, CreditCard, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { verifyDeposit } from '../services/api';
import { Transaction } from '../types';

interface GatewayCheckoutModalProps {
  isOpen: boolean;
  trackingCode: string;
  amount: number;
  userId: string;
  gateway: string;
  onSuccess: (newBalance: number, tx: Transaction) => void;
  onCancel: () => void;
}

export const GatewayCheckoutModal: React.FC<GatewayCheckoutModalProps> = ({
  isOpen,
  trackingCode,
  amount,
  userId,
  gateway,
  onSuccess,
  onCancel,
}) => {
  const [cardNumber, setCardNumber] = useState('6037-9975-****-4218');
  const [cvv2, setCvv2] = useState('742');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePaySuccess = async () => {
    setIsProcessing(true);
    try {
      const res = await verifyDeposit({
        userId,
        amount,
        trackingCode,
        status: 'successful',
      });
      if (res.success && res.balance !== undefined && res.transaction) {
        onSuccess(res.balance, res.transaction);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayFail = async () => {
    setIsProcessing(true);
    try {
      await verifyDeposit({
        userId,
        amount,
        trackingCode,
        status: 'failed',
      });
      onCancel();
    } catch {
      onCancel();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Gateway Header simulating Iranian Shaparak / Zibal */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>درگاه پرداخت امن شاپرک</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {gateway === 'zibal' ? 'زیبال' : gateway === 'zarinpal' ? 'زرین‌پال' : 'سامان'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">shaparak.ir / sandbox</div>
            </div>
          </div>
          <div className="text-left font-mono text-[11px] text-slate-400">
            <div>کد پیگیری:</div>
            <div className="text-emerald-400 font-bold">{trackingCode}</div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Order Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 mb-1">مبلغ قابل پرداخت</div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              {amount.toLocaleString('fa-IR')}{' '}
              <span className="text-xs font-normal text-slate-400">تومان</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              معادل {(amount * 10).toLocaleString('fa-IR')} ریال
            </div>
          </div>

          {/* Simulated Card input details */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">شماره کارت شتابی (تستی)</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  dir="ltr"
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-4 text-center font-mono text-sm text-slate-200 outline-none"
                />
                <CreditCard className="w-4 h-4 absolute right-3 top-3.5 text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">CVV2</label>
                <input
                  type="text"
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value)}
                  dir="ltr"
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-center font-mono text-sm text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رمز دوم پویا</label>
                <input
                  type="password"
                  readOnly
                  value="•••••"
                  className="w-full h-11 bg-slate-950/60 border border-slate-800 rounded-xl px-3 text-center text-xs text-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl leading-relaxed text-center">
            تراکنش تحت بستر شبکه امن شاپرک و درگاه بانکی شتاب انجام می‌پذیرد.
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePaySuccess}
              disabled={isProcessing}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isProcessing ? 'در حال تایید بانک...' : 'تکمیل و پرداخت موفق'}
            </button>

            <button
              onClick={handlePayFail}
              disabled={isProcessing}
              className="h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1 transition-all"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
