import React, { useState } from 'react';
import { 
  Palette, 
  Code, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import { ColorItem, CodeItem, TypeItem } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerAssetManagersProps {
  colors: ColorItem[];
  codes: CodeItem[];
  types: TypeItem[];
  onRefresh: () => void;
}

export const OwnerAssetManagers: React.FC<OwnerAssetManagersProps> = ({
  colors,
  codes,
  types,
  onRefresh
}) => {
  // Tab state: 'COLOR' | 'CODE' | 'TYPE'
  const [activeTab, setActiveTab] = useState<'COLOR' | 'CODE' | 'TYPE'>('COLOR');

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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-[#F8BBD0] pb-4">
        <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
          Pusat Manajemen Aset (Manager Warna, Kode & Tipe)
        </h2>
        <p className="text-xs text-[#8C7A82] mt-0.5">
          Wadah terpadu untuk mengelola seluruh swatch warna kuku, kode aksesoris/charm, dan tipe bentuk kuku/lash.
        </p>
      </div>

      {/* Unified 3-Tab Selector */}
      <div className="flex rounded-2xl bg-white p-1.5 border border-[#F8BBD0] shadow-2xs max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('COLOR')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'COLOR'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <Palette size={15} />
          <span>Manager Warna ({colors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CODE')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'CODE'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <Code size={15} />
          <span>Manager Kode ({codes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TYPE')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'TYPE'
              ? 'gold-button shadow-xs'
              : 'text-[#8C7A82] hover:text-[#4A3B40]'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Manager Tipe ({types.length})</span>
        </button>
      </div>

      {/* TAB 1: MANAGER WARNA */}
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
                <label className="block font-semibold mb-1 text-[#4A3B40]">Kode Hex / Warna:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-gray-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl border border-[#F8BBD0] bg-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Upload Foto Swatch (PNG/JPG):</label>
                <label className="cursor-pointer py-2 px-3 rounded-xl border border-dashed border-[#D4AF37] hover:bg-[#FFF8E7] transition flex items-center gap-2 text-xs text-[#B8860B] font-semibold truncate">
                  <Upload size={14} />
                  <span>{colorImage ? 'Foto Terpilih ✓' : 'Upload Gambar'}</span>
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

          {/* Color List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {colors.map((color) => (
              <div 
                key={color.id}
                className="luxury-card p-3 bg-white border-[#F8BBD0]/60 flex items-center justify-between gap-2 shadow-2xs hover:border-[#D4AF37]"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {color.imageUrl ? (
                    <img src={color.imageUrl} alt={color.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <span 
                      className="w-8 h-8 rounded-full border border-gray-300 shrink-0 shadow-inner"
                      style={{ backgroundColor: color.hex || '#FFD1DC' }}
                    />
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-xs text-[#4A3B40] block truncate">{color.name}</span>
                    <span className="text-[10px] text-[#8C7A82] font-mono">{color.hex || 'Custom'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    salonStore.deleteColor(color.id);
                    onRefresh();
                  }}
                  className="p-1 text-red-400 hover:text-red-600 rounded shrink-0"
                  title="Hapus Warna"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGER KODE */}
      {activeTab === 'CODE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Code Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/40 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Kode Aksesoris / Charm Baru</span>
            </h3>

            <form onSubmit={handleAddCode} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Item:</label>
                <input
                  type="text"
                  required
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder="Contoh: Pita Korean 3D, Mutiara..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Kode Referensi:</label>
                <input
                  type="text"
                  value={codeIdentifier}
                  onChange={(e) => setCodeIdentifier(e.target.value)}
                  placeholder="Contoh: ACC-GOLD-01..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Upload Foto Gambar (PNG/JPG):</label>
                <label className="cursor-pointer py-2 px-3 rounded-xl border border-dashed border-[#D4AF37] hover:bg-[#FFF8E7] transition flex items-center gap-2 text-xs text-[#B8860B] font-semibold truncate">
                  <Upload size={14} />
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
            {codes.map((item) => (
              <div 
                key={item.id}
                className="luxury-card p-3.5 bg-white border-[#F8BBD0]/60 flex items-center justify-between gap-3 shadow-2xs hover:border-[#D4AF37]"
              >
                <div className="flex items-center gap-3 truncate">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] flex items-center justify-center text-[#B8860B] shrink-0">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-xs text-[#4A3B40] block truncate">{item.name}</span>
                    <span className="text-[11px] text-[#B8860B] font-mono font-bold">{item.code}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    salonStore.deleteCode(item.id);
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

      {/* TAB 3: MANAGER TIPE */}
      {activeTab === 'TYPE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Type Form */}
          <div className="luxury-card p-5 bg-white border-[#D4AF37]/40 shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#4A3B40] mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#D4AF37]" />
              <span>Tambah Tipe Bentuk / Kelengkungan Baru</span>
            </h3>

            <form onSubmit={handleAddType} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Nama Tipe:</label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Contoh: Shape Coffin, Curl D-Lash..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Deskripsi / Keterangan:</label>
                <input
                  type="text"
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  placeholder="Bentuk kuku meruncing elegan..."
                  className="w-full py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#4A3B40]">Upload Foto Referensi (PNG/JPG):</label>
                <label className="cursor-pointer py-2 px-3 rounded-xl border border-dashed border-[#D4AF37] hover:bg-[#FFF8E7] transition flex items-center gap-2 text-xs text-[#B8860B] font-semibold truncate">
                  <Upload size={14} />
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
