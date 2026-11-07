import React, { useState } from 'react';
import { 
  Store, 
  Upload, 
  MapPin, 
  Instagram, 
  Phone, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  History, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Lock,
  Copy
} from 'lucide-react';
import { StoreSettings, StaffAccount, AuditLog } from '../types/salon';
import { salonStore } from '../services/store';
import { OtpModal } from '../components/OtpModal';

interface OwnerSettingsProps {
  settings: StoreSettings;
  staffList: StaffAccount[];
  auditLogs: AuditLog[];
  onRefresh: () => void;
}

export const OwnerSettings: React.FC<OwnerSettingsProps> = ({
  settings,
  staffList,
  auditLogs,
  onRefresh
}) => {
  // Store Info Inputs
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(settings.googleMapsUrl);
  const [latitude, setLatitude] = useState(settings.storeCoordinate?.lat ?? -6.1438);
  const [longitude, setLongitude] = useState(settings.storeCoordinate?.lng ?? 106.7356);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl);

  // Logo upload preview
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl);

  // Sync inputs with settings when settings changes
  React.useEffect(() => {
    setStoreName(settings.storeName);
    setTagline(settings.tagline);
    setStoreAddress(settings.storeAddress);
    setGoogleMapsUrl(settings.googleMapsUrl);
    setLatitude(settings.storeCoordinate?.lat ?? -6.1438);
    setLongitude(settings.storeCoordinate?.lng ?? 106.7356);
    setInstagramUrl(settings.instagramUrl);
    setTiktokUrl(settings.tiktokUrl);
    setLogoPreview(settings.logoUrl);
  }, [settings]);

  // Security & OTP Flows
  // 1. Change Owner PIN via OTP WA
  const [newOwnerPin, setNewOwnerPin] = useState('');
  const [isPinOtpOpen, setIsPinOtpOpen] = useState(false);

  // 2. Change WA via OTP Email
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [isWaOtpOpen, setIsWaOtpOpen] = useState(false);

  // 3. Change Email via OTP WA
  const [newEmail, setNewEmail] = useState('');
  const [isEmailOtpOpen, setIsEmailOtpOpen] = useState(false);

  // Add Staff Modal / Form
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Senior Nail Artist');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPin, setStaffPin] = useState('');

  // Staff PIN Visibility & Management for Owner
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [showAllPins, setShowAllPins] = useState(false);
  const [editingStaffPin, setEditingStaffPin] = useState<{ id: string; name: string; currentPin: string } | null>(null);
  const [newPinValue, setNewPinValue] = useState('');
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  const togglePinVisibility = (staffId: string) => {
    setRevealedPins(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));
  };

  const toggleShowAllPins = () => {
    const nextState = !showAllPins;
    setShowAllPins(nextState);
    const nextMap: Record<string, boolean> = {};
    staffList.forEach(s => {
      nextMap[s.id] = nextState;
    });
    setRevealedPins(nextMap);
  };

  const handleCopyStaffPin = (staffId: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedStaffId(staffId);
    setTimeout(() => setCopiedStaffId(null), 2000);
  };

  const handleSaveStaffPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffPin || !newPinValue.trim()) return;
    salonStore.updateStaff(editingStaffPin.id, { pin: newPinValue.trim() });
    setNotificationMsg(`PIN untuk staf ${editingStaffPin.name} berhasil diperbarui!`);
    setTimeout(() => setNotificationMsg(''), 3000);
    setEditingStaffPin(null);
    setNewPinValue('');
    onRefresh();
  };

  const [notificationMsg, setNotificationMsg] = useState('');

  // Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        salonStore.updateSettings({ logoUrl: result });
        setNotificationMsg('Logo toko berhasil diperbarui di seluruh ekosistem website!');
        setTimeout(() => setNotificationMsg(''), 3000);
        onRefresh();
      };
      reader.readAsDataURL(file);
    }
  };

  // Save General Store Info
  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMaps = googleMapsUrl.trim();
    const formattedMaps = trimmedMaps
      ? (trimmedMaps.startsWith('http') ? trimmedMaps : `https://${trimmedMaps}`)
      : settings.googleMapsUrl;

    const trimmedIg = instagramUrl.trim();
    const formattedIg = trimmedIg
      ? (trimmedIg.startsWith('http') ? trimmedIg : `https://instagram.com/${trimmedIg.replace(/^@/, '')}`)
      : settings.instagramUrl;
    const igHandle = formattedIg.includes('instagram.com/')
      ? '@' + formattedIg.split('instagram.com/')[1].replace(/\/$/, '')
      : settings.instagramHandle;

    const trimmedTiktok = tiktokUrl.trim();
    const formattedTiktok = trimmedTiktok
      ? (trimmedTiktok.startsWith('http') ? trimmedTiktok : `https://tiktok.com/@${trimmedTiktok.replace(/^@/, '')}`)
      : settings.tiktokUrl;
    const tiktokHandle = formattedTiktok.includes('tiktok.com/@')
      ? '@' + formattedTiktok.split('tiktok.com/@')[1].replace(/\/$/, '')
      : settings.tiktokHandle;

    salonStore.updateSettings({
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      storeAddress: storeAddress.trim(),
      storeCoordinate: { lat: Number(latitude), lng: Number(longitude) },
      googleMapsUrl: formattedMaps,
      instagramUrl: formattedIg,
      instagramHandle: igHandle,
      tiktokUrl: formattedTiktok,
      tiktokHandle: tiktokHandle
    });

    setNotificationMsg('Perubahan informasi toko, titik Google Maps, medsos, dan koordinat berhasil disimpan! Seluruh website & kalkulator Home Service telah otomatis diperbarui.');
    setTimeout(() => setNotificationMsg(''), 4000);
    onRefresh();
  };

  // OTP Verification Handlers
  const handleConfirmPinChange = (otp: string) => {
    if (otp.length === 6 && newOwnerPin.length >= 4) {
      salonStore.updateSettings({ ownerPin: newOwnerPin });
      setNewOwnerPin('');
      setNotificationMsg('PIN Owner berhasil diperbarui!');
      setTimeout(() => setNotificationMsg(''), 3000);
      onRefresh();
      return true;
    }
    return false;
  };

  const handleConfirmWaChange = (otp: string) => {
    if (otp.length === 6 && newWhatsapp.trim()) {
      salonStore.updateSettings({ ownerWhatsapp: newWhatsapp });
      setNewWhatsapp('');
      setNotificationMsg('Nomor WhatsApp resmi berhasil diperbarui!');
      setTimeout(() => setNotificationMsg(''), 3000);
      onRefresh();
      return true;
    }
    return false;
  };

  const handleConfirmEmailChange = (otp: string) => {
    if (otp.length === 6 && newEmail.trim()) {
      salonStore.updateSettings({ ownerEmail: newEmail });
      setNewEmail('');
      setNotificationMsg('Alamat Email resmi berhasil diperbarui!');
      setTimeout(() => setNotificationMsg(''), 3000);
      onRefresh();
      return true;
    }
    return false;
  };

  // Staff Account Handlers
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffPin.trim()) return;

    salonStore.addStaff({
      name: staffName.trim(),
      role: staffRole.trim(),
      phone: staffPhone.trim() || '0812000000',
      pin: staffPin.trim(),
      isActive: true
    });

    setIsAddingStaff(false);
    setStaffName('');
    setStaffPhone('');
    setStaffPin('');
    setNotificationMsg('Akun staf baru berhasil ditambahkan!');
    setTimeout(() => setNotificationMsg(''), 3000);
    onRefresh();
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Yakin ingin menghapus akun staf ini?')) {
      salonStore.deleteStaff(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-[#F8BBD0] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
          Pengaturan Toko, Akun Staf, & Keamanan PIN
        </h2>
        <p className="text-xs text-[#8C7A82] mt-0.5">
          Kelola profil toko, upload logo resmi, tautan kontak, verifikasi OTP berlapis, dan pantau log audit keluar masuk.
        </p>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check size={16} className="shrink-0" />
          <span className="font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* SECTION 1: Logo Toko Uploader */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/40 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
          <Store size={18} className="text-[#D4AF37]" />
          <span>Upload & Ganti Logo Toko (Sewaktu-waktu)</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37] to-[#F8BBD0] shadow-md">
              <img
                src={logoPreview}
                alt="Logo Toko"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <label className="cursor-pointer inline-flex items-center gap-2 py-2 px-4 rounded-xl gold-button text-xs font-bold shadow-xs hover:scale-101 transition">
              <Upload size={14} />
              <span>Pilih Gambar Logo Baru (PNG/JPG)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            <p className="text-[11px] text-[#8C7A82] max-w-sm">
              Logo baru akan tersinkronisasi instan ke Layar Pembuka (Splash Screen), Header Customer, dan Header POS.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Official Links & Contacts */}
      <form onSubmit={handleSaveStoreInfo} className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
          <MapPin size={18} className="text-[#D4AF37]" />
          <span>Informasi Toko, Media Sosial & Tautan Resmi</span>
        </h3>

        <div className="p-3 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/40 text-xs text-[#4A3B40] flex items-start gap-2.5">
          <AlertCircle size={16} className="text-[#B8860B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Sinkronisasi Otomatis Real-Time:</strong> Setiap perubahan Alamat Fisik Studio, Titik Koordinat (Latitude & Longitude), Tautan Google Maps, Instagram, dan TikTok akan seketika tersinkronisasi di seluruh portal Customer, navigasi resmi, serta rumus kalkulasi tarif jarak <strong>Home Service</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Toko:</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-serif font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">Tagline / Slogan:</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-[#4A3B40]">Alamat Fisik Studio:</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">URL Google Maps Toko:</label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1 text-[#4A3B40] text-xs">Garis Lintang (Latitude):</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono text-xs"
                placeholder="-6.1438"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-[#4A3B40] text-xs">Garis Bujur (Longitude):</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono text-xs"
                placeholder="106.7356"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">URL Instagram Resmi:</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#4A3B40]">URL TikTok Resmi:</label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl gold-button text-xs font-bold shadow-xs"
          >
            Simpan Perubahan Kontak & Medsos
          </button>
        </div>
      </form>

      {/* SECTION 3: Keamanan PIN & Perubahan Kontak dengan Verifikasi OTP Silang */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/50 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2 border-b border-[#F8BBD0]/40 pb-2">
          <ShieldCheck size={18} className="text-[#D4AF37]" />
          <span>Keamanan Tingkat Tinggi (Verifikasi OTP Silang)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. Ubah PIN Owner via OTP WA */}
          <div className="p-4 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/30 space-y-2.5">
            <span className="font-bold text-[#4A3B40] block">
              1. Ubah PIN Owner (Verifikasi OTP WA)
            </span>
            <p className="text-[11px] text-[#8C7A82]">
              OTP verifikasi dikirimkan ke nomor WhatsApp Owner yang tertaut ({settings.ownerWhatsapp}).
            </p>
            <input
              type="password"
              maxLength={12}
              value={newOwnerPin}
              onChange={(e) => setNewOwnerPin(e.target.value)}
              placeholder="Masukkan PIN Owner Baru"
              className="w-full py-2 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono tracking-widest text-center"
            />
            <button
              type="button"
              disabled={newOwnerPin.length < 4}
              onClick={() => setIsPinOtpOpen(true)}
              className="w-full py-2 rounded-lg gold-button font-bold text-xs shadow-2xs disabled:opacity-50"
            >
              Minta OTP & Simpan PIN
            </button>
          </div>

          {/* 2. Ganti WA tertaut via OTP Email */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0] space-y-2.5">
            <span className="font-bold text-[#4A3B40] block">
              2. Ganti WhatsApp Tertaut (OTP ke Email)
            </span>
            <p className="text-[11px] text-[#8C7A82]">
              OTP verifikasi dikirimkan ke Email Owner yang tertaut ({settings.ownerEmail}).
            </p>
            <input
              type="tel"
              value={newWhatsapp}
              onChange={(e) => setNewWhatsapp(e.target.value)}
              placeholder="Nomor WA Baru (e.g. 0822...)"
              className="w-full py-2 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono"
            />
            <button
              type="button"
              disabled={!newWhatsapp.trim()}
              onClick={() => setIsWaOtpOpen(true)}
              className="w-full py-2 rounded-lg soft-button font-bold text-xs border border-[#F8BBD0] disabled:opacity-50"
            >
              Minta OTP Email & Ganti WA
            </button>
          </div>

          {/* 3. Ganti Email tertaut via OTP WhatsApp */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0] space-y-2.5">
            <span className="font-bold text-[#4A3B40] block">
              3. Ganti Email Tertaut (OTP ke WA)
            </span>
            <p className="text-[11px] text-[#8C7A82]">
              OTP verifikasi dikirimkan ke WhatsApp Owner yang tertaut ({settings.ownerWhatsapp}).
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Alamat Email Baru"
              className="w-full py-2 px-3 rounded-lg border border-[#F8BBD0] bg-white"
            />
            <button
              type="button"
              disabled={!newEmail.trim()}
              onClick={() => setIsEmailOtpOpen(true)}
              className="w-full py-2 rounded-lg soft-button font-bold text-xs border border-[#F8BBD0] disabled:opacity-50"
            >
              Minta OTP WA & Ganti Email
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Akun Staf Salon & Akses Lihat PIN Staf untuk Owner */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F8BBD0]/40 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-[#D4AF37]" />
            <div>
              <h3 className="font-serif font-bold text-base text-[#4A3B40]">
                Manajemen Akun Staf Salon &amp; Kontrol PIN ({staffList.length} Staf)
              </h3>
              <p className="text-xs text-[#8C7A82]">
                Owner dapat melihat dan mereset PIN staf jika staf lupa kata sandi mereka.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleShowAllPins}
              className="py-1.5 px-3 rounded-xl border border-[#D4AF37] text-[#B8860B] hover:bg-[#FFF8E7] text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
            >
              {showAllPins ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showAllPins ? 'Sembunyikan Semua PIN' : 'Lihat Semua PIN Staf'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingStaff(!isAddingStaff)}
              className="py-1.5 px-3 rounded-xl gold-button text-xs font-bold shadow-2xs flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Tambah Staf</span>
            </button>
          </div>
        </div>

        {/* Informative notice for Owner */}
        <div className="p-3 rounded-xl bg-[#FFF8E7]/70 border border-[#D4AF37]/30 text-xs text-[#4A3B40] flex items-start gap-2">
          <ShieldCheck size={16} className="text-[#B8860B] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] text-[#8C7A82]">
            <strong className="text-[#4A3B40]">Privasi Antar Staf Terlindungi:</strong> Di portal staf (<code className="text-[#B8860B]">/staff</code>), staf tidak dapat melihat PIN rekan lainnya. Hanya <strong>Owner</strong> yang berwenang melihat atau mengubah PIN terapis di halaman pengaturan ini.
          </p>
        </div>

        {isAddingStaff && (
          <form onSubmit={handleCreateStaff} className="p-4 rounded-xl bg-[#FFF8E7] border border-[#D4AF37] space-y-3 text-xs animate-fadeIn">
            <span className="font-serif font-bold text-sm text-[#4A3B40] block">
              Tambah Staf Salon Baru:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Nama Staf:</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Contoh: Rina Melati"
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jabatan / Role:</label>
                <input
                  type="text"
                  required
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  placeholder="Senior Nail Artist"
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nomor Telepon:</label>
                <input
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="081234..."
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">PIN Rahasia Staf:</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="Contoh: rina123"
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono text-center"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="py-1 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-1 px-4 rounded-lg gold-button text-xs font-bold"
              >
                Simpan Akun Staf
              </button>
            </div>
          </form>
        )}

        {/* Staff List with visible PIN for Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {staffList.map((st) => {
            const isRevealed = !!revealedPins[st.id];

            return (
              <div 
                key={st.id}
                className="p-4 rounded-2xl bg-white border border-[#F8BBD0] hover:border-[#D4AF37] transition shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-serif font-bold text-sm text-[#4A3B40] block">{st.name}</span>
                      <span className="text-[11px] font-medium text-[#B8860B]">{st.role}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </div>

                  <p className="text-xs text-[#8C7A82] flex items-center gap-1 font-mono">
                    <Phone size={12} className="text-[#D4AF37]" />
                    <span>{st.phone}</span>
                  </p>

                  {/* PIN Display with Eye Toggle for Owner */}
                  <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Lock size={12} className="text-[#B8860B]" />
                      <span className="text-[11px] text-[#8C7A82]">PIN Staf:</span>
                      {isRevealed ? (
                        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 select-all">
                          {st.pin}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-gray-400 tracking-widest">
                          ••••••••
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isRevealed && (
                        <button
                          type="button"
                          onClick={() => handleCopyStaffPin(st.id, st.pin)}
                          className="p-1 text-gray-500 hover:text-[#B8860B] rounded"
                          title="Salin PIN Staf"
                        >
                          <span className="text-[10px] font-bold">
                            {copiedStaffId === st.id ? '✓' : <Copy size={12} />}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => togglePinVisibility(st.id)}
                        className="p-1 text-[#8C7A82] hover:text-[#4A3B40] rounded"
                        title={isRevealed ? 'Sembunyikan PIN' : 'Lihat PIN Staf'}
                      >
                        {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaffPin({ id: st.id, name: st.name, currentPin: st.pin });
                      setNewPinValue(st.pin);
                    }}
                    className="text-[#B8860B] hover:text-[#4A3B40] font-semibold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <Edit3 size={12} />
                    <span>Ubah PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(st.id)}
                    className="p-1 text-rose-400 hover:text-rose-600 rounded-lg transition"
                    title="Hapus Akun Staf"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Editing Staff PIN by Owner */}
        {editingStaffPin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm bg-[#FFFDF9] rounded-2xl p-6 shadow-2xl border border-[#F8BBD0] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-[#B8860B]" />
                  <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                    Ubah PIN Staf: {editingStaffPin.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStaffPin(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveStaffPin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">
                    Masukkan PIN Baru untuk {editingStaffPin.name}:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    placeholder="Contoh: syafira2026"
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono text-center tracking-wider text-sm font-bold text-[#4A3B40]"
                  />
                  <p className="text-[11px] text-[#8C7A82] mt-1">
                    PIN ini digunakan oleh terapis untuk masuk ke portal <code className="text-[#B8860B]">/staff</code>.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStaffPin(null)}
                    className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl gold-button font-bold text-xs shadow-xs"
                  >
                    Simpan PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Log Keluar-Masuk (Audit Trail) */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base text-[#4A3B40]">
              Log Keluar-Masuk & Audit Trail Sistem
            </h3>
          </div>
          <span className="text-xs text-[#8C7A82]">
            Merekam Riwayat Login/Logout Staf & Owner
          </span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs text-[#4A3B40]">
            <thead className="bg-[#FFF8E7] text-[#8C7A82] uppercase text-[10px] tracking-wider border-b border-[#F8BBD0]/40 sticky top-0">
              <tr>
                <th className="py-2 px-3">Waktu (WIB)</th>
                <th className="py-2 px-3">Nama Pengguna</th>
                <th className="py-2 px-3">Peran</th>
                <th className="py-2 px-3">Aktivitas</th>
                <th className="py-2 px-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFFDF9] transition">
                  <td className="py-2 px-3 font-mono text-[11px] text-[#8C7A82]">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 font-semibold text-[#4A3B40]">
                    {log.userName}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.userType === 'OWNER' ? 'bg-[#D4AF37] text-white' : 'bg-[#FFD1DC] text-[#4A3B40]'
                    }`}>
                      {log.userType}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-[#B8860B]">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 text-[#8C7A82] text-[11px]">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OTP Modals for Security Flows */}
      <OtpModal
        isOpen={isPinOtpOpen}
        onClose={() => setIsPinOtpOpen(false)}
        onVerify={handleConfirmPinChange}
        targetType="WHATSAPP"
        targetDestination={settings.ownerWhatsapp}
        purpose="Mengubah PIN Rahasia Owner"
      />

      <OtpModal
        isOpen={isWaOtpOpen}
        onClose={() => setIsWaOtpOpen(false)}
        onVerify={handleConfirmWaChange}
        targetType="EMAIL"
        targetDestination={settings.ownerEmail}
        purpose="Mengganti Nomor WhatsApp Tertaut"
      />

      <OtpModal
        isOpen={isEmailOtpOpen}
        onClose={() => setIsEmailOtpOpen(false)}
        onVerify={handleConfirmEmailChange}
        targetType="WHATSAPP"
        targetDestination={settings.ownerWhatsapp}
        purpose="Mengganti Alamat Email Tertaut"
      />
    </div>
  );
};
