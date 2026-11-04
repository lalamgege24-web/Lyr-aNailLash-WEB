import React from 'react';
import { User, Crown, Users, Sparkles, CheckCircle2, ArrowRight, Heart } from 'lucide-react';

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
          className="text-xs font-bold text-[#B8860B] hover:text-[#4A3B40] transition inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/70 hover:bg-[#FFD1DC]/40 border border-[#F8BBD0]/60 shadow-2xs"
        >
          <span>←</span>
          <span>Kembali ke Halaman Pembuka</span>
        </button>
      </div>

      {/* Title & subtitle with refined header styling */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F4] border border-[#FFCCD8]/70 text-xs font-semibold text-[#B83260]">
          <Sparkles size={13} className="text-[#D4AF37]" />
          <span>Tipe Layanan Reservasi</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3B40]">
          Selamat Datang di Lyra&apos;s Nail-Lash
        </h2>
        <p className="text-xs sm:text-sm text-[#8C7A82] leading-relaxed max-w-lg mx-auto">
          Silakan tentukan jenis reservasi sesuai kenyamanan Anda. Nikmati pelayanan personal eksklusif oleh terapis terampil kami.
        </p>
      </div>

      {/* 3 Neat, Balanced & Elegant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: REGULER */}
        <div 
          onClick={() => onSelectType('REGULER')}
          className="cute-card p-6 flex flex-col justify-between cursor-pointer group hover:border-[#D4AF37] transition duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#FFF5F7] border border-[#F8BBD0]/50 flex items-center justify-center text-[#B83260] shadow-2xs group-hover:scale-105 transition">
                <User size={22} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF8E7] border border-[#D4AF37]/30 text-[#B8860B]">
                Cepat &amp; Praktis
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#8C7A82] uppercase tracking-wider block">
                Pemesanan Perorangan
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3B40] mt-0.5 group-hover:text-[#B8860B] transition-colors">
                Customer Reguler
              </h3>
            </div>

            <p className="text-xs text-[#8C7A82] leading-relaxed min-h-[40px]">
              Reservasi langsung tanpa login akun. Pilih dari katalog transparan, kustomisasi kuku &amp; bulu mata, serta opsi Home Service.
            </p>

            <ul className="space-y-2 text-xs text-[#4A3B40] pt-3 border-t border-[#F8BBD0]/30">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Katalog harga resmi transparan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Pilih warna, tipe &amp; upload foto desain</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Kunjungan Studio atau Home Service</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl soft-button text-xs font-bold flex items-center justify-center gap-2 shadow-2xs group-hover:shadow-sm transition">
              <span>Pilih Reguler</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: MEMBER (Highlighted Loyalty) */}
        <div 
          onClick={() => onSelectType('MEMBER')}
          className="cute-card p-6 flex flex-col justify-between cursor-pointer group border-2 border-[#D4AF37]/60 shadow-md bg-gradient-to-b from-[#FFFDF9] to-[#FFF8E7]/30 hover:border-[#D4AF37] transition duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/50 flex items-center justify-center text-[#B8860B] shadow-2xs group-hover:scale-105 transition">
                <Crown size={22} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-white shadow-2xs">
                Favorit VIP
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#B8860B] uppercase tracking-wider block">
                Loyalti &amp; Hadiah Koin
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3B40] mt-0.5 group-hover:text-[#B8860B] transition-colors">
                Member Eksklusif
              </h3>
            </div>

            <p className="text-xs text-[#8C7A82] leading-relaxed min-h-[40px]">
              Login nomor WhatsApp. Dapatkan koin reward tiap treatment selesai, tukar voucher diskon spesial, dan potongan ongkir Home Service.
            </p>

            <ul className="space-y-2 text-xs text-[#4A3B40] pt-3 border-t border-[#F8BBD0]/30">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                <span>Reward koin di setiap transaksi selesai</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                <span>Klaim voucher diskon &amp; potongan harga</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0" />
                <span>Diskon ongkir Home Service (200 koin = -Rp 50)</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl gold-button text-xs font-bold flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition">
              <span>Masuk / Daftar Member</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: GABUNGAN (Bestie Party) */}
        <div 
          onClick={() => onSelectType('GABUNGAN')}
          className="cute-card p-6 flex flex-col justify-between cursor-pointer group hover:border-[#D4AF37] transition duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#FFF5F7] border border-[#F8BBD0]/50 flex items-center justify-center text-[#C2416C] shadow-2xs group-hover:scale-105 transition">
                <Users size={22} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFE4EC] text-[#9A254D]">
                Min. 3 Orang
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#8C7A82] uppercase tracking-wider block">
                Pesta Cantik Sahabat
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#4A3B40] mt-0.5 group-hover:text-[#B8860B] transition-colors">
                Paket Gabungan
              </h3>
            </div>

            <p className="text-xs text-[#8C7A82] leading-relaxed min-h-[40px]">
              Cocok untuk bridal shower, wisuda, atau arisan. Ketua tentukan jadwal &amp; lokasi, tiap anggota memilih treatment dari HP masing-masing!
            </p>

            <ul className="space-y-2 text-xs text-[#4A3B40] pt-3 border-t border-[#F8BBD0]/30">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Multi-browser: pilih layanan dari HP masing-masing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Rincian tagihan per individu tetap transparan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Anggota berstatus member tetap memperoleh koin</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <div className="w-full py-2.5 px-4 rounded-xl soft-button text-xs font-bold flex items-center justify-center gap-2 shadow-2xs group-hover:shadow-sm transition">
              <span>Buat / Gabung Kelompok</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
