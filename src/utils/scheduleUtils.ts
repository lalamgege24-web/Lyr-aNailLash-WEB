import { 
  DaySchedule, 
  DateOverrideSchedule, 
  OperationalScheduleSettings,
  Reservation
} from '../types/salon';

export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayOfWeek: 1,
    dayName: 'Senin',
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Buka normal'
  },
  {
    dayOfWeek: 2,
    dayName: 'Selasa',
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Buka normal'
  },
  {
    dayOfWeek: 3,
    dayName: 'Rabu',
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Buka normal'
  },
  {
    dayOfWeek: 4,
    dayName: 'Kamis',
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Buka normal'
  },
  {
    dayOfWeek: 5,
    dayName: 'Jumat',
    isOpen: true,
    openTime: '09:00',
    closeTime: '20:30',
    hasBreak: true,
    breakStartTime: '11:30',
    breakEndTime: '13:00',
    note: 'Istirahat sholat Jumat & makan siang'
  },
  {
    dayOfWeek: 6,
    dayName: 'Sabtu',
    isOpen: true,
    openTime: '08:30',
    closeTime: '21:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Weekend salon buka lebih awal'
  },
  {
    dayOfWeek: 0,
    dayName: 'Minggu',
    isOpen: true,
    openTime: '09:00',
    closeTime: '19:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Weekend santai'
  }
];

export const DEFAULT_DATE_OVERRIDES: DateOverrideSchedule[] = [
  {
    id: 'ov-1',
    date: '2026-12-25',
    title: 'Libur Hari Raya Natal',
    isOpen: false,
    note: 'Toko tutup total perayaan Hari Raya Natal'
  },
  {
    id: 'ov-2',
    date: '2026-12-31',
    title: 'Malam Tahun Baru (Tutup Lebih Awal)',
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    hasBreak: true,
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    note: 'Tutup jam 17:00 WIB untuk persiapan malam tahun baru'
  }
];

export const DEFAULT_OPERATIONAL_SCHEDULE: OperationalScheduleSettings = {
  regularWeeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
  dateOverrides: DEFAULT_DATE_OVERRIDES
};

// Convert 'HH:mm' to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Convert minutes from midnight to 'HH:mm'
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface DayScheduleResolution {
  date: string;
  isOverride: boolean;
  isOpen: boolean;
  title: string;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStartTime: string;
  breakEndTime: string;
  note?: string;
  slots: string[];
}

/**
 * Resolve the operational schedule for any specific date YYYY-MM-DD
 */
export function getStoreScheduleForDate(
  dateStr: string,
  scheduleSettings?: OperationalScheduleSettings
): DayScheduleResolution {
  const settings = scheduleSettings || DEFAULT_OPERATIONAL_SCHEDULE;
  const cleanDate = (dateStr || new Date().toISOString().slice(0, 10)).trim();

  // 1. Check for specific date override first
  const override = settings.dateOverrides.find(o => o.date === cleanDate);
  if (override) {
    if (!override.isOpen) {
      return {
        date: cleanDate,
        isOverride: true,
        isOpen: false,
        title: override.title || 'Toko Tutup / Libur Khusus',
        openTime: '00:00',
        closeTime: '00:00',
        hasBreak: false,
        breakStartTime: '00:00',
        breakEndTime: '00:00',
        note: override.note || 'Toko tidak menerima reservasi pada tanggal ini.',
        slots: []
      };
    }

    const openTime = override.openTime || '09:00';
    const closeTime = override.closeTime || '20:00';
    const hasBreak = !!override.hasBreak;
    const breakStartTime = override.breakStartTime || '12:00';
    const breakEndTime = override.breakEndTime || '13:00';

    const slots = generateSlots(openTime, closeTime, hasBreak, breakStartTime, breakEndTime);

    return {
      date: cleanDate,
      isOverride: true,
      isOpen: true,
      title: override.title || 'Jadwal Khusus Tanggal Ini',
      openTime,
      closeTime,
      hasBreak,
      breakStartTime,
      breakEndTime,
      note: override.note,
      slots
    };
  }

  // 2. Fallback to regular weekly schedule (by day of week)
  // Use explicit date components to avoid timezone offset shifts
  const [y, m, d] = cleanDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday...

  const daySchedule = settings.regularWeeklySchedule.find(s => s.dayOfWeek === dayOfWeek) 
    || DEFAULT_WEEKLY_SCHEDULE.find(s => s.dayOfWeek === dayOfWeek)
    || DEFAULT_WEEKLY_SCHEDULE[0];

  if (!daySchedule.isOpen) {
    return {
      date: cleanDate,
      isOverride: false,
      isOpen: false,
      title: `Libur Rutin ${daySchedule.dayName}`,
      openTime: '00:00',
      closeTime: '00:00',
      hasBreak: false,
      breakStartTime: '00:00',
      breakEndTime: '00:00',
      note: daySchedule.note || `Toko tutup rutin setiap hari ${daySchedule.dayName}.`,
      slots: []
    };
  }

  const slots = generateSlots(
    daySchedule.openTime,
    daySchedule.closeTime,
    daySchedule.hasBreak,
    daySchedule.breakStartTime,
    daySchedule.breakEndTime
  );

  return {
    date: cleanDate,
    isOverride: false,
    isOpen: true,
    title: `Jadwal Reguler Hari ${daySchedule.dayName}`,
    openTime: daySchedule.openTime,
    closeTime: daySchedule.closeTime,
    hasBreak: daySchedule.hasBreak,
    breakStartTime: daySchedule.breakStartTime,
    breakEndTime: daySchedule.breakEndTime,
    note: daySchedule.note,
    slots
  };
}

/**
 * Generate 30-minute booking slots between openTime and closeTime,
 * automatically excluding break hours (jam istirahat).
 */
function generateSlots(
  openTime: string,
  closeTime: string,
  hasBreak: boolean,
  breakStartTime: string,
  breakEndTime: string,
  intervalMinutes: number = 30
): string[] {
  const startMin = timeToMinutes(openTime);
  const endMin = timeToMinutes(closeTime);
  const breakStartMin = hasBreak ? timeToMinutes(breakStartTime) : -1;
  const breakEndMin = hasBreak ? timeToMinutes(breakEndTime) : -1;

  const slots: string[] = [];

  for (let m = startMin; m < endMin; m += intervalMinutes) {
    // If inside break time, skip!
    if (hasBreak && m >= breakStartMin && m < breakEndMin) {
      continue;
    }
    slots.push(minutesToTime(m));
  }

  return slots;
}

export interface TimeSlotStatus {
  isValid: boolean;
  isFull: boolean;
  reason?: string;
  conflictingTime?: string;
  conflictingBuffer?: string;
}

export interface BookedWindow {
  appointmentTime: string;
  customerName: string;
  bufferStart: string;
  bufferEnd: string;
}

/**
 * Get all booked 30-minute buffer windows for a given date.
 * Excludes rejected/cancelled reservations.
 */
export function getBookedWindowsForDate(
  dateStr: string,
  reservations: Reservation[]
): BookedWindow[] {
  if (!dateStr || !reservations) return [];

  const cleanDate = dateStr.trim();
  const dayReservations = reservations.filter(r => 
    r.appointmentDate === cleanDate && 
    r.status !== 'REJECTED' &&
    !!r.appointmentTime
  );

  return dayReservations.map(r => {
    const resMins = timeToMinutes(r.appointmentTime);
    const startMins = Math.max(0, resMins - 30);
    const endMins = resMins + 30;
    return {
      appointmentTime: r.appointmentTime,
      customerName: r.fullName || 'Pelanggan',
      bufferStart: minutesToTime(startMins),
      bufferEnd: minutesToTime(endMins)
    };
  });
}

/**
 * Check if a selected time is valid and available.
 * Implements the 30-minute collision rule:
 * Any requested time within 30 minutes before or after an existing reservation is automatically FULL.
 */
export function checkTimeSlotAvailability(
  dateStr: string,
  timeStr: string,
  reservations: Reservation[],
  scheduleSettings?: OperationalScheduleSettings
): TimeSlotStatus {
  if (!dateStr || !timeStr) {
    return { isValid: false, isFull: false, reason: 'Silakan tentukan tanggal dan jam treatment.' };
  }

  const schedule = getStoreScheduleForDate(dateStr, scheduleSettings);

  // 1. Check if store is closed on that day
  if (!schedule.isOpen) {
    return {
      isValid: false,
      isFull: true,
      reason: `Studio tutup pada tanggal ${dateStr} (${schedule.note || schedule.title || 'Libur'}).`
    };
  }

  const targetMinutes = timeToMinutes(timeStr);
  const openMinutes = timeToMinutes(schedule.openTime);
  const closeMinutes = timeToMinutes(schedule.closeTime);

  // 2. Check if outside opening hours
  if (targetMinutes < openMinutes) {
    return {
      isValid: false,
      isFull: true,
      reason: `Jam ${timeStr} WIB di luar jam operasional (Studio baru buka jam ${schedule.openTime} WIB).`
    };
  }

  if (targetMinutes > closeMinutes - 30) {
    return {
      isValid: false,
      isFull: true,
      reason: `Jam ${timeStr} WIB terlalu dekat dengan jam tutup studio (${schedule.closeTime} WIB). Reservasi minimal 30 menit sebelum tutup.`
    };
  }

  // 3. Check if inside store break hours
  if (schedule.hasBreak) {
    const breakStartMin = timeToMinutes(schedule.breakStartTime);
    const breakEndMin = timeToMinutes(schedule.breakEndTime);

    // If appointment starts inside break time or within 30 mins before break ends
    if (targetMinutes >= breakStartMin && targetMinutes < breakEndMin) {
      return {
        isValid: false,
        isFull: true,
        reason: `Jam ${timeStr} WIB tidak tersedia (slot penuh/ditutup). Silakan pilih jam lainnya.`
      };
    }
  }

  // 4. Check 30-minute buffer rule against existing reservations
  // If targetMinutes is within 30 minutes before or after an existing appointment: Math.abs(target - res) < 30
  const bookedWindows = getBookedWindowsForDate(dateStr, reservations);

  for (const bw of bookedWindows) {
    const resMins = timeToMinutes(bw.appointmentTime);
    const diff = Math.abs(targetMinutes - resMins);

    if (diff < 30) {
      return {
        isValid: false,
        isFull: true,
        conflictingTime: bw.appointmentTime,
        conflictingBuffer: `${bw.bufferStart} - ${bw.bufferEnd}`,
        reason: `Slot Penuh: Sudah ada reservasi di jam ${bw.appointmentTime} WIB. Sesuai aturan operasional, rentang 30 menit sebelum dan sesudahnya (${bw.bufferStart} - ${bw.bufferEnd} WIB) otomatis dianggap penuh.`
      };
    }
  }

  return {
    isValid: true,
    isFull: false
  };
}

