import React, { useState } from 'react';
import { 
  Crown, 
  Phone, 
  Lock, 
  UserPlus, 
  LogIn, 
  KeyRound, 
  Coins, 
  Ticket, 
  Check, 
  Sparkles, 
  Star, 
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
  MemberAccount, 
  Voucher,
  OperationalScheduleSettings,
  StoreSettings
} from '../types/salon';
import { salonStore } from '../services/store';
import { TransparentCatalog } from './TransparentCatalog';
import { HomeServicePicker } from './HomeServicePicker';
import { OtpModal } from './OtpModal';
import { getStoreScheduleForDate, checkTimeSlotAvailability } from '../utils/scheduleUtils';
import { TreatmentTimePicker } from './TreatmentTimePicker';

interface MemberBookingProps {
  categories: Category[];
  availableColors: ColorItem[];
  availableCodes: CodeItem[];
  availableTypes: TypeItem[];
  vouchers: Voucher[];
  operationalSchedule?: OperationalScheduleSettings;
  reservations: Reservation[];
  settings?: StoreSettings;
  onSubmitReservation: (reservation: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'randomCuteQuote'>) => void;
  onBack: () => void;
}

export const MemberBooking: React.FC<MemberBookingProps> = ({
  categories,
  availableColors,
  availableCodes,
  availableTypes,
  vouchers,
  operationalSchedule,
  reservations,
  settings,
  onSubmitReservation,
  onBack
}) => {
  // Auth view states: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'DASHBOARD'
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'DASHBOARD'>('LOGIN');

  // Input states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password inputs
  const [forgotPhone, setForgotPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  // Active logged-in member
  const [currentMember, setCurrentMember] = useState<MemberAccount | null>(null);

  // Reservation details
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentTime, setAppointmentTime] = useState('13:00');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>([]);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);

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

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [validationError, setValidationError] = useState('');

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const res = salonStore.loginMember(loginPhone, loginPassword);
    if (res.success && res.member) {
      setCurrentMember(res.member);
      setAuthView('DASHBOARD');
    } else {
      setAuthError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regFullName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setAuthError('Semua kolom pendaftaran wajib diisi!');
      return;
    }

    const res = salonStore.registerMember(regFullName, regPhone, regPassword);
    if (res.success && res.member) {
      setCurrentMember(res.member);
      setAuthSuccess(res.message);
      setAuthView('DASHBOARD');
    } else {
      setAuthError(res.message);
    }
  };

  const handleStartForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!forgotPhone.trim() || !newPassword.trim()) {
      setAuthError('Masukkan nomor WA dan kata sandi baru Anda.');
      return;
    }
    // Check if phone exists
    const members = salonStore.getMembers();
    const found = members.find(m => m.whatsapp.replace(/\D/g, '') === forgotPhone.replace(/\D/g, ''));
    if (!found) {
      setAuthError('Nomor WhatsApp belum terdaftar sebagai Member!');
      return;
    }
    setIsOtpOpen(true);
  };

  const handleVerifyResetOtp = (otp: string) => {
    if (otp.length === 6) {
      const ok = salonStore.resetMemberPassword(forgotPhone, newPassword);
      if (ok) {
        setAuthSuccess('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.');
        setAuthView('LOGIN');
        setLoginPhone(forgotPhone);
        setLoginPassword('');
        return true;
      }
    }
    return false;
  };

  const handleClaimVoucher = (voucherId: string) => {
    if (!currentMember) return;
    const res = salonStore.claimVoucher(currentMember.id, voucherId);
    if (res.success) {
      const refreshed = salonStore.getMembers().find(m => m.id === currentMember.id);
      if (refreshed) setCurrentMember({ ...refreshed });
      setAuthSuccess(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  // Service toggle & update
  const handleToggleService = (item: SelectedServiceItem) => {
    setSelectedServices(prev => [...prev, item]);
  };

  const handleUpdateService = (serviceId: string, partial: Partial<SelectedServiceItem>) => {
    setSelectedServices(prev => prev.map(s => s.serviceId === serviceId ? { ...s, ...partial } : s));
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.serviceId !== serviceId));
  };

  // Financial calculations
  const servicesSubtotal = selectedServices.reduce((acc, curr) => acc + curr.finalPrice, 0);
  
  // Calculate voucher discount
  let voucherDiscount = 0;
  if (appliedVoucherId) {
    const v = vouchers.find(vc => vc.id === appliedVoucherId);
    if (v) {
      if (v.discountType === 'PERCENT') {
        voucherDiscount = Math.round((servicesSubtotal * v.discountValue) / 100);
      } else {
        voucherDiscount = v.discountValue;
      }
      if (voucherDiscount > servicesSubtotal) voucherDiscount = servicesSubtotal;
    }
  }

  const deliveryFee = location.isHomeService ? location.totalDeliveryFee : 0;
  const coinDiscount = location.isHomeService ? location.coinDiscountAmount : 0;
  const totalPrice = Math.max(0, servicesSubtotal - voucherDiscount + deliveryFee);

  // Operational schedule resolution for member booking
  const scheduleResolution = React.useMemo(() => {
    if (!appointmentDate) return null;
    return getStoreScheduleForDate(appointmentDate, operationalSchedule);
  }, [appointmentDate, operationalSchedule]);

  React.useEffect(() => {
    if (scheduleResolution?.isOpen && scheduleResolution.slots.length > 0) {
      if (!scheduleResolution.slots.includes(appointmentTime)) {
        setAppointmentTime(scheduleResolution.slots[0]);
      }
    }
  }, [scheduleResolution]);

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!currentMember) {
      setValidationError('Silakan login member terlebih dahulu!');
      return;
    }
    if (!appointmentDate) {
      setValidationError('Silakan tentukan tanggal treatment!');
      return;
    }
    
    // Check slot availability and 30-min buffer rule
    const timeStatus = checkTimeSlotAvailability(appointmentDate, appointmentTime, reservations, operationalSchedule);
    if (!timeStatus.isValid) {
      setValidationError(timeStatus.reason || 'Jam treatment yang dipilih tidak tersedia (mungkin penuh atau bertepatan dengan jam istirahat).');
      return;
    }

    if (selectedServices.length === 0) {
      setValidationError('Silakan pilih minimal 1 layanan treatment pada katalog!');
      return;
    }

    // Check mandatory reference photo uploads
    for (const s of selectedServices) {
      const cat = categories.find(c => c.id === s.categoryId);
      const sub = cat?.subCategories.find(sc => sc.id === s.subCategoryId);
      if (sub?.requireDesignUpload && !s.referencePhotoUrl) {
        setValidationError(`Layanan "${s.subSubCategoryName || s.subCategoryName}" mewajibkan unggah foto referensi desain/tangan.`);
        return;
      }
    }

    // Submit reservation
    onSubmitReservation({
      type: 'MEMBER',
      fullName: currentMember.fullName,
      whatsapp: currentMember.whatsapp,
      appointmentDate,
      appointmentTime,
      services: selectedServices,
      location,
      servicesSubtotal,
      deliveryFee,
      voucherDiscount,
      coinDiscount,
      customAdjustment: 0,
      totalPrice,
      paymentStatus: 'BELUM_BAYAR',
      status: 'PENDING',
      ownerNotes: customerNotes ? `Catatan Member: ${customerNotes}` : undefined
    });
  };

  // --- VIEW: LOGIN / REGISTER / FORGOT PASSWORD ---
  if (authView !== 'DASHBOARD' || !currentMember) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 sm:py-10 animate-fadeIn space-y-4">
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

        <div className="luxury-card p-6 sm:p-8 space-y-5 border-[#D4AF37]/50 shadow-md">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#FFD1DC] to-[#D4AF37]/40 flex items-center justify-center text-[#B8860B] shadow-xs">
              <Crown size={28} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
              {authView === 'LOGIN' && 'Masuk Akun Member'}
              {authView === 'REGISTER' && 'Pendaftaran Member Baru'}
              {authView === 'FORGOT_PASSWORD' && 'Atur Ulang Kata Sandi'}
            </h2>
            <p className="text-xs text-[#8C7A82]">
              {authView === 'LOGIN' && 'Masukkan nomor WhatsApp dan kata sandi Anda'}
              {authView === 'REGISTER' && 'Dapatkan langsung Welcome Bonus 50 Koin!'}
              {authView === 'FORGOT_PASSWORD' && 'Verifikasi OTP melalui nomor WhatsApp Anda'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check size={15} className="shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {authView === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Nomor WhatsApp Member:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="Contoh: 081288990011"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                  <Phone size={15} className="absolute left-3 top-3 text-[#8C7A82]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#4A3B40]">
                    Kata Sandi:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('FORGOT_PASSWORD');
                      setAuthError('');
                    }}
                    className="text-[11px] text-[#B8860B] hover:underline font-medium"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-[#8C7A82]" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Masuk Sekarang</span>
              </button>

              <div className="text-center pt-2 border-t border-[#F8BBD0]/40">
                <p className="text-xs text-[#8C7A82]">
                  Belum punya akun member?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('REGISTER');
                      setAuthError('');
                    }}
                    className="text-[#B8860B] font-bold hover:underline"
                  >
                    Daftar Baru Di Sini
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Form: REGISTER */}
          {authView === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Nama Lengkap: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Clara Simanjuntak"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Nomor WhatsApp: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Contoh: 081288990011"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Buat Kata Sandi: <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>Daftar & Klaim 50 Koin</span>
              </button>

              <div className="text-center pt-2 border-t border-[#F8BBD0]/40">
                <p className="text-xs text-[#8C7A82]">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('LOGIN');
                      setAuthError('');
                    }}
                    className="text-[#B8860B] font-bold hover:underline"
                  >
                    Masuk Ke Akun
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {authView === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleStartForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Nomor WhatsApp Terdaftar:
                </label>
                <input
                  type="tel"
                  required
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="081288990011"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Masukkan Kata Sandi Baru:
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kata sandi baru Anda"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <KeyRound size={16} />
                <span>Kirim Kode OTP Verifikasi</span>
              </button>

              <div className="text-center pt-2 border-t border-[#F8BBD0]/40">
                <button
                  type="button"
                  onClick={() => setAuthView('LOGIN')}
                  className="text-xs text-[#8C7A82] hover:text-[#4A3B40] font-medium"
                >
                  ← Kembali ke Layar Masuk
                </button>
              </div>
            </form>
          )}
        </div>

        {/* OTP Modal for Forgot Password */}
        <OtpModal
          isOpen={isOtpOpen}
          onClose={() => setIsOtpOpen(false)}
          onVerify={handleVerifyResetOtp}
          targetType="WHATSAPP"
          targetDestination={forgotPhone}
          purpose="Atur Ulang Kata Sandi Member"
        />
      </div>
    );
  }

  // --- VIEW: MEMBER DASHBOARD & RESERVATION BOOKING ---
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Header & Member Card */}
      <div className="space-y-3 border-b border-[#F8BBD0] pb-4">
        {/* Back button aligned strictly to the left */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] transition inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#FFD1DC]/30 border border-transparent hover:border-[#F8BBD0]"
          >
            ← Kembali ke Menu Utama
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40]">
                Portal Reservasi Member
              </h2>
              {currentMember.hasRatedGoogleMaps && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  <Star size={12} fill="#D4AF37" className="text-[#D4AF37]" /> Verified Reviewer
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#8C7A82] mt-0.5">
              Selamat datang, <strong className="text-[#4A3B40]">{currentMember.fullName}</strong> ({currentMember.whatsapp})
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentMember(null);
              setAuthView('LOGIN');
            }}
            className="text-xs px-3.5 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 text-[#8C7A82] self-start sm:self-center transition"
          >
            Keluar Akun
          </button>
        </div>
      </div>

      {/* Member Balance & Loyalty Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Coins Card */}
        <div className="luxury-card p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/40 border-[#D4AF37]/50 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
              Saldo Koin Saya
            </span>
            <div className="text-3xl font-serif font-bold text-[#4A3B40] flex items-center gap-2">
              <span>{currentMember.coins}</span>
              <span className="text-xs font-sans font-normal text-[#8C7A82]">Koin</span>
            </div>
            <p className="text-[11px] text-[#8C7A82]">
              Tiap selesai treatment bertambah koin loyalty!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-white flex items-center justify-center shadow-md">
            <Coins size={24} />
          </div>
        </div>

        {/* Total Treatments */}
        <div className="luxury-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A82]">
              Total Treatment Selesai
            </span>
            <div className="text-3xl font-serif font-bold text-[#4A3B40]">
              {currentMember.totalCompletedTreatments || 0}x
            </div>
            <p className="text-[11px] text-[#8C7A82]">
              Bergabung sejak {currentMember.joinDate}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFD1DC] text-[#4A3B40] flex items-center justify-center shadow-xs">
            <Sparkles size={24} className="text-[#B8860B]" />
          </div>
        </div>

        {/* Voucher Status */}
        <div className="luxury-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A82]">
              Voucher Dimiliki
            </span>
            <div className="text-3xl font-serif font-bold text-[#4A3B40]">
              {currentMember.claimedVoucherIds?.length || 0}
            </div>
            <p className="text-[11px] text-[#8C7A82]">
              Siap digunakan pada reservasi hari ini
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] border border-[#D4AF37]/30 text-[#B8860B] flex items-center justify-center shadow-xs">
            <Ticket size={24} />
          </div>
        </div>
      </div>

      {/* Voucher Exchange Center (Provided by Owner) */}
      <div className="luxury-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2">
              <Ticket size={18} className="text-[#D4AF37]" />
              <span>Tukar Koin dengan Voucher Eksklusif</span>
            </h3>
            <p className="text-xs text-[#8C7A82]">
              Pilih voucher diskon yang sudah disediakan oleh Owner Lyra&apos;s Nail-Lash.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFF8E7] text-[#B8860B] font-bold border border-[#D4AF37]/30">
            Koin Anda: {currentMember.coins}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {vouchers.filter(v => v.isActive).map((voucher) => {
            const alreadyClaimed = currentMember.claimedVoucherIds?.includes(voucher.id);
            const canAfford = currentMember.coins >= voucher.coinsRequired;

            return (
              <div 
                key={voucher.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                  alreadyClaimed
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-[#F8BBD0]/50 bg-white hover:border-[#D4AF37]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                      {voucher.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40] shrink-0">
                      {voucher.coinsRequired} Koin
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A82] mt-1 leading-relaxed">
                    {voucher.description}
                  </p>
                  <span className="block text-[10px] text-[#8C7A82] mt-2">
                    Berlaku s/d: {voucher.validUntil} • Diklaim: {voucher.totalClaimedCount}x
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F8BBD0]/30 flex items-center justify-between">
                  {alreadyClaimed ? (
                    <button
                      type="button"
                      onClick={() => setAppliedVoucherId(appliedVoucherId === voucher.id ? null : voucher.id)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        appliedVoucherId === voucher.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      <Check size={13} />
                      <span>{appliedVoucherId === voucher.id ? 'Voucher Terpasang' : 'Gunakan Voucher Ini'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleClaimVoucher(voucher.id)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        canAfford
                          ? 'gold-button shadow-xs'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Coins size={13} />
                      <span>{canAfford ? 'Tukar Sekarang' : 'Koin Belum Cukup'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservation Form */}
      <form onSubmit={handleSubmitReservation} className="space-y-8">
        {/* Date & Time Picker */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#4A3B40] border-b border-[#F8BBD0]/40 pb-2">
            Pilih Tanggal & Waktu Kunjungan
          </h3>

          <div className="space-y-3">
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

        {/* Transparent Catalog */}
        <TransparentCatalog
          categories={categories}
          availableColors={availableColors}
          availableCodes={availableCodes}
          availableTypes={availableTypes}
          selectedServices={selectedServices}
          onToggleService={handleToggleService}
          onUpdateService={handleUpdateService}
          onRemoveService={handleRemoveService}
        />

        {/* Home Service with Member Coin Discount (every 200 coins = -Rp 50) */}
        <HomeServicePicker
          value={location}
          onChange={setLocation}
          memberCoins={currentMember.coins}
          allowCoinDiscount={true}
          settings={settings}
        />

        {/* Customer Notes */}
        <div className="luxury-card p-5 space-y-2">
          <label className="block text-xs font-semibold text-[#4A3B40]">
            Catatan Tambahan untuk Terapis / Owner (Opsional):
          </label>
          <textarea
            rows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Kebutuhan khusus atau instruksi arah lokasi..."
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
            Rincian Pembayaran Eksklusif Member
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-[#4A3B40]">
            <div className="flex justify-between">
              <span>Subtotal Treatment ({selectedServices.length} Layanan):</span>
              <span className="font-mono font-bold">Rp {servicesSubtotal.toLocaleString('id-ID')}</span>
            </div>

            {voucherDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Potongan Voucher Member:</span>
                <span className="font-mono font-bold">-Rp {voucherDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>
                Ongkos Transportasi ({location.isHomeService ? `Home Service • ${location.calculatedDistanceKm} km` : 'Salon Visit'}):
              </span>
              <span className="font-mono font-bold">
                {deliveryFee > 0 ? `Rp ${deliveryFee.toLocaleString('id-ID')}` : 'Rp 0'}
              </span>
            </div>

            {coinDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Potongan Diskon Koin Home Service:</span>
                <span className="font-mono font-bold">-Rp {coinDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-[#D4AF37]/30 text-base sm:text-lg font-bold text-[#4A3B40]">
              <span>Total Estimasi Bayar:</span>
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
              <span>Kirim Reservasi Member</span>
            </button>
            <p className="text-[11px] text-[#8C7A82] text-center mt-2">
              Setelah perawatan selesai, Anda akan menerima bonus koin loyalty {salonStore.getSettings().coinRewardPercentage || 2}% dari total perawatan ke akun Member ini!
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
