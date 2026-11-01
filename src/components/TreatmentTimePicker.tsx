import React, { useMemo } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Coffee, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  OperationalScheduleSettings, 
  Reservation 
} from '../types/salon';
import { 
  getStoreScheduleForDate, 
  checkTimeSlotAvailability, 
  getBookedWindowsForDate, 
  timeToMinutes, 
  minutesToTime 
} from '../utils/scheduleUtils';

interface TreatmentTimePickerProps {
  date: string;
  value: string; // e.g. "14:15"
  onChange: (time: string) => void;
  operationalSchedule?: OperationalScheduleSettings;
  reservations: Reservation[];
  disabled?: boolean;
}

export const TreatmentTimePicker: React.FC<TreatmentTimePickerProps> = ({
  date,
  value,
  onChange,
  operationalSchedule,
  reservations,
  disabled = false
}) => {
  // Parse hour and minute from value (defaults to 10:00 if invalid)
  const [currentHour, currentMinute] = useMemo(() => {
    if (!value || !value.includes(':')) return ['10', '00'];
    const [h, m] = value.split(':');
    return [h.padStart(2, '0'), m.padStart(2, '0')];
  }, [value]);

  // Operational schedule resolution for selected date
  const schedule = useMemo(() => {
    return getStoreScheduleForDate(date, operationalSchedule);
  }, [date, operationalSchedule]);

  // Available operational hours (e.g., from 09 to 19 if store is 09:00 - 20:00)
  const availableHours = useMemo(() => {
    if (!schedule.isOpen) return [];
    const openH = parseInt(schedule.openTime.split(':')[0], 10);
    const closeH = parseInt(schedule.closeTime.split(':')[0], 10);
    const closeM = parseInt(schedule.closeTime.split(':')[1] || '0', 10);

    // If closeTime has minutes > 30, include closeH; otherwise stop at closeH - 1
    const maxHour = closeM >= 30 ? closeH : Math.max(openH, closeH - 1);

    const hours: string[] = [];
    for (let h = openH; h <= maxHour; h++) {
      hours.push(h.toString().padStart(2, '0'));
    }
    return hours;
  }, [schedule]);

  // Check availability status of the currently selected time
  const availability = useMemo(() => {
    if (!date || !value) return { isValid: false, isFull: false };
    return checkTimeSlotAvailability(date, value, reservations, operationalSchedule);
  }, [date, value, reservations, operationalSchedule]);

  // Booked windows on this date
  const bookedWindows = useMemo(() => {
    return getBookedWindowsForDate(date, reservations);
  }, [date, reservations]);

  const handleHourChange = (newH: string) => {
    const formatted = `${newH.padStart(2, '0')}:${currentMinute}`;
    onChange(formatted);
  };

  const handleMinuteChange = (newM: string) => {
    const formatted = `${currentHour}:${newM.padStart(2, '0')}`;
    onChange(formatted);
  };

  const handleQuickMinute = (minStr: string) => {
    const formatted = `${currentHour}:${minStr}`;
    onChange(formatted);
  };

  // Common minute steps
  const commonMinutes = [
    '00', '05', '10', '15', '20', '25', 
    '30', '35', '40', '45', '50', '55'
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#4A3B40]">
          Pilih Jam & Menit Treatment: <span className="text-red-500">*</span>
        </label>
        <span className="text-[10px] text-[#8C7A82] font-medium">
          Aturan: Jeda minimal 30 menit dari jadwal lain
        </span>
      </div>

      {/* Main Hour & Minute Dual Selector */}
      <div className="p-3 rounded-2xl bg-white border border-[#F8BBD0] shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Hour Selector */}
          <div className="flex-1 min-w-[110px]">
            <span className="text-[10px] font-bold uppercase text-[#8C7A82] block mb-1">
              Jam:
            </span>
            <select
              disabled={disabled || !schedule.isOpen || availableHours.length === 0}
              value={currentHour}
              onChange={(e) => handleHourChange(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-sm font-bold text-[#4A3B40] font-mono focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {!schedule.isOpen ? (
                <option value="">Tutup</option>
              ) : availableHours.length === 0 ? (
                <option value="">--</option>
              ) : (
                availableHours.map(h => (
                  <option key={h} value={h}>
                    Pukul {h}:00
                  </option>
                ))
              )}
            </select>
          </div>

          <span className="text-lg font-bold text-[#D4AF37] mt-5">:</span>

          {/* Minute Selector */}
          <div className="flex-1 min-w-[110px]">
            <span className="text-[10px] font-bold uppercase text-[#8C7A82] block mb-1">
              Menit Ke-:
            </span>
            <select
              disabled={disabled || !schedule.isOpen}
              value={currentMinute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-sm font-bold text-[#4A3B40] font-mono focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {commonMinutes.map(m => (
                <option key={m} value={m}>
                  Menit {m}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Native Time Input (for custom exact minute e.g. 14:18) */}
          <div className="shrink-0">
            <span className="text-[10px] font-bold uppercase text-[#8C7A82] block mb-1">
              Input Presisi:
            </span>
            <input
              type="time"
              disabled={disabled || !schedule.isOpen}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-[#F8BBD0] bg-[#FFF8E7]/50 text-xs font-mono font-bold text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 disabled:bg-gray-100"
              title="Pilih jam dan menit secara bebas"
            />
          </div>
        </div>

        {/* Quick Minute Chips */}
        {schedule.isOpen && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-[#F8BBD0]/40">
            <span className="text-[10px] font-semibold text-[#8C7A82] shrink-0">
              Pintasan Menit:
            </span>
            {['00', '15', '30', '45'].map(m => (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => handleQuickMinute(m)}
                className={`py-0.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition ${
                  currentMinute === m
                    ? 'bg-[#D4AF37] text-white shadow-2xs'
                    : 'bg-[#FFF8E7] text-[#B8860B] hover:bg-[#FFD1DC]/40 border border-[#D4AF37]/30'
                }`}
              >
                :{m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Status Banner */}
      {!schedule.isOpen ? (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={15} className="shrink-0 text-rose-500" />
          <span>
            Studio TUTUP pada tanggal {date || 'ini'} ({schedule.note || schedule.title || 'Libur'}). Silakan pilih tanggal lain.
          </span>
        </div>
      ) : availability.isFull ? (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-2xs animate-fadeIn">
          <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Slot Jam {value} WIB Tidak Tersedia / Penuh
            </span>
            <p className="text-[11px] leading-relaxed">
              {availability.reason}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Jam {value} WIB Tersedia!</strong> (Di luar jam istirahat & berjarak aman &ge;30 menit dari pelanggan lain).
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
            Siap Direservasi
          </span>
        </div>
      )}

      {/* Booked Schedule Indicator for this Date */}
      {bookedWindows.length > 0 && schedule.isOpen && (
        <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#4A3B40] flex items-center gap-1.5">
              <Calendar size={13} className="text-[#D4AF37]" />
              <span>Jadwal Sudah Terisi pada Tanggal Ini ({bookedWindows.length} Reservasi):</span>
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">
              Slot ±30 mnt terkunci
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {bookedWindows.map((bw, idx) => (
              <span
                key={idx}
                className="py-1 px-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px] font-medium flex items-center gap-1"
                title={`Reservasi jam ${bw.appointmentTime} WIB (${bw.customerName}). Slot penuh: ${bw.bufferStart} s/d ${bw.bufferEnd} WIB`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{bw.appointmentTime} WIB</span>
                <span className="text-[9px] text-rose-500">({bw.bufferStart}-{bw.bufferEnd})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Break Time info reminder */}
      {schedule.isOpen && schedule.hasBreak && (
        <div className="p-2 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/30 text-[11px] text-[#4A3B40] flex items-center gap-1.5">
          <Coffee size={13} className="text-[#B8860B] shrink-0" />
          <span>
            <strong>Jam Istirahat Toko:</strong> {schedule.breakStartTime} - {schedule.breakEndTime} WIB (Slot istirahat otomatis ditolak).
          </span>
        </div>
      )}
    </div>
  );
};
