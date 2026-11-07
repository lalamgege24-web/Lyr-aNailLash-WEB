import React from 'react';
import { MapPin, Instagram, MessageCircle, Search, Shield, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types/salon';

interface CustomerHeaderProps {
  settings: StoreSettings;
  onOpenStatusCheck: () => void;
  onSelectCustomerType?: (type: 'REGULER' | 'MEMBER' | 'GABUNGAN') => void;
  currentView?: string;
  onGoHome?: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  settings,
  onOpenStatusCheck,
  onGoHome
}) => {
  const [showHub, setShowHub] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F8BBD0]/60 shadow-xs">
      {/* Elegant Studio Notice Bar */}
      <div className="bg-gradient-to-r from-[#FFF5F7] via-[#FFF8E7] to-[#FFF5F7] py-1 px-4 text-center border-b border-[#F8BBD0]/35">
        <p className="text-[11px] font-medium text-[#4A3B40] tracking-wide flex items-center justify-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[#B8860B]">Studio Mall Taman Palem Lt G Blok A 30B</span>
          <span className="text-[#D4AF37]">•</span>
          <span>Tersedia Kunjungan Studio &amp; Home Service Terapis ke Rumah</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37] to-[#F8BBD0] shadow-sm group-hover:scale-105 transition-transform duration-300">
            <img
              src={settings.logoUrl}
              alt="Lyra's Nail-Lash Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#4A3B40] group-hover:text-[#B8860B] transition-colors">
                {settings.storeName}
              </span>
              <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
            </div>
            <p className="text-[11px] text-[#8C7A82] hidden sm:block font-medium">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Social Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 border-r border-[#F8BBD0]/60 pr-2 sm:pr-3">
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              title="Google Maps Lyra's Nail-Lash"
              className="p-2 rounded-full hover:bg-[#FFD1DC]/40 text-[#4A3B40] hover:text-[#B8860B] transition hover:scale-105"
            >
              <MapPin size={17} />
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              title="Instagram @lyras_naillash.id"
              className="p-2 rounded-full hover:bg-[#FFD1DC]/40 text-[#4A3B40] hover:text-[#B8860B] transition hover:scale-105"
            >
              <Instagram size={17} />
            </a>
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              title="TikTok @lyrasnaillash"
              className="p-2 rounded-full hover:bg-[#FFD1DC]/40 text-[#4A3B40] hover:text-[#B8860B] transition font-bold text-xs hover:scale-105"
            >
              <span className="font-mono">TT</span>
            </a>
            <a
              href={`https://wa.me/${settings.ownerWhatsapp.replace(/\D/g, '')}?text=Halo%20Lyra's%20Nail-Lash,%20saya%20ingin%20bertanya`}
              target="_blank"
              rel="noreferrer"
              title="WhatsApp Official"
              className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition hover:scale-105"
            >
              <MessageCircle size={17} />
            </a>
          </div>

          {/* Cek Status Reservasi Button */}
          <button
            onClick={onOpenStatusCheck}
            className="flex items-center gap-1.5 py-1.5 px-3 sm:px-4 rounded-full soft-button text-xs sm:text-sm font-bold shadow-xs hover:scale-102 transition"
          >
            <Search size={14} className="text-[#B8860B]" />
            <span>Cek Status</span>
          </button>

          {/* Internal Portal Dropdown / Link Hub */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setShowHub(!showHub)}
              title="Pilihan Portal Sistem (Owner, Staf, Pelanggan)"
              className="p-2 rounded-full text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFF8E7] border border-[#D4AF37]/40 transition flex items-center gap-1 text-xs"
            >
              <Shield size={16} className="text-[#D4AF37]" />
              <span className="hidden md:inline font-semibold text-[11px]">Portal Salon</span>
            </button>

            {showHub && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFDF9] rounded-2xl p-4 shadow-xl border border-[#F8BBD0] z-50 animate-fadeIn space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2">
                  <span className="font-serif font-bold text-xs text-[#4A3B40]">
                    Link Terpisah Ekosistem Salon
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHub(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <a
                    href="/owner"
                    className="p-2 rounded-xl bg-white hover:bg-[#FFF8E7] border border-[#F8BBD0]/60 flex items-center justify-between transition group/item"
                  >
                    <div>
                      <span className="font-bold text-[#4A3B40] block">Portal Owner (B2B)</span>
                      <span className="text-[10px] text-[#8C7A82]">Kelola Reservasi, Keuangan &amp; POS</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#B8860B] group-hover/item:translate-x-0.5 transition-transform">→</span>
                  </a>

                  <a
                    href="/staff"
                    className="p-2 rounded-xl bg-white hover:bg-[#FFF8E7] border border-[#F8BBD0]/60 flex items-center justify-between transition group/item"
                  >
                    <div>
                      <span className="font-bold text-[#4A3B40] block">Portal Staf Terapis (B2B)</span>
                      <span className="text-[10px] text-[#8C7A82]">Presensi Kehadiran &amp; Jadwal H-1</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#B8860B] group-hover/item:translate-x-0.5 transition-transform">→</span>
                  </a>

                  <div className="p-2 rounded-xl bg-[#FFF8E7]/60 border border-[#D4AF37]/30 text-[10px] text-[#8C7A82] leading-relaxed">
                    💡 Buka di browser terpisah untuk mencoba sinkronisasi multi-browser secara real-time.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
