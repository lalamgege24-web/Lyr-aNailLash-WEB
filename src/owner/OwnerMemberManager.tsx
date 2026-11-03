import React, { useState } from 'react';
import { 
  Crown, 
  Coins, 
  Ticket, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Percent, 
  Users, 
  Calendar, 
  Sparkles 
} from 'lucide-react';
import { MemberAccount, Voucher, StoreSettings } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerMemberManagerProps {
  members: MemberAccount[];
  vouchers: Voucher[];
  settings: StoreSettings;
  onRefresh: () => void;
}

export const OwnerMemberManager: React.FC<OwnerMemberManagerProps> = ({
  members,
  vouchers,
  settings,
  onRefresh
}) => {
  // Coin Reward Percentage state (e.g. 0.001%)
  const [coinPercentage, setCoinPercentage] = useState(settings.coinRewardPercentage || 0.002);
  const [savePercentageSuccess, setSavePercentageSuccess] = useState(false);

  // New Voucher Form
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vDiscountType, setVDiscountType] = useState<'PERCENT' | 'NOMINAL'>('PERCENT');
  const [vDiscountVal, setVDiscountVal] = useState(20);
  const [vCoinsReq, setVCoinsReq] = useState(300);
  const [vValidFrom, setVValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [vValidUntil, setVValidUntil] = useState('2026-12-31');
  const [vMaxClaimsQuota, setVMaxClaimsQuota] = useState<number>(50);
  const [vDisplayStartDate, setVDisplayStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [vDisplayEndDate, setVDisplayEndDate] = useState('2026-12-31');

  // Editing Voucher Modal / Drawer
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Handlers
  const handleSavePercentage = (e: React.FormEvent) => {
    e.preventDefault();
    salonStore.updateSettings({ coinRewardPercentage: Number(coinPercentage) });
    setSavePercentageSuccess(true);
    setTimeout(() => setSavePercentageSuccess(false), 2000);
    onRefresh();
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle.trim()) return;

    salonStore.addVoucher({
      title: vTitle.trim(),
      description: vDesc.trim(),
      discountType: vDiscountType,
      discountValue: Number(vDiscountVal),
      coinsRequired: Number(vCoinsReq),
      validFrom: vValidFrom,
      validUntil: vValidUntil,
      isActive: true,
      maxClaimsQuota: Number(vMaxClaimsQuota) > 0 ? Number(vMaxClaimsQuota) : undefined,
      displayStartDate: vDisplayStartDate || undefined,
      displayEndDate: vDisplayEndDate || undefined
    });

    setIsAddingVoucher(false);
    setVTitle('');
    setVDesc('');
    setVDiscountVal(20);
    setVCoinsReq(300);
    setVMaxClaimsQuota(50);
    onRefresh();
  };

  const handleUpdateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher) return;

    salonStore.updateVoucher(editingVoucher.id, {
      title: editingVoucher.title,
      description: editingVoucher.description,
      coinsRequired: Number(editingVoucher.coinsRequired),
      discountType: editingVoucher.discountType,
      discountValue: Number(editingVoucher.discountValue),
      validFrom: editingVoucher.validFrom,
      validUntil: editingVoucher.validUntil,
      isActive: editingVoucher.isActive,
      maxClaimsQuota: editingVoucher.maxClaimsQuota !== undefined ? Number(editingVoucher.maxClaimsQuota) : undefined,
      displayStartDate: editingVoucher.displayStartDate || undefined,
      displayEndDate: editingVoucher.displayEndDate || undefined
    });

    setEditingVoucher(null);
    onRefresh();
  };

  const handleDeleteVoucher = (voucherId: string) => {
    if (confirm('Yakin ingin menghapus jenis voucher ini?')) {
      salonStore.deleteVoucher(voucherId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F8BBD0] gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#4A3B40] flex items-center gap-2">
            <Crown size={24} className="text-[#D4AF37]" />
            <span>Pengaturan Member & Manajemen Voucher</span>
          </h2>
          <p className="text-xs text-[#8C7A82] mt-0.5">
            Kelola rasio konversi koin loyalty, data saldo member, serta buat dan edit jenis voucher hadiah.
          </p>
        </div>

        {/* Setting: Ubah % Total Tagihan Menjadi Koin (0,001% - 100%, presisi 0,001) */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-2">
          <form onSubmit={handleSavePercentage} className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-bold text-[#4A3B40] flex items-center gap-1.5 shrink-0">
              <Percent size={14} className="text-[#D4AF37]" />
              <span>% Reward Koin Member:</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCoinPercentage(prev => Math.max(0.001, parseFloat((prev - 0.001).toFixed(3))))}
                className="w-7 h-7 rounded-lg border border-[#F8BBD0] bg-[#FFFDF9] text-[11px] font-bold text-[#4A3B40] hover:bg-[#FFD1DC] transition flex items-center justify-center"
                title="Kurang 0,001%"
              >
                -0.001
              </button>
              <input
                type="number"
                min={0.001}
                max={100}
                step={0.001}
                value={coinPercentage}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    setCoinPercentage(parseFloat(val.toFixed(3)));
                  } else {
                    setCoinPercentage(0.001);
                  }
                }}
                className="w-24 py-1 px-2 rounded-lg border border-[#D4AF37] font-mono font-bold text-center text-xs text-[#B8860B] bg-[#FFF8E7]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
              <span className="text-xs font-bold text-[#B8860B]">%</span>
              <button
                type="button"
                onClick={() => setCoinPercentage(prev => Math.min(100, parseFloat((prev + 0.001).toFixed(3))))}
                className="w-7 h-7 rounded-lg border border-[#F8BBD0] bg-[#FFFDF9] text-[11px] font-bold text-[#4A3B40] hover:bg-[#FFD1DC] transition flex items-center justify-center"
                title="Tambah 0,001%"
              >
                +0.001
              </button>
            </div>
            
            <button
              type="submit"
              className="py-1.5 px-4 rounded-xl gold-button text-xs font-bold shadow-2xs hover:scale-102 transition"
            >
              {savePercentageSuccess ? 'Tersimpan ✓' : 'Simpan % Koin'}
            </button>
          </form>

          {/* Quick presets & Live Simulation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F8BBD0]/30 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#8C7A82] text-[10px] font-semibold">Preset:</span>
              {[0.001, 0.5, 1, 2, 5, 10, 20, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCoinPercentage(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition ${
                    coinPercentage === preset
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-[#FFF8E7] text-[#8C7A82] hover:bg-[#FFD1DC]/60'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            <div className="text-[11px] text-[#4A3B40] bg-[#FFF8E7] px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 flex items-center gap-1 font-medium">
              <Coins size={12} className="text-[#D4AF37]" />
              <span>
                Simulasi Tagihan Rp 100.000 &rarr; Member dapat{' '}
                <strong className="text-[#B8860B] font-mono">
                  {Math.round((100000 * coinPercentage) / 100).toLocaleString('id-ID')}
                </strong>{' '}
                Koin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Member Accounts Table */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base text-[#4A3B40]">
              Daftar Member Terdaftar ({members.length} Akun)
            </h3>
          </div>
          <span className="text-xs text-[#8C7A82]">
            Data Real-Time Terhubung Cloud
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4A3B40]">
            <thead className="bg-[#FFF8E7] text-[#8C7A82] uppercase text-[10px] tracking-wider border-b border-[#F8BBD0]/40">
              <tr>
                <th className="py-2.5 px-3">Nama Member</th>
                <th className="py-2.5 px-3">Nomor WhatsApp</th>
                <th className="py-2.5 px-3">Jumlah Koin</th>
                <th className="py-2.5 px-3">Voucher Dimiliki</th>
                <th className="py-2.5 px-3">Total Treatment</th>
                <th className="py-2.5 px-3">Tanggal Bergabung</th>
                <th className="py-2.5 px-3">Status Google Maps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((mem) => (
                <tr key={mem.id} className="hover:bg-[#FFFDF9] transition">
                  <td className="py-3 px-3 font-semibold text-[#4A3B40]">
                    {mem.fullName}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#8C7A82]">
                    {mem.whatsapp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[#B8860B] bg-[#FFF8E7] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                      <Coins size={12} />
                      <span>{mem.coins} Koin</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {mem.claimedVoucherIds?.length || 0} Voucher
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    {mem.totalCompletedTreatments || 0}x
                  </td>
                  <td className="py-3 px-3 text-[#8C7A82]">
                    {mem.joinDate}
                  </td>
                  <td className="py-3 px-3">
                    {mem.hasRatedGoogleMaps ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        ⭐ Bintang 5 Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8C7A82]">Belum review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Voucher Management (Add, Delete, Edit coins, period, status, usage stats) */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/40 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F8BBD0] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Ticket size={18} className="text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-lg text-[#4A3B40]">
                Manajemen Voucher Diskon & Hadiah Koin
              </h3>
            </div>
            <p className="text-xs text-[#8C7A82]">
              Atur jenis voucher, koin klaim, masa aktif, dan pantau jumlah penggunaan voucher oleh pelanggan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingVoucher(!isAddingVoucher)}
            className="py-2 px-4 rounded-xl gold-button text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus size={14} />
            <span>Tambah Jenis Voucher Baru</span>
          </button>
        </div>

        {/* Add Voucher Form */}
        {isAddingVoucher && (
          <form onSubmit={handleCreateVoucher} className="p-4 rounded-xl bg-[#FFF8E7] border border-[#D4AF37] space-y-3 animate-fadeIn text-xs">
            <span className="font-serif font-bold text-sm text-[#4A3B40] block">
              Formulir Tambah Voucher Baru:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Judul / Nama Voucher:</label>
                <input
                  type="text"
                  required
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  placeholder="Contoh: Diskon Kemerdekaan 25%..."
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Singkat:</label>
                <input
                  type="text"
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  placeholder="Potongan harga untuk treatment eyelash..."
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Tipe Diskon:</label>
                <select
                  value={vDiscountType}
                  onChange={(e) => setVDiscountType(e.target.value as any)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white"
                >
                  <option value="PERCENT">Persentase (%)</option>
                  <option value="NOMINAL">Nominal Tunai (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nilai Potongan ({vDiscountType === 'PERCENT' ? '%' : 'Rp'}):</label>
                <input
                  type="number"
                  required
                  value={vDiscountVal}
                  onChange={(e) => setVDiscountVal(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Koin Dibutuhkan:</label>
                <input
                  type="number"
                  required
                  value={vCoinsReq}
                  onChange={(e) => setVCoinsReq(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Berlaku Sampai Tanggal:</label>
                <input
                  type="date"
                  required
                  value={vValidUntil}
                  onChange={(e) => setVValidUntil(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white"
                />
              </div>
            </div>

            {/* Quota Limit & Scheduled Display for Customer Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#FFF8E7]/40 border border-[#D4AF37]/30">
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Limit Kuota Diklaim (0 = Tak Terbatas):</label>
                <input
                  type="number"
                  min={0}
                  value={vMaxClaimsQuota}
                  onChange={(e) => setVMaxClaimsQuota(Number(e.target.value))}
                  placeholder="Contoh: 50 kali klaim..."
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Mulai Tampil di Customer Dashboard:</label>
                <input
                  type="date"
                  value={vDisplayStartDate}
                  onChange={(e) => setVDisplayStartDate(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Berakhir Tampil di Customer Dashboard:</label>
                <input
                  type="date"
                  value={vDisplayEndDate}
                  onChange={(e) => setVDisplayEndDate(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingVoucher(false)}
                className="py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-lg gold-button text-xs font-bold"
              >
                Simpan Voucher
              </button>
            </div>
          </form>
        )}

        {/* Voucher Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <div 
              key={voucher.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                voucher.isActive ? 'border-[#D4AF37]/40 bg-white shadow-2xs' : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                    {voucher.title}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    voucher.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {voucher.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-xs text-[#8C7A82] mt-1 leading-relaxed">
                  {voucher.description}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-[#FFF8E7]/50 border border-[#D4AF37]/20 space-y-1.5 text-[11px] text-[#4A3B40]">
                  <div className="flex justify-between">
                    <span>Koin untuk Klaim:</span>
                    <strong className="text-[#B8860B] font-mono">{voucher.coinsRequired} Koin</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Masa Berlaku Voucher:</span>
                    <span className="font-mono">{voucher.validFrom} s/d {voucher.validUntil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limit Kuota Klaim:</span>
                    <span className="font-mono font-semibold text-purple-800">
                      {voucher.maxClaimsQuota ? `${voucher.totalClaimedCount || 0} / ${voucher.maxClaimsQuota} kuota` : 'Tanpa Batas'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tampil di Customer:</span>
                    <span className="font-mono text-[10px] text-[#8C7A82]">
                      {voucher.displayStartDate || 'Langsung'} s/d {voucher.displayEndDate || 'Seterusnya'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#F8BBD0]/30 font-semibold">
                    <span>Statistik Penggunaan:</span>
                    <span className="text-[#B8860B] font-mono">
                      {voucher.totalUsedCount} digunakan / {voucher.totalClaimedCount} diklaim
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingVoucher(voucher)}
                  className="py-1 px-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1 text-gray-700"
                >
                  <Edit3 size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVoucher(voucher.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                  title="Hapus Voucher"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Voucher Modal */}
      {editingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#FFFDF9] rounded-2xl p-6 shadow-2xl border border-[#F8BBD0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2">
              <h4 className="font-serif font-bold text-base text-[#4A3B40]">
                Edit Voucher: {editingVoucher.title}
              </h4>
              <button
                type="button"
                onClick={() => setEditingVoucher(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Voucher:</label>
                <input
                  type="text"
                  required
                  value={editingVoucher.title}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, title: e.target.value })}
                  className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Koin Dibutuhkan:</label>
                  <input
                    type="number"
                    required
                    value={editingVoucher.coinsRequired}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, coinsRequired: Number(e.target.value) })}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Voucher:</label>
                  <select
                    value={editingVoucher.isActive ? 'ACTIVE' : 'INACTIVE'}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, isActive: e.target.value === 'ACTIVE' })}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-semibold"
                  >
                    <option value="ACTIVE">Aktif (Bisa Diklaim)</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Mulai Berlaku:</label>
                  <input
                    type="date"
                    required
                    value={editingVoucher.validFrom}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, validFrom: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Berakhir Pada:</label>
                  <input
                    type="date"
                    required
                    value={editingVoucher.validUntil}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, validUntil: e.target.value })}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 rounded-xl bg-[#FFF8E7]/50 border border-[#D4AF37]/30">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Limit Kuota Klaim:</label>
                  <input
                    type="number"
                    min={0}
                    value={editingVoucher.maxClaimsQuota ?? ''}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, maxClaimsQuota: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0 = Tak terbatas"
                    className="w-full py-1.5 px-2 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Mulai Tampil di Customer:</label>
                  <input
                    type="date"
                    value={editingVoucher.displayStartDate ?? ''}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, displayStartDate: e.target.value || undefined })}
                    className="w-full py-1.5 px-2 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Berakhir Tampil di Customer:</label>
                  <input
                    type="date"
                    value={editingVoucher.displayEndDate ?? ''}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, displayEndDate: e.target.value || undefined })}
                    className="w-full py-1.5 px-2 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVoucher(null)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg gold-button font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
