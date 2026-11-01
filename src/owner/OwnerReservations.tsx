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
  DollarSign 
} from 'lucide-react';
import { Reservation, StoreSettings } from '../types/salon';
import { salonStore } from '../services/store';

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

  // Status counts
  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
  const approvedCount = reservations.filter(r => r.status === 'APPROVED').length;
  const discussionCount = reservations.filter(r => r.status === 'NEEDS_DISCUSSION').length;
  const finishedCount = reservations.filter(r => r.status === 'FINISHED').length;
  const totalCount = reservations.length;

  // 1. Jadwal Treatment Hari Ini (Chronological morning to night)
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

  // 2. Action H-1 Reminders (Tomorrow's schedule)
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
    <div className="space-y-10 animate-fadeIn">
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

      {/* SECTION 2: Pengingat H-1 (Reminder H-1 Tindakan Besok) */}
      {tomorrowReservations.length > 0 && (
        <div className="luxury-card p-5 bg-gradient-to-r from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/30 border-[#D4AF37]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#B8860B]" />
              <h3 className="font-serif font-bold text-base text-[#4A3B40]">
                Pengingat Janji Treatment H-1 (Besok: {tomorrowDateStr})
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-white">
              {tomorrowReservations.length} Pelanggan Besok
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tomorrowReservations.map((res) => (
              <div 
                key={res.id} 
                className="p-3.5 rounded-xl bg-white border border-[#F8BBD0]/60 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="font-semibold text-xs text-[#4A3B40] block">
                    {res.fullName} ({res.appointmentTime} WIB)
                  </span>
                  <span className="text-[11px] text-[#8C7A82]">
                    {res.services[0]?.subCategoryName || 'Treatment Rombongan'} • {res.location.isHomeService ? 'Home Service' : 'Studio'}
                  </span>
                </div>

                {isOwner && (
                  <a
                    href={`https://wa.me/${res.whatsapp.replace(/\D/g, '')}?text=Halo%20Kak%20${encodeURIComponent(res.fullName)},%20kami%20dari%20Lyra's%20Nail-Lash%20mengingatkan%20jadwal%20perawatan%20cantik%20Kakak%20besok%20jam%20${encodeURIComponent(res.appointmentTime)}%20WIB.%20Sampai%20bertemu%20besok!%20✨`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                  >
                    <MessageCircle size={13} />
                    <span>Kirim WA H-1</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                        <button
                          type="button"
                          onClick={() => setEditingRes(res)}
                          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                          title="Edit Jadwal / Harga / Layanan"
                        >
                          <Edit3 size={15} />
                        </button>
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
                        <button
                          type="button"
                          onClick={() => setEditingRes(res)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
                          title="Edit Reservasi"
                        >
                          <Edit3 size={13} />
                        </button>
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

              <div className="pt-2 flex gap-2">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
