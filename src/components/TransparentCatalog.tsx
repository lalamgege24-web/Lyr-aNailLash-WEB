import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Palette, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  Category, 
  SubCategory, 
  SubSubCategory, 
  ColorItem, 
  CodeItem, 
  TypeItem, 
  SelectedServiceItem 
} from '../types/salon';

interface TransparentCatalogProps {
  categories: Category[];
  availableColors: ColorItem[];
  availableCodes: CodeItem[];
  availableTypes: TypeItem[];
  selectedServices: SelectedServiceItem[];
  onToggleService: (item: SelectedServiceItem) => void;
  onUpdateService: (serviceId: string, partial: Partial<SelectedServiceItem>) => void;
  onRemoveService: (serviceId: string) => void;
}

export const TransparentCatalog: React.FC<TransparentCatalogProps> = ({
  categories,
  availableColors,
  availableCodes,
  availableTypes,
  selectedServices,
  onToggleService,
  onUpdateService,
  onRemoveService
}) => {
  // Helper to check if a specific subCategory or subSubCategory is selected
  const isSelected = (subCategoryId: string, subSubCategoryId?: string) => {
    return selectedServices.some(
      s => s.subCategoryId === subCategoryId && 
      (subSubCategoryId ? s.subSubCategoryId === subSubCategoryId : !s.subSubCategoryId)
    );
  };

  const getSelectedInstance = (subCategoryId: string, subSubCategoryId?: string) => {
    return selectedServices.find(
      s => s.subCategoryId === subCategoryId && 
      (subSubCategoryId ? s.subSubCategoryId === subSubCategoryId : !s.subSubCategoryId)
    );
  };

  // Convert uploaded file to base64
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    serviceId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateService(serviceId, { referencePhotoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#F8BBD0] pb-3">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#4A3B40] flex items-center gap-2">
            <Sparkles size={22} className="text-[#D4AF37]" />
            <span>Katalog Resmi & Pilihan Treatment</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#8C7A82] mt-0.5">
            Seluruh layanan terbuka transparan. Pilih satu atau beberapa perlakuan sesuai kebutuhan Anda.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFF8E7] border border-[#D4AF37]/40 text-[#B8860B]">
          {selectedServices.length} Layanan Terpilih
        </div>
      </div>

      {/* Transparent Hierarchy: Bab -> Subbab -> Sub-subbab */}
      {categories.map((category) => (
        <section 
          key={category.id} 
          className="space-y-4 bg-white/70 rounded-2xl p-5 sm:p-6 border border-[#F8BBD0]/60 shadow-xs"
        >
          {/* Bab (Kategori Utama: NAIL ART, EYELASH, LASH LIFT) */}
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#4A3B40]">
                  {category.name}
                </h4>
              </div>
              {category.description && (
                <p className="text-xs text-[#8C7A82] mt-0.5 ml-4.5">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Subbab (Jenis Pelayanan) */}
          <div className="grid grid-cols-1 gap-5 pt-2">
            {category.subCategories.map((subCategory) => {
              const hasSubSub = subCategory.subSubCategories && subCategory.subSubCategories.length > 0;
              const directSelected = !hasSubSub && isSelected(subCategory.id);
              const directInstance = directSelected ? getSelectedInstance(subCategory.id) : null;

              return (
                <div 
                  key={subCategory.id}
                  className={`rounded-xl p-4 sm:p-5 border transition ${
                    directSelected || (hasSubSub && subCategory.subSubCategories?.some(ssc => isSelected(subCategory.id, ssc.id)))
                      ? 'border-[#D4AF37] bg-[#FFF8E7]/30 shadow-xs'
                      : 'border-[#F8BBD0]/40 bg-white hover:border-[#F8BBD0]'
                  }`}
                >
                  {/* Subbab Header & Direct Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-serif font-bold text-base sm:text-lg text-[#4A3B40]">
                          {subCategory.name}
                        </h5>
                        {subCategory.requireDesignUpload && (
                          <span className="text-[10px] bg-[#FFD1DC] text-[#4A3B40] font-semibold px-2 py-0.5 rounded-full">
                            Wajib Foto Desain
                          </span>
                        )}
                      </div>
                      {subCategory.description && (
                        <p className="text-xs text-[#8C7A82]">
                          {subCategory.description}
                        </p>
                      )}
                    </div>

                    {/* If NO Sub-subbab: Show Price on Subbab */}
                    {!hasSubSub && (() => {
                      const hasDiscount = (subCategory.discountPercent ?? 0) > 0;
                      const effectivePrice = hasDiscount
                        ? Math.round(subCategory.price * (1 - (subCategory.discountPercent || 0) / 100))
                        : subCategory.price;

                      return (
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            {hasDiscount && (
                              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                                <span className="line-through text-[11px] text-[#8C7A82] font-mono">
                                  Rp {subCategory.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full border border-rose-200">
                                  Diskon {subCategory.discountPercent}%
                                </span>
                              </div>
                            )}
                            <span className="font-mono text-base font-bold text-[#B8860B]">
                              {effectivePrice > 0 ? `Rp ${effectivePrice.toLocaleString('id-ID')}` : 'Harga Custom'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (directSelected && directInstance) {
                                onRemoveService(directInstance.serviceId);
                              } else {
                                onToggleService({
                                  serviceId: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                  categoryId: category.id,
                                  categoryName: category.name,
                                  subCategoryId: subCategory.id,
                                  subCategoryName: subCategory.name,
                                  price: subCategory.price,
                                  discountPrice: hasDiscount ? effectivePrice : undefined,
                                  finalPrice: effectivePrice,
                                  selectedColors: []
                                });
                              }
                            }}
                            className={`py-1.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                              directSelected
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : 'soft-button border border-[#F8BBD0] hover:scale-102'
                            }`}
                          >
                            {directSelected ? (
                              <>
                                <Trash2 size={13} />
                                <span>Batal</span>
                              </>
                            ) : (
                              <>
                                <Plus size={13} />
                                <span>Pilih Layanan</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* If SubCategory has Sub-subcategories (Variations) */}
                  {hasSubSub && (
                    <div className="mt-4 pt-3 border-t border-[#F8BBD0]/40 space-y-3">
                      <span className="text-[11px] font-semibold text-[#8C7A82] uppercase tracking-wider block">
                        Pilihan Variasi (Sub-subbab):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {subCategory.subSubCategories!.map((subSub) => {
                          const variantSelected = isSelected(subCategory.id, subSub.id);
                          const variantInstance = variantSelected ? getSelectedInstance(subCategory.id, subSub.id) : null;
                          const hasSubSubDiscount = (subSub.discountPercent ?? 0) > 0;
                          const effectiveSubSubPrice = hasSubSubDiscount
                            ? Math.round(subSub.price * (1 - (subSub.discountPercent || 0) / 100))
                            : subSub.price;

                          return (
                            <div
                              key={subSub.id}
                              onClick={() => {
                                if (variantSelected && variantInstance) {
                                  onRemoveService(variantInstance.serviceId);
                                } else {
                                  onToggleService({
                                    serviceId: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                    categoryId: category.id,
                                    categoryName: category.name,
                                    subCategoryId: subCategory.id,
                                    subCategoryName: subCategory.name,
                                    subSubCategoryId: subSub.id,
                                    subSubCategoryName: subSub.name,
                                    price: subSub.price,
                                    discountPrice: hasSubSubDiscount ? effectiveSubSubPrice : undefined,
                                    finalPrice: effectiveSubSubPrice,
                                    selectedColors: []
                                  });
                                }
                              }}
                              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                                variantSelected
                                  ? 'gold-border-active bg-[#FFF8E7]'
                                  : 'border-[#F8BBD0]/40 bg-white hover:bg-[#FFFDF9]'
                              }`}
                            >
                              <div className="text-xs">
                                <span className="font-semibold text-[#4A3B40] block">
                                  {subSub.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {hasSubSubDiscount && (
                                    <>
                                      <span className="line-through text-[10px] text-gray-400 font-mono">
                                        Rp {subSub.price.toLocaleString('id-ID')}
                                      </span>
                                      <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1 rounded-full border border-rose-200">
                                        -{subSub.discountPercent}%
                                      </span>
                                    </>
                                  )}
                                  <span className="text-[11px] text-[#B8860B] font-mono font-bold">
                                    Rp {effectiveSubSubPrice.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                variantSelected ? 'bg-[#D4AF37] text-white' : 'border border-gray-300'
                              }`}>
                                {variantSelected && <Check size={12} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Customizations Panel for selected service under this Subcategory */}
                  {selectedServices
                    .filter(s => s.subCategoryId === subCategory.id)
                    .map((activeService) => (
                      <div 
                        key={activeService.serviceId}
                        className="mt-4 p-4 rounded-xl bg-white border border-[#D4AF37]/40 space-y-4 animate-fadeIn"
                      >
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F8BBD0]/30">
                          <span className="font-semibold text-[#4A3B40]">
                            Kustomisasi untuk: <strong className="text-[#B8860B]">{activeService.subSubCategoryName || activeService.subCategoryName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveService(activeService.serviceId)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium text-[11px]"
                          >
                            <Trash2 size={12} /> Hapus dari Pesanan
                          </button>
                        </div>

                        {/* 1. Color Manager (Multiselect with visual swatches) */}
                        {subCategory.useColorManager && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#4A3B40] flex items-center gap-1.5">
                              <Palette size={14} className="text-[#D4AF37]" />
                              <span>Pilih Warna Toko (Bisa Pilih Lebih dari 1 / Multiselect):</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {availableColors.map((color) => {
                                const isColorPicked = activeService.selectedColors?.includes(color.name);
                                return (
                                  <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => {
                                      const current = activeService.selectedColors || [];
                                      const next = isColorPicked
                                        ? current.filter(c => c !== color.name)
                                        : [...current, color.name];
                                      onUpdateService(activeService.serviceId, { selectedColors: next });
                                    }}
                                    className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition ${
                                      isColorPicked
                                        ? 'gold-border-active bg-[#FFF8E7] text-[#4A3B40] font-semibold'
                                        : 'border-[#F8BBD0]/50 bg-white hover:bg-gray-50 text-[#8C7A82]'
                                    }`}
                                  >
                                    <span
                                      className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs shrink-0"
                                      style={{ backgroundColor: color.hex || '#FFD1DC' }}
                                    />
                                    <span>{color.name}</span>
                                    {isColorPicked && <Check size={12} className="text-[#D4AF37]" />}
                                  </button>
                                );
                              })}
                            </div>
                            {activeService.selectedColors && activeService.selectedColors.length > 0 && (
                              <p className="text-[11px] text-[#B8860B] font-medium">
                                Warna terpilih: {activeService.selectedColors.join(', ')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 2. Code Manager (Charms / Aksesoris / Foil) */}
                        {subCategory.useCodeManager && availableCodes.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#4A3B40] flex items-center gap-1.5">
                              <SlidersHorizontal size={14} className="text-[#D4AF37]" />
                              <span>Pilih Kode Aksesoris / Charm Tambahan:</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableCodes.map((code) => {
                                const isCodePicked = activeService.selectedCode === code.name;
                                return (
                                  <button
                                    key={code.id}
                                    type="button"
                                    onClick={() => {
                                      onUpdateService(activeService.serviceId, {
                                        selectedCode: isCodePicked ? undefined : code.name
                                      });
                                    }}
                                    className={`p-2 rounded-xl border text-left text-xs flex items-center gap-2 transition ${
                                      isCodePicked
                                        ? 'gold-border-active bg-[#FFF8E7]'
                                        : 'border-[#F8BBD0]/50 bg-white hover:bg-gray-50'
                                    }`}
                                  >
                                    {code.imageUrl ? (
                                      <img src={code.imageUrl} alt={code.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-[#FFD1DC]/40 flex items-center justify-center shrink-0">
                                        <Sparkles size={14} className="text-[#B8860B]" />
                                      </div>
                                    )}
                                    <div className="truncate">
                                      <span className="font-semibold text-[#4A3B40] block truncate">{code.name}</span>
                                      <span className="text-[10px] text-[#8C7A82] font-mono">{code.code}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. Type Manager (Bentuk Kuku / Kelengkungan Lash) */}
                        {subCategory.useTypeManager && availableTypes.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#4A3B40] flex items-center gap-1.5">
                              <SlidersHorizontal size={14} className="text-[#D4AF37]" />
                              <span>Pilih Tipe Bentuk / Kelengkungan:</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {availableTypes.map((typeItem) => {
                                const isTypePicked = activeService.selectedType === typeItem.name;
                                return (
                                  <button
                                    key={typeItem.id}
                                    type="button"
                                    onClick={() => {
                                      onUpdateService(activeService.serviceId, {
                                        selectedType: isTypePicked ? undefined : typeItem.name
                                      });
                                    }}
                                    className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition ${
                                      isTypePicked
                                        ? 'gold-border-active bg-[#FFF8E7]'
                                        : 'border-[#F8BBD0]/50 bg-white hover:bg-gray-50'
                                    }`}
                                  >
                                    <div>
                                      <span className="font-semibold text-[#4A3B40] block">{typeItem.name}</span>
                                      {typeItem.description && (
                                        <span className="text-[10px] text-[#8C7A82] line-clamp-1">{typeItem.description}</span>
                                      )}
                                    </div>
                                    {isTypePicked && <Check size={14} className="text-[#D4AF37] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 4. Mandatory Reference Photo Upload (Only when subCategory requires it) */}
                        {subCategory.requireDesignUpload && (
                          <div className="space-y-2 pt-1 border-t border-[#F8BBD0]/30">
                            <label className="text-xs font-semibold text-[#4A3B40] flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Upload size={14} className="text-[#D4AF37]" />
                                Unggah Foto Referensi Desain / Kuku Tangan:
                                <span className="text-red-500">*</span>
                              </span>
                              <span className="text-[10px] text-[#8C7A82]">Format JPG / PNG</span>
                            </label>

                            <div className="flex items-center gap-4">
                              <label className="cursor-pointer py-2 px-4 rounded-xl border border-dashed border-[#D4AF37] hover:bg-[#FFF8E7] transition flex items-center gap-2 text-xs font-medium text-[#B8860B]">
                                <ImageIcon size={16} />
                                <span>{activeService.referencePhotoUrl ? 'Ganti Foto' : 'Pilih File / Foto'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, activeService.serviceId)}
                                />
                              </label>

                              {activeService.referencePhotoUrl && (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={activeService.referencePhotoUrl}
                                    alt="Referensi Desain"
                                    className="w-12 h-12 rounded-lg object-cover border border-[#F8BBD0] shadow-xs"
                                  />
                                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                    <Check size={12} /> Foto siap
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
