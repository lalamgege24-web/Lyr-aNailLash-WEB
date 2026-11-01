import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Copy, 
  Sparkles 
} from 'lucide-react';
import { salonStore } from './services/store';
import { Reservation, StoreSettings } from './types/salon';
import { SplashScreen } from './components/SplashScreen';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerTypeSelector } from './components/CustomerTypeSelector';
import { RegularBooking } from './components/RegularBooking';
import { MemberBooking } from './components/MemberBooking';
import { GroupBooking } from './components/GroupBooking';
import { ReservationStatusModal } from './components/ReservationStatusModal';

type CustomerView = 'SPLASH' | 'SELECTOR' | 'REGULER' | 'MEMBER' | 'GABUNGAN' | 'SUCCESS_SUMMARY';

export default function App() {
  const [currentView, setCurrentView] = useState<CustomerView>('SPLASH');
  const [settings, setSettings] = useState<StoreSettings>(() => salonStore.getSettings());
  const [categories, setCategories] = useState(() => salonStore.getCategories());
  const [colors, setColors] = useState(() => salonStore.getColors());
  const [codes, setCodes] = useState(() => salonStore.getCodes());
  const [types, setTypes] = useState(() => salonStore.getTypes());
  const [vouchers, setVouchers] = useState(() => salonStore.getVouchers());
  const [reservations, setReservations] = useState<Reservation[]>(() => salonStore.getReservations());

  // Status check modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [initialStatusPhone, setInitialStatusPhone] = useState('');

  // Latest created reservation for summary view
  const [latestReservation, setLatestReservation] = useState<Reservation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync with centralized store in real-time
  useEffect(() => {
    const unsubscribe = salonStore.subscribe(() => {
      setSettings(salonStore.getSettings());
      setCategories(salonStore.getCategories());
      setColors(salonStore.getColors());
      setCodes(salonStore.getCodes());
      setTypes(salonStore.getTypes());
      setVouchers(salonStore.getVouchers());
      setReservations(salonStore.getReservations());
    });
    return unsubscribe;
  }, []);

  const handleReservationSubmitted = (
    reservationData: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'randomCuteQuote'>
  ) => {
    const newRes = salonStore.addReservation(reservationData);
    setLatestReservation(newRes);
    setCurrentView('SUCCESS_SUMMARY');
  };

  const handleCopyBookingCode = () => {
    if (latestReservation) {
      navigator.clipboard.writeText(latestReservation.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#4A3B40] flex flex-col font-sans">
      {/* If view is SPLASH, show full-screen SplashScreen */}
      {currentView === 'SPLASH' ? (
        <SplashScreen
          settings={settings}
          onEnter={() => setCurrentView('SELECTOR')}
          onOpenStatusCheck={() => {
            setInitialStatusPhone('');
            setIsStatusModalOpen(true);
          }}
        />
      ) : (
        <>
          {/* Main Customer Header */}
          <CustomerHeader
            settings={settings}
            onOpenStatusCheck={() => {
              setInitialStatusPhone('');
              setIsStatusModalOpen(true);
            }}
            onGoHome={() => setCurrentView('SELECTOR')}
          />

          <main className="flex-1 pb-16">
            {currentView === 'SELECTOR' && (
              <CustomerTypeSelector
                onSelectType={(type) => setCurrentView(type)}
                onBackToSplash={() => setCurrentView('SPLASH')}
              />
            )}

            {currentView === 'REGULER' && (
              <RegularBooking
                categories={categories}
                availableColors={colors}
                availableCodes={codes}
                availableTypes={types}
                operationalSchedule={settings.operationalSchedule}
                reservations={reservations}
                settings={settings}
                onSubmitReservation={handleReservationSubmitted}
                onBack={() => setCurrentView('SELECTOR')}
              />
            )}

            {currentView === 'MEMBER' && (
              <MemberBooking
                categories={categories}
                availableColors={colors}
                availableCodes={codes}
                availableTypes={types}
                vouchers={vouchers}
                operationalSchedule={settings.operationalSchedule}
                reservations={reservations}
                settings={settings}
                onSubmitReservation={handleReservationSubmitted}
                onBack={() => setCurrentView('SELECTOR')}
              />
            )}

            {currentView === 'GABUNGAN' && (
              <GroupBooking
                categories={categories}
                availableColors={colors}
                availableCodes={codes}
                availableTypes={types}
                operationalSchedule={settings.operationalSchedule}
                reservations={reservations}
                settings={settings}
                onSubmitReservation={handleReservationSubmitted}
                onBack={() => setCurrentView('SELECTOR')}
              />
            )}

            {currentView === 'SUCCESS_SUMMARY' && latestReservation && (
              <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 animate-fadeIn">
                <div className="luxury-card p-6 sm:p-8 space-y-6 text-center border-[#D4AF37]/50 shadow-xl bg-white">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                      Reservasi Berhasil Terkirim!
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-[#4A3B40]">
                      Terima Kasih, {latestReservation.fullName}!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C7A82] max-w-md mx-auto">
                      Permintaan jadwal treatment Anda telah masuk ke sistem operasional Lyra&apos;s Nail-Lash dan sedang ditinjau oleh staf kami.
                    </p>
                  </div>

                  {/* Booking Code Box */}
                  <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#D4AF37]/40 flex flex-col items-center justify-center gap-1.5">
                    <span className="text-[11px] text-[#8C7A82] uppercase tracking-wider font-semibold">
                      Kode Booking Anda:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-bold text-[#B8860B] tracking-wider">
                        {latestReservation.bookingCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBookingCode}
                        className="p-1.5 rounded-lg bg-white border border-[#D4AF37]/30 hover:bg-[#FFD1DC]/30 text-[#4A3B40] transition"
                        title="Salin Kode Booking"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {copiedCode && (
                      <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                        Kode berhasil disalin!
                      </span>
                    )}
                  </div>

                  {/* Quick Detail Summary */}
                  <div className="text-left bg-[#FFFDF9] p-4 rounded-xl border border-[#F8BBD0]/40 text-xs space-y-2 text-[#4A3B40]">
                    <div className="flex justify-between">
                      <span className="text-[#8C7A82]">Tanggal & Waktu:</span>
                      <span className="font-semibold">{latestReservation.appointmentDate} • {latestReservation.appointmentTime} WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C7A82]">Lokasi:</span>
                      <span className="font-semibold">
                        {latestReservation.location.isHomeService
                          ? `Home Service (${latestReservation.location.calculatedDistanceKm} km)`
                          : 'Studio Lyra’s Nail-Lash'}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-gray-100">
                      <span>Total Estimasi Biaya:</span>
                      <span className="font-mono text-[#B8860B] text-sm">
                        Rp {latestReservation.totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Random Cute Quote */}
                  {latestReservation.randomCuteQuote && (
                    <div className="p-3.5 rounded-xl bg-[#FFF8E7]/50 border border-[#D4AF37]/30 text-xs text-[#4A3B40]">
                      <div className="flex justify-center mb-1 text-[#D4AF37]">
                        <Heart size={14} fill="#F8BBD0" className="text-[#D4AF37]" />
                      </div>
                      <p className="font-serif italic">
                        &ldquo;{latestReservation.randomCuteQuote}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInitialStatusPhone(latestReservation.whatsapp);
                        setIsStatusModalOpen(true);
                      }}
                      className="flex-1 py-3 px-5 rounded-xl gold-button text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Search size={16} />
                      <span>Cek Status Reservasi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentView('SELECTOR')}
                      className="flex-1 py-3 px-5 rounded-xl soft-button text-xs sm:text-sm font-semibold border border-[#F8BBD0]"
                    >
                      <span>Kembali ke Beranda</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-[#F8BBD0]/50 py-8 px-4 text-center text-xs text-[#8C7A82] space-y-1">
            <p className="font-serif font-bold text-[#4A3B40] text-sm">
              {settings.storeName}
            </p>
            <p>
              {settings.storeAddress}
            </p>
          </footer>
        </>
      )}

      {/* Reservation Status Modal (WhatsApp verified) */}
      <ReservationStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        settings={settings}
        initialWhatsapp={initialStatusPhone}
      />
    </div>
  );
}
