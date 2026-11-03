import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Edit3,
  Check, 
  Sliders, 
  Palette, 
  Upload, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Info,
  Percent,
  FileText,
  Ruler
} from 'lucide-react';
import { Category, SubCategory, SubSubCategory } from '../types/salon';
import { salonStore } from '../services/store';
import { countWords, validateDescriptionWordCount } from '../utils/salonRules';

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
  const [subDiscount, setSubDiscount] = useState(0);
  const [subDesc, setSubDesc] = useState('');
  const [subUseColor, setSubUseColor] = useState(false);
  const [subUseCode, setSubUseCode] = useState(false);
  const [subUseType, setSubUseType] = useState(false);
  const [subUseAccessory, setSubUseAccessory] = useState(false);
  const [subUseExtension, setSubUseExtension] = useState(false);
  const [subRequireUpload, setSubRequireUpload] = useState(false);

  // Sub-subbab creation state
  const [targetSubIdForSubSub, setTargetSubIdForSubSub] = useState<string | null>(null);
  const [subSubName, setSubSubName] = useState('');
  const [subSubPrice, setSubSubPrice] = useState(50000);
  const [subSubDiscount, setSubSubDiscount] = useState(0);
  const [subSubDesc, setSubSubDesc] = useState('');

  // Description Edit Modal State (Max 50 Words enforced)
  const [descModal, setDescModal] = useState<{
    level: 'CATEGORY' | 'SUBCATEGORY' | 'SUBSUBCATEGORY';
    catId: string;
    subId?: string;
    sscId?: string;
    title: string;
    currentText: string;
  } | null>(null);
  const [tempDescText, setTempDescText] = useState('');

  // Collapse toggle
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleOpenDescModal = (
    level: 'CATEGORY' | 'SUBCATEGORY' | 'SUBSUBCATEGORY',
    catId: string,
    title: string,
    currentText: string = '',
    subId?: string,
    sscId?: string
  ) => {
    setDescModal({
      level,
      catId,
      subId,
      sscId,
      title,
      currentText
    });
    setTempDescText(currentText);
  };

  const handleSaveDescModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descModal) return;

    const check = validateDescriptionWordCount(tempDescText);
    if (!check.valid) return;

    const trimmed = tempDescText.trim();
    const updated = categories.map(cat => {
      if (descModal.level === 'CATEGORY') {
        if (cat.id === descModal.catId) {
          return { ...cat, description: trimmed || undefined };
        }
        return cat;
      }

      if (cat.id !== descModal.catId) return cat;

      return {
        ...cat,
        subCategories: cat.subCategories.map(sub => {
          if (descModal.level === 'SUBCATEGORY') {
            if (sub.id === descModal.subId) {
              return { ...sub, description: trimmed || undefined };
            }
            return sub;
          }

          if (sub.id !== descModal.subId) return sub;

          return {
            ...sub,
            subSubCategories: (sub.subSubCategories || []).map(ssc => {
              if (ssc.id === descModal.sscId) {
                return { ...ssc, description: trimmed || undefined };
              }
              return ssc;
            })
          };
        })
      };
    });

    salonStore.setCategories(updated);
    setDescModal(null);
    onRefresh();
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

    const discountP = Math.min(100, Math.max(0, Number(subDiscount) || 0));
    const baseP = Number(subPrice);
    const discP = discountP > 0 ? Math.round(baseP * (1 - discountP / 100)) : baseP;

    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;

      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: subName.trim(),
        price: baseP,
        discountPercent: discountP,
        discountPrice: discP,
        description: subDesc.trim() || undefined,
        useColorManager: subUseColor,
        useCodeManager: subUseCode,
        useTypeManager: subUseType,
        useAccessoryManager: subUseAccessory,
        useExtensionManager: subUseExtension,
        requireDesignUpload: subRequireUpload,
        subSubCategories: []
      };

      return { ...cat, subCategories: [...cat.subCategories, newSub] };
    });

    salonStore.setCategories(updated);
    setTargetCatIdForSub(null);
    setSubName('');
    setSubPrice(50000);
    setSubDiscount(0);
    setSubDesc('');
    setSubUseColor(false);
    setSubUseCode(false);
    setSubUseType(false);
    setSubUseAccessory(false);
    setSubUseExtension(false);
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

  // Update Subbab Price and Discount %
  const handleUpdateSubPriceAndDiscount = (
    catId: string,
    subId: string,
    deltaPrice?: number,
    exactPrice?: number,
    discountPercent?: number
  ) => {
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(s => {
          if (s.id !== subId) return s;
          let newPrice = s.price;
          if (exactPrice !== undefined) {
            newPrice = Math.max(0, exactPrice);
          } else if (deltaPrice !== undefined) {
            newPrice = Math.max(0, newPrice + deltaPrice);
          }

          let newDiscount = discountPercent !== undefined
            ? Math.min(100, Math.max(0, discountPercent))
            : (s.discountPercent || 0);

          const discountPrice = newDiscount > 0 ? Math.round(newPrice * (1 - newDiscount / 100)) : newPrice;

          return {
            ...s,
            price: newPrice,
            discountPercent: newDiscount,
            discountPrice
          };
        })
      };
    });
    salonStore.setCategories(updated);
    onRefresh();
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

    const discountP = Math.min(100, Math.max(0, Number(subSubDiscount) || 0));
    const baseP = Number(subSubPrice);
    const discP = discountP > 0 ? Math.round(baseP * (1 - discountP / 100)) : baseP;

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
            price: baseP,
            discountPercent: discountP,
            discountPrice: discP
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
    setSubSubDiscount(0);
    onRefresh();
  };

  // Update Sub-subbab Price and Discount %
  const handleUpdateSubSubPriceAndDiscount = (
    catId: string,
    subId: string,
    sscId: string,
    deltaPrice?: number,
    exactPrice?: number,
    discountPercent?: number
  ) => {
    const updated = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subCategories: cat.subCategories.map(s => {
          if (s.id !== subId) return s;
          return {
            ...s,
            subSubCategories: (s.subSubCategories || []).map(ssc => {
              if (ssc.id !== sscId) return ssc;
              let newPrice = ssc.price;
              if (exactPrice !== undefined) {
                newPrice = Math.max(0, exactPrice);
              } else if (deltaPrice !== undefined) {
                newPrice = Math.max(0, newPrice + deltaPrice);
              }

              let newDiscount = discountPercent !== undefined
                ? Math.min(100, Math.max(0, discountPercent))
                : (ssc.discountPercent || 0);

              const discountPrice = newDiscount > 0 ? Math.round(newPrice * (1 - newDiscount / 100)) : newPrice;

              return {
                ...ssc,
                price: newPrice,
                discountPercent: newDiscount,
                discountPrice
              };
            })
          };
        })
      };
    });
    salonStore.setCategories(updated);
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
                    onClick={() => handleOpenDescModal('CATEGORY', category.id, `Bab: ${category.name}`, category.description)}
                    className="py-1.5 px-3 rounded-xl border border-[#F8BBD0] bg-white text-xs font-semibold text-[#8C7A82] hover:text-[#4A3B40] flex items-center gap-1 hover:border-[#D4AF37]"
                    title="Edit keterangan Bab (Maksimal 50 kata)"
                  >
                    <FileText size={13} className="text-[#D4AF37]" />
                    <span>{category.description ? 'Ubah Deskripsi' : '+ Deskripsi'}</span>
                  </button>
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
                      <label className="block font-semibold mb-1 text-rose-700">Diskon Awal (%):</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={subDiscount}
                        onChange={(e) => setSubDiscount(Number(e.target.value))}
                        placeholder="0 - 100%"
                        className="w-full py-1.5 px-3 rounded-lg border border-rose-300 bg-rose-50/40 font-mono font-medium text-rose-700"
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
                          <div>
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
                            {sub.description && (
                              <p className="text-[11px] text-[#8C7A82] italic mt-0.5">{sub.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenDescModal('SUBCATEGORY', category.id, `Subbab: ${sub.name}`, sub.description, sub.id)}
                              className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white text-[11px] font-semibold text-[#8C7A82] hover:text-[#4A3B40] flex items-center gap-1 hover:border-[#D4AF37]"
                              title="Edit deskripsi Subbab (Maks 50 kata)"
                            >
                              <FileText size={11} className="text-[#D4AF37]" />
                              <span>{sub.description ? 'Ubah Deskripsi' : '+ Deskripsi'}</span>
                            </button>
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

                        {/* SUBBAB FEATURE FLAGS (Warna, Kode, Tipe, Aksesoris, Ekstensi 1mm, Wajib Upload Desain) */}
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
                              checked={!!sub.useAccessoryManager}
                              onChange={(e) => handleUpdateSubCategoryFlag(category.id, sub.id, 'useAccessoryManager', e.target.checked)}
                              className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-3.5 w-3.5"
                            />
                            <span className="font-semibold text-[#B8860B] flex items-center gap-1">
                              <Sparkles size={11} />
                              Manager Aksesoris
                            </span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B40]">
                            <input
                              type="checkbox"
                              checked={!!sub.useExtensionManager}
                              onChange={(e) => handleUpdateSubCategoryFlag(category.id, sub.id, 'useExtensionManager', e.target.checked)}
                              className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-3.5 w-3.5"
                            />
                            <span className="font-semibold text-emerald-800 flex items-center gap-1">
                              <Ruler size={11} />
                              Ekstensi 1mm
                            </span>
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

                        {/* SUBBAB HARGA & DISKON CONTROLLER (Jika tidak ada Sub-subbab) */}
                        {!hasSubSub && (
                          <div className="bg-white p-3 rounded-xl border border-[#D4AF37]/50 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              {/* Price Controls */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-[#4A3B40] flex items-center gap-1">
                                  <DollarSign size={13} className="text-[#D4AF37]" />
                                  Harga:
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, -10000)}
                                    className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700 transition"
                                    title="Turunkan Rp 10.000"
                                  >
                                    -10rb
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, -5000)}
                                    className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700 transition"
                                    title="Turunkan Rp 5.000"
                                  >
                                    -5rb
                                  </button>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1 text-xs text-gray-400 font-mono">Rp</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={1000}
                                      value={sub.price}
                                      onChange={(e) => handleUpdateSubPriceAndDiscount(category.id, sub.id, undefined, Number(e.target.value))}
                                      className="w-28 pl-7 pr-2 py-1 text-xs font-mono font-bold text-[#B8860B] rounded-lg border border-[#F8BBD0] bg-[#FFFDF9] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, 5000)}
                                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-[#B8860B] border border-amber-200 transition"
                                    title="Naikkan Rp 5.000"
                                  >
                                    +5rb
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, 10000)}
                                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-[#B8860B] border border-amber-200 transition"
                                    title="Naikkan Rp 10.000"
                                  >
                                    +10rb
                                  </button>
                                </div>
                              </div>

                              {/* Discount % Controls */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-[#4A3B40] flex items-center gap-1">
                                  <Percent size={13} className="text-rose-500" />
                                  Diskon:
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, undefined, undefined, Math.max(0, (sub.discountPercent || 0) - 5))}
                                    className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700 transition"
                                    title="Kurangi Diskon 5%"
                                  >
                                    -5%
                                  </button>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={1}
                                      value={sub.discountPercent || 0}
                                      onChange={(e) => handleUpdateSubPriceAndDiscount(category.id, sub.id, undefined, undefined, Number(e.target.value))}
                                      className="w-16 px-2 py-1 text-xs font-mono font-bold text-center text-rose-700 rounded-lg border border-rose-300 bg-rose-50/40 focus:outline-none focus:ring-1 focus:ring-rose-400"
                                    />
                                    <span className="text-xs font-bold text-rose-700 ml-1">%</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, undefined, undefined, Math.min(100, (sub.discountPercent || 0) + 5))}
                                    className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-[10px] font-bold text-rose-800 transition"
                                    title="Tambah Diskon 5%"
                                  >
                                    +5%
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Preset Buttons & Live Price Preview */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] text-[#8C7A82] font-semibold">Preset Diskon:</span>
                                {[0, 5, 10, 15, 20, 25, 30, 50].map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleUpdateSubPriceAndDiscount(category.id, sub.id, undefined, undefined, d)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition ${
                                      (sub.discountPercent || 0) === d
                                        ? 'bg-rose-600 text-white font-bold'
                                        : 'bg-gray-100 hover:bg-rose-100 text-gray-700'
                                    }`}
                                  >
                                    {d === 0 ? '0% (Nonaktif)' : `${d}%`}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-2">
                                {(sub.discountPercent || 0) > 0 ? (
                                  <>
                                    <span className="line-through text-gray-400 font-mono text-[11px]">
                                      Rp {sub.price.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                      Diskon {sub.discountPercent}%
                                    </span>
                                    <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                                      Harga Akhir: Rp {Math.round(sub.price * (1 - (sub.discountPercent || 0) / 100)).toLocaleString('id-ID')}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-mono text-xs font-bold text-[#B8860B]">
                                    Harga Akhir: Rp {sub.price.toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Form Tambah Sub-subbab */}
                        {targetSubIdForSubSub === sub.id && (
                          <div className="p-3.5 rounded-xl bg-[#FFF8E7] border border-[#D4AF37] space-y-2.5 animate-fadeIn">
                            <span className="text-xs font-bold text-[#4A3B40] block">
                              Tambah Sub-subbab (Variasi) untuk &ldquo;{sub.name}&rdquo;:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
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
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={subSubDiscount}
                                onChange={(e) => setSubSubDiscount(Number(e.target.value))}
                                placeholder="Diskon Awal % (0-100%)"
                                className="py-1.5 px-3 rounded-lg border border-rose-300 bg-rose-50/40 font-mono font-medium text-rose-700"
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
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#8C7A82] uppercase tracking-wider block">
                                Daftar Variasi & Atur Harga/Diskon (Sub-subbab):
                              </span>
                              <span className="text-[10px] text-[#B8860B] font-semibold">
                                {sub.subSubCategories!.length} Variasi Tersedia
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {sub.subSubCategories!.map((ssc) => {
                                const hasDisc = (ssc.discountPercent || 0) > 0;
                                const netPrice = hasDisc
                                  ? Math.round(ssc.price * (1 - (ssc.discountPercent || 0) / 100))
                                  : ssc.price;

                                return (
                                  <div
                                    key={ssc.id}
                                    className="p-3 rounded-xl bg-white border border-[#F8BBD0]/60 space-y-2.5 shadow-2xs hover:border-[#D4AF37]/60 transition"
                                  >
                                    <div className="flex items-center justify-between gap-2 border-b border-[#F8BBD0]/30 pb-1.5">
                                      <div>
                                        <span className="font-semibold text-xs text-[#4A3B40]">
                                          {ssc.name}
                                        </span>
                                        {ssc.description && (
                                          <p className="text-[10px] text-[#A08892] italic mt-0.5">{ssc.description}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenDescModal('SUBSUBCATEGORY', category.id, `Variasi: ${ssc.name}`, ssc.description, sub.id, ssc.id)}
                                          className="p-1 text-[#8C7A82] hover:text-[#4A3B40] rounded hover:bg-gray-100"
                                          title="Edit deskripsi Variasi (Maks 50 kata)"
                                        >
                                          <FileText size={12} className="text-[#D4AF37]" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSubSubCategory(category.id, sub.id, ssc.id)}
                                          className="p-1 text-red-400 hover:text-red-600 rounded transition"
                                          title="Hapus Variasi"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Price controls */}
                                    <div className="flex items-center justify-between gap-1 text-xs">
                                      <span className="text-[11px] text-[#8C7A82] font-semibold">Harga (Rp):</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, -5000)}
                                          className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700"
                                          title="Kurang Rp 5.000"
                                        >
                                          -5rb
                                        </button>
                                        <input
                                          type="number"
                                          min={0}
                                          step={1000}
                                          value={ssc.price}
                                          onChange={(e) => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, undefined, Number(e.target.value))}
                                          className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold text-[#B8860B] rounded border border-[#F8BBD0] bg-[#FFFDF9] text-center"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, 5000)}
                                          className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-[#B8860B] border border-amber-200"
                                          title="Tambah Rp 5.000"
                                        >
                                          +5rb
                                        </button>
                                      </div>
                                    </div>

                                    {/* Discount controls */}
                                    <div className="flex items-center justify-between gap-1 text-xs">
                                      <span className="text-[11px] text-rose-700 font-semibold">Diskon (%):</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, undefined, undefined, Math.max(0, (ssc.discountPercent || 0) - 5))}
                                          className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700"
                                          title="Kurang Diskon 5%"
                                        >
                                          -5%
                                        </button>
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          step={1}
                                          value={ssc.discountPercent || 0}
                                          onChange={(e) => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, undefined, undefined, Number(e.target.value))}
                                          className="w-12 px-1 py-0.5 text-xs font-mono font-bold text-rose-700 rounded border border-rose-300 bg-rose-50/40 text-center"
                                        />
                                        <span className="text-xs font-bold text-rose-700">%</span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, undefined, undefined, Math.min(100, (ssc.discountPercent || 0) + 5))}
                                          className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-[10px] font-bold text-rose-800"
                                          title="Tambah Diskon 5%"
                                        >
                                          +5%
                                        </button>
                                      </div>
                                    </div>

                                    {/* Quick presets */}
                                    <div className="flex items-center gap-1 pt-1 border-t border-gray-100 flex-wrap">
                                      {[0, 5, 10, 15, 20, 50].map((d) => (
                                        <button
                                          key={d}
                                          type="button"
                                          onClick={() => handleUpdateSubSubPriceAndDiscount(category.id, sub.id, ssc.id, undefined, undefined, d)}
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition ${
                                            (ssc.discountPercent || 0) === d
                                              ? 'bg-rose-600 text-white font-bold'
                                              : 'bg-gray-100 hover:bg-rose-100 text-gray-700'
                                          }`}
                                        >
                                          {d === 0 ? '0%' : `${d}%`}
                                        </button>
                                      ))}
                                    </div>

                                    {/* Net price display */}
                                    <div className="pt-1 text-[11px] font-medium flex items-center justify-between border-t border-[#F8BBD0]/30">
                                      {hasDisc ? (
                                        <>
                                          <span className="line-through text-gray-400 font-mono text-[10px]">
                                            Rp {ssc.price.toLocaleString('id-ID')}
                                          </span>
                                          <span className="font-mono font-bold text-emerald-700 text-xs">
                                            Net: Rp {netPrice.toLocaleString('id-ID')} (-{ssc.discountPercent}%)
                                          </span>
                                        </>
                                      ) : (
                                        <span className="font-mono font-bold text-[#B8860B] text-xs">
                                          Net: Rp {ssc.price.toLocaleString('id-ID')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
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

      {/* Description Edit Modal with Real-time 50-Word Limit Validation */}
      {descModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#F8BBD0] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
              <h4 className="font-serif font-bold text-base text-[#4A3B40] flex items-center gap-2">
                <FileText size={18} className="text-[#D4AF37]" />
                <span>Edit Deskripsi ({descModal.title})</span>
              </h4>
              <button
                type="button"
                onClick={() => setDescModal(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDescModal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B40] mb-1">
                  Keterangan (Maksimal 50 Kata • Ditampilkan di Bawah Nama):
                </label>
                <textarea
                  rows={4}
                  value={tempDescText}
                  onChange={(e) => setTempDescText(e.target.value)}
                  placeholder="Tuliskan keterangan singkat, menarik, dan informatif..."
                  className={`w-full p-3 rounded-xl border text-xs text-[#4A3B40] focus:outline-none focus:ring-1 ${
                    countWords(tempDescText) > 50
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                      : 'border-[#F8BBD0] bg-white focus:ring-[#D4AF37]'
                  }`}
                />
              </div>

              {/* Live word count indicator */}
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold flex items-center gap-1 ${
                  countWords(tempDescText) > 50 ? 'text-rose-600' : 'text-[#8C7A82]'
                }`}>
                  <span>Jumlah kata:</span>
                  <strong className="font-mono text-sm">{countWords(tempDescText)}</strong>
                  <span>/ 50 kata</span>
                </span>

                {countWords(tempDescText) > 50 ? (
                  <span className="text-[11px] font-bold text-rose-600">
                    Kelebihan {countWords(tempDescText) - 50} kata!
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Sesuai batas kata
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDescModal(null)}
                  className="py-2 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-[#4A3B40] hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={countWords(tempDescText) > 50}
                  className={`py-2 px-5 rounded-xl text-xs font-bold transition shadow-xs ${
                    countWords(tempDescText) > 50
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'gold-button'
                  }`}
                >
                  Simpan Keterangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
