import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CalendarOff,
  Clock,
  Coffee,
  FlaskConical,
  Hash,
  LayoutGrid,
  MapPin,
  User,
} from 'lucide-react';
import {
  type ClassSession,
  DAYS_OF_WEEK,
  type DayOfWeek,
  TIME_SLOTS,
  type Teacher,
} from '../types/routine';
import {
  buildDayTimeline,
  findTeacherById,
  getTodayDayOfWeek,
  getWeekStats,
} from '../utils/routineHelpers';

interface DayWeekScheduleProps {
  classes: ClassSession[];
  teachers: Teacher[];
  onSelectTeacher?: (teacher: Teacher) => void;
  emptyHint?: string;
}

const SHORT_DAY: Record<DayOfWeek, string> = {
  Saturday: 'Sat',
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
};

const parseCourseParts = (courseName: string) => {
  const idx = courseName.indexOf(':');
  if (idx === -1) {
    return { code: courseName, title: courseName };
  }
  return {
    code: courseName.slice(0, idx).trim(),
    title: courseName.slice(idx + 1).trim(),
  };
};

export const DayWeekSchedule: React.FC<DayWeekScheduleProps> = ({
  classes,
  teachers,
  onSelectTeacher,
  emptyHint = 'No classes scheduled for this day.',
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() =>
    getTodayDayOfWeek()
  );

  const dayClasses = classes.filter((c) => c.day === selectedDay);
  const timeline = buildDayTimeline(dayClasses);
  const weekStats = getWeekStats(classes);

  return (
    <div className="space-y-4">
      {/* Full-Width Segmented Day View | Week View Toggle Bar */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-white dark:bg-[#16191D] p-1.5 border border-[#E2E8F0] dark:border-[#23282E]">
        <button
          type="button"
          onClick={() => setViewMode('day')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-base font-semibold transition ${
            viewMode === 'day'
              ? 'bg-[#15803D] dark:bg-[#16A34A] text-white shadow-xs'
              : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Day View
        </button>
        <button
          type="button"
          onClick={() => setViewMode('week')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-base font-semibold transition ${
            viewMode === 'week'
              ? 'bg-[#15803D] dark:bg-[#16A34A] text-white shadow-xs'
              : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F4F6]'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Week View
        </button>
      </div>

      {viewMode === 'day' ? (
        <>
          {/* Row of 6 Square Day Selector Cards (Sat through Thu) */}
          <div className="grid grid-cols-6 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const count = classes.filter((c) => c.day === day).length;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-1 border transition ${
                    isSelected
                      ? 'bg-[#15803D] dark:bg-[#16A34A] text-white border-transparent shadow-xs'
                      : 'bg-white dark:bg-[#16191D] text-[#0F172A] dark:text-[#F3F4F6] border-[#E2E8F0] dark:border-[#23282E] hover:border-[#16A34A]/60'
                  }`}
                >
                  <span className="text-base font-bold">{SHORT_DAY[day]}</span>
                  <span
                    className={`mt-0.5 text-xs font-medium ${
                      isSelected
                        ? 'text-white/90'
                        : 'text-[#64748B] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {count} cls
                  </span>
                </button>
              );
            })}
          </div>

          {/* Day Timeline or Clean Empty State */}
          {timeline.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] text-[#64748B] dark:text-[#9CA3AF]">
                <CalendarOff className="w-6 h-6" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                No Class on {selectedDay}
              </h3>
              <p className="mt-1 text-base text-[#64748B] dark:text-[#9CA3AF] max-w-sm mx-auto">
                {emptyHint}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((item) => {
                if (item.kind === 'break') {
                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0px, rgba(16, 185, 129, 0.05) 8px, transparent 8px, transparent 16px)',
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#23282E] bg-slate-50 dark:bg-[#16191D]/80 px-4 py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <Coffee className="w-5 h-5 text-[#15803D] dark:text-[#10B981]" />
                        <div>
                          <p className="text-base font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                            Break Time
                          </p>
                          <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">
                            {item.slotsSkipped}{' '}
                            {item.slotsSkipped === 1 ? 'free slot' : 'free slots'}
                          </p>
                        </div>
                      </div>
                      <span className="text-base font-semibold text-[#15803D] dark:text-[#10B981]">
                        {item.start_time} – {item.end_time}
                      </span>
                    </div>
                  );
                }

                const cls = item.session;
                const teacher = findTeacherById(teachers, cls.teacher_id);
                const isLab = cls.type === 'Lab';
                const { code, title } = parseCourseParts(cls.course_name);

                return (
                  <div
                    key={cls.id}
                    className="flex rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] overflow-hidden"
                  >
                    {/* Left-side Time Column */}
                    <div className="w-24 shrink-0 flex flex-col items-center justify-between py-4 px-2 border-r border-[#E2E8F0] dark:border-[#23282E] bg-slate-50/70 dark:bg-[#0E1012]/40 text-center">
                      <span className="text-base font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                        {cls.start_time}
                      </span>

                      {/* Vertical tick marks */}
                      <div className="my-2 flex flex-col items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#10B981]" />
                        <span className="h-3 w-0.5 rounded-full bg-[#CBD5E1] dark:bg-[#23282E]" />
                        <span className="h-1 w-1 rounded-full bg-[#CBD5E1] dark:bg-[#23282E]" />
                        <span className="h-3 w-0.5 rounded-full bg-[#CBD5E1] dark:bg-[#23282E]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#15803D] dark:bg-[#10B981]" />
                      </div>

                      <span className="text-base font-semibold text-[#64748B] dark:text-[#9CA3AF]">
                        {cls.end_time}
                      </span>
                    </div>

                    {/* Right-side Details */}
                    <div className="flex-1 min-w-0 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F3F4F6] leading-snug">
                          {title}
                        </h3>
                        {isLab && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-sm font-bold text-[#15803D] dark:text-[#10B981]">
                            <FlaskConical className="w-3.5 h-3.5" />
                            {cls.lab_group ? cls.lab_group : 'Lab'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-base">
                        <div className="flex items-center gap-2 text-[#64748B] dark:text-[#9CA3AF]">
                          <BookOpen className="w-4 h-4 text-[#15803D] dark:text-[#10B981] shrink-0" />
                          <span className="truncate font-medium text-[#0F172A] dark:text-[#F3F4F6]">
                            {code}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[#64748B] dark:text-[#9CA3AF]">
                          <Hash className="w-4 h-4 text-[#15803D] dark:text-[#10B981] shrink-0" />
                          <span className="truncate font-medium text-[#0F172A] dark:text-[#F3F4F6]">
                            {cls.section_tag}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[#64748B] dark:text-[#9CA3AF]">
                          <MapPin className="w-4 h-4 text-[#15803D] dark:text-[#10B981] shrink-0" />
                          <span className="truncate font-medium text-[#0F172A] dark:text-[#F3F4F6]">
                            {cls.room}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#15803D] dark:text-[#10B981] shrink-0" />
                          {teacher && onSelectTeacher ? (
                            <button
                              type="button"
                              onClick={() => onSelectTeacher(teacher)}
                              className="font-bold text-[#15803D] dark:text-[#10B981] hover:underline truncate"
                            >
                              {teacher.initial}
                            </button>
                          ) : (
                            <span className="font-semibold text-[#0F172A] dark:text-[#F3F4F6] truncate">
                              {teacher ? teacher.initial : cls.teacher_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Week View: 3 Top Stat Cards + Horizontally Scrollable Day x Time Slot Matrix */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                Total Classes
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[#15803D] dark:text-[#10B981]">
                {weekStats.totalClasses}
              </p>
              <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">
                per week
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                Busiest Day
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#0F172A] dark:text-[#F3F4F6]">
                {weekStats.busiestDay && weekStats.busiestDay.count > 0
                  ? SHORT_DAY[weekStats.busiestDay.day]
                  : '—'}
              </p>
              <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">
                {weekStats.busiestDay && weekStats.busiestDay.count > 0
                  ? `${weekStats.busiestDay.count} classes`
                  : 'No classes'}
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                Lightest Day
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#15803D] dark:text-[#10B981]">
                {weekStats.lightestDay && weekStats.totalClasses > 0
                  ? SHORT_DAY[weekStats.lightestDay.day]
                  : '—'}
              </p>
              <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">
                {weekStats.lightestDay && weekStats.totalClasses > 0
                  ? `${weekStats.lightestDay.count} classes`
                  : 'No classes'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full border-collapse text-base">
                <thead>
                  <tr className="bg-[#15803D] dark:bg-[#16A34A] text-white">
                    <th className="sticky left-0 z-10 bg-[#15803D] dark:bg-[#16A34A] px-3 py-3 text-left font-bold border-r border-white/15">
                      Day
                    </th>
                    {TIME_SLOTS.map((slot) => (
                      <th
                        key={slot}
                        className="px-2.5 py-3 text-center font-semibold whitespace-nowrap border-r last:border-r-0 border-white/15 text-sm"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 opacity-80" />
                          {slot}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS_OF_WEEK.map((day) => (
                    <tr
                      key={day}
                      className="border-t border-[#E2E8F0] dark:border-[#23282E]"
                    >
                      <td className="sticky left-0 z-10 bg-white dark:bg-[#16191D] px-3 py-3 font-bold text-[#0F172A] dark:text-[#F3F4F6] border-r border-[#E2E8F0] dark:border-[#23282E]">
                        {SHORT_DAY[day]}
                      </td>
                      {TIME_SLOTS.map((slot) => {
                        const cellClasses = classes.filter(
                          (c) => c.day === day && c.slot === slot
                        );
                        return (
                          <td
                            key={slot}
                            className="p-2 align-top border-r last:border-r-0 border-[#E2E8F0] dark:border-[#23282E] min-w-[115px]"
                          >
                            {cellClasses.length === 0 ? (
                              <div className="h-12 flex items-center justify-center text-[#94A3B8] dark:text-[#4B5563]">
                                —
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {cellClasses.map((cls) => {
                                  const teacher = findTeacherById(
                                    teachers,
                                    cls.teacher_id
                                  );
                                  const isLab = cls.type === 'Lab';
                                  return (
                                    <div
                                      key={cls.id}
                                      className={`rounded-lg p-2 border text-sm leading-snug ${
                                        isLab
                                          ? 'bg-emerald-500/10 border-emerald-500/30'
                                          : 'bg-slate-50 dark:bg-[#0E1012] border-[#E2E8F0] dark:border-[#23282E]'
                                      }`}
                                    >
                                      <div className="font-bold text-[#0F172A] dark:text-[#F3F4F6] truncate">
                                        {parseCourseParts(cls.course_name).code}
                                      </div>
                                      <div className="mt-0.5 text-xs text-[#64748B] dark:text-[#9CA3AF] truncate">
                                        {cls.room}
                                      </div>
                                      <div className="mt-0.5 flex items-center justify-between gap-1 text-xs">
                                        <span className="font-semibold text-[#15803D] dark:text-[#10B981]">
                                          {cls.section_tag}
                                        </span>
                                        <span className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                                          {teacher?.initial ?? cls.teacher_id}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
