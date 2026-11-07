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
  const [showLinkHub, setShowLinkHub] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const getOrigin = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  };

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const links = [
    {
      key: 'customer',
      label: 'Portal Pelanggan (B2C)',
      desc: 'Link katalog, reservasi, & status pesanan pelanggan',
      url: `${getOrigin()}/`,
      tag: 'Customer Link'
    },
    {
      key: 'owner',
      label: 'Portal Owner (B2B Admin & POS)',
      desc: 'Link kelola reservasi, katalog, keuangan, & hapus data',
      url: `${getOrigin()}/owner`,
      tag: 'Owner Link'
    },
    {
      key: 'staff',
      label: 'Portal Staf Terapis (B2B)',
      desc: 'Link presensi kehadiran harian & jadwal H-1 (tanpa kontak)',
      url: `${getOrigin()}/staff`,
      tag: 'Staff Link'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F8BBD0] shadow-2xs">
      {/* Multi-Browser Ecosystem Notice Banner */}
      <div className="bg-gradient-to-r from-[#FFF8E7] via-white to-[#FFD1DC]/40 border-b border-[#D4AF37]/30 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-[#4A3B40]">
              Mode Multi-Browser Aktif:
            </span>
            <span className="text-[#8C7A82] hidden sm:inline">
              Link terpisah untuk Pelanggan (/), Owner (/owner), dan Staf (/staff) terhubung secara real-time.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLinkHub(true)}
            className="font-bold text-[#B8860B] hover:text-[#4A3B40] underline flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Link Ekosistem (Salin Tautan)</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-white shadow-2xs">
                  OWNER (Hak Penuh)
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A82]">
                Sistem Operasional &amp; POS Internal • Login sebagai: <strong className="text-[#4A3B40]">{activeUserName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Quick Link to Customer Portal */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 py-1.5 px-3 sm:px-3.5 rounded-full text-xs font-bold text-[#4A3B40] bg-[#FFD1DC]/40 hover:bg-[#FFD1DC]/80 border border-[#F8BBD0] shadow-2xs transition hover:scale-102"
              title="Buka Halaman Utama Pelanggan (B2C)"
            >
              <span>🛍️ Portal Customer</span>
              <ExternalLink size={12} />
            </a>

            {/* Quick link to separated Staff Portal */}
            <a
              href="/staff"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFF8E7] border border-[#F8BBD0]/60 transition"
              title="Buka Portal Khusus Staf Terapis"
            >
              <span>💼 Portal Staf</span>
              <ExternalLink size={12} />
            </a>

            {/* Ecosystem Link Hub Button */}
            <button
              type="button"
              onClick={() => setShowLinkHub(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold text-[#B8860B] bg-[#FFF8E7] hover:bg-[#FFF3D1] border border-[#D4AF37]/50 shadow-2xs transition"
            >
              <ExternalLink size={13} />
              <span>Link Ekosistem</span>
            </button>

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

        {/* Link Hub Modal */}
        {showLinkHub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg bg-[#FFFDF9] rounded-2xl p-6 shadow-2xl border border-[#F8BBD0] space-y-4">
              <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF8E7] text-[#B8860B] flex items-center justify-center font-bold">
                    🔗
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#4A3B40]">
                      Link Terpisah Ekosistem Salon (Multi-Browser)
                    </h4>
                    <p className="text-xs text-[#8C7A82]">
                      Setiap peran memiliki URL tersendiri dan tetap tersinkronisasi otomatis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkHub(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {links.map((item) => (
                  <div key={item.key} className="p-3.5 rounded-xl bg-white border border-[#F8BBD0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#4A3B40] block">{item.label}</span>
                        <span className="text-[11px] text-[#8C7A82]">{item.desc}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#B8860B]">
                        {item.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={item.url}
                        className="flex-1 py-1 px-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-mono text-gray-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(item.key, item.url)}
                        className={`py-1 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          copiedKey === item.key
                            ? 'bg-emerald-600 text-white'
                            : 'gold-button'
                        }`}
                      >
                        {copiedKey === item.key ? '✓ Tersalin' : 'Salin'}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                        title="Buka Tab Baru"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#FFF8E7]/80 border border-[#D4AF37]/40 text-xs text-[#4A3B40] space-y-1">
                <p className="font-bold text-[#B8860B]">
                  💡 Cara Menguji di 2 Browser Berbeda:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-[#8C7A82]">
                  <li>Buka <strong>Browser 1 (misal Chrome / Tab Biasa)</strong> lalu buka Link Owner: <code className="text-[#4A3B40]">/owner</code>.</li>
                  <li>Buka <strong>Browser 2 (misal Chrome Incognito, Edge, atau HP)</strong> lalu buka Link Customer: <code className="text-[#4A3B40]">/</code>.</li>
                  <li>Kirim reservasi dari Browser Customer. Pesanan akan langsung muncul seketika di Browser Owner disertai bunyi bel!</li>
                </ol>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowLinkHub(false)}
                  className="py-1.5 px-4 rounded-xl gold-button text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-3 pb-1 border-t border-[#F8BBD0]/30 mt-2.5">
          <button
            type="button"
            onClick={() => onSelectTab('reservations')}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'reservations'
                ? 'gold-button shadow-2xs'
                : 'text-[#8C7A82] hover:text-[#4A3B40] hover:bg-[#FFD1DC]/20'
            }`}
          >
            Jadwal &amp; Reservasi
          </button>

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
            Manager Warna, Kode &amp; Tipe
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
            Keuangan &amp; Laporan
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
            Pengaturan Member &amp; Voucher
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
            Absensi Staf Salon
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
            Jam Buka, Tutup &amp; Istirahat
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
            Pengaturan Toko &amp; PIN
          </button>
        </nav>
      </div>
    </header>
  );
};
