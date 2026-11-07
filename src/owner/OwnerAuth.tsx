import React, { useState } from 'react';
import { Shield, KeyRound, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { StoreSettings, StaffAccount } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerAuthProps {
  settings: StoreSettings;
  staffList: StaffAccount[];
  onLoginSuccess: (role: 'OWNER' | 'STAFF', userName: string, staffData?: StaffAccount) => void;
}

export const OwnerAuth: React.FC<OwnerAuthProps> = ({
  settings,
  staffList,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState<'OWNER' | 'STAFF'>('OWNER');

  // Owner PIN input (Secret: default is 560605, NEVER displayed anywhere in UI!)
  const [ownerPinInput, setOwnerPinInput] = useState('');

  // Staff Login input: Choose staff from list (WITHOUT showing PIN!)
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [staffPinInput, setStaffPinInput] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (ownerPinInput === settings.ownerPin) {
      salonStore.addAuditLog('OWNER', 'Owner Lyra', 'LOGIN', 'Login Owner sukses');
      onLoginSuccess('OWNER', 'Owner Lyra');
    } else {
      setErrorMessage('PIN Owner tidak valid. Silakan periksa kembali!');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const staff = staffList.find(s => s.id === selectedStaffId);
    if (!staff) {
      setErrorMessage('Silakan pilih akun staf yang tersedia.');
      return;
    }

    if (staff.pin === staffPinInput) {
      salonStore.addAuditLog('STAFF', staff.name, 'LOGIN', `Login Staf (${staff.role}) sukses`);
      onLoginSuccess('STAFF', staff.name, staff);
    } else {
      setErrorMessage('PIN Staf salah. Silakan hubungi Owner jika lupa PIN!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md luxury-card p-6 sm:p-8 space-y-6 border-[#D4AF37]/50 shadow-xl bg-white">
        {/* Brand & Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37] to-[#F8BBD0] shadow-md">
            <img
              src={settings.logoUrl}
              alt="Logo Lyra"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#4A3B40]">
            Portal Internal Operasional
          </h1>
          <p className="text-xs text-[#8C7A82]">
            Lyra&apos;s Nail-Lash Management System & POS
          </p>
        </div>

        {/* Tab Switch: Owner vs Staff */}
        <div className="flex rounded-xl bg-[#FFF8E7] p-1 border border-[#F8BBD0]/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode('OWNER');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'OWNER'
                ? 'bg-white text-[#B8860B] shadow-xs border border-[#D4AF37]/30'
                : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            <Shield size={14} />
            <span>Login Owner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('STAFF');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authMode === 'STAFF'
                ? 'bg-white text-[#B8860B] shadow-xs border border-[#D4AF37]/30'
                : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            <UserCheck size={14} />
            <span>Login Staf Salon</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Owner Login Form */}
        {authMode === 'OWNER' && (
          <form onSubmit={handleOwnerLogin} className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1.5">
                Masukkan PIN Rahasia Owner:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={12}
                  value={ownerPinInput}
                  onChange={(e) => setOwnerPinInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-center tracking-widest text-xl font-mono py-2.5 px-4 rounded-xl border border-[#F8BBD0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-[#8C7A82]" />
              </div>
              <p className="text-[11px] text-[#8C7A82] mt-1.5 text-center">
                Hak akses penuh seluruh modul keuangan, katalog, absensi, dan data rahasia. (PIN Default: <strong className="font-mono text-[#B8860B]">560605</strong>)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Shield size={16} />
              <span>Masuk Sebagai Owner</span>
            </button>
          </form>
        )}

        {/* Staff Login Form */}
        {authMode === 'STAFF' && (
          <form onSubmit={handleStaffLogin} className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1.5">
                Pilih Akun Staf:
              </label>
              {/* NOTE: Absolutely NO PIN is shown in this selection! */}
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-medium"
              >
                {staffList.filter(s => s.isActive).map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} — ({staff.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1.5">
                Masukkan PIN Staf Pribadi:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={10}
                  value={staffPinInput}
                  onChange={(e) => setStaffPinInput(e.target.value)}
                  placeholder="••••••"
                  className="w-full text-center tracking-widest text-xl font-mono py-2.5 px-4 rounded-xl border border-[#F8BBD0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-[#8C7A82]" />
              </div>
              <p className="text-[11px] text-[#8C7A82] mt-1.5 text-center">
                Staf hanya dapat melihat jadwal hari ini/besok, nama, layanan, warna & desain foto.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl soft-button border border-[#F8BBD0] text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              <span>Masuk Sebagai Staf Salon</span>
            </button>
          </form>
        )}

        {/* Back to Customer Web */}
        <div className="text-center pt-2 border-t border-[#F8BBD0]/40">
          <a
            href="/"
            className="text-xs text-[#8C7A82] hover:text-[#4A3B40] hover:underline"
          >
            ← Kembali ke Portal Reservasi Customer
          </a>
        </div>
      </div>
    </div>
  );
};
