import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Instagram, ArrowRight, Heart, Star } from 'lucide-react';
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
        background: 'linear-gradient(150deg, #FFFDF9 0%, #FFF5F7 35%, #FFE8EE 70%, #FFD1DC 100%)'
      }}
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-[#FFD1DC]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#F8BBD0]/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-white/40 blur-2xl pointer-events-none" />

      {/* Top Bar on Splash Screen */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-5xl mx-auto px-5 sm:px-6 py-5 flex items-center justify-between z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#FFD1DC]/70 shadow-xs text-xs font-semibold text-[#4A3B40]">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span className="tracking-wide">Official Beauty Studio &amp; Home Service</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={settings.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            title="Google Maps"
            className="p-2 sm:p-2.5 rounded-full bg-white/80 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] shadow-xs border border-[#F8BBD0]/40 transition hover:scale-105"
          >
            <MapPin size={16} />
          </a>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            title="Instagram"
            className="p-2 sm:p-2.5 rounded-full bg-white/80 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] shadow-xs border border-[#F8BBD0]/40 transition hover:scale-105"
          >
            <Instagram size={16} />
          </a>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noreferrer"
            title="TikTok"
            className="p-2 sm:p-2.5 rounded-full bg-white/80 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] shadow-xs border border-[#F8BBD0]/40 transition font-bold text-xs hover:scale-105"
          >
            TT
          </a>
          <button
            onClick={onOpenStatusCheck}
            className="text-xs font-bold px-3.5 sm:px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#4A3B40] hover:text-[#B8860B] border border-[#FFD1DC] shadow-xs transition hover:scale-102 flex items-center gap-1.5"
          >
            <span>Cek Status</span>
          </button>
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto my-auto z-10 space-y-6 animate-fadeIn py-6">
        {/* Elegant Store Logo */}
        <div className="relative">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37]/50 to-[#F8BBD0] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-inner bg-white">
              <img
                src={settings.logoUrl}
                alt="Lyra's Nail-Lash Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Nama Toko & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#FFD1DC]/80 text-[11px] font-bold text-[#B8860B] tracking-wider uppercase shadow-2xs">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span>Premium Nail &amp; Lash Artistry</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#4A3B40]">
            {settings.storeName}
          </h1>
          <p className="text-sm sm:text-base font-normal text-[#8C7A82] tracking-wide">
            {settings.tagline}
          </p>
        </div>

        {/* Quotes Pilihan Elegan */}
        <div className="max-w-lg bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-[#FFD1DC] shadow-sm transition hover:border-[#D4AF37]/40 relative">
          <div className="flex justify-center items-center gap-1 mb-2 text-[#D4AF37]">
            <Heart size={15} fill="#F8BBD0" stroke="#D4AF37" />
          </div>
          <p className="font-serif italic text-sm sm:text-base text-[#4A3B40] leading-relaxed">
            &ldquo;{CUTE_QUOTES[currentQuoteIndex]}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-[#FFD1DC]/30">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#B8860B] font-semibold">
              Lyra&apos;s Beauty Philosophy
            </span>
          </div>
        </div>

        {/* Interactive Tap Hint with Elegant Button */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2.5 py-3 px-8 sm:px-10 rounded-full gold-button text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition transform active:scale-95">
            <span>Mulai Reservasi</span>
            <ArrowRight size={17} />
          </div>
          <p className="text-[11px] text-[#8C7A82] mt-2.5">
            Sentuh di mana saja untuk melihat katalog dan jadwal
          </p>
        </div>
      </div>

      {/* Footer info with real address */}
      <div className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A82] border-t border-[#F8BBD0]/30 z-10 gap-1.5">
        <p>© 2026 {settings.storeName}. All rights reserved.</p>
        <p className="font-medium text-[#4A3B40]">
          📍 {settings.storeAddress}
        </p>
      </div>
    </div>
  );
};
