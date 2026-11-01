import React, { useState } from 'react';
import { 
  Search, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Star, 
  ExternalLink, 
  Sparkles, 
  Receipt, 
  Heart 
} from 'lucide-react';
import { Reservation, StoreSettings } from '../types/salon';
import { salonStore } from '../services/store';

interface ReservationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  initialWhatsapp?: string;
}

export const ReservationStatusModal: React.FC<ReservationStatusModalProps> = ({
  isOpen,
  onClose,
  settings,
  initialWhatsapp = ''
}) => {
  const [whatsappQuery, setWhatsappQuery] = useState(initialWhatsapp);
  const [hasSearched, setHasSearched] = useState(!!initialWhatsapp);
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    if (initialWhatsapp) {
      const clean = initialWhatsapp.replace(/\D/g, '');
      return salonStore.getReservations().filter(r => r.whatsapp.replace(/\D/g, '').includes(clean));
    }
    return [];
  });

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = whatsappQuery.replace(/\D/g, '');
    if (!clean || clean.length < 5) {
      setReservations([]);
      setHasSearched(true);
      return;
    }

    const all = salonStore.getReservations();
    const matched = all.filter(r => {
      const mainMatch = r.whatsapp.replace(/\D/g, '').includes(clean);
      const groupMatch = r.groupMembers?.some(m => m.whatsapp.replace(/\D/g, '').includes(clean));
      return mainMatch || groupMatch;
    });

    setReservations(matched);
    setHasSearched(true);
  };

  const handleConfirmGoogleMapsReview = (resId: string, phone: string) => {
    salonStore.markGoogleMapsRated(resId, phone);
    // Refresh local list
    const all = salonStore.getReservations();
    const clean = whatsappQuery.replace(/\D/g, '');
    setReservations(all.filter(r => r.whatsapp.replace(/\D/g, '').includes(clean)));
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={13} />
            <span>Disetujui (Approved)</span>
          </span>
        );
      case 'FINISHED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]">
            <Sparkles size={13} />
            <span>Selesai Treatment (Completed)</span>
          </span>
        );
      case 'NEEDS_DISCUSSION':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Clock size={13} />
            <span>Perlu Diskusi Tambahan</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle size={13} />
            <span>Tidak Disetujui</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={13} />
            <span>Menunggu Konfirmasi (Pending)</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#F8BBD0] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#F8BBD0]/50 flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FFD1DC] text-[#4A3B40] flex items-center justify-center shadow-xs">
              <Search size={20} className="text-[#B8860B]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#4A3B40]">
                Cek Status Reservasi Customer
              </h3>
              <p className="text-xs text-[#8C7A82]">
                Wajib memasukkan Nomor WhatsApp yang digunakan saat reservasi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white/80 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-5 border-b border-[#F8BBD0]/30 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="tel"
                required
                value={whatsappQuery}
                onChange={(e) => setWhatsappQuery(e.target.value)}
                placeholder="Masukkan Nomor WhatsApp Anda (contoh: 081234567890)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#F8BBD0] text-xs sm:text-sm text-[#4A3B40] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
              <Search size={16} className="absolute left-3 top-3 text-[#8C7A82]" />
            </div>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl gold-button text-xs sm:text-sm font-bold shadow-xs hover:scale-101 transition shrink-0"
            >
              Cari Status
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!hasSearched ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF8E7] border border-[#D4AF37]/30 flex items-center justify-center text-[#B8860B]">
                <Receipt size={32} />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#4A3B40]">
                Silakan Masukkan Nomor WhatsApp
              </h4>
              <p className="text-xs text-[#8C7A82] max-w-sm mx-auto">
                Sesuai ketentuan keamanan sistem, detail reservasi hanya dapat diakses melalui verifikasi nomor WhatsApp Anda.
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-white rounded-2xl border border-dashed border-[#F8BBD0] p-6">
              <AlertCircle size={36} className="mx-auto text-[#B8860B]" />
              <h4 className="font-serif text-base font-bold text-[#4A3B40]">
                Tidak Ada Reservasi Ditemukan
              </h4>
              <p className="text-xs text-[#8C7A82]">
                Tidak ada data reservasi yang terdaftar dengan nomor WhatsApp <span className="font-bold text-[#4A3B40]">{whatsappQuery}</span>. Pastikan nomor sudah benar.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((res) => {
                const isFinished = res.status === 'FINISHED';

                return (
                  <div
                    key={res.id}
                    className="luxury-card p-5 sm:p-6 space-y-4 border-[#D4AF37]/40 bg-white shadow-xs relative overflow-hidden"
                  >
                    {/* Top row: Booking Code & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F8BBD0]/40 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#B8860B]">
                            {res.bookingCode}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#4A3B40]">
                            {res.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <h4 className="font-serif text-lg font-bold text-[#4A3B40]">
                            {res.fullName}
                          </h4>
                          {/* Star Badge for Verified Reviewer */}
                          {res.hasRatedGoogleMaps && (
                            <span 
                              title="Verified 5-Star Reviewer di Google Maps!"
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 shadow-2xs"
                            >
                              <Star size={12} fill="#D4AF37" className="text-[#D4AF37]" />
                              <span>⭐ Reviewer Bintang 5</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="self-start sm:self-center">
                        {getStatusBadge(res.status)}
                      </div>
                    </div>

                    {/* Schedule & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FFFDF9] p-3 rounded-xl border border-[#F8BBD0]/40">
                      <div>
                        <span className="text-[#8C7A82] block">Jadwal Treatment:</span>
                        <span className="font-semibold text-[#4A3B40]">
                          {res.appointmentDate} • Pukul {res.appointmentTime} WIB
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C7A82] block">Lokasi:</span>
                        <span className="font-semibold text-[#4A3B40]">
                          {res.location.isHomeService
                            ? `Home Service (${res.location.calculatedDistanceKm} km) - ${res.location.village}, ${res.location.district}`
                            : 'Studio Lyra’s Nail-Lash (Kunjungan Salon)'}
                        </span>
                      </div>
                    </div>

                    {/* Service items detail */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#4A3B40] block">
                        Rincian Layanan yang Dipilih:
                      </span>
                      {res.type === 'GABUNGAN' && res.groupMembers ? (
                        <div className="space-y-2">
                          {res.groupMembers.map((gm, i) => (
                            <div key={gm.id} className="p-2.5 rounded-lg bg-[#FFF8E7]/40 border border-[#F8BBD0]/30 text-xs">
                              <span className="font-bold text-[#B8860B] block">
                                Anggota {i + 1}: {gm.fullName} ({gm.whatsapp})
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-[#4A3B40] mt-1">
                                {gm.services.map((s, idx) => (
                                  <li key={idx}>
                                    {s.subSubCategoryName || s.subCategoryName} {s.selectedColors?.length ? `(Warna: ${s.selectedColors.join(', ')})` : ''} — Rp {s.finalPrice.toLocaleString('id-ID')}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {res.services.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-100 pb-1">
                              <div>
                                <span className="font-semibold text-[#4A3B40]">
                                  {s.categoryName} • {s.subSubCategoryName || s.subCategoryName}
                                </span>
                                {s.selectedColors && s.selectedColors.length > 0 && (
                                  <span className="block text-[11px] text-[#8C7A82]">
                                    Warna: {s.selectedColors.join(', ')}
                                  </span>
                                )}
                                {s.selectedType && (
                                  <span className="block text-[11px] text-[#8C7A82]">
                                    Tipe: {s.selectedType}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-medium text-[#4A3B40]">
                                Rp {s.finalPrice.toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-[#FFF8E7]/40 p-3.5 rounded-xl border border-[#D4AF37]/30 text-xs space-y-1.5 text-[#4A3B40]">
                      <div className="flex justify-between">
                        <span>Subtotal Layanan:</span>
                        <span className="font-mono">Rp {res.servicesSubtotal.toLocaleString('id-ID')}</span>
                      </div>
                      {res.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Ongkos Transportasi Home Service:</span>
                          <span className="font-mono">Rp {res.deliveryFee.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {res.voucherDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Diskon Voucher:</span>
                          <span className="font-mono">-Rp {res.voucherDiscount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {res.coinDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Diskon Koin:</span>
                          <span className="font-mono">-Rp {res.coinDiscount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#D4AF37]/30">
                        <span>Total Biaya:</span>
                        <span className="font-mono text-[#B8860B] text-base">Rp {res.totalPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#8C7A82] pt-1">
                        <span>Status Pembayaran:</span>
                        <span className="font-bold text-[#4A3B40]">
                          {res.paymentStatus === 'LUNAS' ? 'LUNAS ✅' : res.paymentStatus === 'DP' ? 'Uang Muka (DP) 💳' : 'Belum Bayar (Bayar di Tempat) ⏳'}
                        </span>
                      </div>
                    </div>

                    {/* Random Cute Quote in Owner Notes */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-[#FFD1DC]/40 border border-[#F8BBD0] space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#B8860B]">
                        <Heart size={13} fill="#F8BBD0" className="text-[#D4AF37]" />
                        <span>Catatan Toko & Pesan Manis Hari Ini:</span>
                      </div>
                      {res.ownerNotes && (
                        <p className="text-xs text-[#4A3B40] font-medium">
                          {res.ownerNotes}
                        </p>
                      )}
                      {res.randomCuteQuote && (
                        <p className="font-serif italic text-xs text-[#4A3B40] pt-1">
                          &ldquo;{res.randomCuteQuote}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Action If Treatment is FINISHED: Google Maps 5-Star Review Button */}
                    {isFinished && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFF8E7] via-amber-50 to-[#FFD1DC]/40 border border-[#D4AF37] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star size={18} fill="#D4AF37" className="text-[#D4AF37]" />
                            <span className="font-serif font-bold text-sm text-[#4A3B40]">
                              Perawatan Anda Telah Selesai! ✨
                            </span>
                          </div>
                          {res.coinAwarded ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-white">
                              +{res.coinAwarded} Koin Diperoleh
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-[#8C7A82] leading-relaxed">
                          Terima kasih telah mempercayakan kecantikan kuku dan bulu mata Anda di Lyra&apos;s Nail-Lash! Bagikan pengalaman memukau Anda dengan memberikan bintang 5 di Google Maps kami.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                          <a
                            href={settings.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl gold-button text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:scale-101 transition"
                          >
                            <ExternalLink size={14} />
                            <span>Beri Ulasan Bintang 5 di Google Maps</span>
                          </a>

                          {!res.hasRatedGoogleMaps ? (
                            <button
                              type="button"
                              onClick={() => handleConfirmGoogleMapsReview(res.id, res.whatsapp)}
                              className="w-full sm:w-auto py-2.5 px-4 rounded-xl soft-button text-xs font-semibold border border-[#F8BBD0] hover:bg-white transition"
                            >
                              Saya Sudah Memberikan Review ⭐
                            </button>
                          ) : (
                            <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                              <Star size={14} fill="#D4AF37" className="text-[#D4AF37]" />
                              Terverifikasi Bintang 5!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
