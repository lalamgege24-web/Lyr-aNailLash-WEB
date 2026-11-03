import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Search, Check, Info, Home, Building2, Globe, Loader2, Edit3 } from 'lucide-react';
import { LocationDetail, StoreSettings } from '../types/salon';
import {
  calculateStoreDistance,
  searchIndonesianRegions
} from '../data/indonesiaRegions';
import { salonStore } from '../services/store';
import { IndonesiaWilayahService, WilayahItem } from '../services/indonesiaWilayahService';

interface HomeServicePickerProps {
  value: LocationDetail;
  onChange: (location: LocationDetail) => void;
  memberCoins?: number; // Member can use coins for discount: 200 coins = -Rp 50
  allowCoinDiscount?: boolean;
  settings?: StoreSettings;
}

export const HomeServicePicker: React.FC<HomeServicePickerProps> = ({
  value,
  onChange,
  memberCoins = 0,
  allowCoinDiscount = false,
  settings
}) => {
  const [internalSettings, setInternalSettings] = useState<StoreSettings>(() => settings || salonStore.getSettings());

  useEffect(() => {
    if (settings) {
      setInternalSettings(settings);
    } else {
      const unsub = salonStore.subscribe(() => {
        setInternalSettings(salonStore.getSettings());
      });
      return () => unsub();
    }
  }, [settings]);

  const activeSettings = settings || internalSettings;

  const [isHomeService, setIsHomeService] = useState(value.isHomeService);
  const [selectedProvince, setSelectedProvince] = useState(value.province || 'DKI Jakarta');
  const [selectedRegency, setSelectedRegency] = useState(value.regency || 'Jakarta Barat');
  const [selectedDistrict, setSelectedDistrict] = useState(value.district || 'Cengkareng');
  const [selectedVillage, setSelectedVillage] = useState(value.village || 'Cengkareng Timur');
  const [streetAddress, setStreetAddress] = useState(value.streetAddress || '');
  const [rtRw, setRtRw] = useState(value.rtRw || '');
  const [notes, setNotes] = useState(value.notes || '');

  // Asynchronous lists for districts and villages
  const [districtsList, setDistrictsList] = useState<WilayahItem[]>([]);
  const [villagesList, setVillagesList] = useState<WilayahItem[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Manual typing mode fallback
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);
  const [customDistrictText, setCustomDistrictText] = useState('');
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [customVillageText, setCustomVillageText] = useState('');

  // Search by typing
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchIndonesianRegions>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Coin discount toggle
  const [useCoinDiscount, setUseCoinDiscount] = useState(false);

  // All 34 Provinces from Kemendagri
  const allProvinces = useMemo(() => {
    return IndonesiaWilayahService.getProvinces();
  }, []);

  // All 514 Regencies/Cities for chosen province
  const availableRegencies = useMemo(() => {
    return IndonesiaWilayahService.getRegencies(selectedProvince);
  }, [selectedProvince]);

  // Load official Kemendagri Districts when Province or Regency changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingDistricts(true);

    IndonesiaWilayahService.getDistricts(selectedProvince, selectedRegency)
      .then((dists) => {
        if (isCancelled) return;
        setDistrictsList(dists);
        setIsLoadingDistricts(false);

        // Retain or select first district
        const existing = dists.find(
          d => d.name.toLowerCase() === selectedDistrict.toLowerCase()
        );
        if (!existing && dists.length > 0 && !isCustomDistrict) {
          setSelectedDistrict(dists[0].name);
        }
      })
      .catch((err) => {
        console.error('Failed to load districts:', err);
        if (!isCancelled) setIsLoadingDistricts(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedProvince, selectedRegency]);

  // Load official Kemendagri Villages when District changes
  useEffect(() => {
    let isCancelled = false;
    if (isCustomDistrict || !selectedDistrict) {
      setVillagesList([]);
      return;
    }

    setIsLoadingVillages(true);

    IndonesiaWilayahService.getVillages(selectedDistrict, districtsList)
      .then((vils) => {
        if (isCancelled) return;
        setVillagesList(vils);
        setIsLoadingVillages(false);

        // Retain or select first village
        const existing = vils.find(
          v => v.name.toLowerCase() === selectedVillage.toLowerCase()
        );
        if (!existing && vils.length > 0 && !isCustomVillage) {
          setSelectedVillage(vils[0].name);
        }
      })
      .catch((err) => {
        console.error('Failed to load villages:', err);
        if (!isCancelled) setIsLoadingVillages(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDistrict, districtsList, isCustomDistrict]);

  // Quick typed search
  useEffect(() => {
    if (quickSearchQuery.trim().length >= 2) {
      const hits = searchIndonesianRegions(quickSearchQuery, 12, activeSettings.storeCoordinate);
      setSearchResults(hits);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [quickSearchQuery, activeSettings.storeCoordinate?.lat, activeSettings.storeCoordinate?.lng]);

  // Handle cascade updates
  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    setIsCustomDistrict(false);
    setIsCustomVillage(false);
    const regs = IndonesiaWilayahService.getRegencies(prov);
    const firstReg = regs[0]?.name || '';
    setSelectedRegency(firstReg);
  };

  const handleRegencyChange = (reg: string) => {
    setSelectedRegency(reg);
    setIsCustomDistrict(false);
    setIsCustomVillage(false);
  };

  const handleDistrictChange = (dist: string) => {
    if (dist === '__CUSTOM__') {
      setIsCustomDistrict(true);
      setSelectedDistrict(customDistrictText || 'Kecamatan Baru');
    } else {
      setIsCustomDistrict(false);
      setSelectedDistrict(dist);
    }
  };

  const handleVillageChange = (vil: string) => {
    if (vil === '__CUSTOM__') {
      setIsCustomVillage(true);
      setSelectedVillage(customVillageText || 'Kelurahan Baru');
    } else {
      setIsCustomVillage(false);
      setSelectedVillage(vil);
    }
  };

  const handleSelectQuickResult = (item: { province: string; regency: string; district: string; village: string }) => {
    setSelectedProvince(item.province);
    setSelectedRegency(item.regency);
    setSelectedDistrict(item.district);
    setSelectedVillage(item.village);
    setIsCustomDistrict(false);
    setIsCustomVillage(false);
    setQuickSearchQuery('');
    setIsSearching(false);
  };

  // Active district & village names for calculations
  const effectiveDistrict = isCustomDistrict ? (customDistrictText || selectedDistrict) : selectedDistrict;
  const effectiveVillage = isCustomVillage ? (customVillageText || selectedVillage) : selectedVillage;

  // Recalculate price and distance whenever dependencies change
  useEffect(() => {
    if (!isHomeService) {
      onChange({
        isHomeService: false,
        province: 'DKI Jakarta',
        regency: 'Jakarta Barat',
        district: 'Cengkareng',
        village: 'Cengkareng Timur',
        streetAddress: `${activeSettings.storeAddress} (Kunjungan Salon)`,
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
      district: effectiveDistrict,
      village: effectiveVillage,
      useLongestRoute: true,
      storeCoordinate: activeSettings.storeCoordinate
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
      district: effectiveDistrict,
      village: effectiveVillage,
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
    effectiveDistrict,
    effectiveVillage,
    streetAddress,
    rtRw,
    notes,
    useCoinDiscount,
    memberCoins,
    allowCoinDiscount,
    activeSettings.storeAddress,
    activeSettings.storeCoordinate?.lat,
    activeSettings.storeCoordinate?.lng
  ]);

  const currentDistResult = useMemo(() => {
    return calculateStoreDistance({
      province: selectedProvince,
      regency: selectedRegency,
      district: effectiveDistrict,
      village: effectiveVillage,
      useLongestRoute: true,
      storeCoordinate: activeSettings.storeCoordinate
    });
  }, [
    selectedProvince,
    selectedRegency,
    effectiveDistrict,
    effectiveVillage,
    activeSettings.storeCoordinate?.lat,
    activeSettings.storeCoordinate?.lng
  ]);

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
                {activeSettings.storeAddress}. Gratis tanpa biaya transport.
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
                Terapis datang membawa peralatan lengkap & higienis. Mencakup seluruh kecamatan & kelurahan di Indonesia!
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Immediate Google Maps Store Location View when customer clicks 'Datang ke Studio Lyra' */}
      {!isHomeService && (
        <div className="pt-3 border-t border-[#F8BBD0]/50 space-y-3.5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/50 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#F8BBD0]/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#B8860B] flex items-center justify-center font-bold shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#4A3B40]">
                    Peta Lokasi Studio Lyra&apos;s Nail-Lash
                  </h4>
                  <p className="text-[11px] text-[#8C7A82]">
                    {activeSettings.storeAddress}
                  </p>
                </div>
              </div>

              <a
                href={activeSettings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3.5 rounded-xl gold-button text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:scale-102 transition shrink-0"
              >
                <span>Buka Rute di Google Maps</span>
                <Navigation size={13} />
              </a>
            </div>

            {/* Embedded Interactive Google Maps */}
            <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-[#F8BBD0] shadow-inner bg-stone-100">
              <iframe
                title="Peta Lokasi Studio Lyra"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${activeSettings.storeCoordinate?.lat || -6.1438},${activeSettings.storeCoordinate?.lng || 106.7356}&hl=id&z=17&output=embed`}
              />
            </div>

            {/* Studio Arrival Info Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/30 text-[#4A3B40] flex items-center gap-2">
                <span className="text-sm">📍</span>
                <span>
                  <strong>Koordinat:</strong> {activeSettings.storeCoordinate?.lat || -6.1438}, {activeSettings.storeCoordinate?.lng || 106.7356}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <span className="text-sm">✨</span>
                <span>
                  <strong>Biaya Perjalanan:</strong> Gratis (Rp 0)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200 text-[#4A3B40] flex items-center gap-2">
                <span className="text-sm">🏢</span>
                <span>
                  <strong>Lokasi:</strong> Lt. Ground Blok A 30B (Dekat Lift/Lobby)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Home Service Hierarchy & Distance Calculator */}
      {isHomeService && (
        <div className="space-y-5 pt-3 border-t border-[#F8BBD0]/50 animate-fadeIn">
          {/* Official Coverage Badge */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#FFF8E7] via-white to-[#FFD1DC]/30 border border-[#D4AF37]/40 flex items-center gap-2.5 text-xs text-[#4A3B40] shadow-2xs">
            <Globe size={18} className="text-[#D4AF37] shrink-0 animate-spin-slow" />
            <div className="leading-snug">
              <strong className="text-[#B8860B] block font-semibold">Cakupan Wilayah Nasional Lengkap 100%:</strong>
              <span>
                Seluruh 34-38 Provinsi, 514 Kabupaten/Kota, 7.200+ Kecamatan, dan 83.000+ Kelurahan/Desa di Indonesia tanpa terkecuali siap dipilih!
              </span>
            </div>
          </div>

          {/* Quick Typed Search Bar */}
          <div className="relative">
            <label className="block text-xs font-semibold text-[#4A3B40] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Search size={14} className="text-[#D4AF37]" />
                <span>Pencarian Cepat Wilayah (Ketik Nama Kelurahan / Kecamatan / Kota / Kabupaten):</span>
              </span>
              <span className="text-[11px] text-[#8C7A82] font-normal hidden sm:inline">
                Contoh: Cengkareng, Senayan, Merauke, Bandung, Badung
              </span>
            </label>
            <input
              type="text"
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              placeholder="Ketik untuk mencari wilayah di seluruh Indonesia..."
              className="w-full py-2.5 px-4 rounded-xl border border-[#F8BBD0] bg-white text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 shadow-2xs"
            />

            {/* Quick search autocomplete results popup */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border border-[#D4AF37]/50 divide-y divide-[#F8BBD0]/30 animate-fadeIn">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.village}-${item.district}-${idx}`}
                    type="button"
                    onClick={() => handleSelectQuickResult(item)}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-[#FFF8E7] transition flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-[#4A3B40]">
                        {item.village}, Kec. {item.district}
                      </span>
                      <span className="block text-[11px] text-[#8C7A82]">
                        {item.regency}, {item.province}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#B8860B] bg-[#FFD1DC]/40 px-2.5 py-0.5 rounded-full shrink-0">
                      ~{item.estimatedDistanceKm} km
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4-Level Strict Cascading Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Provinsi (Seluruh Provinsi Indonesia) */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                1. Provinsi:
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
              >
                {allProvinces.map((prov) => (
                  <option key={prov.id} value={prov.name}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Kabupaten / Kota (514 Kab/Kota Lengkap) */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                2. Kab / Kota ({availableRegencies.length}):
              </label>
              <select
                value={selectedRegency}
                onChange={(e) => handleRegencyChange(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
              >
                {availableRegencies.map((reg) => (
                  <option key={reg.id} value={reg.name}>
                    {reg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Kecamatan (7.200+ Kecamatan Resmi Kemendagri) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#4A3B40]">
                  3. Kecamatan:
                </label>
                {isLoadingDistricts && (
                  <span className="text-[10px] text-[#B8860B] flex items-center gap-1 font-medium">
                    <Loader2 size={10} className="animate-spin" /> Memuat...
                  </span>
                )}
              </div>
              {!isCustomDistrict ? (
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
                >
                  {districtsList.map((dist) => (
                    <option key={dist.id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                  <option value="__CUSTOM__">✍️ Ketik Kecamatan Manual...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    value={customDistrictText}
                    onChange={(e) => {
                      setCustomDistrictText(e.target.value);
                      setSelectedDistrict(e.target.value);
                    }}
                    placeholder="Tulis nama kecamatan..."
                    className="w-full py-2 px-3 rounded-xl border border-[#D4AF37] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomDistrict(false)}
                    className="p-2 rounded-lg bg-[#FFD1DC]/40 text-[#4A3B40] text-[10px] hover:bg-[#FFD1DC] transition"
                    title="Kembali ke Pilihan Dropdown"
                  >
                    Daftar
                  </button>
                </div>
              )}
            </div>

            {/* 4. Kelurahan / Desa (83.000+ Kelurahan/Desa Resmi Kemendagri) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#4A3B40]">
                  4. Kelurahan / Desa:
                </label>
                {isLoadingVillages && (
                  <span className="text-[10px] text-[#B8860B] flex items-center gap-1 font-medium">
                    <Loader2 size={10} className="animate-spin" /> Memuat...
                  </span>
                )}
              </div>
              {!isCustomVillage ? (
                <select
                  value={selectedVillage}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
                >
                  {villagesList.map((vil) => (
                    <option key={vil.id} value={vil.name}>
                      {vil.name}
                    </option>
                  ))}
                  <option value="__CUSTOM__">✍️ Ketik Kelurahan/Desa Manual...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    value={customVillageText}
                    onChange={(e) => {
                      setCustomVillageText(e.target.value);
                      setSelectedVillage(e.target.value);
                    }}
                    placeholder="Tulis nama kelurahan/desa..."
                    className="w-full py-2 px-3 rounded-xl border border-[#D4AF37] bg-white text-xs text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomVillage(false)}
                    className="p-2 rounded-lg bg-[#FFD1DC]/40 text-[#4A3B40] text-[10px] hover:bg-[#FFD1DC] transition"
                    title="Kembali ke Pilihan Dropdown"
                  >
                    Daftar
                  </button>
                </div>
              )}
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

            {/* Dynamic Store Departure Location & Google Maps Link */}
            <div className="p-2.5 rounded-xl bg-white/70 border border-[#F8BBD0]/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[#4A3B40]">
                <MapPin size={14} className="text-[#D4AF37] shrink-0" />
                <span>Titik Berangkat Toko: <strong>{activeSettings.storeAddress}</strong></span>
              </div>
              <a
                href={activeSettings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B8860B] hover:underline shrink-0"
              >
                <span>Lihat di Google Maps</span>
                <Navigation size={11} />
              </a>
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
              * Dihitung otomatis menggunakan algoritma Google Maps rute terpanjang/teraman untuk menjamin keamanan perjalanan terapis dan ketepatan waktu. Mencakup seluruh 34 provinsi dan 514 kabupaten/kota di Indonesia.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
