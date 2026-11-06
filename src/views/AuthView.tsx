/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Phone,
  KeyRound,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Gift,
  Coins,
  Trophy,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';
import { User } from '../types';

interface AuthViewProps {
  onSuccess: (user: User, token: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('09123456789');
  const [code, setCode] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
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
      const res = await sendOtp(cleanPhone);
      const generatedCode = res.previewCode || '12345';
      setPreviewCode(generatedCode);
      setStep('code');
      setCountdown(120);
      setCode(generatedCode); // Auto-fill for seamless preview sandbox testing
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال پیامک کد ورود');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!code || code.length < 5) {
      setError('لطفاً کد ۵ رقمی پیامک شده را به صورت کامل وارد فرمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(phone.trim(), code.trim());
      if (res.user && res.token) {
        onSuccess(res.user, res.token);
      } else {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'کد تایید وارد شده نامعتبر یا منقضی است');
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetPhone = (preset: string) => {
    setPhone(preset);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#030406] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Vazirmatn',sans-serif] selection:bg-amber-500 selection:text-black">
      {/* Dynamic Background Luxury Radial Glow & Rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full gold-radial-aura opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3 relative">
            <div className="w-20 h-20 rounded-3xl ball-3d border-2 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center justify-center text-slate-950 font-black text-3xl">
              🎲
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-[#030406] text-slate-950 flex items-center justify-center shadow-lg">
              <Trophy className="w-4 h-4 fill-current" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#FFE600] to-amber-400 tracking-tight">
            دبــرنا لنــد
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/75 mt-1 font-bold">
            پادشاهی دبرنا آنلاین، رقابت‌های زنده و جوایز میلیونی
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="card-3d rounded-3xl p-6 sm:p-8 border-2 border-amber-500/35 shadow-2xl relative">
          {/* Top Badge: 100k Gift */}
          <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-[#2a1d06] via-[#3d2a08] to-[#2a1d06] border border-amber-400/40 text-amber-300 flex items-center justify-between text-xs font-bold shadow-inner">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FFE600] shrink-0 animate-bounce" />
              <span>هدیه ویژه عضویت جدید</span>
            </div>
            <span className="font-mono text-[#FFE600] font-black text-sm">
              ۱۰۰،۰۰۰ تومان رایگان
            </span>
          </div>

          {/* Step Header */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-white flex items-center justify-center gap-2">
              {step === 'phone' ? (
                <>
                  <Phone className="w-5 h-5 text-amber-400" />
                  <span>ورود / ثبت‌نام در دبرنا لند</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>کد تایید پیامکی</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {step === 'phone'
                ? 'برای ورود به میزهای بازی و دریافت شارژ اولیه، شماره همراه خود را وارد کنید:'
                : `کد پیامک شده ۵ رقمی به شماره ${phone} را وارد نمایید:`}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Sandbox Auto-Fill Helper Notification */}
          {previewCode && step === 'code' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#1f1906] border-2 border-amber-400/60 text-amber-200 text-xs shadow-lg glow-gold">
              <div className="flex items-center justify-between gap-1 mb-1 font-bold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-[#FFE600]" />
                  شبیه‌ساز سامانه پیامک (کاوهنگار)
                </span>
                <span className="font-mono bg-black/60 px-2.5 py-1 rounded-xl text-[#FFE600] text-sm font-black tracking-widest border border-amber-500/50">
                  {previewCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                کد یکبار مصرف شبیه‌سازی شد و به طور خودکار جای‌گذاری گردید. کافیست دکمه زیر را لمس فرمایید.
              </p>
            </div>
          )}

          {/* Form */}
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
                  شماره تلفن همراه (بدون پیش‌شماره کشور)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    maxLength={11}
                    dir="ltr"
                    className="w-full h-13 bg-[#08090d] border-2 border-amber-500/30 focus:border-amber-400 rounded-2xl px-4 text-center font-mono text-lg font-bold tracking-wider text-[#FFE600] outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                    +۹۸
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons for Test/Demo */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span>تست سریع شماره‌های نمونه:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPresetPhone('09123456789')}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/20 text-amber-300 font-mono text-xs transition-colors"
                  >
                    ۰۹۱۲۳۴۵۶۷۸۹
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetPhone('09359876543')}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/20 text-amber-300 font-mono text-xs transition-colors"
                  >
                    ۰۹۳۵۹۸۷۶۵۴۳
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 rounded-2xl btn-3d-gold text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xl disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>در حال ارسال پیامک...</span>
                ) : (
                  <>
                    <span>دریافت کد تایید یکبار مصرف (OTP)</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  کد تایید ۵ رقمی را وارد نمایید
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="— — — — —"
                  maxLength={5}
                  dir="ltr"
                  autoFocus
                  className="w-full h-14 bg-[#08090d] border-2 border-amber-400 rounded-2xl text-center font-mono text-2xl tracking-[0.5em] text-[#FFE600] outline-none transition-all shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-1 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>تغییر شماره ({phone})</span>
                </button>

                <div>
                  {countdown > 0 ? (
                    <span className="font-mono text-amber-400">
                      ارسال مجدد ({Math.floor(countdown / 60)}:
                      {(countdown % 60).toString().padStart(2, '0')})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 rounded-2xl btn-3d-gold text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <span>در حال اعتبارسنجی...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>تایید و ورود مستقیم به بازی</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust Guarantees */}
          <div className="mt-6 pt-5 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400 font-medium">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>رمزنگاری امن SSL</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>واریز و برداشت آنی</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Lock className="w-4 h-4 text-sky-400" />
              <span>ورود بدون رمز عبور</span>
            </div>
          </div>
        </div>

        {/* Mandatory Policy Disclaimer */}
        <p className="text-center text-[11px] text-slate-500 mt-4 leading-relaxed">
          ورود به دبرنا لند به منزله تایید کلیه قوانین اتاق‌های بازی و استفاده منصفانه از جوایز است.
        </p>
      </div>
    </div>
  );
};
