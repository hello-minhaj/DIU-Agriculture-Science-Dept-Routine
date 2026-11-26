import {
  type ClassSession,
  DAYS_OF_WEEK,
  type DayOfWeek,
  type LabFilter,
  TIME_SLOTS,
  type Teacher,
  type TimeSlot,
} from '../types/routine';

export const getTodayDayOfWeek = (): DayOfWeek => {
  const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  switch (jsDay) {
    case 6:
      return 'Saturday';
    case 0:
      return 'Sunday';
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
    default:
      return 'Saturday'; // Default to Saturday on Friday
  }
};

export const getSlotIndex = (slot: string): number => {
  const idx = TIME_SLOTS.indexOf(slot as TimeSlot);
  return idx === -1 ? 99 : idx;
};

export const slotStartEnd = (slot: TimeSlot): { start: string; end: string } => {
  const [start, end] = slot.split('-');
  return { start, end };
};

export const filterClassesByLab = (
  classes: ClassSession[],
  labFilter: LabFilter
): ClassSession[] => {
  if (labFilter === 'ALL') return classes;
  return classes.filter((cls) => {
    if (cls.type !== 'Lab' || !cls.lab_group) return true;
    const grp = cls.lab_group.toUpperCase();
    if (labFilter === 'GROUP_1') return grp.endsWith('1') || grp.includes('G1');
    if (labFilter === 'GROUP_2') return grp.endsWith('2') || grp.includes('G2');
    return true;
  });
};

export const hasLabSubgroups = (classes: ClassSession[]): boolean => {
  return classes.some((cls) => cls.type === 'Lab' && Boolean(cls.lab_group));
};

export type TimelineItem =
  | { kind: 'class'; session: ClassSession }
  | {
      kind: 'break';
      id: string;
      start_time: string;
      end_time: string;
      slotsSkipped: number;
    };

/**
 * Sorts a day's classes by time slot and automatically inserts a
 * "Break Time" card whenever there is a gap between two classes.
 */
export const buildDayTimeline = (dayClasses: ClassSession[]): TimelineItem[] => {
  if (dayClasses.length === 0) return [];

  const sorted = [...dayClasses].sort(
    (a, b) => getSlotIndex(a.slot) - getSlotIndex(b.slot)
  );

  const timeline: TimelineItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (i > 0) {
      const prev = sorted[i - 1];
      const prevIdx = getSlotIndex(prev.slot);
      const currIdx = getSlotIndex(current.slot);
      if (currIdx - prevIdx > 1 && prevIdx < TIME_SLOTS.length && currIdx < TIME_SLOTS.length) {
        const gapStart = prev.end_time;
        const gapEnd = current.start_time;
        timeline.push({
          kind: 'break',
          id: `break-${prev.slot}-${current.slot}`,
          start_time: gapStart,
          end_time: gapEnd,
          slotsSkipped: currIdx - prevIdx - 1,
        });
      }
    }
    timeline.push({ kind: 'class', session: current });
  }
  return timeline;
};

export interface WeekStats {
  totalClasses: number;
  busiestDay: { day: DayOfWeek; count: number } | null;
  lightestDay: { day: DayOfWeek; count: number } | null;
}

export const getWeekStats = (classes: ClassSession[]): WeekStats => {
  const counts = new Map<DayOfWeek, number>();
  DAYS_OF_WEEK.forEach((d) => counts.set(d, 0));
  classes.forEach((c) => {
    counts.set(c.day, (counts.get(c.day) ?? 0) + 1);
  });

  let busiest: { day: DayOfWeek; count: number } | null = null;
  let lightest: { day: DayOfWeek; count: number } | null = null;

  for (const day of DAYS_OF_WEEK) {
    const count = counts.get(day) ?? 0;
    if (!busiest || count > busiest.count) {
      busiest = { day, count };
    }
    if (count > 0 && (!lightest || count < lightest.count)) {
      lightest = { day, count };
    }
  }

  if (!lightest && busiest) {
    lightest = { day: 'Thursday', count: 0 };
  }

  return {
    totalClasses: classes.length,
    busiestDay: busiest,
    lightestDay: lightest,
  };
};

export const findTeacherById = (
  teachers: Teacher[],
  teacherId: string
): Teacher | undefined => {
  return teachers.find((t) => t.id === teacherId);
};
