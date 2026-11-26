import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Download, Search, UserCheck } from 'lucide-react';
import type { RoutineData, Teacher } from '../types/routine';
import { DayWeekSchedule } from './DayWeekSchedule';
import { PrintSchedule } from './PrintSchedule';
import { ThemeToggle } from './ThemeToggle';

const STORAGE_TEACHER_KEY = 'agri_routine_teacher_id';

interface TeacherViewProps {
  routine: RoutineData;
  isDark: boolean;
  onToggleDark: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  routine,
  isDark,
  onToggleDark,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_TEACHER_KEY);
    if (saved && routine.teachers.some((t) => t.id === saved)) {
      return saved;
    }
    return '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedTeacherId) {
      localStorage.setItem(STORAGE_TEACHER_KEY, selectedTeacherId);
    }
  }, [selectedTeacherId]);

  const selectedTeacher: Teacher | undefined = useMemo(
    () => routine.teachers.find((t) => t.id === selectedTeacherId),
    [routine.teachers, selectedTeacherId]
  );

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return routine.teachers;
    return routine.teachers.filter(
      (t) =>
        t.initial.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [routine.teachers, searchQuery]);

  const teacherClasses = useMemo(
    () => routine.classes.filter((c) => c.teacher_id === selectedTeacherId),
    [routine.classes, selectedTeacherId]
  );

  const uniqueCoursesCount = useMemo(
    () => new Set(teacherClasses.map((c) => c.course_name)).size,
    [teacherClasses]
  );

  const assignedSections = useMemo(
    () => Array.from(new Set(teacherClasses.map((c) => c.section_tag))).sort(),
    [teacherClasses]
  );

  return (
    <div className="space-y-5">
      {/* Top Centered Search Bar + Version Badge + Theme Toggle */}
      <div className="no-print max-w-xl mx-auto flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <div className="h-12 flex items-center gap-2 rounded-xl border border-[#E2E8F0] dark:border-[#23282E] bg-white dark:bg-[#16191D] px-4 focus-within:border-[#16A34A] transition">
            <Search className="w-5 h-5 text-[#64748B] dark:text-[#9CA3AF] shrink-0" />
            <input
              id="teacher-search"
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              placeholder="Search teacher initial (e.g., MHH) or name..."
              className="w-full bg-transparent text-base font-medium text-[#0F172A] dark:text-[#F3F4F6] placeholder:text-[#94A3B8] dark:placeholder:text-[#9CA3AF]/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Toggle teacher list"
              className="text-[#64748B] dark:text-[#9CA3AF]"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 z-30 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] shadow-xl p-1.5 space-y-1">
              {filteredTeachers.length === 0 ? (
                <p className="px-3 py-2.5 text-base text-[#64748B] dark:text-[#9CA3AF]">
                  No faculty found.
                </p>
              ) : (
                filteredTeachers.map((t) => {
                  const isActive = t.id === selectedTeacherId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTeacherId(t.id);
                        setSearchQuery('');
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2.5 text-base transition flex items-center gap-3 ${
                        isActive
                          ? 'bg-[#15803D] dark:bg-[#16A34A] text-white font-bold'
                          : 'text-[#0F172A] dark:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-[#23282E] font-medium'
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-500/10 text-[#15803D] dark:text-[#10B981]'
                        }`}
                      >
                        {t.initial}
                      </span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  );
                })
              )}
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-center py-1.5 text-sm font-semibold text-[#64748B] dark:text-[#9CA3AF]"
              >
                Close
              </button>
            </div>
          )}
        </div>

        <span className="h-12 shrink-0 inline-flex items-center rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] px-3.5 text-sm font-bold text-[#15803D] dark:text-[#10B981] whitespace-nowrap">
          AGS • {routine.version}
        </span>

        <ThemeToggle isDark={isDark} onToggleDark={onToggleDark} />
      </div>

      {/* Clean Empty State or Teacher Header + Summary + Schedule */}
      {!selectedTeacher ? (
        <div className="no-print rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#15803D] dark:text-[#10B981]">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-base font-medium text-[#64748B] dark:text-[#9CA3AF] max-w-md mx-auto">
            Search for a teacher&apos;s initial to view their schedule
          </p>
        </div>
      ) : (
        <>
          <div className="no-print space-y-5">
            <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-[#15803D] dark:border-[#10B981] text-base font-extrabold text-[#15803D] dark:text-[#10B981]">
                {selectedTeacher.initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F3F4F6] truncate">
                  {selectedTeacher.name}
                </h2>
                <p className="text-base text-[#64748B] dark:text-[#9CA3AF]">
                  Initial:{' '}
                  <span className="font-semibold text-[#0F172A] dark:text-[#F3F4F6]">
                    {selectedTeacher.initial}
                  </span>{' '}
                  • {teacherClasses.length}{' '}
                  {teacherClasses.length === 1 ? 'class' : 'classes'} / week
                </p>
              </div>
            </section>

            {/* Always-Open Teaching Summary Card */}
            <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-4 space-y-3.5">
              <div>
                <p className="text-lg font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                  Teaching Summary
                </p>
                <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">
                  {selectedTeacher.initial} • {uniqueCoursesCount} courses •{' '}
                  {teacherClasses.length} classes/wk
                </p>
              </div>

              <div className="divide-y divide-[#E2E8F0] dark:divide-[#23282E] text-base border-t border-[#E2E8F0] dark:border-[#23282E]">
                <div className="flex justify-between gap-4 py-2">
                  <span className="text-[#64748B] dark:text-[#9CA3AF] shrink-0">
                    Initial
                  </span>
                  <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                    {selectedTeacher.initial}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span className="text-[#64748B] dark:text-[#9CA3AF] shrink-0">
                    Assigned Sections
                  </span>
                  <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6] text-right">
                    {assignedSections.join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span className="text-[#64748B] dark:text-[#9CA3AF] shrink-0">
                    Total Courses
                  </span>
                  <span className="font-bold text-[#15803D] dark:text-[#10B981]">
                    {uniqueCoursesCount}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span className="text-[#64748B] dark:text-[#9CA3AF] shrink-0">
                    Routine Version
                  </span>
                  <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6] text-right">
                    {routine.semester} • {routine.version}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span className="text-[#64748B] dark:text-[#9CA3AF] shrink-0">
                    Classes per Week
                  </span>
                  <span className="font-bold text-[#15803D] dark:text-[#10B981]">
                    {teacherClasses.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#15803D] dark:bg-[#16A34A] text-white py-3 text-base font-bold hover:opacity-95 transition"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </section>

            <DayWeekSchedule
              classes={teacherClasses}
              teachers={routine.teachers}
              emptyHint="No classes scheduled for this faculty member on this day."
            />
          </div>

          <PrintSchedule
            semester={routine.semester}
            version={routine.version}
            effectiveDate={routine.effective_date}
            faculty={selectedTeacher}
            classes={teacherClasses}
            teachers={routine.teachers}
          />
        </>
      )}
    </div>
  );
};
