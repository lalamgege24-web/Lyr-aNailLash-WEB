import React, { useState } from 'react';
import { Shield, KeyRound, AlertCircle, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { StoreSettings } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerAuthProps {
  settings: StoreSettings;
  onLoginSuccess: (role: 'OWNER', userName: string) => void;
}

export const OwnerAuth: React.FC<OwnerAuthProps> = ({
  settings,
  onLoginSuccess
}) => {
  // Owner PIN input (default: 560605)
  const [ownerPinInput, setOwnerPinInput] = useState('');
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

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md luxury-card p-6 sm:p-8 space-y-6 border-[#D4AF37]/50 shadow-xl bg-white animate-fadeIn">
        {/* Brand & Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37] to-[#F8BBD0] shadow-md">
            <img
              src={settings.logoUrl}
              alt="Logo Lyra"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30 text-[11px] font-bold mb-1">
              <Shield size={12} />
              <span>Portal Khusus Owner (B2B Admin &amp; POS)</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#4A3B40]">
              {settings.storeName}
            </h1>
            <p className="text-xs text-[#8C7A82]">
              Sistem Manajemen Keuangan, Katalog, Reservasi &amp; Kontrol Salon
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Owner Login Form */}
        <form onSubmit={handleOwnerLogin} className="space-y-4">
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
              Hak akses penuh operasional, laporan keuangan, dan hapus riwayat.
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

        {/* Dedicated Staff Portal Notice */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8E7]/60 border border-[#D4AF37]/30 space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-[#B8860B]" />
            <span className="font-serif font-bold text-xs text-[#4A3B40]">
              Apakah Anda Staf Terapis?
            </span>
          </div>
          <p className="text-[11px] text-[#8C7A82] leading-relaxed">
            Portal terapis dipisahkan sepenuhnya di alamat tersendiri untuk absensi jam kerja, melihat jadwal H-1, dan antrean treatment.
          </p>
          <a
            href="/staff"
            className="w-full py-2 px-3 rounded-xl bg-white border border-[#D4AF37]/50 hover:bg-[#FFF8E7] text-xs font-bold text-[#B8860B] flex items-center justify-center gap-1.5 shadow-2xs transition"
          >
            <span>Buka Portal Khusus Staf Terapis (/staff)</span>
            <ArrowRight size={13} />
          </a>
        </div>

        {/* Quick Links to Customer Portal */}
        <div className="pt-2 border-t border-[#F8BBD0]/40">
          <a
            href="/"
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#FFF5F7] via-white to-[#FFF8E7] border border-[#F8BBD0] hover:border-[#D4AF37] text-xs font-bold text-[#4A3B40] hover:text-[#B8860B] flex items-center justify-between shadow-2xs transition group"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🛍️</span>
              <span>Buka Website / Portal Pelanggan (B2C)</span>
            </span>
            <span className="text-[#B8860B] group-hover:translate-x-1 transition-transform font-bold">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};
