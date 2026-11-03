import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Send, 
  AlertCircle 
} from 'lucide-react';
import { 
  Category, 
  ColorItem, 
  CodeItem, 
  TypeItem, 
  SelectedServiceItem, 
  LocationDetail, 
  Reservation,
  OperationalScheduleSettings,
  StoreSettings,
  AccessoryItem,
  ExtensionConfig
} from '../types/salon';
import { TransparentCatalog } from './TransparentCatalog';
import { HomeServicePicker } from './HomeServicePicker';
import { getStoreScheduleForDate, checkTimeSlotAvailability } from '../utils/scheduleUtils';
import { TreatmentTimePicker } from './TreatmentTimePicker';

interface RegularBookingProps {
  categories: Category[];
  availableColors: ColorItem[];
  availableCodes: CodeItem[];
  availableTypes: TypeItem[];
  availableAccessories?: AccessoryItem[];
  availableExtensions?: ExtensionConfig[];
  operationalSchedule?: OperationalScheduleSettings;
  reservations: Reservation[];
  settings?: StoreSettings;
  onSubmitReservation: (reservation: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'randomCuteQuote'>) => void;
  onBack: () => void;
}

export const RegularBooking: React.FC<RegularBookingProps> = ({
  categories,
  availableColors,
  availableCodes,
  availableTypes,
  availableAccessories = [],
  availableExtensions = [],
  operationalSchedule,
  reservations,
  settings,
  onSubmitReservation,
  onBack
}) => {
  // Customer inputs
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentTime, setAppointmentTime] = useState('11:00');
  const [customerNotes, setCustomerNotes] = useState('');

  // Services
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);

  // Home Service Location state
  const [location, setLocation] = useState<LocationDetail>({
    isHomeService: false,
    province: 'DKI Jakarta',
    regency: 'Jakarta Barat',
    district: 'Cengkareng',
    village: 'Cengkareng Timur',
    streetAddress: `${settings?.storeAddress || 'Mall Taman Palem Lt G Blok A 30B, Cengkareng Timur, Jakarta Barat'} (Kunjungan Salon)`,
    calculatedDistanceKm: 0,
    baseDeliveryFee: 0,
    additional5KmFee: 0,
    coinDiscountAmount: 0,
    totalDeliveryFee: 0
  });

  const [validationError, setValidationError] = useState('');

  // Handle service toggle
  const handleToggleService = (item: SelectedServiceItem) => {
    setSelectedServices(prev => [...prev, item]);
  };

  const handleUpdateService = (serviceId: string, partial: Partial<SelectedServiceItem>) => {
    setSelectedServices(prev => prev.map(s => s.serviceId === serviceId ? { ...s, ...partial } : s));
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId));
  };

  // Calculations
  const servicesSubtotal = selectedServices.reduce((acc, curr) => acc + curr.finalPrice, 0);
  const deliveryFee = location.isHomeService ? location.totalDeliveryFee : 0;
  const totalPrice = servicesSubtotal + deliveryFee;

  // Resolve operational hours for chosen date
  const scheduleResolution = React.useMemo(() => {
    if (!appointmentDate) return null;
    return getStoreScheduleForDate(appointmentDate, operationalSchedule);
  }, [appointmentDate, operationalSchedule]);

  // Auto-select valid slot when date changes
  React.useEffect(() => {
    if (scheduleResolution?.isOpen && scheduleResolution.slots.length > 0) {
      if (!scheduleResolution.slots.includes(appointmentTime)) {
        setAppointmentTime(scheduleResolution.slots[0]);
      }
    }
  }, [scheduleResolution]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError('Nama Lengkap wajib diisi!');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 9) {
      setValidationError('Nomor WhatsApp valid wajib diisi!');
      return;
    }
    if (!appointmentDate) {
      setValidationError('Silakan pilih tanggal jadwal kunjungan / treatment!');
      return;
    }
    
    // Check slot availability and 30-min buffer rule
    const slotCheck = checkTimeSlotAvailability(appointmentDate, appointmentTime, reservations, operationalSchedule);
    if (!slotCheck.isValid) {
      setValidationError(slotCheck.reason || 'Jam treatment yang dipilih tidak tersedia atau slot penuh.');
      return;
    }

    if (selectedServices.length === 0) {
      setValidationError('Silakan pilih minimal 1 layanan treatment pada katalog!');
      return;
    }

    // Check mandatory reference photo uploads
    for (const s of selectedServices) {
      // Find category and subCategory definition
      const cat = categories.find(c => c.id === s.categoryId);
      const sub = cat?.subCategories.find(sc => sc.id === s.subCategoryId);
      if (sub?.requireDesignUpload && !s.referencePhotoUrl) {
        setValidationError(`Layanan "${s.subSubCategoryName || s.subCategoryName}" mewajibkan unggah foto referensi desain/tangan.`);
        return;
      }
    }

    // If Home Service, check street address
    if (location.isHomeService && !location.streetAddress.trim()) {
      setValidationError('Untuk layanan Home Service, silakan isi detail nama jalan dan nomor rumah!');
      return;
    }

    // Submit reservation payload
    onSubmitReservation({
      type: 'REGULER',
      fullName,
      whatsapp,
      email: email.trim() || undefined,
      appointmentDate,
      appointmentTime,
      services: selectedServices,
      location,
      servicesSubtotal,
      deliveryFee,
      voucherDiscount: 0,
      coinDiscount: 0,
      customAdjustment: 0,
      totalPrice,
      paymentStatus: 'BELUM_BAYAR',
      status: 'PENDING',
      ownerNotes: customerNotes ? `Catatan Customer: ${customerNotes}` : undefined
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* Back button aligned strictly to the left */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] transition inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#FFD1DC]/30 border border-transparent hover:border-[#F8BBD0]"
        >
          ← Kembali ke Pemilihan Tipe Customer
        </button>
      </div>

      {/* Top Header */}
      <div className="border-b border-[#F8BBD0] pb-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40]">
          Formulir Reservasi Customer Reguler
        </h2>
        <p className="text-xs sm:text-sm text-[#8C7A82] mt-0.5">
          Isi data diri Anda dan tentukan layanan perawatan favorit Anda secara transparan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Customer Identitas Wajib & Opsional */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2.5">
            <User size={18} className="text-[#D4AF37]" />
            <span>1. Data Diri Pemesan & Tanggal Treatment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Nama Lengkap: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Gisella Anastasia"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <User size={15} className="absolute left-3 top-3 text-[#8C7A82]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Nomor WhatsApp: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <Phone size={15} className="absolute left-3 top-3 text-[#8C7A82]" />
              </div>
              <span className="text-[10px] text-[#8C7A82] mt-1 block">
                Digunakan untuk konfirmasi jadwal dan cek status reservasi.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Alamat Email (Opsional):
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: customer@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <Mail size={15} className="absolute left-3 top-3 text-[#8C7A82]" />
              </div>
            </div>

            {/* Tanggal Treatment */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Tanggal Treatment: <span className="text-red-500">*</span>
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

        {/* Section 2: Transparent Catalog */}
        <TransparentCatalog
          categories={categories}
          availableColors={availableColors}
          availableCodes={availableCodes}
          availableTypes={availableTypes}
          availableAccessories={availableAccessories}
          availableExtensions={availableExtensions}
          selectedServices={selectedServices}
          onToggleService={handleToggleService}
          onUpdateService={handleUpdateService}
          onRemoveService={handleRemoveService}
        />

        {/* Section 3: Home Service Location & Distance Calculation */}
        <HomeServicePicker
          value={location}
          onChange={setLocation}
          allowCoinDiscount={false}
          settings={settings}
        />

        {/* Section 4: Customer Notes */}
        <div className="luxury-card p-5 space-y-2">
          <label className="block text-xs font-semibold text-[#4A3B40]">
            Catatan Tambahan untuk Terapis / Owner (Opsional):
          </label>
          <textarea
            rows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Contoh: Kuku agak tipis, tolong hati-hati saat pengikiran, atau patokan rumah gerbang biru..."
            className="w-full p-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          />
        </div>

        {/* Error Notification */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Final Price Summary & Submit Button */}
        <div className="luxury-card p-6 bg-gradient-to-br from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/40 border-[#D4AF37] space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#4A3B40] border-b border-[#D4AF37]/30 pb-2">
            Ringkasan Transparan Estimasi Biaya
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-[#4A3B40]">
            <div className="flex justify-between">
              <span>Subtotal Layanan ({selectedServices.length} Treatment):</span>
              <span className="font-mono font-bold">Rp {servicesSubtotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="flex justify-between">
              <span>
                Ongkos Transportasi ({location.isHomeService ? `Home Service • ${location.calculatedDistanceKm} km` : 'Salon Visit'}):
              </span>
              <span className="font-mono font-bold">
                {deliveryFee > 0 ? `Rp ${deliveryFee.toLocaleString('id-ID')}` : 'Rp 0 (Gratis)'}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#D4AF37]/30 text-base sm:text-lg font-bold text-[#4A3B40]">
              <span>Total Estimasi Pembayaran:</span>
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
              <span>Kirim Reservasi Sekarang</span>
            </button>
            <p className="text-[11px] text-[#8C7A82] text-center mt-2">
              Setelah dikirim, Anda dapat memantau status persetujuan reservasi kapan pun menggunakan Nomor WhatsApp Anda.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
