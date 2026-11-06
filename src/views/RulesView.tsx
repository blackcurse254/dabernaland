/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface RulesViewProps {
  onBack?: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'چند نفر می‌توانند در هر بازی شرکت کنند؟',
      a: 'تعداد نامحدودی از بازیکنان می‌توانند در اتاق‌ها شرکت کنند و هر بازیکن تا ۶ کارت می‌تواند برای هر راند خریداری کند.',
    },
    {
      q: 'آیا می‌توانم چند کارت داشته باشم؟',
      a: 'بله، شما می‌توانید در هر بازی بین ۱ تا ۶ کارت دبرنا به صورت همزمان داشته باشید تا شانس برد خود را افزایش دهید.',
    },
    {
      q: 'اگر همزمان با دیگری پر شدم چه می‌شود؟',
      a: 'در صورت برد همزمان در یک شماره خوانده شده، جایزه خط یا دبرنا به صورت منصفانه و مساوی بین برندگان تقسیم می‌گردد.',
    },
    {
      q: 'جایزه دپیلای یک خط چیست؟',
      a: 'جایزه دپیلای خط اول (سنت اول) درصد معینی از کل استخر جوایز کارت‌های فروخته شده آن راند می‌باشد که بلافاصله به کیف پول واریز می‌شود.',
    },
  ];

  return (
    <div className="space-y-4 pb-24 pt-1 max-w-4xl mx-auto px-3 sm:px-4 animate-fade-in text-right">
      {/* Top Header matching image_91e9fb18.png */}
      <div className="relative flex items-center justify-between pb-2 mb-1">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="text-center absolute inset-x-0 pointer-events-none">
          <h1 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-1.5">
            <span>قوانین و مقررات</span>
            <span>📜</span>
          </h1>
        </div>

        <div className="w-9" />
      </div>

      {/* 1. Target Badge Hero (Matching image_91e9fb18.png) */}
      <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-5 shadow-lg text-center flex flex-col items-center justify-center space-y-1">
        <span className="text-2xl mb-1">🎯</span>
        <h2 className="text-base sm:text-lg font-black text-white">قوانین بازی دبرنا</h2>
        <p className="text-xs text-slate-400">آشنایی کامل با نحوه بازی و برنده شدن</p>
      </div>

      {/* 2. Three Metric Cards Row (Matching image_91e9fb18.png) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Right: ۳۰ کارت */}
        <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-3 sm:p-4 text-center">
          <span className="text-xl block mb-1">👥</span>
          <div className="text-lg sm:text-xl font-black text-white">۳۰</div>
          <div className="text-[11px] text-slate-400 mt-0.5">کارت</div>
        </div>

        {/* Middle: ۱۵ خانه فعال */}
        <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-3 sm:p-4 text-center">
          <span className="text-xl block mb-1">🎯</span>
          <div className="text-lg sm:text-xl font-black text-white">۱۵</div>
          <div className="text-[11px] text-slate-400 mt-0.5">خانه فعال</div>
        </div>

        {/* Left: ۹۰ عدد کل */}
        <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-3 sm:p-4 text-center">
          <span className="text-xl block mb-1">🎲</span>
          <div className="text-lg sm:text-xl font-black text-white">۹۰</div>
          <div className="text-[11px] text-slate-400 mt-0.5">عدد کل</div>
        </div>
      </div>

      {/* 3. Section: قوانین اصلی (Matching image_91e9fb18.png) */}
      <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-white pb-2 border-b border-slate-800">
          <span>قوانین اصلی</span>
          <span>📜</span>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              ۱
            </span>
            <div>
              <span className="font-bold text-white">کارت دبرنا: </span>
              <span>هر کارت دبرنا شامل ۲۷ خانه (۳ ردیف در ۹ ستون) است که از این تعداد، ۱۵ خانه با اعداد (۱ تا ۹۰) پر می‌شوند. (۵ عدد در هر ردیف).</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              ۲
            </span>
            <div>
              <span className="font-bold text-white">شروع بازی: </span>
              <span>پس از شروع، اعداد بین ۱ تا ۹۰ به صورت تصادفی و یکی یکی قرعه‌کشی می‌شوند. اگر عدد مربوطه روی کارت شما باشد، به صورت خودکار علامت می‌خورد.</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              ۳
            </span>
            <div>
              <span className="font-bold text-white">دپیلای خط 🥇: </span>
              <span>اولین نفری که تمام ۵ خانه یک ردیف از کارتش علامت بخورد، برنده دپیلای یک خط می‌شود. چند نفر می‌توانند برنده یک خط شوند و داوری ادامه پیدا می‌کند.</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              ۴
            </span>
            <div>
              <span className="font-bold text-white">دپیلای پر 🏆: </span>
              <span>اولین نفری که تمام ۱۵ خانه کارتش علامت بخورد، برنده نهایی (دپیلای پر) می‌شود و بازی به پایان می‌رسد. چند نفر هم می‌توانند برنده دپیلای پر شوند.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section: نحوه برنده شدن (Matching image_91e9fb18.png) */}
      <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-white pb-2 border-b border-slate-800">
          <span>نحوه برنده شدن</span>
          <span>🏆</span>
        </div>

        <div className="space-y-3">
          {/* دپیلای یک خط (Brown container) */}
          <div className="p-4 rounded-xl bg-[#3a2c10] border border-amber-600/40 text-right space-y-1.5">
            <div className="flex items-center justify-end gap-1.5 font-bold text-amber-300 text-xs">
              <span>دپیلای یک خط</span>
              <span>🥇</span>
            </div>
            <ul className="text-[11px] text-amber-100/90 space-y-1 pr-3 list-disc">
              <li>تکمیل کامل یک ردیف (۵ خانه)</li>
              <li>چند نفر می‌توانند برنده شوند</li>
              <li>بازی ادامه پیدا می‌کند</li>
            </ul>
          </div>

          {/* دپیلای پر (Purple container) */}
          <div className="p-4 rounded-xl bg-[#2a133a] border border-purple-600/40 text-right space-y-1.5">
            <div className="flex items-center justify-end gap-1.5 font-bold text-purple-300 text-xs">
              <span>دپیلای پر</span>
              <span>🏆</span>
            </div>
            <ul className="text-[11px] text-purple-100/90 space-y-1 pr-3 list-disc">
              <li>تکمیل تمام ۱۵ خانه کارت</li>
              <li>فقط یک برنده تعیین و بازی به پایان می‌رسد</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Section: سوالات متداول (Matching image_91e9fb18.png) */}
      <div className="rounded-2xl bg-[#0e162f] border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-white pb-2 border-b border-slate-800">
          <span>سوالات متداول</span>
          <span>❓</span>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 flex items-center justify-between text-right text-xs font-bold text-slate-200 hover:text-white"
                >
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  <span>{faq.q}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 pt-1 text-[11px] text-slate-400 border-t border-slate-800/80 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
