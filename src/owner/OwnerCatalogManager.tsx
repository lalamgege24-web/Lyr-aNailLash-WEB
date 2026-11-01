import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Sliders, Palette, Upload, Sparkles, ChevronDown, ChevronUp, DollarSign, Info } from 'lucide-react';
import { Category, SubCategory, SubSubCategory } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerCatalogManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const OwnerCatalogManager: React.FC<OwnerCatalogManagerProps> = ({ categories, onRefresh }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Subbab creation state
  const [targetCatIdForSub, setTargetCatIdForSub] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState(50000);
  const [subDiscount, setSubDiscount] = useState(0);
  const [subDesc, setSubDesc] = useState('');
  const [subUseColor, setSubUseColor] = useState(false);
  const [subUseCode, setSubUseCode] = useState(false);
  const [subUseType, setSubUseType] = useState(false);
  const [subRequireUpload, setSubRequireUpload] = useState(false);

  // Sub-subbab creation state
  const [targetSubIdForSubSub, setTargetSubIdForSubSub] = useState<string | null>(null);
  const [subSubName, setSubSubName] = useState('');
  const [subSubPrice, setSubSubPrice] = useState(50000);
  const [subSubDiscount, setSubSubDiscount] = useState(0);

  // Collapse toggle
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim().toUpperCase(),
      description: newCategoryDesc.trim() || undefined,
      subCategories: []
    };
    salonStore.setCategories([...categories, newCat]);
    setNewCategoryName('');
    setNewCategoryDesc('');
    onRefresh();
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Yakin ingin menghapus Kategori Utama (Bab) ini beserta seluruh layanannya?')) {
      salonStore.setCategories(categories.filter(c => c.id !== catId));
      onRefresh();
    }
  };

  const handleAddSubCategory = (catId: string) => {
    if (!subName.trim()) return;
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: subName.trim(),
        price: Number(subPrice),
        discountPercentage: Number(subDiscount),
        description: subDesc.trim() || undefined,
        useColorManager: subUseColor,
        useCodeManager: subUseCode,
        useTypeManager: subUseType,
        requireDesignUpload: subRequireUpload,
        subSubCategories: []
      };
      return { ...cat, subCategories: [...cat.subCategories, newSub] };
    });
    salonStore.setCategories(updated);
    setTargetCatIdForSub(null);
    setSubName('');
    setSubPrice(50000);
    setSubDesc('');
    setSubUseColor(false);
    setSubUseCode(false);
    setSubUseType(false);
    setSubRequireUpload(false);
    onRefresh();
  };

  const handleDeleteSubCategory = (catId: string, subId: string) => {
    if (confirm('Hapus jenis pelayanan (Subbab) ini?')) {
      const updated = categories.map(cat => {
        if (cat.id !== catId) return cat;
        return { ...cat, subCategories: cat.subCategories.filter(s => s.id !== subId) };
      });
      salonStore.setCategories(updated);
      onRefresh();
    }
  };

  const handleUpdateSubCategoryFlag = (catId: string, subId: string, field: keyof SubCategory, value: any) => {
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(s => {
          if (s.id !== subId) return s;
          return { ...s, [field]: value };
        })
      };
    });
    salonStore.setCategories(updated);
    onRefresh();
  };

  const handleAddSubSubCategory = (catId: string, subId: string) => {
    if (!subSubName.trim()) return;
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(s => {
          if (s.id !== subId) return s;
          const currentSubs = s.subSubCategories || [];
          const newSubSub: SubSubCategory = {
            id: `ssc-${Date.now()}`,
            name: subSubName.trim(),
            price: Number(subSubPrice),
            discountPercentage: Number(subSubDiscount)
          };
          return {
            ...s,
            price: 0,
            subSubCategories: [...currentSubs, newSubSub]
          };
        })
      };
    });
    salonStore.setCategories(updated);
    setTargetSubIdForSubSub(null);
    setSubSubName('');
    setSubSubPrice(50000);
    setSubSubDiscount(0);
    onRefresh();
  };

  const handleDeleteSubSubCategory = (catId: string, subId: string, sscId: string) => {
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(s => {
          if (s.id !== subId) return s;
          const remaining = (s.subSubCategories || []).filter(item => item.id !== sscId);
          return {
            ...s,
            price: remaining.length === 0 ? 50000 : 0,
            subSubCategories: remaining
          };
        })
      };
    });
    salonStore.setCategories(updated);
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F8BBD0] gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#4A3B40]">
            Editor Katalog Bertingkat (Bab, Subbab, Sub-subbab)
          </h2>
          <p className="text-xs text-[#8C7A82] mt-0.5">
            Aturan Mutlak: Pengaturan Manager Warna, Kode, Tipe, & Wajib Desain diatur per Subbab. Harga di Subbab otomatis dinonaktifkan jika memiliki Sub-subbab variasi.
          </p>
        </div>
        {/* Add Bab Trigger */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            required
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Tambah Bab Baru (e.g. SPA)..."
            className="py-2 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl gold-button text-xs font-bold shrink-0 shadow-2xs"
          >
            + Tambah Bab
          </button>
        </form>
      </div>

      {/* Categories Hierarchy */}
      <div className="space-y-6">
        {categories.map((category) => {
          const isCollapsed = collapsedCategories[category.id];
          return (
            <div key={category.id} className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/40 shadow-xs space-y-4">
              {/* BAB HEADER */}
              <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
                <div onClick={() => toggleCategoryCollapse(category.id)} className="flex items-center gap-3 cursor-pointer select-none">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#4A3B40]">
                        Bab: {category.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] font-bold border border-[#D4AF37]/30">
                        {category.subCategories.length} Subbab
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-xs text-[#8C7A82]">{category.description}</p>
                    )}
                  </div>
                  {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetCatIdForSub(category.id)}
                    className="py-1.5 px-3 rounded-xl soft-button text-xs font-bold border border-[#F8BBD0] flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Tambah Subbab</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Hapus Kategori Utama"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Form Tambah Subbab */}
              {targetCatIdForSub === category.id && (
                <div className="p-4 rounded-xl bg-[#FFF8E7] border border-[#D4AF37] space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4A3B40]">
                    <span>Tambah Jenis Pelayanan (Subbab) ke dalam {category.name}:</span>
                    <button type="button" onClick={() => setTargetCatIdForSub(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Nama Subbab:</label>
                      <input
                        type="text"
                        required
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        placeholder="Contoh: Gel Polis, Russian Lash..."
                        className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Harga Dasar (Rp):</label>
                      <input
                        type="number"
                        value={subPrice}
                        onChange={(e) => setSubPrice(Number(e.target.value))}
                        className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Diskon Promo (%):</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={subDiscount}
                        onChange={(e) => setSubDiscount(Number(e.target.value))}
                        placeholder="0"
                        className="w-full py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono font-medium text-rose-600"
                      />
                    </div>
                  </div>

                  {/* Subbab feature switches */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#D4AF37]/20 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-[#F8BBD0]/60">
                      <input
                        type="checkbox"
                        checked={subUseColor}
                        onChange={(e) => setSubUseColor(e.target.checked)}
                        className="rounded text-[#D4AF37]"
                      />
                      <span className="font-semibold text-[#4A3B40]">Pakai Warna</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-[#F8BBD0]/60">
                      <input
                        type="checkbox"
                        checked={subUseCode}
                        onChange={(e) => setSubUseCode(e.target.checked)}
                        className="rounded text-[#D4AF37]"
                      />
                      <span className="font-semibold text-[#4A3B40]">Pakai Kode</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-[#F8BBD0]/60">
                      <input
                        type="checkbox"
                        checked={subUseType}
                        onChange={(e) => setSubUseType(e.target.checked)}
                        className="rounded text-[#D4AF37]"
                      />
                      <span className="font-semibold text-[#4A3B40]">Pakai Tipe</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-[#F8BBD0]/60">
                      <input
                        type="checkbox"
                        checked={subRequireUpload}
                        onChange={(e) => setSubRequireUpload(e.target.checked)}
                        className="rounded text-[#D4AF37]"
                      />
                      <span className="font-semibold text-[#4A3B40]">Wajib Desain</span>
                    </label>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetCatIdForSub(null)}
                      className="py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSubCategory(category.id)}
                      className="py-1.5 px-4 rounded-lg gold-button text-xs font-bold"
                    >
                      Simpan Subbab
                    </button>
                  </div>
                </div>
              )}

              {/* LIST SUBBAB */}
              {!isCollapsed && (
                <div className="space-y-4 pt-1">
                  {category.subCategories.map((sub) => {
                    const hasSubSub = sub.subSubCategories && sub.subSubCategories.length > 0;
                    return (
                      <div key={sub.id} className="p-4 rounded-xl border border-[#F8BBD0]/60 bg-[#FFFDF9] space-y-3 shadow-2xs">
                        {/* Subbab Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F8BBD0]/30 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-base text-[#4A3B40]">
                              {sub.name}
                            </span>
                            {hasSubSub ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Info size={1
