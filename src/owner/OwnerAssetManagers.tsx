import React, { useState } from 'react';
import { 
  Palette, 
  Code, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  Image as ImageIcon,
  Sparkles,
  Ruler,
  Tag,
  DollarSign
} from 'lucide-react';
import { ColorItem, CodeItem, TypeItem, Category, AccessoryItem, ExtensionConfig } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerAssetManagersProps {
  colors: ColorItem[];
  codes: CodeItem[];
  types: TypeItem[];
  categories?: Category[];
  onRefresh: () => void;
}

export const OwnerAssetManagers: React.FC<OwnerAssetManagersProps> = ({
  colors,
  codes,
  types,
  categories = salonStore.getCategories(),
  onRefresh
}) => {
  // Tab state: 'COLOR' | 'CODE' | 'TYPE' | 'ACCESSORY' | 'EXTENSION'
  const [activeTab, setActiveTab] = useState<'COLOR' | 'CODE' | 'TYPE' | 'ACCESSORY' | 'EXTENSION'>('ACCESSORY');

  const accessories = salonStore.getAccessories();
  const extensions = salonStore.getExtensions();

  // New Color Form
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#FFD1DC');
  const [colorImage, setColorImage] = useState('');

  // New Code Form
  const [codeName, setCodeName] = useState('');
  const [codeIdentifier, setCodeIdentifier] = useState('');
  const [codeImage, setCodeImage] = useState('');

  // New Type Form
  const [typeName, setTypeName] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeImage, setTypeImage] = useState('');

  // New Accessory Form
  const [accName, setAccName] = useState('');
  const [accCode, setAccCode] = useState('');
  const [accPhoto, setAccPhoto] = useState('');
  const [accPrice, setAccPrice] = useState(15000);
  const [accCategoryId, setAccCategoryId] = useState(categories[0]?.id || '');
  const [accSubCategoryId, setAccSubCategoryId] = useState(categories[0]?.subCategories[0]?.id || '');
  const [accSubSubCategoryId, setAccSubSubCategoryId] = useState('');
  const [accDesc, setAccDesc] = useState('');

  // New Extension Form (Kenaikan setiap 1 mm)
  const [extName, setExtName] = useState('');
  const [extMinMm, setExtMinMm] = useState(6);
  const [extMaxMm, setExtMaxMm] = useState(25);
  const [extPricePerMm, setExtPricePerMm] = useState(3000);
  const [extBasePrice, setExtBasePrice] = useState(50000);
  const [extCategoryId, setExtCategoryId] = useState(categories[0]?.id || '');
  const [extSubCategoryId, setExtSubCategoryId] = useState(categories[0]?.subCategories[0]?.id || '');
  const [extSubSubCategoryId, setExtSubSubCategoryId] = useState('');
  const [extDesc, setExtDesc] = useState('');

  // File upload reader helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Color
  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) return;
    salonStore.addColor({
      name: colorName.trim(),
      hex: colorHex,
      imageUrl: colorImage || undefined
    });
    setColorName('');
    setColorHex('#FFD1DC');
    setColorImage('');
    onRefresh();
  };

  // Submit Code
  const handleAddCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim()) return;
    salonStore.addCode({
      name: codeName.trim(),
      code: codeIdentifier.trim() || `CODE-${Date.now().toString().slice(-4)}`,
      imageUrl: codeImage || undefined
    });
    setCodeName('');
    setCodeIdentifier('');
    setCodeImage('');
    onRefresh();
  };

  // Submit Type
  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    salonStore.addType({
      name: typeName.trim(),
      description: typeDesc.trim() || undefined,
      imageUrl: typeImage || undefined
    });
    setTypeName('');
    setTypeDesc('');
    setTypeImage('');
    onRefresh();
  };

  // Submit Accessory
  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    salonStore.addAccessory({
      name: accName.trim(),
      code: accCode.trim() || `ACC-${Date.now().toString().slice(-4)}`,
      photoUrl: accPhoto || undefined,
      price: Number(accPrice) || 0,
      targetCategoryId: accCategoryId || undefined,
      targetSubCategoryId: accSubCategoryId || undefined,
      targetSubSubCategoryId: accSubSubCategoryId || undefined,
      description: accDesc.trim() || undefined
    });
    setAccName('');
    setAccCode('');
    setAccPhoto('');
    setAccPrice(15000);
    setAccDesc('');
    onRefresh();
  };

  // Submit Extension
  const handleAddExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extName.trim()) return;
    salonStore.addExtension({
      name: extName.trim(),
      minMm: Number(extMinMm) || 5,
      maxMm: Number(extMaxMm) || 25,
      stepMm: 1, // Kenaikan setiap 1 milimeter
      pricePerMm: Number(extPricePerMm) || 0,
      basePrice: Number(extBasePrice) || 0,
      targetCategoryId: extCategoryId || undefined,
      targetSubCategoryId: extSubCategoryId || undefined,
      targetSubSubCategoryId: extSubSubCategoryId || undefined,
      description: extDesc.trim() || undefined
    });
    setExtName('');
    setExtDesc('');
    onRefresh();
  };

  // Helper to find category/subcategory label
  const getCategoryLabel = (catId?: string, subId?: string, sscId?: string) => {
    if (!catId) return 'Semua Kategori';
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 'Kategori Khusus';
    if (!subId) return cat.name;
    const sub = cat.subCategories.find(s => s.id === subId);
    if (!sub) return cat.name;
    if (!sscId) return `${cat.name} → ${sub.name}`;
    const ssc = sub.subSubCategories?.find(sc => sc.id === sscId);
    return `${cat.name} → ${sub.name} → ${ssc ? ssc.name : ''}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-[#F8BBD0] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#4A3B40] flex items-center gap-2">
          <Sparkles size={24} className="text-[#D4AF37]" />
          <span>Pusat Manajemen Aset & Aksesoris Salon</span>
        </h2>
        <p className="text-xs text-[#8C7A82] mt-0.5">
          Kelola swatch warna kuku, kode hiasan, tipe kelengkungan/bentuk kuku, manager aksesoris (charm/mutiara/batu), dan manager ekstensi presisi 1 mm.
        </p>
      </div>

      {/* Unified 5-Tab Selector */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-1.5 border border-[#F8BBD0] shadow-2xs max-w-4xl">
        <button
          type="button"
          onClick={() => setActiveTab('ACCESSORY')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'ACCESSORY'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <Sparkles size={15} />
          <span>Manager Aksesoris ({accessories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXTENSION')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'EXTENSION'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <Ruler size={15} />
          <span>Manager Ekstensi 1mm ({extensions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COLOR')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'COLOR'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <Palette size={15} />
          <span>Warna ({colors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CODE')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'CODE'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <Code size={15} />
          <span>Kode ({codes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TYPE')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'TYPE'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Tipe ({types.length})</span>
        </button>
      </div>

      {/* TAB 1: MANAGER ACCESSORIES (NAMA/KODE, FOTO, SUB/SUBSUB KATEGORI) */}
      {activeTab === 'ACCESSORY' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Accessory Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/50 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Aksesoris / Charm Baru</span>
            </h3>

            <form onSubmit={handleAddAccessory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Aksesoris:</label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Contoh: Charm Pita 3D Korean, Mutiara Baroque..."
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Kode Aksesoris:</label>
                  <input
                    type="text"
                    value={accCode}
                    onChange={(e) => setAccCode(e.target.value)}
                    placeholder="Contoh: ACC-RIB-01..."
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Harga Aksesoris (Rp):</label>
                  <input
                    type="number"
                    min={0}
                    value={accPrice}
                    onChange={(e) => setAccPrice(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
              </div>

              {/* Target Sub/SubSub Kategori Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Kategori Utama:</label>
                  <select
                    value={accCategoryId}
                    onChange={(e) => {
                      setAccCategoryId(e.target.value);
                      const cat = categories.find(c => c.id === e.target.value);
                      setAccSubCategoryId(cat?.subCategories[0]?.id || '');
                      setAccSubSubCategoryId('');
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Target Sub Kategori:</label>
                  <select
                    value={accSubCategoryId}
                    onChange={(e) => {
                      setAccSubCategoryId(e.target.value);
                      setAccSubSubCategoryId('');
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  >
                    <option value="">-- Semua Sub Kategori --</option>
                    {categories
                      .find(c => c.id === accCategoryId)
                      ?.subCategories.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Target Sub-Sub Kategori (Opsional):</label>
                  <select
                    value={accSubSubCategoryId}
                    onChange={(e) => setAccSubSubCategoryId(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  >
                    <option value="">-- Berlaku untuk Sub Kategori --</option>
                    {categories
                      .find(c => c.id === accCategoryId)
                      ?.subCategories.find(s => s.id === accSubCategoryId)
                      ?.subSubCategories?.map(ssc => (
                        <option key={ssc.id} value={ssc.id}>{ssc.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Upload Foto & Deskripsi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Deskripsi Aksesoris:</label>
                  <input
                    type="text"
                    value={accDesc}
                    onChange={(e) => setAccDesc(e.target.value)}
                    placeholder="Hiasan kilau crystal swarovski original..."
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Foto Aksesoris:</label>
                  <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#F8BBD0] bg-[#FFF8E7]/50 hover:bg-[#FFF8E7] cursor-pointer transition">
                    <Upload size={14} className="text-[#D4AF37]" />
                    <span className="font-semibold text-xs text-[#4A3B40] truncate">
                      {accPhoto ? 'Foto Terpasang ✓' : 'Upload Foto'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setAccPhoto)}
                    />
                  </label>
                </div>
              </div>

              {accPhoto && (
                <div className="flex items-center gap-3 p-2 bg-[#FFF8E7]/60 rounded-xl border border-[#D4AF37]/30">
                  <img src={accPhoto} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-[#F8BBD0]" />
                  <span className="text-xs text-[#4A3B40] font-medium">Foto aksesoris siap disimpan</span>
                  <button type="button" onClick={() => setAccPhoto('')} className="text-rose-500 text-xs font-semibold hover:underline ml-auto">Hapus Foto</button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl gold-button font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Simpan Aksesoris</span>
                </button>
              </div>
            </form>
          </div>

          {/* Accessories Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessories.map((acc) => (
              <div 
                key={acc.id}
                className="luxury-card p-4 bg-white border-[#F8BBD0] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#D4AF37] transition"
              >
                <div className="flex items-start gap-3">
                  {acc.photoUrl ? (
                    <img 
                      src={acc.photoUrl} 
                      alt={acc.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-[#F8BBD0] shrink-0 shadow-2xs" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#FFF8E7] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 font-bold text-xs shadow-2xs">
                      ✨ CHARM
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30">
                        {acc.code}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#4A3B40]">
                        Rp {acc.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[#4A3B40] mt-1 truncate">
                      {acc.name}
                    </h4>

                    <span className="text-[11px] text-[#8C7A82] block truncate mt-0.5">
                      📍 {getCategoryLabel(acc.targetCategoryId, acc.targetSubCategoryId, acc.targetSubSubCategoryId)}
                    </span>

                    {acc.description && (
                      <p className="text-[11px] text-[#A08892] mt-1 line-clamp-2">
                        {acc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      salonStore.deleteAccessory(acc.id);
                      onRefresh();
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Aksesoris</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGER EXTENSION (KENAIKKAN TIAP 1 MILIMETER) */}
      {activeTab === 'EXTENSION' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Extension Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/50 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Konfigurasi Ekstensi Presisi 1 mm</span>
            </h3>

            <form onSubmit={handleAddExtension} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Konfigurasi Ekstensi:</label>
                  <input
                    type="text"
                    required
                    value={extName}
                    onChange={(e) => setExtName(e.target.value)}
                    placeholder="Contoh: Custom Panjang Kuku Akrilik, Custom Panjang Lash Natural..."
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Harga Dasar (Rp):</label>
                  <input
                    type="number"
                    min={0}
                    value={extBasePrice}
                    onChange={(e) => setExtBasePrice(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
              </div>

              {/* Milimeter Ranges with 1 mm step rule */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FFF8E7]/40 p-3.5 rounded-2xl border border-[#D4AF37]/30">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Panjang Minimal (mm):</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={extMinMm}
                    onChange={(e) => setExtMinMm(Number(e.target.value))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Panjang Maksimal (mm):</label>
                  <input
                    type="number"
                    min={extMinMm}
                    max={60}
                    value={extMaxMm}
                    onChange={(e) => setExtMaxMm(Number(e.target.value))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Kenaikan Presisi (Step):</label>
                  <div className="py-1.5 px-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono font-bold text-center">
                    Setiap 1 mm ✓
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Biaya Tambahan per 1 mm (Rp):</label>
                  <input
                    type="number"
                    min={0}
                    value={extPricePerMm}
                    onChange={(e) => setExtPricePerMm(Number(e.target.value))}
                    className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono"
                  />
                </div>
              </div>

              {/* Target Sub/SubSub Kategori Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Kategori Utama:</label>
                  <select
                    value={extCategoryId}
                    onChange={(e) => {
                      setExtCategoryId(e.target.value);
                      const cat = categories.find(c => c.id === e.target.value);
                      setExtSubCategoryId(cat?.subCategories[0]?.id || '');
                      setExtSubSubCategoryId('');
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Target Sub Kategori:</label>
                  <select
                    value={extSubCategoryId}
                    onChange={(e) => {
                      setExtSubCategoryId(e.target.value);
                      setExtSubSubCategoryId('');
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  >
                    <option value="">-- Semua Sub Kategori --</option>
                    {categories
                      .find(c => c.id === extCategoryId)
                      ?.subCategories.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#4A3B40]">Target Sub-Sub Kategori (Opsional):</label>
                  <select
                    value={extSubSubCategoryId}
                    onChange={(e) => setExtSubSubCategoryId(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-medium"
                  >
                    <option value="">-- Berlaku untuk Sub Kategori --</option>
                    {categories
                      .find(c => c.id === extCategoryId)
                      ?.subCategories.find(s => s.id === extSubCategoryId)
                      ?.subSubCategories?.map(ssc => (
                        <option key={ssc.id} value={ssc.id}>{ssc.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Deskripsi / Catatan:</label>
                <input
                  type="text"
                  value={extDesc}
                  onChange={(e) => setExtDesc(e.target.value)}
                  placeholder="Kenaikan panjang ekstensi setiap 1 milimeter..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl gold-button font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Simpan Manager Ekstensi</span>
                </button>
              </div>
            </form>
          </div>

          {/* Extensions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extensions.map((ext) => (
              <div 
                key={ext.id}
                className="luxury-card p-4 bg-white border-[#D4AF37]/50 flex flex-col justify-between gap-3 shadow-2xs hover:border-[#D4AF37] transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-bold text-base text-[#4A3B40]">
                      {ext.name}
                    </h4>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step: 1 mm
                    </span>
                  </div>

                  <span className="text-xs text-[#8C7A82] block mt-1">
                    📍 {getCategoryLabel(ext.targetCategoryId, ext.targetSubCategoryId, ext.targetSubSubCategoryId)}
                  </span>

                  <div className="mt-3 p-3 rounded-xl bg-[#FFFDF9] border border-[#F8BBD0]/60 space-y-1.5 text-xs text-[#4A3B40]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8C7A82]">Rentang Panjang:</span>
                      <strong className="font-mono text-[#B8860B]">{ext.minMm} mm s/d {ext.maxMm} mm</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8C7A82]">Harga Dasar:</span>
                      <span className="font-mono font-semibold">Rp {(ext.basePrice || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8C7A82]">Tambahan Biaya per 1 mm:</span>
                      <span className="font-mono text-emerald-700 font-semibold">+ Rp {(ext.pricePerMm || 0).toLocaleString('id-ID')} / mm</span>
                    </div>
                  </div>

                  {ext.description && (
                    <p className="text-[11px] text-[#A08892] mt-2 italic">
                      {ext.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      salonStore.deleteExtension(ext.id);
                      onRefresh();
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Konfigurasi Ekstensi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGER WARNA */}
      {activeTab === 'COLOR' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Color Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/40 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Warna Nail Art Baru</span>
            </h3>

            <form onSubmit={handleAddColor} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Warna:</label>
                <input
                  type="text"
                  required
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Contoh: Coral Peach, Dusty Lilac..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Pilihan Kode Hex:</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="flex-1 py-2 px-2 rounded-xl border border-[#F8BBD0] bg-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Foto Swatch (Opsional):</label>
                <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#F8BBD0] bg-[#FFF8E7]/50 hover:bg-[#FFF8E7] cursor-pointer transition">
                  <Upload size={14} className="text-[#D4AF37]" />
                  <span>{colorImage ? 'Foto Terpilih ✓' : 'Upload Swatch'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setColorImage)}
                  />
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl gold-button font-bold text-xs shadow-xs"
                >
                  + Simpan Warna
                </button>
              </div>
            </form>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {colors.map((c) => (
              <div 
                key={c.id} 
                className="luxury-card p-3 bg-white border-[#F8BBD0]/60 flex flex-col items-center text-center gap-2 relative shadow-2xs hover:border-[#D4AF37]"
              >
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: c.hex || '#FFD1DC' }}
                />
                <span className="font-semibold text-xs text-[#4A3B40] truncate w-full">{c.name}</span>
                <span className="font-mono text-[10px] text-[#8C7A82] uppercase">{c.hex}</span>
                <button
                  type="button"
                  onClick={() => {
                    salonStore.deleteColor(c.id);
                    onRefresh();
                  }}
                  className="p-1 text-red-400 hover:text-red-600 rounded"
                  title="Hapus Warna"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MANAGER KODE */}
      {activeTab === 'CODE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Code Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/40 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Kode Desain / Foil Baru</span>
            </h3>

            <form onSubmit={handleAddCode} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Item:</label>
                <input
                  type="text"
                  required
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder="Contoh: Foil Emas, Crystal Aurora..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Kode Unik:</label>
                <input
                  type="text"
                  value={codeIdentifier}
                  onChange={(e) => setCodeIdentifier(e.target.value)}
                  placeholder="Contoh: FOIL-01, CRY-02..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Foto (Opsional):</label>
                <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#F8BBD0] bg-[#FFF8E7]/50 hover:bg-[#FFF8E7] cursor-pointer transition">
                  <Upload size={14} className="text-[#D4AF37]" />
                  <span>{codeImage ? 'Foto Terpilih ✓' : 'Upload Gambar'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setCodeImage)}
                  />
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl gold-button font-bold text-xs shadow-xs"
                >
                  + Simpan Kode
                </button>
              </div>
            </form>
          </div>

          {/* Code List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {codes.map((cd) => (
              <div 
                key={cd.id}
                className="luxury-card p-3.5 bg-white border-[#F8BBD0]/60 flex items-center justify-between gap-3 shadow-2xs hover:border-[#D4AF37]"
              >
                <div className="flex items-center gap-3 truncate">
                  {cd.imageUrl ? (
                    <img src={cd.imageUrl} alt={cd.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] flex items-center justify-center text-[#D4AF37] shrink-0 font-mono font-bold text-xs">
                      #
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-xs text-[#4A3B40] block truncate">{cd.name}</span>
                    <span className="font-mono text-[11px] text-[#B8860B] font-bold block">{cd.code}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    salonStore.deleteCode(cd.id);
                    onRefresh();
                  }}
                  className="p-1.5 text-red-400 hover:text-red-600 rounded shrink-0"
                  title="Hapus Kode"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MANAGER TIPE */}
      {activeTab === 'TYPE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Type Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/40 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Tipe Bentuk / Curl Baru</span>
            </h3>

            <form onSubmit={handleAddType} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Tipe:</label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Contoh: Shape Almond, C-Curl Natural..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Deskripsi:</label>
                <input
                  type="text"
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  placeholder="Deskripsi singkat efek/tampilan..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Foto (Opsional):</label>
                <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#F8BBD0] bg-[#FFF8E7]/50 hover:bg-[#FFF8E7] cursor-pointer transition">
                  <Upload size={14} className="text-[#D4AF37]" />
                  <span>{typeImage ? 'Foto Terpilih ✓' : 'Upload Gambar'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setTypeImage)}
                  />
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl gold-button font-bold text-xs shadow-xs"
                >
                  + Simpan Tipe
                </button>
              </div>
            </form>
          </div>

          {/* Type List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {types.map((t) => (
              <div 
                key={t.id}
                className="luxury-card p-3.5 bg-white border-[#F8BBD0]/60 flex items-center justify-between gap-3 shadow-2xs hover:border-[#D4AF37]"
              >
                <div className="flex items-center gap-3 truncate">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#FFD1DC]/40 flex items-center justify-center text-[#4A3B40] shrink-0 font-bold text-xs">
                      TIPE
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-xs text-[#4A3B40] block truncate">{t.name}</span>
                    {t.description && (
                      <span className="text-[11px] text-[#8C7A82] block truncate">{t.description}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    salonStore.deleteType(t.id);
                    onRefresh();
                  }}
                  className="p-1.5 text-red-400 hover:text-red-600 rounded shrink-0"
                  title="Hapus Tipe"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
