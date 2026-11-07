import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  Edit3, 
  Check, 
  Filter, 
  User, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Trash2,
  Bell,
  Volume2,
  Radio
} from 'lucide-react';
import { Reservation, StoreSettings } from '../types/salon';
import { salonStore } from '../services/store';
import { PushNotificationService } from '../utils/pushNotification';
import { audioManager } from '../utils/audioNotification';

interface OwnerReservationsProps {
  reservations: Reservation[];
  isOwner: boolean;
  settings: StoreSettings;
  onRefresh: () => void;
}

export const OwnerReservations: React.FC<OwnerReservationsProps> = ({
  reservations,
  isOwner,
  settings,
  onRefresh
}) => {
  // Today's date string: YYYY-MM-DD
  const todayDateStr = new Date().toISOString().slice(0, 10);
  
  // Tomorrow's date string for H-1 reminders
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().slice(0, 10);

  // Search & Filter state for Today's schedule
  const [todaySearchQuery, setTodaySearchQuery] = useState('');
  
  // Search & Filter state for Total Reservations
  const [totalSearchQuery, setTotalSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Drawer for editing reservation details (Owner Exclusive)
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [notifPermission, setNotifPermission] = useState<string>(() => PushNotificationService.getPermission());

  // Delete reservation handler (Owner Feature)
  const handleConfirmDelete = () => {
    if (!reservationToDelete) return;
    salonStore.deleteReservation(reservationToDelete.id);
    if (editingRes?.id === reservationToDelete.id) {
      setEditingRes(null);
    }
    setReservationToDelete(null);
    onRefresh();
  };

  const handleRequestPermission = async () => {
    const res = await PushNotificationService.requestPermission();
    setNotifPermission(res);
  };

  const handleTestChime = () => {
    audioManager.playNewReservationChime();
  };

  // Status counts
  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
  const approvedCount = reservations.filter(r => r.status === 'APPROVED').length;
  const discussionCount = reservations.filter(r => r.status === 'NEEDS_DISCUSSION').length;
  const finishedCount = reservations.filter(r => r.status === 'FINISHED').length;
  const totalCount = reservations.length;

  // 1. Antrean Reservasi Pending Masuk Real-Time
  const pendingReservations = useMemo(() => {
    return reservations
      .filter(r => r.status === 'PENDING')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reservations]);

  // 2. Jadwal Treatment Hari Ini (Chronological morning to night)
  const todayReservations = useMemo(() => {
    return reservations
      .filter(r => r.appointmentDate === todayDateStr)
      .filter(r => {
        if (!todaySearchQuery) return true;
        const q = todaySearchQuery.toLowerCase();
        return r.fullName.toLowerCase().includes(q) || r.bookingCode.toLowerCase().includes(q);
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [reservations, todayDateStr, todaySearchQuery]);

  // 3. Action H-1 Reminders (Tomorrow's schedule)
  const tomorrowReservations = useMemo(() => {
    return reservations.filter(r => r.appointmentDate === tomorrowDateStr && r.status !== 'REJECTED');
  }, [reservations, tomorrowDateStr]);

  // 3. Total Reservasi (Separated layout, filterable)
  const filteredTotalReservations = useMemo(() => {
    return reservations
      .filter(r => {
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
        if (!totalSearchQuery) return true;
        const q = totalSearchQuery.toLowerCase();
        return (
          r.fullName.toLowerCase().includes(q) ||
          r.bookingCode.toLowerCase().includes(q) ||
          r.appointmentDate.includes(q)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reservations, statusFilter, totalSearchQuery]);

  // Handlers
  const handleMarkFinished = (resId: string) => {
    salonStore.completeReservation(resId);
    onRefresh();
  };

  const handleUpdateStatus = (resId: string, status: Reservation['status']) => {
    salonStore.updateReservation(resId, { status });
    onRefresh();
  };

  const handleUpdatePayment = (resId: string, paymentStatus: Reservation['paymentStatus']) => {
    salonStore.updateReservation(resId, { paymentStatus });
    onRefresh();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;
    salonStore.updateReservation(editingRes.id, {
      appointmentDate: editingRes.appointmentDate,
      appointmentTime: editingRes.appointmentTime,
      totalPrice: Number(editingRes.totalPrice),
      paymentStatus: editingRes.paymentStatus,
      status: editingRes.status,
      ownerNotes: editingRes.ownerNotes
    });
    setEditingRes(null);
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Real-time Multi-browser Sync & Sound Notification Controls */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF8E7] via-white to-[#FFD1DC]/30 border border-[#D4AF37]/50 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#B8860B] flex items-center justify-center font-bold shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#4A3B40]">
                Sinkronisasi Multi-Browser & Notifikasi Reservasi Aktif
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Terhubung ke server backend" />
            </div>
            <p className="text-[11px] text-[#8C7A82]">
              Setiap reservasi dari browser pelanggan masuk otomatis secara real-time dengan bunyi bel & notifikasi background.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition hover:scale-102"
            >
              <Bell size={13} />
              <span>Aktifkan Notifikasi Latar Belakang</span>
            </button>
          ) : (
            <span className="py-1 px-2.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
              <Bell size={12} />
              <span>Notifikasi Background Aktif</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleTestChime}
            className="py-1.5 px-3 rounded-xl bg-white border border-[#D4AF37] text-[#B8860B] hover:bg-[#FFF8E7] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title="Tes suara bel reservasi baru"
          >
            <Volume2 size={14} />
            <span>Tes Suara Bel</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Status Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="luxury-card p-4 bg-white border-[#F8BBD0]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Pending
            </span>
            <span className="text-2xl font-serif font-bold text-[#4A3B40]">{pendingCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            ⏳
          </div>
        </div>

        <div className="luxury-card p-4 bg-white border-[#F8BBD0]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Disetujui
            </span>
            <span className="text-2xl font-serif font-bold text-[#4A3B40]">{approvedCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
        </div>

        <div className="luxury-card p-4 bg-white border-[#F8BBD0]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
              Perlu Diskusi
            </span>
            <span className="text-2xl font-serif font-bold text-[#4A3B40]">{discussionCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
            💬
          </div>
        </div>

        <div className="luxury-card p-4 bg-white border-[#F8BBD0]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#B8860B] uppercase tracking-wider block">
              Selesai
            </span>
            <span className="text-2xl font-serif font-bold text-[#4A3B40]">{finishedCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-xs">
            ⭐
          </div>
        </div>

        <div className="luxury-card p-4 bg-gradient-to-br from-[#FFF8E7] to-[#FFD1DC]/40 border-[#D4AF37] col-span-2 sm:col-span-1 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4A3B40] uppercase tracking-wider block">
              Total Reservasi
            </span>
            <span className="text-2xl font-serif font-bold text-[#B8860B]">{totalCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-white flex items-center justify-center font-bold text-xs">
            📋
          </div>
        </div>
      </div>

      {/* SECTION: ANTREAN RESERVASI MASUK REAL-TIME (Live Incoming Queue) */}
      <section className={`rounded-2xl transition-all duration-300 p-5 ${
        pendingReservations.length > 0
          ? 'bg-gradient-to-r from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/40 border-2 border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/20'
          : 'bg-white border border-[#F8BBD0] shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              pendingReservations.length > 0 
                ? 'bg-[#D4AF37] text-white shadow-xs animate-bounce' 
                : 'bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/40'
            }`}>
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#4A3B40]">
                  Antrean Reservasi Masuk Baru (Live Queue)
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  pendingReservations.length > 0
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {pendingReservations.length > 0 ? `${pendingReservations.length} Menunggu Konfirmasi` : 'Siaga Aktif'}
                </span>
              </div>
              <p className="text-xs text-[#8C7A82] mt-0.5">
                Reservasi masuk otomatis dari semua browser pelanggan. Owner dapat langsung menyetujui, diskusi, atau hapus riwayat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestChime}
              className="py-1.5 px-3 rounded-xl bg-white border border-[#D4AF37] text-[#B8860B] hover:bg-[#FFF8E7] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              title="Tes Bunyi Bel Masuk"
            >
              <Volume2 size={13} />
              <span>Tes Bel</span>
            </button>
            <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Sync</span>
            </span>
          </div>
        </div>

        {pendingReservations.length === 0 ? (
          <div className="py-7 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FFF8E7] text-[#B8860B] flex items-center justify-center mx-auto border border-[#D4AF37]/30">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-serif font-bold text-sm text-[#4A3B40]">
              Semua Reservasi Masuk Sudah Ditindaklanjuti
            </p>
            <p className="text-xs text-[#8C7A82] max-w-md mx-auto">
              Tidak ada reservasi pending saat ini. Ketika pelanggan dari browser lain mengirim reservasi, pesanan akan langsung muncul seketika di sini dengan suara bel!
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {pendingReservations.map((res) => (
              <div
                key={res.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#D4AF37]/60 shadow-sm hover:shadow-md transition space-y-3.5"
              >
                {/* Header row: Booking Code, DateTime, and Type */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-md bg-[#D4AF37] text-white">
                      {res.bookingCode}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30">
                      📅 {res.appointmentDate} • ⏰ {res.appointmentTime} WIB
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40]">
                      {res.type}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      📍 {res.location.isHomeService ? `Home Service (${res.location.village})` : 'Datang ke Studio'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-xs text-[#8C7A82] block">Total Tagihan:</span>
                    <span className="font-mono text-base sm:text-lg font-bold text-[#B8860B]">
                      Rp {res.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Services breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* Customer Info */}
                  <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#4A3B40] flex items-center gap-1.5">
                        <User size={15} className="text-[#D4AF37]" />
                        <span>{res.fullName}</span>
                      </span>
                      <a
                        href={`https://wa.me/${res.whatsapp.replace(/\D/g, '')}?text=Halo%20Kak%20${encodeURIComponent(res.fullName)},%20kami%20dari%20Lyra's%20Nail-Lash%20mengenai%20reservasi%20${encodeURIComponent(res.bookingCode)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                      >
                        <MessageCircle size={12} />
                        <span>{res.whatsapp}</span>
                      </a>
                    </div>

                    {res.location.isHomeService && (
                      <p className="text-[11px] text-[#8C7A82]">
                        🏠 Alamat: <span className="text-[#4A3B40] font-medium">{res.location.streetAddress || res.location.village}</span>
                        {res.location.calculatedDistanceKm ? ` (Jarak: ${res.location.calculatedDistanceKm} km)` : ''}
                      </p>
                    )}

                    {(res.location.notes || res.ownerNotes) && (
                      <p className="text-[11px] text-[#8C7A82] italic bg-white p-2 rounded-lg border border-[#F8BBD0]/40">
                        💬 Catatan: &quot;{res.location.notes || res.ownerNotes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Services & Selections */}
                  <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/60 space-y-1.5">
                    <span className="font-bold text-[11px] text-[#B8860B] block uppercase tracking-wider">
                      💅 Rincian Pilihan Treatment:
                    </span>
                    {res.services && res.services.length > 0 ? (
                      res.services.map((s, idx) => (
                        <div key={idx} className="text-xs space-y-0.5 pb-1 border-b border-[#F8BBD0]/30 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between font-semibold text-[#4A3B40]">
                            <span>• {s.subSubCategoryName || s.subCategoryName}</span>
                            <span className="font-mono text-[#B8860B]">Rp {s.price.toLocaleString('id-ID')}</span>
                          </div>
                          {s.selectedColors && s.selectedColors.length > 0 && (
                            <p className="text-[11px] text-[#8C7A82]">
                              Warna: <span className="text-[#4A3B40] font-medium">{s.selectedColors.join(', ')}</span>
                            </p>
                          )}
                          {s.selectedExtensionLengthMm && (
                            <p className="text-[11px] text-emerald-700 font-semibold">
                              Extension: {s.selectedExtensionLengthMm} mm
                            </p>
                          )}
                          {s.selectedAccessories && s.selectedAccessories.length > 0 && (
                            <div className="text-[11px] text-purple-700 flex items-center gap-1.5 flex-wrap">
                              <span>Aksesoris:</span>
                              {s.selectedAccessories.map((acc, aIdx) => (
                                <span key={aIdx} className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded text-[10px] font-medium">
                                  {acc.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {s.referencePhotoUrl && (
                            <a
                              href={s.referencePhotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#B8860B] underline font-semibold block"
                            >
                              Lihat Foto Referensi Desain
                            </a>
                          )}
                        </div>
                      ))
                    ) : res.groupMembers && res.groupMembers.length > 0 ? (
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-purple-800">
                          Rombongan {res.groupMembers.length} Orang (Ketua: {res.groupMembers[0]?.fullName})
                        </p>
                        {res.groupMembers.map((m, mIdx) => (
                          <div key={mIdx} className="text-[11px] text-[#4A3B40] pl-2 border-l-2 border-purple-200">
                            <strong>{m.fullName}:</strong> {m.services.map(s => s.subSubCategoryName || s.subCategoryName).join(', ')}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8C7A82]">Layanan Standar</p>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons for Incoming Reservation */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReservationToDelete(res)}
                      className="py-1.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Hapus riwayat reservasi pelanggan"
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingRes(res)}
                      className="py-1.5 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(res.id, 'REJECTED')}
                      className="py-1.5 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(res.id, 'NEEDS_DISCUSSION')}
                      className="py-1.5 px-3 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold transition"
                    >
                      💬 Perlu Diskusi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(res.id, 'APPROVED')}
                      className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition hover:scale-102"
                    >
                      <Check size={14} />
                      <span>Setujui &amp; Konfirmasi</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: JADWAL RESERVASI H-1 (Dapat Dilihat Staf & Owner • Staf Tidak Bisa Menghubungi Customer) */}
      <div className="luxury-card p-5 bg-gradient-to-r from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/30 border-[#D4AF37]/50 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-[#B8860B]" />
              <h3 className="font-serif font-bold text-lg text-[#4A3B40]">
                Jadwal Reservasi H-1 Hari (Besok: {tomorrowDateStr})
              </h3>
            </div>
            <p className="text-xs text-[#8C7A82] mt-0.5">
              Jadwal persiapan treatment esok hari untuk Owner dan Staf. {!isOwner && '🔒 Sesuai protokol, kontak pelanggan disembunyikan untuk staf.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4AF37] text-white shadow-2xs">
              {tomorrowReservations.length} Jadwal Besok
            </span>
            {!isOwner && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Staff Mode (No Contact)
              </span>
            )}
          </div>
        </div>

        {tomorrowReservations.length === 0 ? (
          <div className="py-6 text-center bg-white/70 rounded-2xl border border-dashed border-[#F8BBD0] p-4 text-xs text-[#8C7A82]">
            🌸 Belum ada jadwal janji temu untuk besok (H-1: {tomorrowDateStr}).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tomorrowReservations.map((res) => (
              <div 
                key={res.id} 
                className="p-4 rounded-2xl bg-white border border-[#F8BBD0] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#D4AF37] transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#D4AF37] text-white">
                      {res.appointmentTime} WIB
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FFD1DC] text-[#4A3B40]">
                      {res.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                      {res.fullName}
                    </h4>

                    {/* Contact Privacy Enforcer: Staff CANNOT see or contact customer */}
                    {isOwner ? (
                      <p className="text-xs text-[#8C7A82] flex items-center gap-1 mt-0.5 font-mono">
                        <Phone size={12} className="text-[#D4AF37]" />
                        <span>{res.whatsapp}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic flex items-center gap-1 mt-0.5">
                        <span>🔒 Nomor kontak dirahasiakan (Staff Mode)</span>
                      </p>
                    )}
                  </div>

                  {/* Services & Treatment details for H-1 preparation */}
                  <div className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/50 text-xs text-[#4A3B40] space-y-1">
                    <div className="font-semibold text-[11px] text-[#B8860B] flex items-center gap-1">
                      <span>💅 Tindakan & Detail Persiapan:</span>
                    </div>

                    {res.services && res.services.length > 0 ? (
                      res.services.map((s, idx) => (
                        <div key={idx} className="text-[11px]">
                          • <strong className="text-[#4A3B40]">{s.subSubCategoryName || s.subCategoryName}</strong>
                          {s.selectedColors && s.selectedColors.length > 0 && (
                            <span className="text-[#8C7A82]"> (Warna: {s.selectedColors.join(', ')})</span>
                          )}
                          {s.selectedType && (
                            <span className="text-[#8C7A82]"> [{s.selectedType}]</span>
                          )}
                          {s.selectedExtensionLengthMm && (
                            <span className="text-emerald-700 font-semibold"> [Ext: {s.selectedExtensionLengthMm} mm]</span>
                          )}
                          {s.selectedAccessories && s.selectedAccessories.length > 0 && (
                            <span className="text-purple-700"> [Aksesoris: {s.selectedAccessories.map(a => a.name).join(', ')}]</span>
                          )}
                        </div>
                      ))
                    ) : res.groupMembers && res.groupMembers.length > 0 ? (
                      <div className="text-[11px] text-[#4A3B40]">
                        • Rombongan {res.groupMembers.length} Orang: {res.groupMembers.map(m => m.fullName).filter(Boolean).join(', ')}
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#8C7A82]">Layanan Standar Studio</div>
                    )}

                    <div className="text-[10px] text-[#8C7A82] pt-1 border-t border-[#F8BBD0]/30">
                      📍 Lokasi: {res.location.isHomeService ? `Home Service (${res.location.calculatedDistanceKm} km)` : 'Datang ke Studio Mall Taman Palem'}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Action: Strictly ONLY rendered for Owner. Staff CANNOT contact customer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  {isOwner ? (
                    <a
                      href={`https://wa.me/${res.whatsapp.replace(/\D/g, '')}?text=Halo%20Kak%20${encodeURIComponent(res.fullName)},%20kami%20dari%20Lyra's%20Nail-Lash%20mengingatkan%20jadwal%20perawatan%20cantik%20Kakak%20besok%20jam%20${encodeURIComponent(res.appointmentTime)}%20WIB.%20Sampai%20bertemu%20besok!%20✨💅`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition ml-auto shadow-2xs"
                    >
                      <MessageCircle size={13} />
                      <span>Kirim WA Pengingat H-1</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">
                      Staff hanya dapat melihat jadwal dan detail persiapan treatment.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: JADWAL TREATMENT HARI INI (Dipisah lokasinya, urutan kronologis pagi -> malam) */}
      <section className="luxury-card p-5 sm:p-6 space-y-5 bg-white border-[#D4AF37]/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F8BBD0] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3B40]">
                Jadwal Treatment Hari Ini ({todayDateStr})
              </h3>
            </div>
            <p className="text-xs text-[#8C7A82] mt-0.5 ml-5">
              Urutan kronologis dari pagi hingga malam. Selesaikan tindakan dengan klik tombol &quot;Tandai Selesai&quot;.
            </p>
          </div>

          {/* Chronological Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={todaySearchQuery}
              onChange={(e) => setTodaySearchQuery(e.target.value)}
              placeholder="Cari nama / kode hari ini..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-[#8C7A82]" />
          </div>
        </div>

        {todayReservations.length === 0 ? (
          <div className="text-center py-10 bg-[#FFFDF9] rounded-xl border border-dashed border-[#F8BBD0] p-6 space-y-2">
            <Calendar size={32} className="mx-auto text-[#D4AF37]" />
            <p className="text-xs font-semibold text-[#4A3B40]">
              Tidak ada reservasi terdaftar untuk hari ini ({todayDateStr}).
            </p>
            <p className="text-[11px] text-[#8C7A82]">
              Jadwal hari lain dapat dipantau pada tabel Total Reservasi di bawah.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayReservations.map((res) => {
              const isFinished = res.status === 'FINISHED';

              return (
                <div 
                  key={res.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isFinished 
                      ? 'border-[#D4AF37]/30 bg-[#FFF8E7]/30 opacity-90' 
                      : 'border-[#F8BBD0] bg-white shadow-2xs hover:border-[#D4AF37]'
                  }`}
                >
                  {/* Left: Time & Customer */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-md bg-[#D4AF37] text-white">
                        {res.appointmentTime} WIB
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#B8860B]">
                        {res.bookingCode}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40] font-bold">
                        {res.type}
                      </span>
                      {res.location.isHomeService && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                          Home Service ({res.location.calculatedDistanceKm} km)
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#4A3B40]">
                        {res.fullName}
                      </h4>
                      {/* WA only visible to Owner, hidden from staff */}
                      {isOwner && (
                        <p className="text-xs text-[#8C7A82] flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {res.whatsapp}
                        </p>
                      )}
                    </div>

                    {/* Services and Choices */}
                    <div className="text-xs text-[#4A3B40] space-y-1">
                      {res.services.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span className="font-semibold">{s.subSubCategoryName || s.subCategoryName}</span>
                          {s.selectedColors && s.selectedColors.length > 0 && (
                            <span className="text-[#B8860B] font-medium">
                              (Warna: {s.selectedColors.join(', ')})
                            </span>
                          )}
                          {s.selectedType && (
                            <span className="text-[#8C7A82]">
                              [{s.selectedType}]
                            </span>
                          )}
                          {s.referencePhotoUrl && (
                            <a
                              href={s.referencePhotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#B8860B] underline font-semibold"
                            >
                              Lihat Foto Desain
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Payment, Price (Owner only) and Mark Finished button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end lg:self-center shrink-0">
                    {/* Price and payment - HIDDEN from staff! */}
                    {isOwner && (
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-[#B8860B] block">
                          Rp {res.totalPrice.toLocaleString('id-ID')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          res.paymentStatus === 'LUNAS' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : res.paymentStatus === 'DP'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {res.paymentStatus}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingRes(res)}
                            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                            title="Edit Jadwal / Harga / Layanan"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReservationToDelete(res)}
                            className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                            title="Hapus Riwayat Reservasi Customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}

                      {!isFinished ? (
                        <button
                          type="button"
                          onClick={() => handleMarkFinished(res.id)}
                          className="py-2 px-4 rounded-xl gold-button text-xs font-bold shadow-xs flex items-center gap-1.5 transition hover:scale-102"
                        >
                          <Check size={14} />
                          <span>Tandai Selesai</span>
                        </button>
                      ) : (
                        <span className="py-1.5 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>Sudah Selesai</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 4: TABEL TOTAL RESERVASI (DIPISAH LOKASINYA DARI JADWAL HARI INI) */}
      <section className="luxury-card p-5 sm:p-6 space-y-5 bg-white border-[#F8BBD0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F8BBD0] gap-3">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3B40]">
              Tabel Total Reservasi (Seluruh Jadwal)
            </h3>
            <p className="text-xs text-[#8C7A82] mt-0.5">
              Pusat monitoring semua riwayat pesanan reguler, member, dan rombongan.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] font-semibold focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending (Menunggu)</option>
              <option value="APPROVED">Disetujui</option>
              <option value="NEEDS_DISCUSSION">Perlu Diskusi</option>
              <option value="FINISHED">Selesai</option>
              <option value="REJECTED">Ditolak</option>
            </select>

            <div className="relative">
              <input
                type="text"
                value={totalSearchQuery}
                onChange={(e) => setTotalSearchQuery(e.target.value)}
                placeholder="Cari kode / nama / tanggal..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-[#8C7A82]" />
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4A3B40]">
            <thead className="bg-[#FFF8E7] text-[#8C7A82] uppercase text-[10px] tracking-wider border-b border-[#F8BBD0]/50">
              <tr>
                <th className="py-3 px-3">Kode Booking</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Jadwal</th>
                <th className="py-3 px-3">Layanan</th>
                <th className="py-3 px-3">Tipe & Lokasi</th>
                {isOwner && <th className="py-3 px-3">Biaya</th>}
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTotalReservations.map((res) => (
                <tr key={res.id} className="hover:bg-[#FFFDF9] transition">
                  <td className="py-3 px-3 font-mono font-bold text-[#B8860B]">
                    {res.bookingCode}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold block">{res.fullName}</span>
                    {isOwner ? (
                      <span className="text-[11px] text-[#8C7A82]">{res.whatsapp}</span>
                    ) : (
                      <span className="text-[11px] text-[#8C7A82]">(Privat Staf)</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="block font-medium">{res.appointmentDate}</span>
                    <span className="text-[11px] text-[#8C7A82] font-mono">{res.appointmentTime} WIB</span>
                  </td>
                  <td className="py-3 px-3 max-w-[200px]">
                    <span className="truncate block font-medium">
                      {res.services[0]?.subSubCategoryName || res.services[0]?.subCategoryName || 'Treatment Rombongan'}
                    </span>
                    {res.services.length > 1 && (
                      <span className="text-[10px] text-[#B8860B]">+{res.services.length - 1} layanan lainnya</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40] font-bold block w-fit mb-0.5">
                      {res.type}
                    </span>
                    <span className="text-[10px] text-[#8C7A82]">
                      {res.location.isHomeService ? `Home Service (${res.location.village})` : 'Studio Visit'}
                    </span>
                  </td>

                  {/* Owner Exclusive Column */}
                  {isOwner && (
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#B8860B] block">
                        Rp {res.totalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        res.paymentStatus === 'LUNAS' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {res.paymentStatus}
                      </span>
                    </td>
                  )}

                  <td className="py-3 px-3">
                    {res.status === 'APPROVED' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Disetujui
                      </span>
                    )}
                    {res.status === 'FINISHED' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/40 text-[10px] font-bold">
                        Selesai ⭐
                      </span>
                    )}
                    {res.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Pending
                      </span>
                    )}
                    {res.status === 'NEEDS_DISCUSSION' && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                        Diskusi
                      </span>
                    )}
                    {res.status === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Ditolak
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingRes(res)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
                            title="Edit Reservasi"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReservationToDelete(res)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                            title="Hapus Riwayat Reservasi Customer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}

                      {res.status === 'PENDING' && isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(res.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs"
                            title="Setujui Reservasi"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(res.id, 'NEEDS_DISCUSSION')}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs"
                            title="Perlu Diskusi"
                          >
                            Diskusi
                          </button>
                        </>
                      )}

                      {res.status !== 'FINISHED' && (
                        <button
                          type="button"
                          onClick={() => handleMarkFinished(res.id)}
                          className="py-1 px-2.5 rounded-lg gold-button text-[11px] font-bold shadow-2xs"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal (Owner Exclusive: Edit price, date, time, status, payment) */}
      {editingRes && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#FFFDF9] rounded-2xl p-6 shadow-2xl border border-[#F8BBD0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
              <h4 className="font-serif font-bold text-lg text-[#4A3B40]">
                Edit Reservasi: {editingRes.bookingCode} ({editingRes.fullName})
              </h4>
              <button
                type="button"
                onClick={() => setEditingRes(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B40] mb-1">
                    Tanggal Treatment:
                  </label>
                  <input
                    type="date"
                    required
                    value={editingRes.appointmentDate}
                    onChange={(e) => setEditingRes({ ...editingRes, appointmentDate: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4A3B40] mb-1">
                    Jam:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRes.appointmentTime}
                    onChange={(e) => setEditingRes({ ...editingRes, appointmentTime: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B40] mb-1">
                    Total Harga Tagihan (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    value={editingRes.totalPrice}
                    onChange={(e) => setEditingRes({ ...editingRes, totalPrice: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4A3B40] mb-1">
                    Status Pembayaran:
                  </label>
                  <select
                    value={editingRes.paymentStatus}
                    onChange={(e) => setEditingRes({ ...editingRes, paymentStatus: e.target.value as any })}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-semibold"
                  >
                    <option value="BELUM_BAYAR">Belum Bayar</option>
                    <option value="DP">DP (Uang Muka)</option>
                    <option value="LUNAS">LUNAS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B40] mb-1">
                  Status Reservasi:
                </label>
                <select
                  value={editingRes.status}
                  onChange={(e) => setEditingRes({ ...editingRes, status: e.target.value as any })}
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-semibold"
                >
                  <option value="PENDING">Pending (Menunggu Konfirmasi)</option>
                  <option value="APPROVED">Disetujui (Approved)</option>
                  <option value="NEEDS_DISCUSSION">Memerlukan Diskusi Tambahan</option>
                  <option value="FINISHED">Selesai (Finished)</option>
                  <option value="REJECTED">Tidak Disetujui (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B40] mb-1">
                  Catatan Khusus dari Owner:
                </label>
                <textarea
                  rows={2}
                  value={editingRes.ownerNotes || ''}
                  onChange={(e) => setEditingRes({ ...editingRes, ownerNotes: e.target.value })}
                  placeholder="Instruksi terapis atau konfirmasi khusus..."
                  className="w-full p-2.5 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = editingRes;
                    setReservationToDelete(target);
                  }}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={14} />
                  <span>Hapus Riwayat</span>
                </button>
                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRes(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl gold-button font-bold"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Customer Reservation History */}
      {reservationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="font-serif font-bold text-lg text-[#4A3B40]">
                Hapus Riwayat Reservasi?
              </h4>
              <p className="text-xs text-[#8C7A82] leading-relaxed">
                Apakah Anda yakin ingin menghapus data riwayat reservasi{' '}
                <strong className="text-[#4A3B40] font-mono">{reservationToDelete.bookingCode}</strong> atas nama{' '}
                <strong className="text-[#4A3B40]">{reservationToDelete.fullName}</strong>?
              </p>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] text-left space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>Perhatian:</span>
                </p>
                <p>
                  Data reservasi ini akan dihapus secara permanen dari server dan riwayat di seluruh perangkat browser pelanggan/owner.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReservationToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
