import React from 'react';
import { type ClassSession, DAYS_OF_WEEK, type Teacher } from '../types/routine';
import { findTeacherById, getSlotIndex } from '../utils/routineHelpers';

interface PrintScheduleProps {
  semester: string;
  version: string;
  effectiveDate: string;
  selectedSections?: string[];
  faculty?: Teacher;
  classes: ClassSession[];
  teachers: Teacher[];
}

export const PrintSchedule: React.FC<PrintScheduleProps> = ({
  semester,
  version,
  effectiveDate,
  selectedSections = [],
  faculty,
  classes,
  teachers,
}) => {
  const orderedClasses = [...classes].sort((a, b) => {
    const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return getSlotIndex(a.slot) - getSlotIndex(b.slot);
  });

  const groupedByDay = DAYS_OF_WEEK.map((day) => ({
    day,
    items: orderedClasses.filter((c) => c.day === day),
  })).filter((group) => group.items.length > 0);

  const isTeacherMode = Boolean(faculty);
  const formattedSections =
    selectedSections.map((s) => s.replace(/_/g, ' ')).join(', ') || 'None';

  const titleText = faculty
    ? `Class Routine : ${faculty.name} (${faculty.initial})`
    : `Class Routine : ${formattedSections}`;

  return (
    <div className="hidden print:block w-full bg-white text-black p-[14mm]">
      {/* Dual-Logo Header */}
      <div className="flex items-center justify-between">
        <img
          src="/images/diu-logo.png"
          alt="Daffodil International University"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="h-14 w-auto object-contain"
        />
        <img
          src="/images/dept-logo.png"
          alt="Department of Agricultural Science"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="h-14 w-auto object-contain"
        />
      </div>

      {/* Centered Title Block */}
      <div className="text-center mt-3 mb-5">
        <h1 className="text-xl font-bold text-black">{titleText}</h1>
        <p className="text-sm font-medium text-gray-700 mt-1">
          Department of Agricultural Science
        </p>
      </div>

      {/* Compact, All-Centered Green Table */}
      <table className="w-full border-collapse border border-[#1F2937] text-sm text-black">
        <thead>
          <tr className="bg-[#15803D] text-white font-bold">
            <th className="border border-[#1F2937] py-2.5 px-3 text-center">
              Day
            </th>
            <th className="border border-[#1F2937] py-2.5 px-3 text-center whitespace-nowrap">
              Time Slot
            </th>
            {isTeacherMode ? (
              <>
                <th className="border border-[#1F2937] py-2.5 px-3 text-center whitespace-nowrap">
                  Section
                </th>
                <th className="border border-[#1F2937] py-2.5 px-3 text-center">
                  Course
                </th>
                <th className="border border-[#1F2937] py-2.5 px-3 text-center">
                  Room
                </th>
              </>
            ) : (
              <>
                <th className="border border-[#1F2937] py-2.5 px-3 text-center">
                  Course
                </th>
                <th className="border border-[#1F2937] py-2.5 px-3 text-center">
                  Room
                </th>
                <th className="border border-[#1F2937] py-2.5 px-3 text-center">
                  Faculty
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {groupedByDay.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="border border-[#1F2937] py-6 px-3 text-center text-gray-500"
              >
                No classes scheduled.
              </td>
            </tr>
          ) : (
            groupedByDay.map(({ day, items }) =>
              items.map((cls, idx) => {
                const teacher = findTeacherById(teachers, cls.teacher_id);
                const courseTag =
                  cls.type === 'Lab' && cls.lab_group
                    ? cls.lab_group
                    : cls.section_tag;
                const sectionCell = cls.lab_group
                  ? `${cls.section_tag} (${cls.lab_group})`
                  : cls.section_tag;

                return (
                  <tr key={cls.id}>
                    {idx === 0 && (
                      <td
                        rowSpan={items.length}
                        className="border border-[#1F2937] py-2.5 px-3 text-center align-middle font-bold"
                      >
                        {day}
                      </td>
                    )}
                    <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle whitespace-nowrap">
                      {cls.start_time} - {cls.end_time}
                    </td>
                    {isTeacherMode ? (
                      <>
                        <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle whitespace-nowrap">
                          {sectionCell}
                        </td>
                        <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle">
                          {cls.course_name}
                        </td>
                        <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle">
                          {cls.room}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle">
                          {cls.course_name} ({courseTag})
                        </td>
                        <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle">
                          {cls.room}
                        </td>
                        <td className="border border-[#1F2937] py-2.5 px-3 text-center align-middle">
                          {teacher
                            ? `${teacher.name} (${teacher.initial})`
                            : cls.teacher_id}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )
          )}
        </tbody>
      </table>

      {/* Routine Details Directly Below Table */}
      <div className="mt-5 text-center text-xs text-gray-500 opacity-75 leading-relaxed">
        <div>
          {semester} ({version})
        </div>
        <div>Effective: {effectiveDate}</div>
        <div>
          {faculty
            ? `Faculty: ${faculty.name} (${faculty.initial})`
            : `Sections: ${selectedSections.join(', ') || 'None'}`}
        </div>
      </div>
    </div>
  );
};
