import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  UserPlus, 
  Trash2, 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';
import { 
  Category, 
  ColorItem, 
  CodeItem, 
  TypeItem, 
  SelectedServiceItem, 
  LocationDetail, 
  Reservation, 
  GroupCustomerItem,
  OperationalScheduleSettings
} from '../types/salon';
import { TransparentCatalog } from './TransparentCatalog';
import { HomeServicePicker } from './HomeServicePicker';
import { getStoreScheduleForDate, checkTimeSlotAvailability } from '../utils/scheduleUtils';
import { TreatmentTimePicker } from './TreatmentTimePicker';

interface GroupBookingProps {
  categories: Category[];
  availableColors: ColorItem[];
  availableCodes: CodeItem[];
  availableTypes: TypeItem[];
  operationalSchedule?: OperationalScheduleSettings;
  reservations: Reservation[];
  onSubmitReservation: (reservation: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'randomCuteQuote'>) => void;
  onBack: () => void;
}

export const GroupBooking: React.FC<GroupBookingProps> = ({
  categories,
  availableColors,
  availableCodes,
  availableTypes,
  operationalSchedule,
  reservations,
  onSubmitReservation,
  onBack
}) => {
  // Step 1: Schedule (Kalender Pusat & Jam)
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [appointmentTime, setAppointmentTime] = useState('14:00');
  const [groupLeadName, setGroupLeadName] = useState('');
  const [groupLeadPhone, setGroupLeadPhone] = useState('');

  // Step 2 & 3: Tambah Customer (Minimal 3 Orang) with separate services & photos
  const [groupMembers, setGroupMembers] = useState<GroupCustomerItem[]>([
    { id: 'gm-1', fullName: '', whatsapp: '', services: [], subtotalServices: 0 },
    { id: 'gm-2', fullName: '', whatsapp: '', services: [], subtotalServices: 0 },
    { id: 'gm-3', fullName: '', whatsapp: '', services: [], subtotalServices: 0 }
  ]);

  // Active tab to choose services for each member
  const [activeMemberIndex, setActiveMemberIndex] = useState(0);

  // Compute operational schedule for selected appointment date
  const scheduleResolution = React.useMemo(() => {
    return getStoreScheduleForDate(appointmentDate, operationalSchedule);
  }, [appointmentDate, operationalSchedule]);

  // Ensure selected slot stays valid when date or schedule changes
  React.useEffect(() => {
    if (scheduleResolution?.isOpen && scheduleResolution.slots.length > 0) {
      if (!scheduleResolution.slots.includes(appointmentTime)) {
        setAppointmentTime(scheduleResolution.slots[0]);
      }
    }
  }, [scheduleResolution, appointmentTime]);

  // Step 4: Home Service
  const [location, setLocation] = useState<LocationDetail>({
    isHomeService: false,
    province: 'DKI Jakarta',
    regency: 'Jakarta Selatan',
    district: 'Kebayoran Baru',
    village: 'Senayan',
    streetAddress: 'Studio Lyra’s Nail-Lash (Kunjungan Salon)',
    calculatedDistanceKm: 0,
    baseDeliveryFee: 0,
    additional5KmFee: 0,
    coinDiscountAmount: 0,
    totalDeliveryFee: 0
  });

  const [customerNotes, setCustomerNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Add more members (if > 3)
  const handleAddMember = () => {
    setGroupMembers(prev => [
      ...prev,
      {
        id: `gm-${Date.now()}`,
        fullName: '',
        whatsapp: '',
        services: [],
        subtotalServices: 0
      }
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (groupMembers.length <= 3) {
      setValidationError('Modul Rombongan wajib minimal 3 orang!');
      return;
    }
    setGroupMembers(prev => prev.filter((_, i) => i !== index));
    if (activeMemberIndex >= groupMembers.length - 1) {
      setActiveMemberIndex(Math.max(0, groupMembers.length - 2));
    }
  };

  const handleUpdateMemberInfo = (index: number, field: 'fullName' | 'whatsapp', val: string) => {
    setGroupMembers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Service toggle & update for the ACTIVE member
  const handleToggleServiceForActiveMember = (item: SelectedServiceItem) => {
    setGroupMembers(prev => {
      const copy = [...prev];
      const member = copy[activeMemberIndex];
      const newServices = [...member.services, item];
      const subtotal = newServices.reduce((acc, curr) => acc + curr.finalPrice, 0);
      copy[activeMemberIndex] = { ...member, services: newServices, subtotalServices: subtotal };
      return copy;
    });
  };

  const handleUpdateServiceForActiveMember = (serviceId: string, partial: Partial<SelectedServiceItem>) => {
    setGroupMembers(prev => {
      const copy = [...prev];
      const member = copy[activeMemberIndex];
      const newServices = member.services.map(s => s.serviceId === serviceId ? { ...s, ...partial } : s);
      const subtotal = newServices.reduce((acc, curr) => acc + curr.finalPrice, 0);
      copy[activeMemberIndex] = { ...member, services: newServices, subtotalServices: subtotal };
      return copy;
    });
  };

  const handleRemoveServiceForActiveMember = (serviceId: string) => {
    setGroupMembers(prev => {
      const copy = [...prev];
      const member = copy[activeMemberIndex];
      const newServices = member.services.filter(s => s.serviceId !== serviceId);
      const subtotal = newServices.reduce((acc, curr) => acc + curr.finalPrice, 0);
      copy[activeMemberIndex] = { ...member, services: newServices, subtotalServices: subtotal };
      return copy;
    });
  };

  // Overall totals
  const totalGroupServicesSubtotal = groupMembers.reduce((acc, m) => acc + m.subtotalServices, 0);
  const deliveryFee = location.isHomeService ? location.totalDeliveryFee : 0;
  const totalPrice = totalGroupServicesSubtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!appointmentDate) {
      setValidationError('Silakan tentukan tanggal jadwal kunjungan pada Kalender Pusat!');
      return;
    }

    // Check slot availability and 30-min buffer rule
    const timeStatus = checkTimeSlotAvailability(appointmentDate, appointmentTime, reservations, operationalSchedule);
    if (!timeStatus.isValid) {
      setValidationError(timeStatus.reason || 'Jam kunjungan yang dipilih tidak tersedia (mungkin penuh atau bertepatan dengan jam istirahat).');
      return;
    }

    if (groupMembers.length < 3) {
      setValidationError('Modul Pemesanan Gabungan wajib minimal 3 orang!');
      return;
    }

    // Validate member details
    for (let i = 0; i < groupMembers.length; i++) {
      const m = groupMembers[i];
      if (!m.fullName.trim() || !m.whatsapp.trim()) {
        setValidationError(`Data Anggota ${i + 1} belum lengkap. Silakan isi Nama dan Nomor WhatsApp!`);
        return;
      }
      if (m.services.length === 0) {
        setValidationError(`Anggota ${i + 1} (${m.fullName || 'Nama kosong'}) belum memilih layanan treatment.`);
        return;
      }
      // Check mandatory photos
      for (const s of m.services) {
        const cat = categories.find(c => c.id === s.categoryId);
        const sub = cat?.subCategories.find(sc => sc.id === s.subCategoryId);
        if (sub?.requireDesignUpload && !s.referencePhotoUrl) {
          setValidationError(`Layanan "${s.subSubCategoryName || s.subCategoryName}" untuk ${m.fullName} mewajibkan unggah foto referensi desain/tangan.`);
          return;
        }
      }
    }

    // Submit payload
    const primaryContact = groupMembers[0];
    onSubmitReservation({
      type: 'GABUNGAN',
      fullName: groupLeadName.trim() || `Rombongan ${primaryContact.fullName} (${groupMembers.length} Orang)`,
      whatsapp: groupLeadPhone.trim() || primaryContact.whatsapp,
      appointmentDate,
      appointmentTime,
      groupMembers,
      services: [], // Services are housed inside groupMembers
      location,
      servicesSubtotal: totalGroupServicesSubtotal,
      deliveryFee,
      voucherDiscount: 0,
      coinDiscount: 0,
      customAdjustment: 0,
      totalPrice,
      paymentStatus: 'BELUM_BAYAR',
      status: 'PENDING',
      ownerNotes: customerNotes ? `Catatan Rombongan: ${customerNotes}` : undefined
    });
  };

  const activeMember = groupMembers[activeMemberIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Header - Left Aligned Back Button */}
      <div className="flex flex-col gap-3 border-b border-[#F8BBD0] pb-4">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] transition inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#FFD1DC]/30 border border-transparent hover:border-[#F8BBD0]"
          >
            ← Kembali ke Pemilihan Tipe Customer
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40]">
              Pemesanan Gabungan (Rombongan Min 3 Orang)
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40]">
              Paket Spesial Rombongan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8C7A82]">
            Alur berurutan mutlak: Jadwal Kalender → Tambah Anggota → Pilih Layanan Per Orang → Home Service.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* URUTAN 1: Pemilihan Jadwal (Kalender Pusat) */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2.5">
            <Calendar size={18} className="text-[#D4AF37]" />
            <span>Urutan 1: Pemilihan Jadwal (Kalender Pusat)</span>
          </h3>

          {/* Primary Lead Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Nama Kontak Utama / Rombongan:
              </label>
              <input
                type="text"
                value={groupLeadName}
                onChange={(e) => setGroupLeadName(e.target.value)}
                placeholder="Contoh: Bridal Shower Kak Amanda"
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                No. WhatsApp Utama:
              </label>
              <input
                type="tel"
                value={groupLeadPhone}
                onChange={(e) => setGroupLeadPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
            </div>
          </div>

          {/* Date Picker & TreatmentTimePicker */}
          <div className="space-y-3 pt-2 border-t border-[#F8BBD0]/40">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Tanggal Treatment Rombongan: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
            </div>

            {/* Treatment Time Picker: bebas jam & menit dengan aturan 30 mnt buffer */}
            <TreatmentTimePicker
              date={appointmentDate}
              value={appointmentTime}
              onChange={(newTime) => setAppointmentTime(newTime)}
              operationalSchedule={operationalSchedule}
              reservations={reservations}
            />
          </div>
        </div>

        {/* URUTAN 2: Tambah Customer (Minimal 3 Orang) */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2.5">
            <h3 className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2">
              <Users size={18} className="text-[#D4AF37]" />
              <span>Urutan 2: Data Anggota Rombongan (Min. 3 Orang)</span>
            </h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30">
              Total: {groupMembers.length} Orang
            </span>
          </div>

          <div className="space-y-3">
            {groupMembers.map((member, idx) => (
              <div 
                key={member.id}
                className="p-4 rounded-xl bg-white border border-[#F8BBD0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="w-7 h-7 rounded-full bg-[#FFD1DC] text-[#4A3B40] font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs text-[#4A3B40]">
                    Anggota {idx + 1}:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                  <input
                    type="text"
                    required
                    value={member.fullName}
                    onChange={(e) => handleUpdateMemberInfo(idx, 'fullName', e.target.value)}
                    placeholder="Nama Lengkap Anggota"
                    className="py-1.5 px-3 rounded-lg border border-[#F8BBD0] text-xs text-[#4A3B40] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <input
                    type="tel"
                    required
                    value={member.whatsapp}
                    onChange={(e) => handleUpdateMemberInfo(idx, 'whatsapp', e.target.value)}
                    placeholder="Nomor WA (untuk koin individu)"
                    className="py-1.5 px-3 rounded-lg border border-[#F8BBD0] text-xs text-[#4A3B40] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[11px] font-mono text-[#B8860B] font-semibold">
                    {member.services.length} Layanan (Rp {member.subtotalServices.toLocaleString('id-ID')})
                  </span>
                  {groupMembers.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      title="Hapus Anggota"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddMember}
              className="py-2 px-4 rounded-xl soft-button text-xs font-semibold flex items-center gap-1.5 border border-[#F8BBD0]"
            >
              <Plus size={14} />
              <span>Tambah Anggota ke-{groupMembers.length + 1}</span>
            </button>
            <span className="text-[11px] text-[#8C7A82] italic">
              * Anggota yang merupakan member tetap akan memperoleh koin loyalitas individual.
            </span>
          </div>
        </div>

        {/* URUTAN 3: Pilihan Layanan & Upload Foto Terpisah Per Orang */}
        <div className="luxury-card p-5 sm:p-6 space-y-5">
          <div className="border-b border-[#F8BBD0]/40 pb-3">
            <h3 className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2">
              <Sparkles size={18} className="text-[#D4AF37]" />
              <span>Urutan 3: Pilihan Layanan & Unggah Desain Terpisah Per Orang</span>
            </h3>
            <p className="text-xs text-[#8C7A82] mt-0.5">
              Pilih tab nama anggota di bawah ini untuk memilihkan perlakuan dan warna masing-masing:
            </p>
          </div>

          {/* Member Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {groupMembers.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMemberIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeMemberIndex === idx
                    ? 'gold-button shadow-sm'
                    : 'bg-white border border-[#F8BBD0] text-[#4A3B40] hover:bg-[#FFF8E7]'
                }`}
              >
                <span>{m.fullName || `Anggota ${idx + 1}`}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/40 text-[10px]">
                  {m.services.length}
                </span>
              </button>
            ))}
          </div>

          {/* Active Member Service Customizer */}
          <div className="p-4 rounded-xl bg-[#FFF8E7]/30 border border-[#D4AF37]/30 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#4A3B40]">
                Mengatur Layanan untuk: <strong className="text-[#B8860B]">{activeMember?.fullName || `Anggota ${activeMemberIndex + 1}`}</strong>
              </span>
              <span className="font-mono text-[#B8860B] font-bold">
                Subtotal: Rp {(activeMember?.subtotalServices || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Catalog mapped to active member */}
            <TransparentCatalog
              categories={categories}
              availableColors={availableColors}
              availableCodes={availableCodes}
              availableTypes={availableTypes}
              selectedServices={activeMember?.services || []}
              onToggleService={handleToggleServiceForActiveMember}
              onUpdateService={handleUpdateServiceForActiveMember}
              onRemoveService={handleRemoveServiceForActiveMember}
            />
          </div>
        </div>

        {/* URUTAN 4: Opsi Home Service (Hierarki Wilayah) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
            Urutan 4: Pengaturan Lokasi Salon / Home Service Rombongan
          </div>
          <HomeServicePicker
            value={location}
            onChange={setLocation}
            allowCoinDiscount={false}
          />
        </div>

        {/* Notes */}
        <div className="luxury-card p-5 space-y-2">
          <label className="block text-xs font-semibold text-[#4A3B40]">
            Catatan Tambahan Rombongan (Opsional):
          </label>
          <textarea
            rows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Keterangan acara khusus, dress code, atau perlakuan khusus..."
            className="w-full p-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          />
        </div>

        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Final Price Summary */}
        <div className="luxury-card p-6 bg-gradient-to-br from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/40 border-[#D4AF37] space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#4A3B40] border-b border-[#D4AF37]/30 pb-2">
            Ringkasan Total Reservasi Rombongan ({groupMembers.length} Orang)
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-[#4A3B40]">
            {groupMembers.map((m, idx) => (
              <div key={m.id} className="flex justify-between text-xs text-[#8C7A82]">
                <span>Anggota {idx + 1} ({m.fullName || 'Belum diisi'} - {m.services.length} Layanan):</span>
                <span className="font-mono">Rp {m.subtotalServices.toLocaleString('id-ID')}</span>
              </div>
            ))}

            <div className="flex justify-between font-semibold pt-1 border-t border-[#F8BBD0]/30">
              <span>Subtotal Seluruh Layanan:</span>
              <span className="font-mono">Rp {totalGroupServicesSubtotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between">
              <span>
                Ongkos Transportasi ({location.isHomeService ? `Home Service • ${location.calculatedDistanceKm} km` : 'Salon Visit'}):
              </span>
              <span className="font-mono font-bold">
                {deliveryFee > 0 ? `Rp ${deliveryFee.toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#D4AF37]/30 text-base sm:text-lg font-bold text-[#4A3B40]">
              <span>Total Estimasi Rombongan:</span>
              <span className="font-mono text-[#B8860B]">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl gold-button text-sm sm:text-base font-bold shadow-lg hover:shadow-xl hover:scale-101 transition flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span>Kirim Reservasi Rombongan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
