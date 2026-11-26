import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FlaskConical,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { LabFilter, RoutineData, Teacher } from '../types/routine';
import {
  filterClassesByLab,
  findTeacherById,
  hasLabSubgroups,
} from '../utils/routineHelpers';
import { DayWeekSchedule } from './DayWeekSchedule';
import { PrintSchedule } from './PrintSchedule';
import { TeacherModal } from './TeacherModal';
import { ThemeToggle } from './ThemeToggle';

const STORAGE_SECTIONS_KEY = 'agri_routine_sections';
const STORAGE_LAB_FILTER_KEY = 'agri_routine_lab_filter';

interface StudentViewProps {
  routine: RoutineData;
  isDark: boolean;
  onToggleDark: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  routine,
  isDark,
  onToggleDark,
}) => {
  const allSectionTags = useMemo(() => {
    const set = new Set<string>();
    routine.classes.forEach((c) => set.add(c.section_tag));
    return Array.from(set).sort();
  }, [routine.classes]);

  const [selectedSections, setSelectedSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SECTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage parse error
    }
    return [];
  });

  const [labFilter, setLabFilter] = useState<LabFilter>(() => {
    const saved = localStorage.getItem(STORAGE_LAB_FILTER_KEY);
    if (saved === 'GROUP_1' || saved === 'GROUP_2' || saved === 'ALL') {
      return saved;
    }
    return 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTeacherModal, setActiveTeacherModal] = useState<Teacher | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_SECTIONS_KEY, JSON.stringify(selectedSections));
  }, [selectedSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LAB_FILTER_KEY, labFilter);
  }, [labFilter]);

  const sectionClasses = useMemo(
    () =>
      routine.classes.filter((c) => selectedSections.includes(c.section_tag)),
    [routine.classes, selectedSections]
  );

  const showLabToggle = useMemo(
    () => hasLabSubgroups(sectionClasses),
    [sectionClasses]
  );

  const filteredClasses = useMemo(
    () =>
      showLabToggle
        ? filterClassesByLab(sectionClasses, labFilter)
        : sectionClasses,
    [sectionClasses, showLabToggle, labFilter]
  );

  const sectionTeachers = useMemo(() => {
    const ids = new Set(filteredClasses.map((c) => c.teacher_id));
    return Array.from(ids)
      .map((id) => findTeacherById(routine.teachers, id))
      .filter((t): t is Teacher => Boolean(t));
  }, [filteredClasses, routine.teachers]);

  const totalCourses = useMemo(() => {
    const courses = new Set(filteredClasses.map((c) => c.course_name));
    return courses.size;
  }, [filteredClasses]);

  const matchingTags = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSectionTags.filter(
      (tag) =>
        !selectedSections.includes(tag) && tag.toLowerCase().includes(q)
    );
  }, [allSectionTags, selectedSections, searchQuery]);

  const addSection = (tag: string) => {
    if (!selectedSections.includes(tag)) {
      setSelectedSections((prev) => [...prev, tag]);
    }
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const removeSection = (tag: string) => {
    setSelectedSections((prev) => prev.filter((t) => t !== tag));
  };

  const primaryTag = selectedSections[0] ?? '—';
  const [primaryBatch, primarySec] = primaryTag.includes('_')
    ? primaryTag.split('_')
    : [primaryTag, '—'];

  return (
    <div className="space-y-5">
      {/* Top Centered Search Bar + Version Badge + Theme Toggle */}
      <div className="no-print max-w-xl mx-auto flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <div className="h-12 flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#23282E] bg-white dark:bg-[#16191D] px-4 focus-within:border-[#16A34A] transition">
            <Search className="w-5 h-5 text-[#64748B] dark:text-[#9CA3AF] shrink-0" />
            <input
              id="section-search"
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              placeholder="Search batch-section (e.g., 263_A)..."
              className="w-full bg-transparent text-base font-medium text-[#0F172A] dark:text-[#F3F4F6] placeholder:text-[#94A3B8] dark:placeholder:text-[#9CA3AF]/60 focus:outline-none"
            />
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 z-30 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] shadow-xl p-1.5 space-y-1">
              {matchingTags.length === 0 ? (
                <p className="px-3 py-2.5 text-base text-[#64748B] dark:text-[#9CA3AF]">
                  No matching sections available.
                </p>
              ) : (
                matchingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addSection(tag)}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold text-[#0F172A] dark:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-[#23282E] transition flex items-center justify-between"
                  >
                    <span>{tag}</span>
                    <span className="text-sm font-bold text-[#15803D] dark:text-[#10B981]">
                      + Add
                    </span>
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="w-full text-center py-1.5 text-sm font-semibold text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F4F6]"
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

      {/* Clean Empty State when no section is selected */}
      {selectedSections.length === 0 ? (
        <div className="no-print rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#15803D] dark:text-[#10B981]">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-base font-medium text-[#64748B] dark:text-[#9CA3AF] max-w-md mx-auto">
            Search for your batch (e.g.,{' '}
            <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
              263_A
            </span>
            ) to view your class schedule
          </p>
          {allSectionTags.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              {allSectionTags.slice(0, 4).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSection(tag)}
                  className="rounded-lg bg-slate-100 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] px-3.5 py-1.5 text-base font-semibold text-[#0F172A] dark:text-[#F3F4F6] hover:border-[#16A34A] transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="no-print space-y-5">
          {/* Removable Section Chips + Lab Subgroup Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {selectedSections.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#15803D] dark:bg-[#16A34A] text-white px-3 py-1.5 text-base font-bold"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(tag)}
                    aria-label={`Remove section ${tag}`}
                    className="rounded-sm hover:bg-white/20 p-0.5 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>

            {showLabToggle && (
              <div className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-[#16191D] p-1 border border-[#E2E8F0] dark:border-[#23282E]">
                <FlaskConical className="w-4 h-4 text-[#15803D] dark:text-[#10B981] ml-1.5" />
                {(
                  [
                    { id: 'ALL', label: 'All Labs' },
                    { id: 'GROUP_1', label: 'Group 1' },
                    { id: 'GROUP_2', label: 'Group 2' },
                  ] as { id: LabFilter; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLabFilter(opt.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      labFilter === opt.id
                        ? 'bg-[#15803D] dark:bg-[#16A34A] text-white'
                        : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F4F6]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Always-Open Enrolled Courses Summary Card */}
          <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-4 space-y-3.5">
            <div>
              <p className="text-lg font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                Enrolled Courses
              </p>
              <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">
                {selectedSections.join(', ')} • {totalCourses} courses •{' '}
                {filteredClasses.length} classes/wk
              </p>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#23282E] text-base border-t border-[#E2E8F0] dark:border-[#23282E]">
              <div className="flex justify-between py-2">
                <span className="text-[#64748B] dark:text-[#9CA3AF]">
                  Batch
                </span>
                <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                  {primaryBatch}
                  {selectedSections.length > 1
                    ? ` (+${selectedSections.length - 1})`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B] dark:text-[#9CA3AF]">
                  Section
                </span>
                <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                  {primarySec}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B] dark:text-[#9CA3AF]">
                  Total Courses
                </span>
                <span className="font-bold text-[#15803D] dark:text-[#10B981]">
                  {totalCourses}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B] dark:text-[#9CA3AF]">
                  Routine Version
                </span>
                <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                  {routine.semester} • {routine.version}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B] dark:text-[#9CA3AF]">
                  Classes per Week
                </span>
                <span className="font-bold text-[#15803D] dark:text-[#10B981]">
                  {filteredClasses.length}
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

          {/* Horizontal Row of Circular Emerald-Bordered Teacher Monogram Badges */}
          {sectionTeachers.length > 0 && (
            <section className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-1">
              {sectionTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setActiveTeacherModal(teacher)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#16191D] border-2 border-[#15803D] dark:border-[#10B981] text-sm font-extrabold text-[#15803D] dark:text-[#10B981] group-hover:bg-[#15803D] dark:group-hover:bg-[#16A34A] group-hover:text-white transition">
                    {teacher.initial}
                  </div>
                  <span className="text-sm font-medium text-[#64748B] dark:text-[#9CA3AF] max-w-[76px] truncate">
                    {teacher.name.split(' ').slice(-1)[0]}
                  </span>
                </button>
              ))}
            </section>
          )}

          {/* Day & Week Schedule */}
          <DayWeekSchedule
            classes={filteredClasses}
            teachers={routine.teachers}
            onSelectTeacher={(t) => setActiveTeacherModal(t)}
          />
        </div>
      )}

      {/* Print-Only Schedule Table */}
      <PrintSchedule
        semester={routine.semester}
        version={routine.version}
        effectiveDate={routine.effective_date}
        selectedSections={selectedSections}
        classes={filteredClasses}
        teachers={routine.teachers}
      />

      {/* Teacher Schedule Modal */}
      <TeacherModal
        teacher={activeTeacherModal}
        allClasses={routine.classes}
        onClose={() => setActiveTeacherModal(null)}
      />
    </div>
  );
};
