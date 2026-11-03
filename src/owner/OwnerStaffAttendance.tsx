import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  UserCheck, 
  CalendarDays, 
  Briefcase,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { StaffAccount, StaffAttendance } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerStaffAttendanceProps {
  staffList: StaffAccount[];
  attendanceList: StaffAttendance[];
  onRefresh: () => void;
}

export const OwnerStaffAttendance: React.FC<OwnerStaffAttendanceProps> = ({
  staffList,
  attendanceList,
  onRefresh
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentYearStr = todayStr.slice(0, 4); // YYYY

  // Form states to record attendance
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [attDate, setAttDate] = useState(todayStr);
  const [attStatus, setAttStatus] = useState<StaffAttendance['status']>('HADIR');
  const [checkInTime, setCheckInTime] = useState('08:50');
  const [checkOutTime, setCheckOutTime] = useState('18:00');
  const [attNotes, setAttNotes] = useState('');
  const [attToDelete, setAttToDelete] = useState<StaffAttendance | null>(null);

  // Calculate work hours from checkIn and checkOut
  const calculateHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    return Math.max(0, parseFloat((totalMinutes / 60).toFixed(1)));
  };

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === selectedStaffId);
    if (!staff) return;

    const workHours = attStatus === 'HADIR' ? calculateHours(checkInTime, checkOutTime) : 0;

    salonStore.recordAttendance({
      staffId: staff.id,
      staffName: staff.name,
      date: attDate,
      status: attStatus,
      checkInTime: attStatus === 'HADIR' ? checkInTime : undefined,
      checkOutTime: attStatus === 'HADIR' ? checkOutTime : undefined,
      workHours,
      notes: attNotes.trim() || undefined
    });

    setAttNotes('');
    onRefresh();
  };

  // Monthly and Annual Recaps per staff
  const staffRecap = useMemo(() => {
    return staffList.map(st => {
      const recordsForStaff = attendanceList.filter(a => a.staffId === st.id);

      // Month
      const monthRecords = recordsForStaff.filter(a => a.date.startsWith(currentMonthStr));
      const monthDaysPresent = monthRecords.filter(a => a.status === 'HADIR').length;
      const monthTotalHours = monthRecords.reduce((acc, a) => acc + (a.workHours || 0), 0);

      // Year
      const yearRecords = recordsForStaff.filter(a => a.date.startsWith(currentYearStr));
      const yearDaysPresent = yearRecords.filter(a => a.status === 'HADIR').length;
      const yearTotalHours = yearRecords.reduce((acc, a) => acc + (a.workHours || 0), 0);

      return {
        staff: st,
        monthDaysPresent,
        monthTotalHours,
        yearDaysPresent,
        yearTotalHours
      };
    });
  }, [staffList, attendanceList, currentMonthStr, currentYearStr]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-[#F8BBD0] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#4A3B40] flex items-center gap-2">
          <CalendarDays size={24} className="text-[#D4AF37]" />
          <span>Daftar Absensi & Jam Kerja Staf (Bulan & Tahun)</span>
        </h2>
        <p className="text-xs text-[#8C7A82] mt-0.5">
          Diatur langsung oleh Owner: catat kehadiran harian staf dan pantau akumulasi jam kerja bulanan serta tahunan.
        </p>
      </div>

      {/* SECTION 1: Monthly & Annual Recap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {staffRecap.map(({ staff, monthDaysPresent, monthTotalHours, yearDaysPresent, yearTotalHours }) => (
          <div key={staff.id} className="luxury-card p-5 bg-white border-[#D4AF37]/40 shadow-xs space-y-3">
            <div className="flex items-center gap-3 border-b border-[#F8BBD0]/40 pb-2.5">
              <div className="w-10 h-10 rounded-full bg-[#FFD1DC] text-[#4A3B40] font-bold text-sm flex items-center justify-center">
                {staff.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#4A3B40]">{staff.name}</h4>
                <p className="text-[11px] text-[#8C7A82]">{staff.role}</p>
              </div>
            </div>

            {/* Recap Numbers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/20">
                <span className="text-[10px] uppercase font-bold text-[#B8860B] block">Bulan Ini ({currentMonthStr}):</span>
                <span className="font-bold text-sm text-[#4A3B40] block mt-0.5">{monthDaysPresent} Hari Masuk</span>
                <span className="text-[11px] text-[#8C7A82] font-mono">{monthTotalHours.toFixed(1)} Jam Kerja</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/40">
                <span className="text-[10px] uppercase font-bold text-[#8C7A82] block">Tahun Ini ({currentYearStr}):</span>
                <span className="font-bold text-sm text-[#4A3B40] block mt-0.5">{yearDaysPresent} Hari Masuk</span>
                <span className="text-[11px] text-[#8C7A82] font-mono">{yearTotalHours.toFixed(1)} Jam Kerja</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: Record Attendance Form (Owner Only) */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
          <Clock size={18} className="text-[#D4AF37]" />
          <span>Input Absensi Harian Staf</span>
        </h3>

        <form onSubmit={handleRecordAttendance} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs items-end">
          <div className="lg:col-span-2">
            <label className="block font-semibold mb-1 text-[#4A3B40]">Pilih Staf:</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
            >
              {staffList.filter(s => s.isActive).map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} — ({st.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">Tanggal:</label>
            <input
              type="date"
              required
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-[#F8BBD0] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">Status:</label>
            <select
              value={attStatus}
              onChange={(e) => setAttStatus(e.target.value as any)}
              className="w-full py-2 px-2.5 rounded-xl border border-[#F8BBD0] bg-white font-semibold"
            >
              <option value="HADIR">Hadir</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
              <option value="ALPA">Alpa</option>
            </select>
          </div>

          {attStatus === 'HADIR' ? (
            <>
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Jam Masuk:</label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full py-2 px-2 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Jam Keluar:</label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full py-2 px-2 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                />
              </div>
            </>
          ) : (
            <div className="lg:col-span-2">
              <label className="block font-semibold mb-1 text-[#4A3B40]">Keterangan:</label>
              <input
                type="text"
                value={attNotes}
                onChange={(e) => setAttNotes(e.target.value)}
                placeholder="Alasan izin / sakit..."
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
              />
            </div>
          )}

          <div className="lg:col-span-6 flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl gold-button text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>Catat Absensi</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Recent Attendance Logs Table */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#4A3B40] border-b border-[#F8BBD0]/40 pb-2">
          Riwayat Log Absensi Harian Staf
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4A3B40]">
            <thead className="bg-[#FFF8E7] text-[#8C7A82] uppercase text-[10px] tracking-wider border-b border-[#F8BBD0]/40">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nama Staf</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Jam Masuk</th>
                <th className="py-2.5 px-3">Jam Keluar</th>
                <th className="py-2.5 px-3">Durasi</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3 text-right">Aksi Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceList.slice(0, 25).map((att) => (
                <tr key={att.id} className="hover:bg-[#FFFDF9] transition">
                  <td className="py-2.5 px-3 font-mono font-medium">
                    {att.date}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#4A3B40]">
                    {att.staffName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                      att.status === 'IZIN' ? 'bg-sky-100 text-sky-800' :
                      att.status === 'SAKIT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#8C7A82]">
                    {att.checkInTime || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#8C7A82]">
                    {att.checkOutTime || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#B8860B]">
                    {att.workHours ? `${att.workHours} Jam` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-[#8C7A82]">
                    {att.notes || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setAttToDelete(att)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition inline-flex items-center gap-1 text-[11px] font-semibold"
                      title="Hapus status kehadiran staf ini"
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal to Delete Attendance */}
      {attToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#F8BBD0] p-6 max-w-sm w-full shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h4 className="font-serif font-bold text-lg text-[#4A3B40]">
                Hapus Status Kehadiran?
              </h4>
              <p className="text-xs text-[#8C7A82] mt-1 leading-relaxed">
                Yakin ingin menghapus catatan absensi untuk <strong className="text-[#4A3B40]">{attToDelete.staffName}</strong> pada tanggal <strong className="font-mono text-[#4A3B40]">{attToDelete.date}</strong> (Status: {attToDelete.status})?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAttToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#4A3B40] hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  salonStore.deleteAttendance(attToDelete.id);
                  setAttToDelete(null);
                  onRefresh();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
