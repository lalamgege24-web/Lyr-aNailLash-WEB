import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Coffee, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  CalendarDays, 
  CalendarRange, 
  Sliders, 
  CheckCircle2,
  Sun,
  Moon,
  ArrowRight,
  Info,
  CalendarCheck,
  RotateCcw
} from 'lucide-react';
import { 
  OperationalScheduleSettings, 
  DaySchedule, 
  DateOverrideSchedule 
} from '../types/salon';
import { 
  DEFAULT_WEEKLY_SCHEDULE, 
  getStoreScheduleForDate 
} from '../utils/scheduleUtils';
import { salonStore } from '../services/store';
import { TreatmentTimePicker } from '../components/TreatmentTimePicker';

interface OwnerScheduleManagerProps {
  operationalSchedule: OperationalScheduleSettings;
  onRefresh: () => void;
}

export const OwnerScheduleManager: React.FC<OwnerScheduleManagerProps> = ({
  operationalSchedule,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'WEEKLY' | 'OVERRIDES' | 'SIMULATOR'>('WEEKLY');

  // Weekly Schedule local editable copy
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(
    operationalSchedule.regularWeeklySchedule || DEFAULT_WEEKLY_SCHEDULE
  );

  // Date Overrides local editable copy
  const [dateOverrides, setDateOverrides] = useState<DateOverrideSchedule[]>(
    operationalSchedule.dateOverrides || []
  );

  // Form state for creating a new date override
  const [overrideDate, setOverrideDate] = useState(new Date().toISOString().slice(0, 10));
  const [overrideTitle, setOverrideTitle] = useState('');
  const [overrideIsOpen, setOverrideIsOpen] = useState(false);
  const [overrideOpenTime, setOverrideOpenTime] = useState('09:00');
  const [overrideCloseTime, setOverrideCloseTime] = useState('17:00');
  const [overrideHasBreak, setOverrideHasBreak] = useState(true);
  const [overrideBreakStart, setOverrideBreakStart] = useState('12:00');
  const [overrideBreakEnd, setOverrideBreakEnd] = useState('13:00');
  const [overrideNote, setOverrideNote] = useState('');

  // Simulator date & time test
  const [simDate, setSimDate] = useState(new Date().toISOString().slice(0, 10));
  const [simTime, setSimTime] = useState('14:15');
  const allReservations = salonStore.getReservations();

  const [notificationMsg, setNotificationMsg] = useState('');

  // Quick stats calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySchedule = getStoreScheduleForDate(todayStr, {
    regularWeeklySchedule: weeklySchedule,
    dateOverrides
  });
  const openDaysCount = weeklySchedule.filter(d => d.isOpen).length;

  // Save changes to salonStore
  const saveSchedule = (
    newWeekly: DaySchedule[],
    newOverrides: DateOverrideSchedule[],
    message = 'Jadwal operasional toko berhasil diperbarui!'
  ) => {
    salonStore.updateSettings({
      operationalSchedule: {
        regularWeeklySchedule: newWeekly,
        dateOverrides: newOverrides
      }
    });
    setNotificationMsg(message);
    setTimeout(() => setNotificationMsg(''), 3500);
    onRefresh();
  };

  // Weekly Schedule handlers
  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const updated = [...weeklySchedule];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklySchedule(updated);
  };

  const handleSaveWeeklySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchedule(weeklySchedule, dateOverrides, 'Jadwal rutin mingguan berhasil disimpan & disinkronkan ke customer!');
  };

  const handleApplyToAllDays = (sourceIndex: number) => {
    const source = weeklySchedule[sourceIndex];
    if (confirm(`Terapkan jam buka (${source.openTime}-${source.closeTime}) dan jam istirahat (${source.hasBreak ? source.breakStartTime + '-' + source.breakEndTime : 'Tanpa Istirahat'}) dari hari ${source.dayName} ke semua hari?`)) {
      const updated = weeklySchedule.map(d => ({
        ...d,
        isOpen: true,
        openTime: source.openTime,
        closeTime: source.closeTime,
        hasBreak: source.hasBreak,
        breakStartTime: source.breakStartTime,
        breakEndTime: source.breakEndTime
      }));
      setWeeklySchedule(updated);
      saveSchedule(updated, dateOverrides, `Jam operasional hari ${source.dayName} disalin ke seluruh 7 hari!`);
    }
  };

  const handleResetToStandard = () => {
    if (confirm('Terapkan jadwal standar salon (Senin-Minggu buka 09:00-20:00, istirahat 12:00-13:00)?')) {
      const standard = DEFAULT_WEEKLY_SCHEDULE.map(d => ({
        ...d,
        isOpen: true,
        openTime: '09:00',
        closeTime: '20:00',
        hasBreak: true,
        breakStartTime: '12:00',
        breakEndTime: '13:00'
      }));
      setWeeklySchedule(standard);
      saveSchedule(standard, dateOverrides, 'Jadwal diatur ke standar salon (09:00 - 20:00, istirahat 12:00 - 13:00)!');
    }
  };

  // Date Override handlers
  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;

    const existingIndex = dateOverrides.findIndex(o => o.date === overrideDate);

    const newOverride: DateOverrideSchedule = {
      id: `ov-${Date.now()}`,
      date: overrideDate,
      title: overrideTitle.trim() || (overrideIsOpen ? 'Jadwal Khusus Tanggal Ini' : 'Toko Tutup / Libur Khusus'),
      isOpen: overrideIsOpen,
      openTime: overrideIsOpen ? overrideOpenTime : undefined,
      closeTime: overrideIsOpen ? overrideCloseTime : undefined,
      hasBreak: overrideIsOpen ? overrideHasBreak : undefined,
      breakStartTime: overrideIsOpen && overrideHasBreak ? overrideBreakStart : undefined,
      breakEndTime: overrideIsOpen && overrideHasBreak ? overrideBreakEnd : undefined,
      note: overrideNote.trim() || undefined
    };

    let updatedList: DateOverrideSchedule[];
    if (existingIndex !== -1) {
      updatedList = [...dateOverrides];
      updatedList[existingIndex] = newOverride;
    } else {
      updatedList = [newOverride, ...dateOverrides];
    }

    setDateOverrides(updatedList);
    saveSchedule(weeklySchedule, updatedList, `Jadwal khusus tanggal ${overrideDate} berhasil disimpan!`);

    setOverrideTitle('');
    setOverrideNote('');
  };

  const handleDeleteOverride = (id: string) => {
    if (confirm('Hapus jadwal khusus per tanggal ini?')) {
      const updatedList = dateOverrides.filter(o => o.id !== id);
      setDateOverrides(updatedList);
      saveSchedule(weeklySchedule, updatedList, 'Jadwal khusus tanggal berhasil dihapus!');
    }
  };

  // Simulation test resolution
  const simulationResult = getStoreScheduleForDate(simDate, {
    regularWeeklySchedule: weeklySchedule,
    dateOverrides
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP HEADER & OVERVIEW */}
      <div className="luxury-card p-5 sm:p-6 bg-gradient-to-r from-white via-[#FFFDF9] to-[#FFF8E7] border-[#D4AF37]/40 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30 shadow-2xs">
                <Clock size={20} />
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
                Pengaturan Jam Buka, Tutup & Istirahat Toko
              </h2>
            </div>
            <p className="text-xs text-[#8C7A82] mt-1 max-w-2xl leading-relaxed">
              Atur jam kerja studio, jam istirahat harian, serta libur khusus per-tanggal. Sistem secara otomatis menyinkronkan slot jam reservasi pelanggan dan meniadakan jam istirahat.
            </p>
          </div>

          {/* Sub-tab segmented control */}
          <div className="inline-flex rounded-xl bg-white p-1 border border-[#F8BBD0] shadow-2xs self-start lg:self-center">
            <button
              type="button"
              onClick={() => setActiveSubTab('WEEKLY')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'WEEKLY'
                  ? 'gold-button shadow-xs'
                  : 'text-[#8C7A82] hover:text-[#4A3B40]'
              }`}
            >
              <CalendarDays size={14} />
              <span>Jadwal Mingguan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('OVERRIDES')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'OVERRIDES'
                  ? 'gold-button shadow-xs'
                  : 'text-[#8C7A82] hover:text-[#4A3B40]'
              }`}
            >
              <CalendarRange size={14} />
              <span>Khusus Per-Tanggal ({dateOverrides.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('SIMULATOR')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'SIMULATOR'
                  ? 'gold-button shadow-xs'
                  : 'text-[#8C7A82] hover:text-[#4A3B40]'
              }`}
            >
              <Sparkles size={14} />
              <span>Simulator Customer</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Quick Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#F8BBD0]/30 text-xs">
          {/* Card 1: Hari Ini */}
          <div className="p-3 rounded-xl bg-white/90 border border-[#F8BBD0]/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A82]">Status Hari Ini</span>
              <span className={`w-2 h-2 rounded-full ${todaySchedule.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            </div>
            <div className="font-bold text-[#4A3B40]">
              {todaySchedule.isOpen ? 'Studio Buka' : 'Studio Tutup / Libur'}
            </div>
            <div className="text-[11px] text-[#B8860B] font-medium truncate">
              {todaySchedule.isOpen ? `${todaySchedule.openTime} - ${todaySchedule.closeTime} WIB` : todaySchedule.title}
            </div>
          </div>

          {/* Card 2: Hari Aktif */}
          <div className="p-3 rounded-xl bg-white/90 border border-[#F8BBD0]/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A82]">Hari Operasional</span>
              <CalendarCheck size={13} className="text-[#D4AF37]" />
            </div>
            <div className="font-bold text-[#4A3B40]">
              {openDaysCount} dari 7 Hari
            </div>
            <div className="text-[11px] text-[#8C7A82]">
              {openDaysCount === 7 ? 'Buka setiap hari' : `${7 - openDaysCount} hari libur rutin`}
            </div>
          </div>

          {/* Card 3: Istirahat Standar */}
          <div className="p-3 rounded-xl bg-white/90 border border-[#F8BBD0]/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A82]">Jam Istirahat</span>
              <Coffee size={13} className="text-[#B8860B]" />
            </div>
            <div className="font-bold text-[#4A3B40]">
              {todaySchedule.hasBreak ? `${todaySchedule.breakStartTime} - ${todaySchedule.breakEndTime} WIB` : 'Non-Aktif Hari Ini'}
            </div>
            <div className="text-[11px] text-[#8C7A82]">
              {todaySchedule.hasBreak ? 'Slot istirahat terlewati' : 'Slot operasional penuh'}
            </div>
          </div>

          {/* Card 4: Jadwal Khusus */}
          <div className="p-3 rounded-xl bg-white/90 border border-[#F8BBD0]/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A82]">Jadwal Khusus</span>
              <CalendarRange size={13} className="text-[#B8860B]" />
            </div>
            <div className="font-bold text-[#4A3B40]">
              {dateOverrides.length} Tanggal
            </div>
            <div className="text-[11px] text-[#8C7A82]">
              {dateOverrides.length > 0 ? 'Override aktif terjadwal' : 'Mengikuti jadwal mingguan'}
            </div>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{notificationMsg}</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900">
            Tersimpan
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: WEEKLY RECURRING SCHEDULE                     */}
      {/* ======================================================== */}
      {activeSubTab === 'WEEKLY' && (
        <form onSubmit={handleSaveWeeklySchedule} className="space-y-4 animate-fadeIn">
          {/* Action & Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/30 text-xs">
            <div className="flex items-center gap-2 text-[#4A3B40]">
              <Info size={16} className="text-[#B8860B] shrink-0" />
              <span>
                Pengaturan di bawah berlaku berulang setiap minggu. Tekan <strong>Simpan Jadwal Mingguan</strong> untuk menerapkan ke website customer.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetToStandard}
                className="py-1.5 px-3 rounded-lg border border-[#D4AF37]/50 bg-white hover:bg-[#FFFDF9] text-[#B8860B] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw size={12} />
                <span>Preset Standar (09:00 - 20:00)</span>
              </button>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl gold-button text-xs font-bold shadow-xs hover:scale-101 transition flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Simpan Jadwal Mingguan</span>
              </button>
            </div>
          </div>

          {/* Clean Day Cards List */}
          <div className="space-y-3">
            {weeklySchedule.map((day, idx) => (
              <div 
                key={day.dayOfWeek}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  day.isOpen 
                    ? 'border-[#F8BBD0]/80 bg-white shadow-2xs hover:border-[#D4AF37]' 
                    : 'border-gray-200 bg-gray-50/80 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Day info & Open/Closed toggle */}
                  <div className="flex items-center justify-between lg:justify-start gap-4 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        day.isOpen 
                          ? 'bg-[#FFD1DC] text-[#4A3B40]' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#4A3B40]">
                          {day.dayName}
                        </h4>
                        <span className={`text-[11px] font-semibold ${day.isOpen ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {day.isOpen ? '🟢 Buka Operasional' : '🔴 Libur Rutin'}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={(e) => handleDayChange(idx, 'isOpen', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                    </label>
                  </div>

                  {/* Middle: Opening Hours & Break Hours (If Open) */}
                  {day.isOpen ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Box 1: Jam Buka & Tutup */}
                      <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[#4A3B40] font-semibold shrink-0">
                          <Sun size={14} className="text-[#D4AF37]" />
                          <span>Jam Kerja:</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <input
                            type="time"
                            value={day.openTime}
                            onChange={(e) => handleDayChange(idx, 'openTime', e.target.value)}
                            className="py-1 px-2 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          />
                          <span className="text-gray-400 font-bold">s/d</span>
                          <input
                            type="time"
                            value={day.closeTime}
                            onChange={(e) => handleDayChange(idx, 'closeTime', e.target.value)}
                            className="py-1 px-2 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          />
                        </div>
                      </div>

                      {/* Box 2: Jam Istirahat */}
                      <div className="p-2.5 rounded-xl bg-[#FFF8E7]/70 border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B40] font-semibold shrink-0">
                          <input
                            type="checkbox"
                            checked={day.hasBreak}
                            onChange={(e) => handleDayChange(idx, 'hasBreak', e.target.checked)}
                            className="rounded text-[#D4AF37] focus:ring-0"
                          />
                          <Coffee size={14} className="text-[#B8860B]" />
                          <span>Jam Istirahat:</span>
                        </label>

                        {day.hasBreak ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <input
                              type="time"
                              value={day.breakStartTime}
                              onChange={(e) => handleDayChange(idx, 'breakStartTime', e.target.value)}
                              className="py-1 px-2 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-400 font-bold">s/d</span>
                            <input
                              type="time"
                              value={day.breakEndTime}
                              onChange={(e) => handleDayChange(idx, 'breakEndTime', e.target.value)}
                              className="py-1 px-2 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500 italic">
                            Tanpa Jeda Istirahat
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle size={15} className="text-rose-500 shrink-0" />
                      <span>Studio libur rutin setiap hari {day.dayName}. Pelanggan tidak dapat memilih hari ini pada formulir booking.</span>
                    </div>
                  )}

                  {/* Right: Quick copy tool */}
                  {day.isOpen && (
                    <div className="flex items-center justify-end lg:pl-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApplyToAllDays(idx)}
                        className="py-1.5 px-3 rounded-lg border border-[#D4AF37]/40 bg-white hover:bg-[#FFF8E7] text-[11px] text-[#B8860B] font-semibold flex items-center gap-1 transition"
                        title="Salin jam kerja dan istirahat hari ini ke seluruh hari"
                      >
                        <Copy size={12} />
                        <span>Salin ke Semua</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Bar */}
          <div className="p-4 rounded-xl bg-white border border-[#F8BBD0] shadow-xs flex items-center justify-between gap-3">
            <span className="text-xs text-[#8C7A82]">
              Pastikan menyimpan perubahan agar jam buka dan jam istirahat terbaru langsung aktif di portal pelanggan.
            </span>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl gold-button text-xs font-bold shadow-xs hover:scale-101 transition flex items-center gap-1.5 shrink-0"
            >
              <Check size={14} />
              <span>Simpan Jadwal Mingguan</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: SPECIFIC DATE OVERRIDES                       */}
      {/* ======================================================== */}
      {activeSubTab === 'OVERRIDES' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Form to Add New Date Override */}
          <div className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/40 shadow-xs space-y-4">
            <div className="border-b border-[#F8BBD0]/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2">
                  <Plus size={18} className="text-[#D4AF37]" />
                  <span>Tambah / Perbarui Jadwal Khusus Per-Tanggal</span>
                </h3>
                <p className="text-xs text-[#8C7A82] mt-0.5">
                  Gunakan fitur ini untuk menetapkan hari libur khusus (Hari Raya, Renovasi) atau jam buka khusus pada tanggal tertentu tanpa mengubah jadwal mingguan rutin.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddOverride} className="space-y-4 text-xs">
              {/* Row 1: Tanggal & Mode Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">
                    Pilih Tanggal: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setOverrideDate(new Date().toISOString().slice(0, 10))}
                      className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-[#FFF8E7] text-[11px] font-semibold text-[#B8860B] whitespace-nowrap"
                    >
                      Hari Ini
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">
                    Status Toko pada Tanggal Tersebut: <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOverrideIsOpen(false)}
                      className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        !overrideIsOpen
                          ? 'border-rose-400 bg-rose-50 text-rose-800 shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span>🔴 Tutup / Libur</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverrideIsOpen(true)}
                      className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        overrideIsOpen
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span>🟢 Jam Khusus</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">
                    Judul / Alasan: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={overrideTitle}
                    onChange={(e) => setOverrideTitle(e.target.value)}
                    placeholder="Contoh: Libur Hari Raya, Buka Setengah Hari..."
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Row 2 (Conditional): Jam Kerja & Jam Istirahat Khusus */}
              {overrideIsOpen && (
                <div className="p-4 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-[#4A3B40]">
                    <Clock size={16} className="text-[#B8860B]" />
                    <span>Konfigurasi Jam Buka, Jam Tutup & Jam Istirahat Khusus:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Jam Buka Tutup */}
                    <div className="p-3 rounded-xl bg-white border border-[#F8BBD0]/60 space-y-1.5">
                      <span className="font-semibold text-[#4A3B40] block">Jam Operasional:</span>
                      <div className="flex items-center gap-2 font-mono">
                        <input
                          type="time"
                          value={overrideOpenTime}
                          onChange={(e) => setOverrideOpenTime(e.target.value)}
                          className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold"
                        />
                        <span className="text-gray-400 font-bold">s/d</span>
                        <input
                          type="time"
                          value={overrideCloseTime}
                          onChange={(e) => setOverrideCloseTime(e.target.value)}
                          className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Jam Istirahat */}
                    <div className="p-3 rounded-xl bg-white border border-[#F8BBD0]/60 space-y-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#4A3B40]">
                        <input
                          type="checkbox"
                          checked={overrideHasBreak}
                          onChange={(e) => setOverrideHasBreak(e.target.checked)}
                          className="rounded text-[#D4AF37]"
                        />
                        <Coffee size={14} className="text-[#B8860B]" />
                        <span>Sertakan Jam Istirahat Toko:</span>
                      </label>

                      {overrideHasBreak ? (
                        <div className="flex items-center gap-2 font-mono pt-0.5">
                          <input
                            type="time"
                            value={overrideBreakStart}
                            onChange={(e) => setOverrideBreakStart(e.target.value)}
                            className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold"
                          />
                          <span className="text-gray-400 font-bold">s/d</span>
                          <input
                            type="time"
                            value={overrideBreakEnd}
                            onChange={(e) => setOverrideBreakEnd(e.target.value)}
                            className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white text-xs font-semibold"
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">
                          Tanpa jam istirahat pada tanggal khusus ini.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: Pesan untuk Pelanggan */}
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">
                  Pesan / Catatan untuk Pelanggan (Akan tampil pada formulir booking jika tanggal ini dipilih):
                </label>
                <input
                  type="text"
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="Contoh: Mohon maaf studio tutup dalam rangka Hari Raya. Silakan pilih tanggal besoknya..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl gold-button text-xs font-bold shadow-xs flex items-center gap-1.5 hover:scale-101 transition"
                >
                  <Plus size={14} />
                  <span>Simpan Jadwal Khusus Tanggal</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of active date overrides */}
          <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2">
              <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2">
                <CalendarRange size={18} className="text-[#D4AF37]" />
                <span>Daftar Jadwal Khusus Tanggal Terdaftar ({dateOverrides.length})</span>
              </h3>
            </div>

            {dateOverrides.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D4AF37]">
                  <Calendar size={24} />
                </div>
                <p className="text-xs font-semibold text-[#4A3B40]">
                  Belum Ada Jadwal Khusus Per-Tanggal
                </p>
                <p className="text-xs text-[#8C7A82] max-w-sm mx-auto">
                  Seluruh reservasi pelanggan saat ini beroperasi normal mengikuti <strong>Jadwal Mingguan Berulang</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {dateOverrides.map((ov) => (
                  <div
                    key={ov.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-2xs transition hover:shadow-xs ${
                      ov.isOpen
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-[#B8860B] bg-white px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 shadow-2xs">
                          📅 {ov.date}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ov.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ov.isOpen ? '🟢 Buka Khusus' : '🔴 Libur Total'}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                        {ov.title}
                      </h4>

                      {ov.isOpen ? (
                        <div className="p-2 rounded-lg bg-white/80 border border-emerald-100 text-xs space-y-0.5 font-mono">
                          <p className="text-[#4A3B40]">⏰ Jam: {ov.openTime} - {ov.closeTime} WIB</p>
                          {ov.hasBreak && (
                            <p className="text-[#B8860B]">☕ Istirahat: {ov.breakStartTime} - {ov.breakEndTime} WIB</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-rose-700 font-medium">
                          Studio tutup total pada tanggal ini. Slot reservasi otomatis dinonaktifkan.
                        </p>
                      )}

                      {ov.note && (
                        <p className="text-[11px] text-[#8C7A82] italic bg-white/60 p-2 rounded-lg border border-[#F8BBD0]/40">
                          &ldquo;{ov.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleDeleteOverride(ov.id)}
                        className="py-1 px-2.5 rounded-lg text-xs text-rose-600 hover:bg-rose-100 font-semibold flex items-center gap-1 transition"
                      >
                        <Trash2 size={13} />
                        <span>Hapus Tanggal Ini</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: SIMULATOR CHECK                               */}
      {/* ======================================================== */}
      {activeSubTab === 'SIMULATOR' && (
        <div className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/50 shadow-xs space-y-5 animate-fadeIn">
          <div className="border-b border-[#F8BBD0]/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2">
                <Sparkles size={18} className="text-[#D4AF37]" />
                <span>Pratinjau & Simulasi Slot Booking Customer</span>
              </h3>
              <p className="text-xs text-[#8C7A82] mt-0.5">
                Uji tanggal apa saja untuk memastikan slot yang tampil di hadapan pelanggan sesuai jam buka, tutup, dan jam istirahat.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="font-bold text-[#4A3B40]">Pilih Tanggal Uji:</label>
              <input
                type="date"
                value={simDate}
                onChange={(e) => setSimDate(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/40 space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
              <div>
                <span className="font-serif font-bold text-lg text-[#4A3B40] block">
                  {simulationResult.title}
                </span>
                <span className="text-xs text-[#8C7A82]">
                  Tanggal: <strong className="text-[#4A3B40]">{simulationResult.date}</strong> • Resolusi: {simulationResult.isOverride ? '📌 Jadwal Khusus Tanggal' : '🗓️ Jadwal Mingguan Rutin'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                simulationResult.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {simulationResult.isOpen ? '🟢 Studio Buka' : '🔴 Studio Libur / Tutup'}
              </span>
            </div>

            {simulationResult.isOpen ? (
              <>
                {/* Details badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#F8BBD0]/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#8C7A82] uppercase">Jam Operasional</span>
                    <p className="font-bold text-sm text-[#4A3B40]">
                      {simulationResult.openTime} - {simulationResult.closeTime} WIB
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#F8BBD0]/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#8C7A82] uppercase">Jam Istirahat Terapis</span>
                    <p className="font-bold text-sm text-[#B8860B]">
                      {simulationResult.hasBreak ? `${simulationResult.breakStartTime} - ${simulationResult.breakEndTime} WIB` : 'Tidak Ada Istirahat'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#F8BBD0]/50 space-y-0.5">
                    <span className="text-[10px] font-bold text-[#8C7A82] uppercase">Total Slot Customer</span>
                    <p className="font-bold text-sm text-emerald-700">
                      {simulationResult.slots.length} Slot Waktu Tersedia
                    </p>
                  </div>
                </div>

                {simulationResult.note && (
                  <p className="text-xs text-[#B8860B] italic bg-[#FFF8E7] p-2.5 rounded-xl border border-[#D4AF37]/30">
                    ℹ️ Catatan untuk Customer: &ldquo;{simulationResult.note}&rdquo;
                  </p>
                )}

                {/* Available Slot Pills */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[#4A3B40] block">
                    Slot Pilihan Jam yang Ditampilkan pada Formulir Customer ({simulationResult.slots.length} Slot):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {simulationResult.slots.map(slot => (
                      <span
                        key={slot}
                        className="py-1 px-3 rounded-xl bg-white text-[#B8860B] font-mono text-xs font-bold border border-[#D4AF37]/40 shadow-2xs hover:bg-[#FFF8E7] transition"
                      >
                        {slot} WIB
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interactive TreatmentTimePicker Live Test for Owner */}
                <div className="pt-4 border-t border-[#F8BBD0]/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#D4AF37]" />
                    <span className="font-bold text-xs text-[#4A3B40]">
                      Uji Langsung Pemilihan Jam & Menit Bebas (Aturan Jeda 30 Menit):
                    </span>
                  </div>
                  <TreatmentTimePicker
                    date={simDate}
                    value={simTime}
                    onChange={(newT) => setSimTime(newT)}
                    operationalSchedule={{
                      regularWeeklySchedule: weeklySchedule,
                      dateOverrides
                    }}
                    reservations={allReservations}
                  />
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5">
                <p className="font-bold text-sm">⚠️ Studio Tutup / Libur pada Tanggal Ini</p>
                <p>{simulationResult.note || 'Pelanggan tidak dapat memilih jam pada tanggal ini dan formulir reservasi meminta pelanggan memilih tanggal lain.'}</p>
                <div className="pt-2 max-w-sm">
                  <select disabled className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-gray-100 text-xs text-gray-400">
                    <option>(Studio Tutup / Libur)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
