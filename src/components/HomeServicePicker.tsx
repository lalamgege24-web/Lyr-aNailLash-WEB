import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Search, Check, Info, Home, Building2 } from 'lucide-react';
import { LocationDetail } from '../types/salon';
import {
  PROVINCES_34,
  REGION_HIERARCHY,
  calculateStoreDistance,
  searchIndonesianRegions
} from '../data/indonesiaRegions';

interface HomeServicePickerProps {
  value: LocationDetail;
  onChange: (location: LocationDetail) => void;
  memberCoins?: number; // Member can use coins for discount: 200 coins = -Rp 50
  allowCoinDiscount?: boolean;
}

export const HomeServicePicker: React.FC<HomeServicePickerProps> = ({
  value,
  onChange,
  memberCoins = 0,
  allowCoinDiscount = false
}) => {
  const [isHomeService, setIsHomeService] = useState(value.isHomeService);
  const [selectedProvince, setSelectedProvince] = useState(value.province || 'DKI Jakarta');
  const [selectedRegency, setSelectedRegency] = useState(value.regency || 'Jakarta Selatan');
  const [selectedDistrict, setSelectedDistrict] = useState(value.district || 'Kebayoran Baru');
  const [selectedVillage, setSelectedVillage] = useState(value.village || 'Senayan');
  const [streetAddress, setStreetAddress] = useState(value.streetAddress || '');
  const [rtRw, setRtRw] = useState(value.rtRw || '');
  const [notes, setNotes] = useState(value.notes || '');

  // Search by typing
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchIndonesianRegions>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Coin discount toggle
  const [useCoinDiscount, setUseCoinDiscount] = useState(false);

  // Available regencies for chosen province
  const availableRegencies = useMemo(() => {
    return REGION_HIERARCHY[selectedProvince] ? Object.keys(REGION_HIERARCHY[selectedProvince]) : [];
  }, [selectedProvince]);

  // Available districts for chosen regency
  const availableDistricts = useMemo(() => {
    if (!REGION_HIERARCHY[selectedProvince] || !REGION_HIERARCHY[selectedProvince][selectedRegency]) return [];
    return Object.keys(REGION_HIERARCHY[selectedProvince][selectedRegency]);
  }, [selectedProvince, selectedRegency]);

  // Available villages for chosen district
  const availableVillages = useMemo(() => {
    if (!REGION_HIERARCHY[selectedProvince] || !REGION_HIERARCHY[selectedProvince][selectedRegency] || !REGION_HIERARCHY[selectedProvince][selectedRegency][selectedDistrict]) return [];
    return REGION_HIERARCHY[selectedProvince][selectedRegency][selectedDistrict];
  }, [selectedProvince, selectedRegency, selectedDistrict]);

  // Quick typed search
  useEffect(() => {
    if (quickSearchQuery.trim().length >= 2) {
      const hits = searchIndonesianRegions(quickSearchQuery, 8);
      setSearchResults(hits);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [quickSearchQuery]);

  // Handle cascade updates
  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const regKeys = REGION_HIERARCHY[prov] ? Object.keys(REGION_HIERARCHY[prov]) : [];
    const firstReg = regKeys[0] || '';
    setSelectedRegency(firstReg);

    const distKeys = firstReg && REGION_HIERARCHY[prov][firstReg] ? Object.keys(REGION_HIERARCHY[prov][firstReg]) : [];
    const firstDist = distKeys[0] || '';
    setSelectedDistrict(firstDist);

    const vilKeys = firstDist && REGION_HIERARCHY[prov][firstReg][firstDist] ? REGION_HIERARCHY[prov][firstReg][firstDist] : [];
    setSelectedVillage(vilKeys[0] || '');
  };

  const handleRegencyChange = (reg: string) => {
    setSelectedRegency(reg);
    const distKeys = REGION_HIERARCHY[selectedProvince]?.[reg] ? Object.keys(REGION_HIERARCHY[selectedProvince][reg]) : [];
    const firstDist = distKeys[0] || '';
    setSelectedDistrict(firstDist);

    const vilKeys = firstDist && REGION_HIERARCHY[selectedProvince][reg][firstDist] ? REGION_HIERARCHY[selectedProvince][reg][firstDist] : [];
    setSelectedVillage(vilKeys[0] || '');
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    const vilKeys = REGION_HIERARCHY[selectedProvince]?.[selectedRegency]?.[dist] || [];
    setSelectedVillage(vilKeys[0] || '');
  };

  const handleSelectQuickResult = (item: { province: string; regency: string; district: string; village: string }) => {
    setSelectedProvince(item.province);
    setSelectedRegency(item.regency);
    setSelectedDistrict(item.district);
    setSelectedVillage(item.village);
    setQuickSearchQuery('');
    setIsSearching(false);
  };

  // Recalculate price and distance whenever dependencies change
  useEffect(() => {
    if (!isHomeService) {
      onChange({
        isHomeService: false,
        province: 'DKI Jakarta',
        regency: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        village: 'Senayan',
        streetAddress: 'Studio Lyra’s Nail-Lash (Kunjungan Salon)',
        rtRw: '',
        notes: '',
        calculatedDistanceKm: 0,
        baseDeliveryFee: 0,
        additional5KmFee: 0,
        coinDiscountAmount: 0,
        totalDeliveryFee: 0
      });
      return;
    }

    const distanceCalc = calculateStoreDistance({
      province: selectedProvince,
      regency: selectedRegency,
      district: selectedDistrict,
      village: selectedVillage,
      useLongestRoute: true
    });

    // Coin discount calculation: 200 coins = -Rp 50
    let coinDiscountAmount = 0;
    if (allowCoinDiscount && useCoinDiscount && memberCoins >= 200) {
      const unitsOf200 = Math.floor(memberCoins / 200);
      coinDiscountAmount = unitsOf200 * 50;
      if (coinDiscountAmount > distanceCalc.totalDeliveryFee) {
        coinDiscountAmount = distanceCalc.totalDeliveryFee;
      }
    }

    const finalDeliveryFee = Math.max(0, distanceCalc.totalDeliveryFee - coinDiscountAmount);

    onChange({
      isHomeService: true,
      province: selectedProvince,
      regency: selectedRegency,
      district: selectedDistrict,
      village: selectedVillage,
      streetAddress,
      rtRw,
      notes,
      calculatedDistanceKm: distanceCalc.distanceKm,
      baseDeliveryFee: distanceCalc.baseDeliveryFee,
      additional5KmFee: distanceCalc.additional5KmFee,
      coinDiscountAmount,
      totalDeliveryFee: finalDeliveryFee
    });
  }, [
    isHomeService,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
    selectedVillage,
    streetAddress,
    rtRw,
    notes,
    useCoinDiscount,
    memberCoins,
    allowCoinDiscount
  ]);

  const currentDistResult = useMemo(() => {
    return calculateStoreDistance({
      province: selectedProvince,
      regency: selectedRegency,
      district: selectedDistrict,
      village: selectedVillage,
      useLongestRoute: true
    });
  }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage]);

  return (
    <div className="luxury-card p-5 sm:p-6 space-y-6">
      {/* Radio Switch: Salon Visit vs Home Service */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-serif text-lg font-bold text-[#4A3B40] flex items-center gap-2">
            <MapPin size={20} className="text-[#D4AF37]" />
            <span>Lokasi Pelaksanaan Perawatan</span>
          </label>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFD1DC]/60 text-[#B8860B] font-semibold">
            {isHomeService ? 'Home Service Terpilih' : 'Datang ke Studio'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsHomeService(false)}
            className={`p-4 rounded-xl text-left border transition flex items-start gap-3 ${
              !isHomeService
                ? 'gold-border-active bg-[#FFF8E7]/60'
                : 'border-[#F8BBD0]/50 bg-white hover:bg-[#FFFDF9]'
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${!isHomeService ? 'bg-[#D4AF37] text-white' : 'bg-[#FFD1DC]/40 text-[#4A3B40]'}`}>
              <Building2 size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#4A3B40] flex items-center gap-1.5">
                <span>Datang ke Studio Lyra</span>
                {!isHomeService && <Check size={16} className="text-[#D4AF37]" />}
              </div>
              <p className="text-xs text-[#8C7A82] mt-0.5">
                Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan. Gratis tanpa biaya transport.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsHomeService(true)}
            className={`p-4 rounded-xl text-left border transition flex items-start gap-3 ${
              isHomeService
                ? 'gold-border-active bg-[#FFF8E7]/60'
                : 'border-[#F8BBD0]/50 bg-white hover:bg-[#FFFDF9]'
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${isHomeService ? 'bg-[#D4AF37] text-white' : 'bg-[#FFD1DC]/40 text-[#4A3B40]'}`}>
              <Home size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm text-[#4A3B40] flex items-center gap-1.5">
                <span>Home Service (Terapis ke Rumah)</span>
                {isHomeService && <Check size={16} className="text-[#D4AF37]" />}
              </div>
              <p className="text-xs text-[#8C7A82] mt-0.5">
                Terapis datang membawa peralatan lengkap & higienis. Tarif jarak dihitung otomatis.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Expanded Home Service Hierarchy & Distance Calculator */}
      {isHomeService && (
        <div className="space-y-5 pt-3 border-t border-[#F8BBD0]/50 animate-fadeIn">
          {/* Quick Typed Search Bar */}
          <div className="relative">
            <label className="block text-xs font-semibold text-[#4A3B40] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Search size={14} className="text-[#D4AF37]" />
                Cari Cepat Lokasi (Ketik Kelurahan / Kecamatan / Kota):
              </span>
              <span className="text-[11px] text-[#8C7A82] font-normal">
                Bisa dicari via ketikan langsung
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Contoh: Senayan, Cilandak, Menteng, Pasteur, Caturtunggal..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 shadow-2xs"
              />
              <Search size={16} className="absolute left-3 top-3 text-[#8C7A82]" />
            </div>

            {/* Quick search dropdown results */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl shadow-xl border border-[#F8BBD0] max-h-56 overflow-y-auto divide-y divide-[#F8BBD0]/30">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickResult(item)}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-[#FFF8E7] flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-bold text-[#4A3B40]">{item.village}</span>, {item.district}, {item.regency}
                      <span className="block text-[10px] text-[#8C7A82]">{item.province}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#B8860B] bg-[#FFD1DC]/40 px-2 py-0.5 rounded-full">
                      ~{item.estimatedDistanceKm} km
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4-Level Strict Cascading Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Provinsi (34 Provinsi) */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                1. Provinsi:
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
              >
                {PROVINCES_34.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Kabupaten / Kota */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                2. Kab / Kota:
              </label>
              <select
                value={selectedRegency}
                onChange={(e) => handleRegencyChange(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
              >
                {availableRegencies.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Kecamatan */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                3. Kecamatan:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
              >
                {availableDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Kelurahan */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                4. Kelurahan:
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
              >
                {availableVillages.map((vil) => (
                  <option key={vil} value={vil}>
                    {vil}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Street Address & RT/RW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                Nama Jalan, Blok, Nomor Rumah / Patokan: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Contoh: Jl. Kemang Raya No. 12, Pagar Putih Sebelah Kafe"
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                RT / RW (Opsional):
              </label>
              <input
                type="text"
                value={rtRw}
                onChange={(e) => setRtRw(e.target.value)}
                placeholder="Contoh: RT 03 / RW 05"
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
              />
            </div>
          </div>

          {/* Member Coin Discount Option for Home Service */}
          {allowCoinDiscount && memberCoins >= 200 && (
            <div className="bg-[#FFF8E7] border border-[#D4AF37]/40 p-3 rounded-xl flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold text-[#4A3B40] block">
                  Tukarkan Koin untuk Diskon Ongkir Home Service!
                </span>
                <span className="text-[#8C7A82]">
                  Anda punya <strong>{memberCoins} koin</strong>. Setiap 200 koin memotong Rp 50 ongkir.
                  (Potongan maksimal: Rp {Math.floor(memberCoins / 200) * 50})
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={useCoinDiscount}
                  onChange={(e) => setUseCoinDiscount(e.target.checked)}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-4 w-4"
                />
                <span className="text-xs font-bold text-[#B8860B]">Gunakan Koin</span>
              </label>
            </div>
          )}

          {/* Google Maps Distance & Detailed Price Breakdown Box */}
          <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FFF8E7]/50 to-[#FFD1DC]/30 border border-[#D4AF37]/40 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D4AF37]/20 gap-2">
              <div className="flex items-center gap-2 text-[#B8860B]">
                <Navigation size={18} />
                <span className="font-serif font-bold text-sm sm:text-base text-[#4A3B40]">
                  Kalkulasi Jarak & Tarif Google Maps
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D4AF37]/40 text-xs font-semibold text-[#4A3B40] shadow-2xs">
                <span>Jarak Antar Toko & Customer:</span>
                <strong className="text-[#B8860B] font-mono text-sm">{currentDistResult.distanceKm} km</strong>
              </div>
            </div>

            {/* Formula Explanation & Breakdown Items */}
            <div className="space-y-2 text-xs text-[#4A3B40]">
              <div className="flex items-center justify-between">
                <span className="text-[#8C7A82]">
                  Sistem Pulang-Pergi (Jarak x 2):
                </span>
                <span className="font-mono">{currentDistResult.distanceKm} km × 2 = {(currentDistResult.distanceKm * 2).toFixed(1)} km</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Tarif Dasar ({currentDistResult.distanceKm} km × 2 × Rp 2.851):</span>
                <span className="font-mono font-medium">Rp {currentDistResult.baseDeliveryFee.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  Biaya Tambahan per kenaikan 5 km (+Rp 800 / 5km):
                  <Info size={12} className="text-[#8C7A82]" />
                </span>
                <span className="font-mono font-medium">
                  {currentDistResult.additional5KmFee > 0 ? `+Rp ${currentDistResult.additional5KmFee.toLocaleString('id-ID')}` : 'Rp 0'}
                </span>
              </div>

              {useCoinDiscount && memberCoins >= 200 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Diskon Koin Member:</span>
                  <span className="font-mono font-semibold">-Rp {(Math.floor(memberCoins / 200) * 50).toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/30 text-sm font-bold text-[#4A3B40]">
                <span>Total Tarif Home Service:</span>
                <span className="font-mono text-[#B8860B] text-base">
                  Rp {Math.max(0, currentDistResult.totalDeliveryFee - (useCoinDiscount ? Math.floor(memberCoins / 200) * 50 : 0)).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C7A82] italic leading-tight pt-1">
              * Dihitung otomatis menggunakan algoritma Google Maps rute terpanjang/teraman untuk menjamin keamanan perjalanan terapis dan ketepatan waktu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
