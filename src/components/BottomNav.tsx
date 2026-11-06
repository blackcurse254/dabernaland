/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  spinsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  spinsCount = 0,
}) => {
  // Matching the 5 tabs from tombolaplus.com screenshots
  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'خانه', icon: '🏠' },
    { id: 'wheel', label: 'گردونه', icon: '🎡' },
    { id: 'wallet', label: 'کیف پول', icon: '💰' },
    { id: 'rules', label: 'قوانین', icon: '📜' },
    { id: 'profile', label: 'پروفایل', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#06070a]/98 backdrop-blur-xl border-t border-amber-500/25 pb-safe shadow-2xl shadow-black">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-all select-none ${
                isActive ? 'text-[#f59e0b]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {/* Badge for Wheel spins */}
              {item.id === 'wheel' && spinsCount > 0 && (
                <span className="absolute top-1.5 right-1/4 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-black text-slate-950 flex items-center justify-center border border-slate-950 shadow-md">
                  {spinsCount}
                </span>
              )}

              {/* Icon */}
              <span className={`text-xl transition-transform ${isActive ? 'scale-115 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'opacity-65'}`}>
                {item.icon}
              </span>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-black text-[#f59e0b]' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>

              {/* Underline bar for active state */}
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
