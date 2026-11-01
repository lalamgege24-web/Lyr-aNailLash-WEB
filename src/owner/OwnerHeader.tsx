import React from 'react';
import { 
  Sparkles, 
  LogOut, 
  UserCheck, 
  Shield, 
  ExternalLink 
} from 'lucide-react';
import { StoreSettings } from '../types/salon';

interface OwnerHeaderProps {
  settings: StoreSettings;
  currentRole: 'OWNER' | 'STAFF' | null;
  activeUserName: string;
  onLogout: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  settings,
  currentRole,
  activeUserName,
  onLogout,
  activeTab,
  onSelectTab
}) => {
  const isOwner = currentRole === 'OWNER';

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F8BBD0] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row: Brand & Session info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#FFD1DC] via-[#D4AF37] to-[#F8BBD0] shadow-xs">
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#4A3B40]">
                  {settings.storeName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOwner ? 'bg-[#D4AF37] text-white' : 'bg-[#FFD1DC] text-[#4A3B40]'
                }`}>
                  {isOwner ? 'OWNER (Hak Penuh)' : 'STAF SALON'}
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A82]">
                Sistem Operasional & POS Internal • Login sebagai: <strong className="text-[#4A3B40]">{activeUserName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Link to Customer Portal */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFF8E7] border border-[#F8BBD0]/50 transition"
            >
              <span>Portal Customer</span>
              <ExternalLink size={12} />
            </a>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-3 pb-1 border-t border-[#F8BBD0]/30 mt-2.5">
          {/* Tabs available for Staf & Owner */}
          <button
            type="button"
            onClick={() => onSelectTab('reservations')}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'reservations'
                ? 'gold-button shadow-2xs'
                : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
            }`}
          >
            Jadwal & Reservasi
          </button>

          {/* Owner Only Tabs */}
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('catalog')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'catalog'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Katalog Bertingkat
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('assets')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'assets'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Manager Warna, Kode & Tipe
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('finance')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'finance'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Keuangan & Laporan
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('members')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'members'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Pengaturan Member & Voucher
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('attendance')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'attendance'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Absensi Staf
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('schedule')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'schedule'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Jam Buka, Tutup & Istirahat
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('settings')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'settings'
                    ? 'gold-button shadow-2xs'
                    : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
                }`}
              >
                Pengaturan Toko & PIN
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
