/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Phone, KeyRound, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'code' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError('لطفاً شماره موبایل معتبر ۱۱ رقمی (شروع با ۰۹) وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(cleanPhone);
      setStep('code');
      setCountdown(120);
      setCode('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال پیامک');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!code || code.length < 5) {
      setError('لطفاً کد تایید ۵ رقمی را کامل وارد فرمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(phone.trim(), code.trim());
      onSuccess(res.user, res.token);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'کد تایید نادرست است');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm glass-card border border-slate-700/80 rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5 mb-3 shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              {step === 'phone' ? <Phone className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">
            {step === 'phone' ? 'ورود به دبرنا لند' : 'تایید شماره موبایل'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'phone'
              ? 'شماره همراه خود را جهت دریافت کد تایید پیامکی وارد فرمایید'
              : `کد پیامک شده به شماره ${phone} را وارد نمایید`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Sandbox Test Mode Helper Banner */}
        {previewCode && step === 'code' && (
          <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs">
            <div className="flex items-center justify-between gap-1 mb-1 font-semibold text-purple-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                شبیه‌ساز پیامک (کاوهنگار / SMS.ir)
              </span>
              <span className="font-mono bg-purple-900/50 px-2 py-0.5 rounded text-emerald-300 text-sm tracking-wider">
                {previewCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              کد به صورت خودکار قرار داده شد. برای تست کافیست روی دکمه تایید کلیک کنید.
            </p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                شماره تلفن همراه
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  maxLength={11}
                  dir="ltr"
                  className="w-full h-12 bg-slate-900/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 text-center font-mono text-base tracking-wider text-white outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'در حال ارسال...' : 'ارسال کد یکبار مصرف (OTP)'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                کد ۵ رقمی تایید
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="— — — — —"
                maxLength={5}
                dir="ltr"
                className="w-full h-14 bg-slate-900/90 border border-emerald-500/50 focus:border-emerald-400 rounded-xl text-center font-mono text-2xl tracking-[0.5em] text-emerald-400 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                ویرایش شماره
              </button>

              <div>
                {countdown > 0 ? (
                  <span>
                    ارسال مجدد ({Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, '0')})
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    ارسال مجدد کد
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'در حال بررسی...' : 'تایید و ورود به بازی'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
