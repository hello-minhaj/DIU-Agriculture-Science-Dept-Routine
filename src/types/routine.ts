export type DayOfWeek =
  | 'Saturday'
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
];

export const TIME_SLOTS = [
  '08:30-10:00',
  '10:00-11:30',
  '11:30-01:00',
  '01:00-02:30',
  '02:30-04:00',
  '04:00-05:30',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export interface Teacher {
  id: string;
  initial: string;
  name: string;
}

export interface ClassSession {
  id: string;
  day: DayOfWeek;
  slot: TimeSlot;
  start_time: string;
  end_time: string;
  batch: string;
  section: string;
  lab_group: string | null;
  section_tag: string;
  course_name: string;
  type: 'Theory' | 'Lab';
  teacher_id: string;
  room: string;
}

export interface RoutineData {
  semester: string;
  version: string;
  effective_date: string;
  department: string;
  university: string;
  teachers: Teacher[];
  classes: ClassSession[];
}

export type LabFilter = 'ALL' | 'GROUP_1' | 'GROUP_2';
