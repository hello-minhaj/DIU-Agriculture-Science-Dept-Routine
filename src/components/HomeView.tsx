import React, { useState } from 'react';
import { RefreshCw, Sprout } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HomeViewProps {
  semester: string;
  version: string;
  isDark: boolean;
  onToggleDark: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  semester,
  version,
  isDark,
  onToggleDark,
}) => {
  const [appLogoErr, setAppLogoErr] = useState(false);
  const [deptLogoErr, setDeptLogoErr] = useState(false);

  return (
    <div className="no-print space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 text-sm font-bold text-[#15803D] dark:text-[#10B981]">
          {semester} • {version}
        </span>
        <ThemeToggle isDark={isDark} onToggleDark={onToggleDark} />
      </div>

      <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] max-w-xl mx-auto text-center py-10 px-4 sm:px-8">
        {/* App Logo */}
        <div className="flex justify-center mb-5">
          {!appLogoErr ? (
            <img
              src="/favicon.svg"
              alt="Agri Routine Logo"
              onError={() => setAppLogoErr(true)}
              className="w-16 h-16 rounded-2xl shadow-sm object-contain"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#15803D] dark:bg-[#16A34A] text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Short Description */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F3F4F6] tracking-tight">
          Class Routine | DIU Agricultural Science
        </h1>

        <p className="mt-3 text-base leading-relaxed text-[#64748B] dark:text-[#9CA3AF]">
          Search, filter, and download section schedules, lab groups, and
          faculty class routines for the Department of Agricultural Science,
          Daffodil International University.
        </p>

        {/* Auto-Update Notice */}
        <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-2.5 text-sm font-medium text-[#15803D] dark:text-[#10B981]">
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>
            Automatically updates whenever a new version is published by the
            department.
          </span>
        </div>

        {/* Department Logo & Credit */}
        <div className="border-t border-[#E2E8F0] dark:border-zinc-800/80 pt-6 mt-8 space-y-2.5">
          {!deptLogoErr ? (
            <div className="inline-flex items-center justify-center rounded-xl bg-white p-2 shadow-xs">
              <img
                src="/images/dept-logo.png"
                alt="Department of Agricultural Science"
                onError={() => setDeptLogoErr(true)}
                className="h-14 w-auto mx-auto object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 text-sm font-extrabold text-[#15803D] dark:text-[#10B981]">
              DIU • Dept. of AGS
            </div>
          )}

          <p className="text-sm font-semibold text-[#64748B] dark:text-[#9CA3AF]">
            Powered by Department of Agricultural Science
          </p>
        </div>
      </section>
    </div>
  );
};
