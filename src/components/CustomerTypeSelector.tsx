import React from 'react';
import { User, Crown, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface CustomerTypeSelectorProps {
  onSelectType: (type: 'REGULER' | 'MEMBER' | 'GABUNGAN') => void;
  onBackToSplash: () => void;
}

export const CustomerTypeSelector: React.FC<CustomerTypeSelectorProps> = ({
  onSelectType,
  onBackToSplash
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn space-y-6">
      {/* Back button aligned strictly to the left */}
      <div className="flex justify-start">
        <button
          onClick={onBackToSplash}
          className="text-xs font-semibold text-[#B8860B] hover:text-[#4A3B40] transition inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#FFD1DC]/30 border border-transparent hover:border-[#F8BBD0]"
        >
          ← Kembali ke Halaman Pembuka
        </button>
      </div>

      {/* Title & subtitle without 'Langkah 1 : Pilih tipe kunjungan' */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3B40]">
          Selamat Datang di Lyra&apos;s Nail-Lash
        </h2>
        <p className="text-sm sm:text-base text-[#8C7A82] leading-relaxed">
          Silakan tentukan jenis reservasi Anda. Nikmati pelayanan personal eksklusif oleh nail artist dan lash stylist berpengalaman kami.
        </p>
      </div>

      {/* 3 Modular Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Card 1: REGULER */}
        <div 
          onClick={() => onSelectType('REGULER')}
          className="luxury-card p-6 sm:p-7 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 transition duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFD1DC]/30 rounded-bl-full pointer-events-none group-hover:bg-[#FFD1DC]/50 transition" />
          
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFD1DC] flex items-center justify-center text-[#4A3B40] shadow-xs group-hover:scale-105 transition">
              <User size={28} className="text-[#B8860B]" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
                Pemesanan Perorangan
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3B40] mt-0.5">
                Customer Reguler
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#8C7A82] leading-relaxed">
              Reservasi cepat dan fleksibel tanpa perlu login akun. Akses langsung seluruh katalog resmi transparan, kustomisasi warna, dan layanan Home Service.
            </p>

            <ul className="space-y-2 text-xs text-[#4A3B40] pt-2 border-t border-[#F8BBD0]/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Katalog transparan terlihat utuh</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Pilihan warna & unggah foto desain</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Tersedia Salon Visit & Home Service</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl soft-button text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 group-hover:shadow-md transition">
              <span>Pilih Reguler</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* Card 2: MEMBER (Highlighted) */}
        <div 
          onClick={() => onSelectType('MEMBER')}
          className="luxury-card p-6 sm:p-7 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 transition duration-300 relative overflow-hidden border-[#D4AF37]/50 shadow-md bg-gradient-to-b from-[#FFFDF9] via-[#FFF8E7]/40 to-[#FFD1DC]/30"
        >
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4AF37] text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles size={11} /> Favorit VIP
            </span>
          </div>

          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F8BBD0] to-[#D4AF37]/40 flex items-center justify-center text-[#B8860B] shadow-xs group-hover:scale-105 transition">
              <Crown size={28} className="text-[#B8860B]" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
                Loyalty & Hadiah Koin
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3B40] mt-0.5">
                Member Eksklusif
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#8C7A82] leading-relaxed">
              Login aman nomor WA & kata sandi. Dapatkan koin di setiap perawatan selesai, tukar voucher diskon, dan nikmati potongan ongkir Home Service.
            </p>

            <ul className="space-y-2 text-xs text-[#4A3B40] pt-2 border-t border-[#F8BBD0]/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                <span>Koin reward otomatis setiap transaksi selesai</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                <span>Klaim voucher diskon & hadiah koin</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                <span>Diskon Home Service (tiap 200 koin = -Rp 50)</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl gold-button text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 group-hover:shadow-md transition">
              <span>Masuk / Daftar Member</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* Card 3: GABUNGAN */}
        <div 
          onClick={() => onSelectType('GABUNGAN')}
          className="luxury-card p-6 sm:p-7 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 transition duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFF8E7] rounded-bl-full pointer-events-none group-hover:bg-[#FFD1DC]/40 transition" />

          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#F8BBD0] flex items-center justify-center text-[#4A3B40] shadow-xs group-hover:scale-105 transition">
              <Users size={28} className="text-[#B8860B]" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B]">
                Rombongan Minimal 3 Orang
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3B40] mt-0.5">
                Paket Gabungan
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#8C7A82] leading-relaxed">
              Ideal untuk acara wisuda, bridal shower, arisan, atau perawatan bersama sahabat. Jadwal kalender terpadu dengan pilihan layanan mandiri per orang.
            </p>

            <ul className="space-y-2 text-xs text-[#4A3B40] pt-2 border-t border-[#F8BBD0]/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Kalender jadwal khusus rombongan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Pilih layanan & upload desain terpisah</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Koin individu tetap didapat anggota member</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl soft-button text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 group-hover:shadow-md transition">
              <span>Pilih Gabungan (Min 3 Org)</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
