import React from 'react';
import {
  BookOpen,
  Download,
  FlaskConical,
  Search,
  Smartphone,
  UserCheck,
} from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

interface AboutViewProps {
  semester: string;
  version: string;
  effectiveDate: string;
  isDark: boolean;
  onToggleDark: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  semester,
  version,
  effectiveDate,
  isDark,
  onToggleDark,
}) => {
  const steps = [
    {
      icon: Search,
      title: '1. Instant Student Lookup',
      desc: 'Search your batch-section tag (e.g., 263_A) and add extra sections for retake or overlap courses. Your selection is saved automatically.',
    },
    {
      icon: FlaskConical,
      title: '2. Lab Subgroup Filtering',
      desc: 'Whenever practical (P) classes exist for your sections, toggle between All Labs, Group 1, or Group 2 to see only your assigned lab sessions.',
    },
    {
      icon: UserCheck,
      title: '3. Faculty Schedule View',
      desc: 'Switch to the Teacher tab and search by faculty initial (e.g., MHH) or full name to inspect their daily timeline and weekly matrix.',
    },
    {
      icon: Download,
      title: '4. Clean PDF Export',
      desc: 'Expand the Enrolled Courses summary card and click Download PDF to print or save a clean, formatted DIU routine table.',
    },
    {
      icon: Smartphone,
      title: '5. Install as Home-Screen App',
      desc: 'Use your browser’s "Add to Home Screen" or "Install App" option. Your routine stays cached offline even without internet access.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F3F4F6]">
              About Agri Routine
            </h1>
            <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-sm font-bold text-[#15803D] dark:text-[#10B981]">
              {semester} • {version}
            </span>
          </div>
          <ThemeToggle isDark={isDark} onToggleDark={onToggleDark} />
        </div>
        <p className="text-base text-[#64748B] dark:text-[#9CA3AF]">
          Department of Agricultural Science • Daffodil International University
          (Effective {effectiveDate})
        </p>
      </section>

      {/* Why It Was Made */}
      <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#15803D] dark:text-[#10B981]" />
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F3F4F6]">
            Why It Was Made
          </h2>
        </div>
        <p className="text-base leading-relaxed text-[#64748B] dark:text-[#9CA3AF]">
          Traditional department routines are distributed as dense, multi-page
          merged PDFs where students and faculty have to zoom, scroll, and
          manually cross-reference batch codes, lab groups, and room numbers.
          Agri Routine replaces that manual searching with instant section,
          lab-group, and faculty filtering tailored for the Department of
          Agricultural Science at DIU.
        </p>
      </section>

      {/* How to Use It */}
      <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-4">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F3F4F6]">
          How to Use It
        </h2>

        <div className="space-y-3">
          {steps.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-[#15803D] dark:text-[#10B981]">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                  {title}
                </h3>
                <p className="text-base leading-relaxed text-[#64748B] dark:text-[#9CA3AF]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
