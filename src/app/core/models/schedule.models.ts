export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DoctorSchedule {
  id: string;
  clinicId: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  isActive: boolean;
}

export interface ScheduleOverride {
  id: string;
  doctorId: string;
  overrideDate: string;
  isDayOff: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
