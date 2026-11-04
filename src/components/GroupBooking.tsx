import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  User,
  Crown,
  Calendar, 
  Clock, 
  UserPlus, 
  Trash2, 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Plus,
  Copy,
  Share2,
  Check,
  Edit3,
  Heart,
  Coins,
  ShieldAlert,
  ArrowRight,
  Phone,
  Home,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Gem,
  Ruler
} from 'lucide-react';
import { 
  Category, 
  ColorItem, 
  CodeItem, 
  TypeItem, 
  AccessoryItem,
  ExtensionConfig,
  SelectedServiceItem, 
  LocationDetail, 
  Reservation, 
  GroupCustomerItem,
  GroupMemberSession,
  GroupRoom,
  OperationalScheduleSettings,
  StoreSettings
} from '../types/salon';
import { TransparentCatalog } from './TransparentCatalog';
import { HomeServicePicker } from './HomeServicePicker';
import { TreatmentTimePicker } from './TreatmentTimePicker';
import { checkTimeSlotAvailability } from '../utils/scheduleUtils';
import { canSubmitGroupBooking, calculateMemberCoins } from '../utils/salonRules';
import { salonStore } from '../services/store';

interface GroupBookingProps {
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

type GroupFlowMode = 'SELECT_MODE' | 'LEADER_CREATE' | 'LEADER_ROOM' | 'MEMBER_JOIN' | 'MEMBER_ROOM' | 'SINGLE_DEVICE';

export const GroupBooking: React.FC<GroupBookingProps> = ({
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
  const [flowMode, setFlowMode] = useState<GroupFlowMode>('SELECT_MODE');
  const [validationError, setValidationError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Group Room (for multi-browser session)
  const [activeRoom, setActiveRoom] = useState<GroupRoom | null>(null);
  const [currentMemberSession, setCurrentMemberSession] = useState<GroupMemberSession | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Leader Create Inputs
  const [groupNameInput, setGroupNameInput] = useState('Bestie Nail & Lash Party 🌸');
  const [leaderNameInput, setLeaderNameInput] = useState('');
  const [leaderPhoneInput, setLeaderPhoneInput] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [appointmentTime, setAppointmentTime] = useState('14:00');
  const [isLeaderMember, setIsLeaderMember] = useState(false);

  // Home Service Location (set by Leader)
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

  // Member Join Inputs
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinNameInput, setJoinNameInput] = useState('');
  const [joinPhoneInput, setJoinPhoneInput] = useState('');
  const [isJoinMember, setIsJoinMember] = useState(false);

  // Single Device Fallback Mode State
  const [singleGroupLeadName, setSingleGroupLeadName] = useState('');
  const [singleGroupLeadPhone, setSingleGroupLeadPhone] = useState('');
  const [singleMembers, setSingleMembers] = useState<GroupCustomerItem[]>([
    { id: 'gm-1', fullName: '', whatsapp: '', services: [], subtotalServices: 0 },
    { id: 'gm-2', fullName: '', whatsapp: '', services: [], subtotalServices: 0 },
    { id: 'gm-3', fullName: '', whatsapp: '', services: [], subtotalServices: 0 }
  ]);
  const [singleActiveIndex, setSingleActiveIndex] = useState(0);

  // Coin Reward Percentage
  const rewardPercentage = settings?.coinRewardPercentage ?? 1;

  // --- Real-time Room Sync ---
  const fetchRoom = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/groups/${code.toUpperCase()}`);
      if (res.ok) {
        const data: GroupRoom = await res.json();
        setActiveRoom(data);
        // Also sync local current member session if present
        if (currentMemberSession) {
          const updatedSelf = data.members.find(m => m.id === currentMemberSession.id);
          if (updatedSelf) {
            setCurrentMemberSession(updatedSelf);
          }
        }
      }
    } catch {
      // Offline fallback / store cache
    }
  }, [currentMemberSession]);

  // Subscribe to SSE updates from server
  useEffect(() => {
    if (!activeRoom?.roomCode) return;

    const interval = setInterval(() => {
      fetchRoom(activeRoom.roomCode);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeRoom?.roomCode, fetchRoom]);

  // Handle Leader Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!groupNameInput.trim()) {
      setValidationError('Nama Kelompok wajib diisi!');
      return;
    }
    if (!leaderNameInput.trim()) {
      setValidationError('Nama Ketua Kelompok wajib diisi!');
      return;
    }
    if (!leaderPhoneInput.trim()) {
      setValidationError('Nomor WhatsApp Ketua wajib diisi!');
      return;
    }

    // Check slot
    const slotCheck = checkTimeSlotAvailability(appointmentDate, appointmentTime, reservations, operationalSchedule);
    if (!slotCheck.isValid) {
      setValidationError(slotCheck.reason || 'Jam kunjungan yang dipilih tidak tersedia.');
      return;
    }

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: groupNameInput.trim(),
          leaderName: leaderNameInput.trim(),
          leaderWhatsapp: leaderPhoneInput.trim(),
          appointmentDate,
          appointmentTime,
          location,
          isRegisteredMember: isLeaderMember
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal membuat ruang kelompok');
      }

      const room: GroupRoom = await res.json();
      setActiveRoom(room);
      const self = room.members.find(m => m.id === room.leaderId) || room.members[0];
      setCurrentMemberSession(self);
      setFlowMode('LEADER_ROOM');
    } catch (err: any) {
      setValidationError(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Handle Member Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setValidationError('Masukkan Kode Kelompok (contoh: LYRA-XXXX)');
      return;
    }
    if (!joinNameInput.trim() || !joinPhoneInput.trim()) {
      setValidationError('Nama dan Nomor WhatsApp wajib diisi');
      return;
    }

    try {
      const res = await fetch(`/api/groups/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: joinNameInput.trim(),
          whatsapp: joinPhoneInput.trim(),
          isRegisteredMember: isJoinMember
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Kelompok tidak ditemukan atau kode salah');
      }

      const { room, member } = await res.json();
      setActiveRoom(room);
      setCurrentMemberSession(member);
      setFlowMode('MEMBER_ROOM');
    } catch (err: any) {
      setValidationError(err.message || 'Gagal bergabung ke kelompok.');
    }
  };

  // Update Member's own services or editing status
  const handleUpdateSelfSession = async (
    newServices: SelectedServiceItem[], 
    isEditing: boolean
  ) => {
    if (!activeRoom || !currentMemberSession) return;

    const subtotal = newServices.reduce((sum, s) => sum + s.finalPrice, 0);

    // Optimistic UI update
    const updatedSelf: GroupMemberSession = {
      ...currentMemberSession,
      services: newServices,
      subtotalServices: subtotal,
      isEditing,
      lastUpdated: Date.now()
    };
    setCurrentMemberSession(updatedSelf);

    try {
      const res = await fetch(`/api/groups/${activeRoom.roomCode}/member/${currentMemberSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: newServices,
          isEditing
        })
      });
      if (res.ok) {
        const updatedRoom = await res.json();
        setActiveRoom(updatedRoom);
      }
    } catch {
      // offline fallback
    }
  };

  // Leader Submit Group Reservation
  const handleLeaderSubmit = async () => {
    if (!activeRoom) return;
    setValidationError('');

    const check = canSubmitGroupBooking(activeRoom.members);
    if (!check.canSubmit) {
      setValidationError(check.reason || 'Pemesanan belum dapat dikirim.');
      return;
    }

    try {
      const res = await fetch(`/api/groups/${activeRoom.roomCode}/submit`, {
        method: 'POST'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengirim reservasi kelompok');
      }

      const { reservation } = await res.json();
      onSubmitReservation(reservation);
    } catch (err: any) {
      setValidationError(err.message || 'Gagal menyelesaikan reservasi.');
    }
  };

  // Copy Room Code or Share WhatsApp
  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!activeRoom) return;
    const text = encodeURIComponent(
      `Hai bestie! 🌸 Ayo gabung ke kelompok "${activeRoom.groupName}" untuk reservasi treatment di Lyra's Nail-Lash! 💅✨\n\nMasukkan Kode Kelompok: *${activeRoom.roomCode}*\n\nJadwal: ${activeRoom.appointmentDate} • ${activeRoom.appointmentTime} WIB\nYuk pilih layanan kuku & lash kamu di HP masing-masing ya! 💖`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Computations for Active Room
  const isLeader = activeRoom && currentMemberSession?.id === activeRoom.leaderId;
  const editingMembersCount = activeRoom ? activeRoom.members.filter(m => m.isEditing).length : 0;
  const readyMembersCount = activeRoom ? activeRoom.members.filter(m => !m.isEditing && m.services.length > 0).length : 0;
  const roomServicesTotal = activeRoom ? activeRoom.members.reduce((sum, m) => sum + m.subtotalServices, 0) : 0;
  const roomDeliveryFee = activeRoom?.location.isHomeService ? activeRoom.location.totalDeliveryFee : 0;
  const roomGrandTotal = roomServicesTotal + roomDeliveryFee;

  // Check if leader can submit
  const leaderCanSubmit = activeRoom ? canSubmitGroupBooking(activeRoom.members).canSubmit : false;

  // ==========================================
  // RENDER: SELECT MODE (MAIN CHOICE)
  // ==========================================
  if (flowMode === 'SELECT_MODE') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
        {/* Top Header */}
        <div className="flex flex-col gap-2 border-b border-[#F8BBD0] pb-4">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] transition inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#FFD1DC]/30 border border-transparent hover:border-[#F8BBD0]"
            >
              ← Kembali ke Menu Utama
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FFD1DC] to-[#FFF8E7] text-[#4A3B40] shadow-xs">
              <Users size={24} className="text-[#B8860B]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40] flex items-center gap-2">
                <span>Pemesanan Gabungan Rombongan</span>
                <span className="text-xl">🌸</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#8C7A82]">
                Minimal 3 orang. Bisa dilakukan antar-HP (Multi-Browser) dengan satu kode kelompok!
              </p>
            </div>
          </div>
        </div>

        {/* 3 Cute Pathway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Pathway 1: Buat Kelompok Baru (Ketua) */}
          <div 
            onClick={() => {
              setValidationError('');
              setFlowMode('LEADER_CREATE');
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-white via-[#FFFDF9] to-[#FFF8E7] border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] border border-[#D4AF37]/50 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                👑
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40]">
                Sebagai Ketua Rombongan
              </span>
              <h3 className="font-serif text-xl font-bold text-[#4A3B40] group-hover:text-[#B8860B] transition-colors">
                Buat Ruang Kelompok Baru
              </h3>
              <p className="text-xs text-[#8C7A82] leading-relaxed">
                Tentukan nama kelompok, tanggal, jam, dan lokasi (Studio/Home Service). Dapatkan <strong>Kode Unik</strong> untuk dibagikan ke teman-teman Anda!
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#F8BBD0]/30 text-xs font-bold text-[#B8860B]">
              <span>Mulai Buat Kelompok</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pathway 2: Gabung ke Kelompok (Anggota) */}
          <div 
            onClick={() => {
              setValidationError('');
              setFlowMode('MEMBER_JOIN');
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-white via-[#FFFDF9] to-[#FFD1DC]/30 border-2 border-[#F8BBD0]/60 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD1DC]/40 border border-[#F8BBD0] flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                🎀
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30">
                Sebagai Anggota Teman
              </span>
              <h3 className="font-serif text-xl font-bold text-[#4A3B40] group-hover:text-[#B8860B] transition-colors">
                Gabung dengan Kode Kelompok
              </h3>
              <p className="text-xs text-[#8C7A82] leading-relaxed">
                Sudah punya kode dari ketua rombongan? Masuk ke sini untuk memilih treatment, aksesoris, dan kuku impian Anda dari HP Anda sendiri!
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#F8BBD0]/30 text-xs font-bold text-[#B8860B]">
              <span>Masukkan Kode Kelompok</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Pathway 3 (Fallback Single Device) */}
        <div className="p-4 rounded-2xl bg-white/80 border border-[#F8BBD0]/60 text-center space-y-2">
          <p className="text-xs text-[#8C7A82]">
            Ingin memesankan langsung untuk 3 orang sekaligus dari 1 HP tanpa kode ruangan?
          </p>
          <button
            type="button"
            onClick={() => setFlowMode('SINGLE_DEVICE')}
            className="text-xs font-bold text-[#B8860B] hover:text-[#4A3B40] underline hover:no-underline"
          >
            Klik di sini untuk Input Cepat 3+ Anggota di 1 HP ✨
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LEADER CREATE GROUP
  // ==========================================
  if (flowMode === 'LEADER_CREATE') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fadeIn">
        <div className="flex flex-col gap-2 border-b border-[#F8BBD0] pb-4">
          <button
            type="button"
            onClick={() => setFlowMode('SELECT_MODE')}
            className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] self-start"
          >
            ← Kembali ke Pilihan Jalur
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40]">
              Buat Ruang Kelompok Baru (Ketua)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#8C7A82]">
            Ketua menentukan nama kelompok, jadwal treatment, dan lokasi (Studio Salon atau Home Service).
          </p>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          {/* Card 1: Nama Kelompok & Data Ketua */}
          <div className="luxury-card p-5 sm:p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <span>1. Identitas Kelompok & Kontak Ketua</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Nama Kelompok / Rombongan: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  placeholder="Contoh: Bestie Nails Day 🌸"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                    Nama Lengkap Ketua: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderNameInput}
                    onChange={(e) => setLeaderNameInput(e.target.value)}
                    placeholder="Nama Anda sebagai ketua"
                    className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                    WhatsApp Ketua: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={leaderPhoneInput}
                    onChange={(e) => setLeaderPhoneInput(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLeaderMember}
                  onChange={(e) => setIsLeaderMember(e.target.checked)}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className="text-xs text-[#4A3B40] font-medium">
                  Saya memiliki akun Member Lyra (Kumpulkan koin loyalti dari pesanan saya) 🪙
                </span>
              </label>
            </div>
          </div>

          {/* Card 2: Jadwal Kunjungan (Hanya ditentukan oleh Ketua) */}
          <div className="luxury-card p-5 sm:p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
              <Calendar size={16} className="text-[#D4AF37]" />
              <span>2. Jadwal Treatment Rombongan</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Tanggal Kunjungan: <span className="text-red-500">*</span>
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

              <TreatmentTimePicker
                date={appointmentDate}
                value={appointmentTime}
                onChange={(t) => setAppointmentTime(t)}
                operationalSchedule={operationalSchedule}
                reservations={reservations}
              />
            </div>
          </div>

          {/* Card 3: Lokasi (Studio vs Home Service) */}
          <HomeServicePicker
            value={location}
            onChange={setLocation}
            allowCoinDiscount={false}
            settings={settings}
          />

          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            <span>Buat Ruang Kelompok & Dapatkan Kode Gabung 🎀</span>
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // RENDER: MEMBER JOIN GROUP
  // ==========================================
  if (flowMode === 'MEMBER_JOIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 space-y-6 animate-fadeIn">
        <div className="flex flex-col gap-2 border-b border-[#F8BBD0] pb-4">
          <button
            type="button"
            onClick={() => setFlowMode('SELECT_MODE')}
            className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] self-start"
          >
            ← Kembali ke Pilihan Jalur
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎀</span>
            <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
              Gabung ke Kelompok
            </h2>
          </div>
          <p className="text-xs text-[#8C7A82]">
            Masukkan kode yang dibagikan oleh ketua kelompok Anda.
          </p>
        </div>

        <form onSubmit={handleJoinRoom} className="luxury-card p-6 space-y-4 shadow-md bg-white">
          <div>
            <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
              Kode Kelompok (Room Code): <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="Contoh: LYRA-9B21"
              className="w-full py-2.5 px-3 rounded-xl border-2 border-[#D4AF37]/50 bg-[#FFFDF9] font-mono text-base font-bold text-[#B8860B] text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
              Nama Lengkap Anda: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={joinNameInput}
              onChange={(e) => setJoinNameInput(e.target.value)}
              placeholder="Nama Anda"
              className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
              Nomor WhatsApp Anda: <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={joinPhoneInput}
              onChange={(e) => setJoinPhoneInput(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            />
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isJoinMember}
              onChange={(e) => setIsJoinMember(e.target.checked)}
              className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <span className="text-xs text-[#4A3B40] font-medium">
              Saya adalah Member Lyra (Dapatkan koin otomatis) 🪙
            </span>
          </label>

          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>Masuk ke Ruang Kelompok 💖</span>
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // RENDER: ACTIVE ROOM (LEADER & MEMBER VIEWS)
  // ==========================================
  if ((flowMode === 'LEADER_ROOM' || flowMode === 'MEMBER_ROOM') && activeRoom) {
    const self = currentMemberSession || activeRoom.members[0];
    const selfCoins = calculateMemberCoins(self.subtotalServices, rewardPercentage);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
        {/* Top Room Banner */}
        <div className="cute-card p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8E7] border border-[#D4AF37]/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white flex items-center gap-1.5 shadow-2xs">
                  {isLeader ? (
                    <>
                      <Crown size={12} />
                      <span>Ketua Rombongan</span>
                    </>
                  ) : (
                    <>
                      <User size={12} />
                      <span>Anggota Rombongan</span>
                    </>
                  )}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-white border border-[#D4AF37]/30 text-[#4A3B40] font-semibold flex items-center gap-1.5">
                  <Users size={12} className="text-[#B8860B]" />
                  <span>{activeRoom.members.length} Orang Bergabung (Min 3)</span>
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40] mt-2">
                {activeRoom.groupName}
              </h2>
              <p className="text-xs text-[#8C7A82] mt-0.5">
                Ketua: <strong className="text-[#4A3B40]">{activeRoom.leaderName}</strong> ({activeRoom.leaderWhatsapp})
              </p>
            </div>

            {/* Room Code Share Widget */}
            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 bg-[#FFFDF9] p-3 rounded-xl border border-[#D4AF37]/30">
              <span className="text-[10px] text-[#8C7A82] font-bold uppercase tracking-wider">
                Kode Undangan Gabung:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#B8860B] bg-white px-3.5 py-1 rounded-lg border border-[#D4AF37]/40 tracking-wider">
                  {activeRoom.roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white border border-[#F8BBD0] hover:bg-[#FFD1DC]/30 text-[#4A3B40] transition"
                  title="Salin Kode"
                >
                  {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                  title="Bagikan ke WhatsApp"
                >
                  <Share2 size={16} />
                </button>
              </div>
              {copiedLink && (
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Kode kamar disalin ke clipboard!
                </span>
              )}
            </div>
          </div>

          {/* Schedule & Location Summary (Chosen by Leader) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 border-t border-[#D4AF37]/20 text-xs text-[#4A3B40]">
            <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#F8BBD0]/40">
              <Calendar size={15} className="text-[#B8860B] shrink-0" />
              <span>
                Jadwal: <strong>{activeRoom.appointmentDate}</strong> • Jam <strong>{activeRoom.appointmentTime} WIB</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#F8BBD0]/40">
              <MapPin size={15} className="text-[#B8860B] shrink-0" />
              <span className="truncate">
                Lokasi: <strong>{activeRoom.location.isHomeService ? `Home Service (${activeRoom.location.village})` : 'Studio Mall Taman Palem'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Members Status Dashboard */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2.5">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2">
                <Users size={18} className="text-[#B8860B]" />
                <span>Status & Rincian Anggota Kelompok</span>
              </h3>
              <p className="text-xs text-[#8C7A82]">
                Tiap anggota memilih dari HP masing-masing. Rincian tagihan per individu terlihat transparan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchRoom(activeRoom.roomCode)}
              className="text-xs text-[#B8860B] flex items-center gap-1 hover:underline font-semibold"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Sinkronisasi</span>
            </button>
          </div>

          {/* Members List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeRoom.members.map((m) => {
              const isSelf = m.id === self.id;
              const mCoins = calculateMemberCoins(m.subtotalServices, rewardPercentage);
              const initialLetter = m.fullName.trim().charAt(0).toUpperCase() || 'M';

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all relative space-y-3 ${
                    isSelf
                      ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFDF9] to-[#FFF8E7]/40 shadow-xs ring-1 ring-[#D4AF37]/30'
                      : 'border-[#F8BBD0]/60 bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD1DC] to-[#FFF8E7] text-sm flex items-center justify-center font-bold text-[#4A3B40] shrink-0 border border-[#F8BBD0]">
                        {m.isLeader ? <Crown size={15} className="text-[#B8860B]" /> : initialLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-[#4A3B40]">{m.fullName}</span>
                          {m.isLeader && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Crown size={10} /> Ketua
                            </span>
                          )}
                          {isSelf && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40]">
                              Anda
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C7A82] block font-mono">{m.whatsapp}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {m.isEditing ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock size={11} className="text-amber-600" />
                          <span>Sedang Memilih</span>
                        </span>
                      ) : m.services.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check size={11} strokeWidth={2.5} className="text-emerald-600" />
                          <span>Selesai Memilih</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Belum Memilih
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Services Summary for this member */}
                  <div className="text-xs bg-[#FFFDF9] p-2.5 rounded-xl border border-[#F8BBD0]/30 space-y-1">
                    {m.services.length === 0 ? (
                      <span className="text-[11px] text-[#8C7A82] italic">Belum ada layanan terpilih</span>
                    ) : (
                      m.services.map((s) => (
                        <div key={s.serviceId} className="flex justify-between items-center text-[11px]">
                          <span className="truncate max-w-[200px] text-[#4A3B40]">
                            • {s.subSubCategoryName || s.subCategoryName}
                            {s.selectedExtensionLengthMm ? ` (${s.selectedExtensionLengthMm}mm)` : ''}
                            {s.selectedAccessories && s.selectedAccessories.length > 0 
                              ? ` +${s.selectedAccessories.length} Aksesoris` 
                              : ''}
                          </span>
                          <span className="font-mono text-[#B8860B] font-semibold">
                            Rp {s.finalPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))
                    )}

                    <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#4A3B40]">
                      <span>Subtotal Pilihan:</span>
                      <span className="font-mono text-[#B8860B]">
                        Rp {m.subtotalServices.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {m.isRegisteredMember && mCoins > 0 && (
                      <div className="flex items-center justify-end gap-1 text-[10px] text-amber-700 font-semibold pt-0.5">
                        <Coins size={11} />
                        <span>Estimasi reward: +{mCoins} Koin</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Treatment Customization Area (My Personal Treatment) */}
        <div className="luxury-card p-5 sm:p-6 space-y-4 border border-[#D4AF37]/40 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8BBD0]/40 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] block">
                Pilihan Layanan Saya ({self.fullName})
              </span>
              <h3 className="font-serif text-xl font-bold text-[#4A3B40]">
                Katalog Treatment Pribadi
              </h3>
            </div>

            {/* Editing Toggle Button */}
            <button
              type="button"
              onClick={() => handleUpdateSelfSession(self.services, !self.isEditing)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                self.isEditing
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {self.isEditing ? (
                <>
                  <Edit3 size={14} />
                  <span>Status: Sedang Memilih (Klik Jika Selesai)</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Status: Selesai (Klik untuk Edit)</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Transparent Catalog */}
          <TransparentCatalog
            categories={categories}
            availableColors={availableColors}
            availableCodes={availableCodes}
            availableTypes={availableTypes}
            availableAccessories={availableAccessories}
            availableExtensions={availableExtensions}
            selectedServices={self.services}
            onToggleService={(newItem) => {
              const updated = [...self.services, newItem];
              handleUpdateSelfSession(updated, true);
            }}
            onUpdateService={(srvId, partial) => {
              const updated = self.services.map(s => s.serviceId === srvId ? { ...s, ...partial } : s);
              handleUpdateSelfSession(updated, true);
            }}
            onRemoveService={(srvId) => {
              const updated = self.services.filter(s => s.serviceId !== srvId);
              handleUpdateSelfSession(updated, true);
            }}
          />

          {/* Personal Total Bar */}
          <div className="p-3.5 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[#8C7A82] block">Total Pilihan {self.fullName}:</span>
              <span className="font-mono text-base font-bold text-[#B8860B]">
                Rp {self.subtotalServices.toLocaleString('id-ID')}
              </span>
            </div>
            {self.isRegisteredMember && (
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                <Coins size={14} className="text-[#D4AF37]" />
                <span>Reward Koin yang Anda Dapat: <strong>+{selfCoins} Koin</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* GRAND TOTAL & SUBMIT BAR (For Leader) */}
        <div className="luxury-card p-5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF8E7] border-2 border-[#D4AF37] space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F8BBD0]/40 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B] block">
                Total Tagihan Rombongan (Masuk ke Ketua)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#B8860B]">
                  Rp {roomGrandTotal.toLocaleString('id-ID')}
                </span>
                {roomDeliveryFee > 0 && (
                  <span className="text-xs text-[#8C7A82]">
                    (Termasuk Pengantaran Rp {roomDeliveryFee.toLocaleString('id-ID')})
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-[#8C7A82] sm:text-right space-y-0.5">
              <div>Total Anggota: <strong>{activeRoom.members.length} Orang</strong></div>
              <div>Status Siap: <strong>{readyMembersCount} Siap</strong> • <strong>{editingMembersCount} Mengedit</strong></div>
            </div>
          </div>

          {/* Validation Warnings */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {editingMembersCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-amber-600" />
              <span>
                <strong>Perhatian:</strong> Masih ada {editingMembersCount} anggota yang berstatus sedang memilih layanan. Ketua belum dapat mengirim reservasi sebelum semua anggota menandai &ldquo;Selesai / Siap&rdquo;.
              </span>
            </div>
          )}

          {activeRoom.members.length < 3 && (
            <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-[#4A3B40] text-xs flex items-center gap-2">
              <Users size={16} className="shrink-0 text-[#B8860B]" />
              <span>
                Pemesanan Gabungan wajib minimal 3 orang anggota rombongan. Bagikan kode <strong>{activeRoom.roomCode}</strong> kepada teman Anda!
              </span>
            </div>
          )}

          {/* Leader Submit Button */}
          {isLeader ? (
            <button
              type="button"
              disabled={!leaderCanSubmit}
              onClick={handleLeaderSubmit}
              className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 ${
                leaderCanSubmit
                  ? 'gold-button hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              <span>
                {leaderCanSubmit
                  ? 'Kirim Reservasi Rombongan'
                  : 'Menunggu Semua Anggota Selesai Memilih...'}
              </span>
            </button>
          ) : (
            <div className="text-center p-3 rounded-xl bg-[#FFF8E7]/60 text-xs text-[#8C7A82]">
              Pengiriman formulir akhir reservasi rombongan akan dilakukan oleh Ketua Kelompok (<strong>{activeRoom.leaderName}</strong>).
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SINGLE DEVICE FALLBACK MODE
  // ==========================================
  const handleSingleAddMember = () => {
    setSingleMembers(prev => [
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

  const handleSingleRemoveMember = (idx: number) => {
    if (singleMembers.length <= 3) {
      setValidationError('Modul Rombongan wajib minimal 3 orang!');
      return;
    }
    setSingleMembers(prev => prev.filter((_, i) => i !== idx));
    if (singleActiveIndex >= singleMembers.length - 1) {
      setSingleActiveIndex(Math.max(0, singleMembers.length - 2));
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (singleMembers.length < 3) {
      setValidationError('Pemesanan Gabungan wajib minimal 3 orang!');
      return;
    }

    for (let i = 0; i < singleMembers.length; i++) {
      const m = singleMembers[i];
      if (!m.fullName.trim() || !m.whatsapp.trim()) {
        setValidationError(`Data Anggota ${i + 1} belum lengkap!`);
        return;
      }
      if (m.services.length === 0) {
        setValidationError(`Anggota ${i + 1} (${m.fullName}) belum memilih layanan.`);
        return;
      }
    }

    const totalSub = singleMembers.reduce((acc, m) => acc + m.subtotalServices, 0);
    const dFee = location.isHomeService ? location.totalDeliveryFee : 0;
    const primary = singleMembers[0];

    onSubmitReservation({
      type: 'GABUNGAN',
      fullName: singleGroupLeadName.trim() || `Rombongan ${primary.fullName} (${singleMembers.length} Orang)`,
      whatsapp: singleGroupLeadPhone.trim() || primary.whatsapp,
      appointmentDate,
      appointmentTime,
      groupMembers: singleMembers,
      services: [],
      location,
      servicesSubtotal: totalSub,
      deliveryFee: dFee,
      voucherDiscount: 0,
      coinDiscount: 0,
      customAdjustment: 0,
      totalPrice: totalSub + dFee,
      paymentStatus: 'BELUM_BAYAR',
      status: 'PENDING'
    });
  };

  const activeSingleMember = singleMembers[singleActiveIndex];
  const singleSubtotal = singleMembers.reduce((sum, m) => sum + m.subtotalServices, 0);
  const singleGrandTotal = singleSubtotal + (location.isHomeService ? location.totalDeliveryFee : 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-2 border-b border-[#F8BBD0] pb-4">
        <button
          type="button"
          onClick={() => setFlowMode('SELECT_MODE')}
          className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] self-start"
        >
          ← Kembali ke Pilihan Multi-Browser
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3B40]">
            Input Gabungan Langsung di 1 HP
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#8C7A82]">
          Isi seluruh data anggota rombongan secara berurutan di layar ini.
        </p>
      </div>

      <form onSubmit={handleSingleSubmit} className="space-y-8">
        {/* Jadwal */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
            <Calendar size={16} className="text-[#D4AF37]" />
            <span>1. Kalender Jadwal & Kontak Utama</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">Nama Rombongan:</label>
              <input
                type="text"
                value={singleGroupLeadName}
                onChange={(e) => setSingleGroupLeadName(e.target.value)}
                placeholder="Contoh: Rombongan Bridal Kak Citra"
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">No. WhatsApp Utama:</label>
              <input
                type="tel"
                value={singleGroupLeadPhone}
                onChange={(e) => setSingleGroupLeadPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">Tanggal Kunjungan:</label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm"
              />
            </div>
            <TreatmentTimePicker
              date={appointmentDate}
              value={appointmentTime}
              onChange={setAppointmentTime}
              operationalSchedule={operationalSchedule}
              reservations={reservations}
            />
          </div>
        </div>

        {/* Member Selector */}
        <div className="luxury-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2.5">
            <h3 className="font-serif text-base font-bold text-[#4A3B40] flex items-center gap-2">
              <Users size={16} className="text-[#D4AF37]" />
              <span>2. Pilih Layanan Tiap Anggota (Min 3)</span>
            </h3>
            <button
              type="button"
              onClick={handleSingleAddMember}
              className="py-1 px-3 rounded-lg text-xs font-semibold gold-button flex items-center gap-1 shadow-2xs"
            >
              <Plus size={13} />
              <span>Tambah Anggota</span>
            </button>
          </div>

          {/* Member Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {singleMembers.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSingleActiveIndex(idx)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
                  singleActiveIndex === idx
                    ? 'gold-button shadow-xs'
                    : 'bg-white border border-[#F8BBD0]/60 text-[#4A3B40] hover:bg-[#FFF8E7]'
                }`}
              >
                <span>Anggota {idx + 1}: {m.fullName || 'Nama?'}</span>
                {singleMembers.length > 3 && (
                  <Trash2
                    size={12}
                    className="hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleRemoveMember(idx);
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Active Member Details */}
          {activeSingleMember && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FFFDF9] border border-[#D4AF37]/30">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                    Nama Anggota {singleActiveIndex + 1}: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={activeSingleMember.fullName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSingleMembers(prev => {
                        const copy = [...prev];
                        copy[singleActiveIndex] = { ...copy[singleActiveIndex], fullName: val };
                        return copy;
                      });
                    }}
                    placeholder="Nama teman Anda"
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                    WhatsApp Anggota {singleActiveIndex + 1}: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={activeSingleMember.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSingleMembers(prev => {
                        const copy = [...prev];
                        copy[singleActiveIndex] = { ...copy[singleActiveIndex], whatsapp: val };
                        return copy;
                      });
                    }}
                    placeholder="08xxxxxxxxxx"
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Transparent Catalog for Active Member */}
              <TransparentCatalog
                categories={categories}
                availableColors={availableColors}
                availableCodes={availableCodes}
                availableTypes={availableTypes}
                availableAccessories={availableAccessories}
                availableExtensions={availableExtensions}
                selectedServices={activeSingleMember.services}
                onToggleService={(item) => {
                  setSingleMembers(prev => {
                    const copy = [...prev];
                    const mem = copy[singleActiveIndex];
                    const nextSrv = [...mem.services, item];
                    const sub = nextSrv.reduce((sum, s) => sum + s.finalPrice, 0);
                    copy[singleActiveIndex] = { ...mem, services: nextSrv, subtotalServices: sub };
                    return copy;
                  });
                }}
                onUpdateService={(srvId, partial) => {
                  setSingleMembers(prev => {
                    const copy = [...prev];
                    const mem = copy[singleActiveIndex];
                    const nextSrv = mem.services.map(s => s.serviceId === srvId ? { ...s, ...partial } : s);
                    const sub = nextSrv.reduce((sum, s) => sum + s.finalPrice, 0);
                    copy[singleActiveIndex] = { ...mem, services: nextSrv, subtotalServices: sub };
                    return copy;
                  });
                }}
                onRemoveService={(srvId) => {
                  setSingleMembers(prev => {
                    const copy = [...prev];
                    const mem = copy[singleActiveIndex];
                    const nextSrv = mem.services.filter(s => s.serviceId !== srvId);
                    const sub = nextSrv.reduce((sum, s) => sum + s.finalPrice, 0);
                    copy[singleActiveIndex] = { ...mem, services: nextSrv, subtotalServices: sub };
                    return copy;
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Home Service */}
        <HomeServicePicker
          value={location}
          onChange={setLocation}
          allowCoinDiscount={false}
          settings={settings}
        />

        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Bar */}
        <div className="luxury-card p-5 sm:p-6 bg-[#FFFDF9] border-2 border-[#D4AF37] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] block">
              Total Tagihan Rombongan ({singleMembers.length} Orang)
            </span>
            <span className="font-mono text-2xl font-bold text-[#B8860B]">
              Rp {singleGrandTotal.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="submit"
            className="py-3.5 px-6 rounded-2xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Send size={16} />
            <span>Kirim Reservasi Rombongan ✨</span>
          </button>
        </div>
      </form>
    </div>
  );
};
