import React from 'react';
import { Calendar, Clock, DoorOpen, X } from 'lucide-react';
import { type ClassSession, DAYS_OF_WEEK, type Teacher } from '../types/routine';
import { getSlotIndex } from '../utils/routineHelpers';

interface TeacherModalProps {
  teacher: Teacher | null;
  allClasses: ClassSession[];
  onClose: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  teacher,
  allClasses,
  onClose,
}) => {
  if (!teacher) return null;

  const teacherClasses = allClasses.filter((c) => c.teacher_id === teacher.id);

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-modal-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close teacher schedule"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] text-[#64748B] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-[#F3F4F6] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Centered Top Header */}
        <div className="px-6 pt-7 pb-5 border-b border-[#E2E8F0] dark:border-[#23282E] text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-[#15803D] dark:text-emerald-400">
              {teacher.initial}
            </span>
          </div>

          <h2
            id="teacher-modal-title"
            className="text-2xl font-bold text-center mt-4 text-[#0F172A] dark:text-[#F3F4F6]"
          >
            {teacher.name} ({teacher.initial})
          </h2>

          <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
            Department of Agricultural Science
          </p>
        </div>

        {/* Weekly Schedule Section */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Section Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold text-[#0F172A] dark:text-[#F3F4F6]">
              <Calendar className="w-5 h-5 text-[#15803D] dark:text-emerald-400" />
              <span>Weekly Schedule</span>
            </div>
            <span className="text-sm font-semibold text-[#64748B] dark:text-gray-400">
              {teacherClasses.length}{' '}
              {teacherClasses.length === 1 ? 'class' : 'classes'}
            </span>
          </div>

          {teacherClasses.length === 0 ? (
            <p className="text-center text-base text-[#64748B] dark:text-gray-400 py-8">
              No scheduled classes found for {teacher.name}.
            </p>
          ) : (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayItems = teacherClasses
                  .filter((c) => c.day === day)
                  .sort((a, b) => getSlotIndex(a.slot) - getSlotIndex(b.slot));
                if (dayItems.length === 0) return null;

                return (
                  <div key={day} className="space-y-2.5">
                    <div className="flex items-center gap-2 text-base font-semibold text-[#0F172A] dark:text-[#F3F4F6]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{day}</span>
                    </div>

                    <div className="space-y-2.5">
                      {dayItems.map((cls) => {
                        const sectionBadge = cls.lab_group
                          ? `${cls.batch}_${cls.lab_group}`
                          : cls.section_tag;
                        return (
                          <div
                            key={cls.id}
                            className="bg-slate-50 dark:bg-[#1C2026] border border-[#E2E8F0] dark:border-[#282E36] rounded-xl p-4 space-y-2"
                          >
                            {/* Line 1: Bold course_name + inline emerald section badge */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-[#0F172A] dark:text-[#F3F4F6]">
                                {cls.course_name}
                              </span>
                              <span className="bg-emerald-500/15 text-[#15803D] dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-sm font-medium">
                                {sectionBadge}
                              </span>
                            </div>

                            {/* Line 2: Clock + time • DoorOpen + room */}
                            <div className="flex flex-wrap items-center gap-2 text-sm text-[#64748B] dark:text-gray-400">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {cls.start_time}-{cls.end_time}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1.5">
                                <DoorOpen className="w-4 h-4" />
                                {cls.room}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
