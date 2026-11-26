import React, { useState } from 'react';
import {
  GraduationCap,
  Info,
  Mail,
  Sprout,
  UserCheck,
} from 'lucide-react';

export type NavTab = 'student' | 'teacher' | 'about' | 'contact';

interface NavLayoutProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'teacher', label: 'Teacher', icon: UserCheck },
  { id: 'about', label: 'About', icon: Info },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export const NavLayout: React.FC<NavLayoutProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* Desktop Fixed Left Vertical Navigation Rail (md and above) */}
      <aside
        aria-label="Desktop navigation"
        className="no-print hidden md:flex fixed left-4 top-4 bottom-4 w-24 z-40 rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] flex-col items-center py-5 justify-between shadow-sm dark:shadow-black/30"
      >
        {/* Top: AGS Sprout Emblem */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#15803D] dark:bg-[#16A34A] text-white shadow-xs">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-sm font-extrabold tracking-wider text-[#0F172A] dark:text-[#F3F4F6]">
            AGS
          </span>
        </div>

        {/* Center: 4 Vertical Icon-Above-Label Tabs */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeTab(id)}
                className={`relative w-full flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-1 transition-all ${
                  isActive
                    ? 'bg-[#15803D] dark:bg-[#16A34A] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#23282E]/70 hover:text-[#0F172A] dark:hover:text-[#F3F4F6]'
                }`}
              >
                {isActive && (
                  <span className="absolute -left-2.5 top-3 bottom-3 w-1 rounded-r-full bg-[#10B981]" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold leading-none">
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Department Logo */}
        <div className="w-12 h-12 rounded-xl bg-white/95 p-1.5 shadow-sm flex items-center justify-center mx-auto">
          {!logoError ? (
            <img
              src="/images/dept-logo.png"
              alt="Department of Agricultural Science"
              onError={() => setLogoError(true)}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[11px] font-bold tracking-widest text-[#15803D] uppercase">
              DIU
            </span>
          )}
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar (< md) */}
      <nav
        aria-label="Mobile navigation"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#16191D]/95 backdrop-blur border-t border-[#E2E8F0] dark:border-[#23282E] px-2 py-2"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeTab(id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#15803D] dark:bg-[#16A34A] text-white'
                    : 'text-[#64748B] dark:text-[#9CA3AF]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
