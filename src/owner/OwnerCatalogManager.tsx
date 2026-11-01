import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Sliders, 
  Palette, 
  Upload, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Info 
} from 'lucide-react';
import { Category, SubCategory, SubSubCategory } from '../types/salon';
import { salonStore } from '../services/store';

interface OwnerCatalogManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const OwnerCatalogManager: React.FC<OwnerCatalogManagerProps> = ({
  categories,
  onRefresh
}) => {
  // Active editing category / subcategory
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Subbab creation state
  const [targetCatIdForSub, setTargetCatIdForSub] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState(50000);
  const [subDesc, setSubDesc] = useState('');
  const [subUseColor, setSubUseColor] = useState(false);
  const [subUseCode, setSubUseCode] = useState(false);
  const [subUseType, setSubUseType] = useState(false);
  const [subRequireUpload, setSubRequireUpload] = useState(false);

  // Sub-subbab creation state
  const [targetSubIdForSubSub, setTargetSubIdForSubSub] = useState<string | null>(null);
  const [subSubName, setSubSubName] = useState('');
  const [subSubPrice, setSubSubPrice] = useState(50000);

  // Collapse toggle
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Add Bab (Category Utama)
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

  // Delete Bab
  const handleDeleteCategory = (catId: string) => {
    if (confirm('Yakin ingin menghapus Kategori Utama (Bab) ini beserta seluruh layanannya?')) {
      salonStore.setCategories(categories.filter(c => c.id !== catId));
      onRefresh();
    }
  };

  // Add Subbab (Jenis Pelayanan)
  const handleAddSubCategory = (catId: string) => {
    if (!subName.trim()) return;

    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;

      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: subName.trim(),
        price: Number(subPrice),
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

  // Delete Subbab
  const handleDeleteSubCategory = (catId: string, subId: string) => {
    if (confirm('Hapus jenis pelayanan (Subbab) ini?')) {
      const updated = categories.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          subCategories: cat.subCategories.filter(s => s.id !== subId)
        };
      });
      salonStore.setCategories(updated);
      onRefresh();
    }
  };

  // Toggle Subbab flags
  const handleUpdateSubCategoryFlag = (
    catId: string,
    subId: string,
    field: keyof SubCategory,
    value: any
  ) => {
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

  // Add Sub-subbab (Variasi)
  // CRITICAL RULE: Once sub-subbab exists, Subbab price is mutually excluded / disabled!
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
            price: Number(subSubPrice)
          };
          return {
            ...s,
            price: 0, // Mutual exclusion rule: Price at Subbab level removed/zeroed
            subSubCategories: [...currentSubs, newSubSub]
          };
        })
      };
    });

    salonStore.setCategories(updated);
    setTargetSubIdForSubSub(null);
    setSubSubName('');
    setSubSubPrice(50000);
    onRefresh();
  };

  // Delete Sub-subbab
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
            // If all sub-subs deleted, restore base price capability
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
            <div 
              key={category.id}
              className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/40 shadow-xs space-y-4"
            >
              {/* BAB HEADER */}
              <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
                <div 
                  onClick={() => toggleCategoryCollapse(category.id)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                      <div 
                        key={sub.id}
                        className="p-4 rounded-xl border border-[#F8BBD0]/60 bg-[#FFFDF9] space-y-3 shadow-2xs"
                      >
                        {/* Subbab Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F8BBD0]/30 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-base text-[#4A3B40]">
                              {sub.name}
                            </span>
                            {/* Price display or Mutually Exclusive Indicator */}
                            {hasSubSub ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Info size={11} /> Harga Dibebankan ke Sub-subbab ({sub.subSubCategories!.length} Variasi)
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-xs font-bold text-[#B8860B]">
                                  Rp {sub.price.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setTargetSubIdForSubSub(sub.id)}
                              className="py-1 px-2.5 rounded-lg bg-white border border-[#D4AF37]/50 text-xs font-semibold text-[#B8860B] hover:bg-[#FFF8E7] transition flex items-center gap-1"
                            >
                              <Plus size={12} />
                              <span>Tambah Sub-subbab</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubCategory(category.id, sub.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Hapus Subbab"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* SUBBAB FEATURE FLAGS (Warna, Kode, Tipe, Wajib Upload Desain) */}
                        <div className="flex flex-wrap items-center gap-3 text-xs bg-white p-2.5 rounded-xl border border-[#F8BBD0]/40">
                          <span className="text-[11px] font-bold text-[#8C7A82] uppercase tracking-wider">
                            Pengaturan Subbab:
                          </span>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B40]">
                            <input
                              type="checkbox"
                              checked={sub.useColorManager}
                              onChange={(e) => handleUpdateSubCategoryFlag(category.id, sub.id, 'useColorManager', e.target.checked)}
                              className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-3.5 w-3.5"
                            />
                            <span>Manager Warna</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B40]">
                            <input
                              type="checkbox"
                              checked={sub.useCodeManager}
                              onChange={(e) => handleUpdateSubCategoryFlag(category.id, sub.id, 'useCodeManager', e.target.checked)}
                              className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-3.5 w-3.5"
                            />
                            <span>Manager Kode</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B40]">
                            <input
                              type="checkbox"
                              checked={sub.useTypeManager}
                              onChange={(e) => handleUpdateSubCategoryFlag(category.id, sub.id, 'useTypeManager', e.target.checked)}
                              className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-3.5 w-3.5"
                            />
                            <span>Manager Tipe</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B40]">
                            <input
                              type="checkbox"
                              checked={sub.requireDesignUpload}
                              onChange={(e) => handleUpdateSubCategoryFlag(category.id, sub.id, 'requireDesignUpload', e.target.checked)}
                              className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-3.5 w-3.5"
                            />
                            <span className="font-semibold text-rose-700">Wajib Upload Desain</span>
                          </label>
                        </div>

                        {/* Form Tambah Sub-subbab */}
                        {targetSubIdForSubSub === sub.id && (
                          <div className="p-3.5 rounded-xl bg-[#FFF8E7] border border-[#D4AF37] space-y-2.5 animate-fadeIn">
                            <span className="text-xs font-bold text-[#4A3B40] block">
                              Tambah Sub-subbab (Variasi) untuk &ldquo;{sub.name}&rdquo;:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <input
                                type="text"
                                required
                                value={subSubName}
                                onChange={(e) => setSubSubName(e.target.value)}
                                placeholder="Nama Variasi (contoh: Polos, French, 3D...)"
                                className="py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-medium"
                              />
                              <input
                                type="number"
                                required
                                value={subSubPrice}
                                onChange={(e) => setSubSubPrice(Number(e.target.value))}
                                placeholder="Harga Variasi (Rp)"
                                className="py-1.5 px-3 rounded-lg border border-[#F8BBD0] bg-white font-mono font-medium"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setTargetSubIdForSubSub(null)}
                                className="py-1 px-3 rounded-lg border border-gray-200 text-xs"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddSubSubCategory(category.id, sub.id)}
                                className="py-1 px-3.5 rounded-lg gold-button text-xs font-bold"
                              >
                                Simpan Variasi
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Sub-subbab List */}
                        {hasSubSub && (
                          <div className="pl-3 sm:pl-5 border-l-2 border-[#D4AF37]/50 space-y-2 pt-1">
                            <span className="text-[11px] font-bold text-[#8C7A82] uppercase tracking-wider block">
                              Daftar Variasi (Sub-subbab):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {sub.subSubCategories!.map((ssc) => (
                                <div
                                  key={ssc.id}
                                  className="p-2.5 rounded-lg bg-white border border-[#F8BBD0]/50 flex items-center justify-between gap-2 shadow-2xs"
                                >
                                  <div>
                                    <span className="font-semibold text-xs text-[#4A3B40] block">
                                      {ssc.name}
                                    </span>
                                    <span className="font-mono text-[11px] text-[#B8860B] font-bold">
                                      Rp {ssc.price.toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubSubCategory(category.id, sub.id, ssc.id)}
                                    className="p-1 text-red-400 hover:text-red-600"
                                    title="Hapus Variasi"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
