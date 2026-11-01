import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Instagram, ArrowRight, Heart } from 'lucide-react';
import { StoreSettings } from '../types/salon';
import { CUTE_QUOTES } from '../data/initialData';

interface SplashScreenProps {
  settings: StoreSettings;
  onEnter: () => void;
  onOpenStatusCheck: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  settings,
  onEnter,
  onOpenStatusCheck
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Pick random initial quote
    setCurrentQuoteIndex(Math.floor(Math.random() * CUTE_QUOTES.length));
  }, []);

  return (
    <div 
      onClick={onEnter}
      className="min-h-screen w-full relative flex flex-col justify-between items-center cursor-pointer select-none overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #FFFDF9 0%, #FFF8E7 40%, #FFD1DC 85%, #F8BBD0 100%)'
      }}
    >
      {/* Decorative background blurs & glow */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FFD1DC]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#F8BBD0]/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/40 blur-2xl pointer-events-none" />

      {/* Top Bar on Splash Screen */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-[#8C7A82] tracking-wider uppercase">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Official Beauty Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={settings.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            title="Google Maps"
            className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] shadow-xs border border-[#F8BBD0]/50 transition"
          >
            <MapPin size={18} />
          </a>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            title="Instagram"
            className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] shadow-xs border border-[#F8BBD0]/50 transition"
          >
            <Instagram size={18} />
          </a>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            title="TikTok"
            className="p-2.5 rounded-full bg-white/70 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] shadow-xs border border-[#F8BBD0]/50 transition font-bold text-xs"
          >
            TT
          </a>
          <button
            onClick={onOpenStatusCheck}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-white/80 hover:bg-white text-[#4A3B40] border border-[#F8BBD0] shadow-xs transition"
          >
            Cek Status Reservasi
          </button>
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto my-auto z-10 space-y-6 animate-fadeIn">
        {/* Bulat Logo Toko */}
        <div className="relative group">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37] to-[#F8BBD0] shadow-xl group-hover:scale-105 transition duration-500">
            <img
              src={settings.logoUrl}
              alt="Lyra's Nail-Lash Logo"
              className="w-full h-full object-cover rounded-full shadow-inner"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-[#F8BBD0] text-[#D4AF37]">
            <Sparkles size={20} />
          </div>
        </div>

        {/* Nama Toko */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#4A3B40]">
            {settings.storeName}
          </h1>
          <p className="text-sm sm:text-base font-light text-[#8C7A82] tracking-wide">
            {settings.tagline}
          </p>
        </div>

        {/* Quotes Pilihan */}
        <div className="max-w-lg bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-[#F8BBD0]/60 shadow-sm transition hover:bg-white/80">
          <div className="flex justify-center mb-2 text-[#D4AF37]">
            <Heart size={18} fill="#F8BBD0" stroke="#D4AF37" />
          </div>
          <p className="font-serif italic text-sm sm:text-base text-[#4A3B40] leading-relaxed">
            &ldquo;{CUTE_QUOTES[currentQuoteIndex]}&rdquo;
          </p>
          <span className="block text-[11px] font-sans uppercase tracking-widest text-[#B8860B] mt-2 font-medium">
            Lyra&apos;s Beauty Philosophy
          </span>
        </div>

        {/* Interactive Tap Hint */}
        <div className="pt-4">
          <div className="inline-flex items-center gap-3 py-3 px-8 rounded-full gold-button text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition transform">
            <span>Ketuk Layar untuk Mulai Reservasi</span>
            <ArrowRight size={18} />
          </div>
          <p className="text-[12px] text-[#8C7A82] mt-3">
            Sentuh di mana saja untuk memilih layanan kecantikan impian Anda
          </p>
        </div>
      </div>

      {/* Footer info (Strict rule: ABSOLUTELY NO OWNER/STAFF PIN DISPLAYED) */}
      <div className="w-full max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A82] border-t border-[#F8BBD0]/40 z-10 gap-2">
        <p>© 2026 {settings.storeName}. All rights reserved.</p>
        <p className="font-light">
          Sanitized & Luxury Studio • Kebayoran Baru, Jakarta Selatan
        </p>
      </div>
    </div>
  );
};
