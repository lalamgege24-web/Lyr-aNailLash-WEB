import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Eye, 
  Scissors, 
  Home, 
  Building2, 
  Search,
  RefreshCw,
  Ruler,
  Gem,
  Palette,
  Coffee,
  CheckCircle
} from 'lucide-react';
import { salonStore } from '../services/store';
import { 
  StaffAccount, 
  Reservation, 
  StoreSettings, 
  StaffAttendance 
} from '../types/salon';

export default function StaffApp() {
  const [settings, setSettings] = useState<StoreSettings>(() => salonStore.getSettings());
  const [staffList, setStaffList] = useState<StaffAccount[]>(() => salonStore.getStaff());
  const [reservations, setReservations] = useState<Reservation[]>(() => salonStore.getReservations());
  const [attendanceList, setAttendanceList] = useState<StaffAttendance[]>(() => salonStore.getAttendance());

  // Logged-in Staff State
  const [activeStaff, setActiveStaff] = useState<StaffAccount | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem('lyras_active_staff');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab: 'schedule' (Jadwal Hari Ini & H-1), 'attendance' (Absensi), 'all_tasks' (Antrean Treatment)
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance' | 'all_tasks'>('schedule');

  // Attendance shift note input
  const [shiftNote, setShiftNote] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Sync data
  const refreshAll = () => {
    setSettings(salonStore.getSettings());
    setStaffList(salonStore.getStaff());
    setReservations(salonStore.getReservations());
    setAttendanceList(salonStore.getAttendance());
  };

  useEffect(() => {
    const unsub = salonStore.subscribe(refreshAll);
    return unsub;
  }, []);

  // Today & Tomorrow date strings
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().slice(0, 10);

  // Today attendance for active staff
  const todayAttendance = useMemo(() => {
    if (!activeStaff) return null;
    return attendanceList.find(a => a.staffId === activeStaff.id && a.date === todayDateStr) || null;
  }, [activeStaff, attendanceList, todayDateStr]);

  // Today's Approved / Pending reservations
  const todayReservations = useMemo(() => {
    return reservations
      .filter(r => r.appointmentDate === todayDateStr && r.status !== 'REJECTED')
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [reservations, todayDateStr]);

  // Tomorrow H-1 reservations
  const tomorrowReservations = useMemo(() => {
    return reservations
      .filter(r => r.appointmentDate === tomorrowDateStr && r.status !== 'REJECTED')
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [reservations, tomorrowDateStr]);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = loginPhone.trim().replace(/\D/g, '');
    const found = staffList.find(s => s.phone.replace(/\D/g, '') === cleanInput);

    if (!found) {
      setLoginError('Nomor telepon terapis belum terdaftar!');
      return;
    }

    if (found.pin && found.pin !== loginPassword.trim()) {
      setLoginError('PIN staf salah! Hubungi Owner jika lupa PIN.');
      return;
    }

    setActiveStaff(found);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lyras_active_staff', JSON.stringify(found));
    }
  };

  const handleLogout = () => {
    setActiveStaff(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lyras_active_staff');
    }
  };

  // Clock In
  const handleClockIn = () => {
    if (!activeStaff) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    salonStore.recordAttendance({
      staffId: activeStaff.id,
      staffName: activeStaff.name,
      date: todayDateStr,
      checkInTime: timeStr,
      status: 'HADIR',
      notes: shiftNote.trim() || 'Hadir tepat waktu di studio'
    });
    setShiftNote('');
    refreshAll();
  };

  // Clock Out
  const handleClockOut = () => {
    if (!activeStaff || !todayAttendance) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    salonStore.updateAttendance(todayAttendance.id, {
      checkOutTime: timeStr,
      notes: todayAttendance.notes ? `${todayAttendance.notes} • Selesai: ${timeStr}` : `Selesai: ${timeStr}`
    });
    refreshAll();
  };

  // Mark treatment as finished
  const handleUpdateTreatmentStatus = (resId: string, newStatus: Reservation['status']) => {
    salonStore.updateReservation(resId, { status: newStatus });
    refreshAll();
  };

  const copyUrl = (role: string, path: string) => {
    const fullUrl = window.location.origin + path;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(role);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // --- RENDER: LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!activeStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] to-[#FFD1DC]/40 text-[#4A3B40] flex flex-col justify-between font-sans">
        {/* Top bar with Portal Switcher */}
        <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] p-0.5 shadow-sm">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-[#4A3B40] block">{settings.storeName}</span>
              <span className="text-[10px] text-[#8C7A82] uppercase tracking-wider font-semibold">Portal Staf Terapis</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="/" 
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#F8BBD0] hover:border-[#D4AF37] text-[#4A3B40] font-medium transition shadow-2xs"
            >
              🛍️ Ke Customer
            </a>
            <a 
              href="/owner" 
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#D4AF37]/50 hover:bg-[#FFF8E7] text-[#B8860B] font-semibold transition shadow-2xs"
            >
              👑 Ke Owner
            </a>
          </div>
        </header>

        {/* Center Login Card */}
        <div className="max-w-md w-full mx-auto px-4 py-8">
          <div className="luxury-card p-6 sm:p-8 bg-white/95 backdrop-blur-md border border-[#D4AF37]/40 shadow-xl rounded-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFD1DC]/60 border border-[#D4AF37]/40 flex items-center justify-center text-2xl shadow-sm">
                💼
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
                Masuk Portal Terapis
              </h2>
              <p className="text-xs text-[#8C7A82]">
                Masuk untuk mencatat absensi harian, melihat jadwal H-1, dan antrean treatment hari ini.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B40] mb-1.5">
                  Nomor Telepon Terapis:
                </label>
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="Contoh: 081234567891"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-[#F8BBD0] bg-[#FFFDF9] text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B40] mb-1.5">
                  Kata Sandi / PIN Staf:
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi staf..."
                  className="w-full py-2.5 px-3.5 rounded-xl border border-[#F8BBD0] bg-[#FFFDF9] text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Masuk Sekarang</span>
              </button>
            </form>

            <div className="pt-2 border-t border-[#F8BBD0]/40 text-center">
              <span className="text-[11px] text-[#8C7A82] block">
                Akun staf terdaftar: <strong>Syafira</strong> (081234567891 / syafira123), <strong>Tiara</strong> (081234567892 / tiara123).
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-4 text-center text-xs text-[#8C7A82] border-t border-[#F8BBD0]/40">
          <p>© 2026 {settings.storeName} • Dedicated Staff Workspace</p>
        </footer>
      </div>
    );
  }

  // --- RENDER: AUTHENTICATED STAFF DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3B40] flex flex-col font-sans">
      {/* Ecosystem Role Switcher Banner */}
      <div className="bg-gradient-to-r from-[#FFF5F7] via-[#FFF8E7] to-[#FFF5F7] border-b border-[#D4AF37]/30 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#B8860B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Browser Ecosystem Hub:</span>
            </span>
            <span className="text-[#8C7A82] hidden md:inline">
              Setiap portal terhubung real-time ke backend yang sama.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => copyUrl('Customer', '/')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#F8BBD0] hover:border-[#D4AF37] text-[11px] font-semibold text-[#4A3B40] flex items-center gap-1 shadow-2xs transition"
              title="Salin link halaman customer untuk dibagikan"
            >
              {copiedLink === 'Customer' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>Link Customer (B2C)</span>
            </button>

            <button
              type="button"
              onClick={() => copyUrl('Owner', '/owner')}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#D4AF37]/50 hover:bg-[#FFF8E7] text-[11px] font-semibold text-[#B8860B] flex items-center gap-1 shadow-2xs transition"
              title="Salin link portal owner untuk manajemen"
            >
              {copiedLink === 'Owner' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>Link Owner</span>
            </button>

            <button
              type="button"
              onClick={() => copyUrl('Staff', '/staff')}
              className="px-2.5 py-1 rounded-lg bg-[#D4AF37] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <Check size={12} />
              <span>Link Staff (Aktif)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F8BBD0]/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] p-0.5 shadow-sm">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base sm:text-lg text-[#4A3B40]">
                  {settings.storeName}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Staff Workspace
                </span>
              </div>
              <p className="text-xs text-[#8C7A82]">
                Terapis: <strong className="text-[#4A3B40]">{activeStaff.name}</strong> • {activeStaff.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-[#4A3B40] transition shadow-2xs"
              title="Sinkronisasi data"
            >
              <RefreshCw size={15} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold transition flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 border-t border-gray-100 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-[#D4AF37] text-white shadow-2xs'
                : 'text-[#4A3B40] hover:bg-[#FFF8E7]'
            }`}
          >
            <Calendar size={14} />
            <span>Jadwal H-1 &amp; Hari Ini</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#B8860B] font-mono">
              {todayReservations.length + tomorrowReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-[#D4AF37] text-white shadow-2xs'
                : 'text-[#4A3B40] hover:bg-[#FFF8E7]'
            }`}
          >
            <Clock size={14} />
            <span>Absensi Kerja Terapis</span>
            {todayAttendance && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_tasks')}
            className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'all_tasks'
                ? 'bg-[#D4AF37] text-white shadow-2xs'
                : 'text-[#4A3B40] hover:bg-[#FFF8E7]'
            }`}
          >
            <Scissors size={14} />
            <span>Antrean Treatment Aktif</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* TAB 1: JADWAL RESERVASI H-1 & HARI INI */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Today's Schedule Card */}
            <div className="luxury-card p-5 sm:p-6 space-y-4 border border-[#D4AF37]/40 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8BBD0]/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#B8860B]" />
                    <h2 className="font-serif font-bold text-lg text-[#4A3B40]">
                      Jadwal Treatment Hari Ini ({todayDateStr})
                    </h2>
                  </div>
                  <p className="text-xs text-[#8C7A82] mt-0.5">
                    Daftar reservasi terkonfirmasi yang harus dikerjakan hari ini.
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30 self-start sm:self-auto">
                  {todayReservations.length} Janji Temu Hari Ini
                </span>
              </div>

              {todayReservations.length === 0 ? (
                <div className="p-8 text-center bg-[#FFFDF9] rounded-2xl border border-dashed border-[#F8BBD0] text-xs text-[#8C7A82]">
                  🌸 Belum ada jadwal treatment terkonfirmasi untuk hari ini ({todayDateStr}).
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayReservations.map((res) => (
                    <div 
                      key={res.id} 
                      className="p-4 rounded-2xl bg-white border border-[#F8BBD0] shadow-xs space-y-3 hover:border-[#D4AF37] transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#D4AF37] text-white">
                              {res.appointmentTime} WIB
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40]">
                              {res.type}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#4A3B40] mt-1.5">
                            {res.fullName}
                          </h4>
                          <span className="text-[11px] font-mono text-[#8C7A82] block">
                            Kode: {res.bookingCode}
                          </span>
                        </div>

                        {/* Privacy: Staf TIDAK BISA melihat / menghubungi customer */}
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            🔒 Kontak Dilindungi
                          </span>
                        </div>
                      </div>

                      {/* Location Badge */}
                      <div className="text-xs bg-[#FFFDF9] p-2.5 rounded-xl border border-[#F8BBD0]/30 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-[#4A3B40]">
                          {res.location.isHomeService ? (
                            <>
                              <Home size={14} className="text-[#B8860B]" />
                              <span>Home Service • {res.location.village}, {res.location.district}</span>
                            </>
                          ) : (
                            <>
                              <Building2 size={14} className="text-[#B8860B]" />
                              <span>Studio Mall Taman Palem Lt G Blok A 30B</span>
                            </>
                          )}
                        </div>
                        {res.location.isHomeService && (
                          <p className="text-[11px] text-[#8C7A82]">
                            Alamat: {res.location.streetAddress} {res.location.rtRw ? `(RT/RW: ${res.location.rtRw})` : ''}
                          </p>
                        )}
                      </div>

                      {/* Services breakdown */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A82] block">
                          Layanan Treatment:
                        </span>
                        {res.services && res.services.length > 0 ? (
                          res.services.map((s, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-gray-100 space-y-1">
                              <span className="font-semibold text-[#4A3B40] block">
                                • {s.subSubCategoryName || s.subCategoryName}
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[10px] text-[#8C7A82]">
                                {s.selectedColors && s.selectedColors.length > 0 && (
                                  <span className="bg-[#FFF8E7] px-1.5 py-0.2 rounded border border-[#D4AF37]/30">
                                    Warna: {s.selectedColors.join(', ')}
                                  </span>
                                )}
                                {s.selectedExtensionLengthMm && (
                                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                                    Panjang: {s.selectedExtensionLengthMm}mm
                                  </span>
                                )}
                                {s.selectedAccessories && s.selectedAccessories.length > 0 && (
                                  <span className="bg-pink-50 text-pink-800 px-1.5 py-0.2 rounded border border-pink-200">
                                    Aksesoris: {s.selectedAccessories.map(a => a.name).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : res.groupMembers ? (
                          <span className="text-[11px] text-[#8C7A82]">
                            Pemesanan Kelompok: {res.groupMembers.length} Orang
                          </span>
                        ) : null}
                      </div>

                      {/* Treatment Progress Action */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          res.status === 'FINISHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'APPROVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          Status: {res.status}
                        </span>

                        {res.status !== 'FINISHED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTreatmentStatus(res.id, 'FINISHED')}
                            className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <CheckCircle size={13} />
                            <span>Tandai Selesai</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* H-1 Tomorrow Schedule Card */}
            <div className="luxury-card p-5 sm:p-6 space-y-4 border border-[#D4AF37]/30 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8E7]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-[#B8860B]" />
                    <h2 className="font-serif font-bold text-lg text-[#4A3B40]">
                      Jadwal Reservasi H-1 (Besok: {tomorrowDateStr})
                    </h2>
                  </div>
                  <p className="text-xs text-[#8C7A82] mt-0.5">
                    Informasi jadwal H-1 agar staf dapat mempersiapkan bahan, kuku, atau perlengkapan Home Service lebih awal.
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4AF37] text-white shadow-2xs self-start sm:self-auto">
                  {tomorrowReservations.length} Reservasi Besok
                </span>
              </div>

              {tomorrowReservations.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#F8BBD0] text-xs text-[#8C7A82]">
                  🌸 Belum ada jadwal janji temu untuk besok (H-1: {tomorrowDateStr}).
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tomorrowReservations.map((res) => (
                    <div 
                      key={res.id} 
                      className="p-4 rounded-2xl bg-white border border-[#F8BBD0] shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#D4AF37] text-white">
                          Besok, {res.appointmentTime} WIB
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          🔒 No Kontak Terproteksi
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                        {res.fullName}
                      </h4>

                      <div className="text-xs text-[#8C7A82]">
                        Lokasi: <strong>{res.location.isHomeService ? `Home Service (${res.location.district})` : 'Studio Mall Taman Palem'}</strong>
                      </div>

                      <div className="pt-2 border-t border-gray-100 text-[11px] text-[#8C7A82]">
                        Layanan: {res.services?.map(s => s.subSubCategoryName || s.subCategoryName).join(', ') || 'Paket Kelompok'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ABSENSI KERJA TERAPIS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Clock-in / Clock-out Widget */}
            <div className="luxury-card p-6 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8E7] border border-[#D4AF37]/50 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F8BBD0]/40 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] block">
                    Presensi Kehadiran Harian Terapis
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
                    Halo, {activeStaff.name}!
                  </h2>
                  <p className="text-xs text-[#8C7A82] mt-0.5">
                    Tanggal Hari Ini: <strong>{todayDateStr}</strong> • Posisi: <strong>{activeStaff.role}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-2xs self-start sm:self-auto text-center min-w-[140px]">
                  <span className="text-[10px] text-[#8C7A82] uppercase tracking-wider font-bold block">Status Hari Ini</span>
                  <span className={`text-sm font-bold block mt-0.5 ${
                    todayAttendance ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {todayAttendance ? (todayAttendance.checkOutTime ? 'Shift Selesai ✓' : 'Sedang Bertugas 🟢') : 'Belum Absen Masuk'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#F8BBD0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#4A3B40]">1. Jam Masuk (Clock In)</span>
                    {todayAttendance?.checkInTime && (
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {todayAttendance.checkInTime} WIB
                      </span>
                    )}
                  </div>
                  
                  {!todayAttendance ? (
                    <>
                      <input
                        type="text"
                        value={shiftNote}
                        onChange={(e) => setShiftNote(e.target.value)}
                        placeholder="Catatan masuk (misal: shift pagi, studio siap)..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-[#FFFDF9]"
                      />
                      <button
                        type="button"
                        onClick={handleClockIn}
                        className="w-full py-2.5 rounded-xl gold-button text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <LogIn size={14} />
                        <span>Catat Jam Masuk Sekarang</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-emerald-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                      ✓ Jam masuk tercatat pukul <strong>{todayAttendance.checkInTime} WIB</strong>. Catatan: &ldquo;{todayAttendance.notes}&rdquo;.
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#F8BBD0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#4A3B40]">2. Jam Keluar (Clock Out)</span>
                    {todayAttendance?.checkOutTime && (
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {todayAttendance.checkOutTime} WIB
                      </span>
                    )}
                  </div>

                  {todayAttendance && !todayAttendance.checkOutTime ? (
                    <button
                      type="button"
                      onClick={handleClockOut}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={14} />
                      <span>Selesai Shift &amp; Catat Jam Keluar</span>
                    </button>
                  ) : todayAttendance?.checkOutTime ? (
                    <p className="text-xs text-emerald-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                      ✓ Jam keluar tercatat pukul <strong>{todayAttendance.checkOutTime} WIB</strong>. Terima kasih atas kerja keras hari ini!
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic p-3 rounded-xl bg-gray-50 border border-gray-200">
                      Harap lakukan jam masuk terlebih dahulu sebelum mencatat jam keluar.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance History for this staff */}
            <div className="luxury-card p-5 sm:p-6 space-y-4 bg-white border border-gray-200">
              <h3 className="font-serif font-bold text-base text-[#4A3B40] border-b border-gray-100 pb-2">
                Riwayat Kehadiran Anda ({activeStaff.name})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FFF8E7] text-[#4A3B40] font-bold">
                    <tr>
                      <th className="p-3 rounded-l-xl">Tanggal</th>
                      <th className="p-3">Jam Masuk</th>
                      <th className="p-3">Jam Keluar</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-xl">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceList
                      .filter(a => a.staffId === activeStaff.id)
                      .map((att) => (
                        <tr key={att.id} className="hover:bg-[#FFFDF9]">
                          <td className="p-3 font-medium text-[#4A3B40]">{att.date}</td>
                          <td className="p-3 font-mono font-semibold text-emerald-700">{att.checkInTime || '-'}</td>
                          <td className="p-3 font-mono font-semibold text-rose-700">{att.checkOutTime || '-'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {att.status}
                            </span>
                          </td>
                          <td className="p-3 text-[#8C7A82]">{att.notes || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANTREAN TREATMENT AKTIF */}
        {activeTab === 'all_tasks' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="luxury-card p-5 sm:p-6 space-y-4 bg-white border border-[#D4AF37]/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8BBD0]/40 pb-3">
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#4A3B40]">
                    Antrean Semua Treatment Aktif
                  </h2>
                  <p className="text-xs text-[#8C7A82] mt-0.5">
                    Daftar reservasi disetujui Owner yang siap dikerjakan oleh tim terapis.
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30 self-start sm:self-auto">
                  {reservations.filter(r => r.status === 'APPROVED').length} Treatment Berjalan
                </span>
              </div>

              <div className="space-y-3">
                {reservations
                  .filter(r => r.status === 'APPROVED')
                  .map((res) => (
                    <div 
                      key={res.id} 
                      className="p-4 rounded-xl border border-gray-200 bg-[#FFFDF9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#D4AF37] text-white">
                            {res.appointmentDate} • {res.appointmentTime} WIB
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFD1DC] text-[#4A3B40]">
                            {res.type}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                          {res.fullName}
                        </h4>
                        <p className="text-xs text-[#8C7A82]">
                          Layanan: {res.services?.map(s => s.subSubCategoryName || s.subCategoryName).join(', ') || 'Paket Kelompok'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateTreatmentStatus(res.id, 'FINISHED')}
                          className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle size={14} />
                          <span>Selesaikan Treatment</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Role Confirmation */}
      <footer className="bg-white border-t border-[#F8BBD0]/50 py-4 px-4 text-center text-xs text-[#8C7A82] space-y-1">
        <p className="font-medium text-[#4A3B40]">
          {settings.storeName} Staff Portal • Login Sebagai: <strong>{activeStaff.name}</strong> ({activeStaff.role})
        </p>
        <p className="text-[11px] text-gray-500">
          Protokol Privasi: Nomor telepon dan data kontak pelanggan dienkripsi untuk privasi pelanggan.
        </p>
      </footer>
    </div>
  );
}
