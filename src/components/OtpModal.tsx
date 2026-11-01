import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, RefreshCw, KeyRound } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => boolean | Promise<boolean>;
  targetType: 'WHATSAPP' | 'EMAIL';
  targetDestination: string;
  purpose: string;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  targetType,
  targetDestination,
  purpose
}) => {
  const [otp, setOtp] = useState('');
  const [mockGeneratedOtp, setMockGeneratedOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate a realistic 6-digit OTP when modal opens
  useEffect(() => {
    if (isOpen) {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setMockGeneratedOtp(generated);
      setOtp('');
      setErrorMsg('');
      setCountdown(60);
    }
  }, [isOpen, targetDestination]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleResend = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockGeneratedOtp(newOtp);
    setCountdown(60);
    setErrorMsg('');
  };

  const handleConfirm = async () => {
    if (otp.length < 6) {
      setErrorMsg('Masukkan 6 digit kode OTP secara lengkap.');
      return;
    }
    if (otp !== mockGeneratedOtp) {
      setErrorMsg('Kode OTP tidak valid atau salah. Silakan periksa kembali!');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    try {
      const success = await onVerify(otp);
      if (success) {
        onClose();
      } else {
        setErrorMsg('Verifikasi gagal. Silakan coba lagi.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#FFFDF9] rounded-2xl p-6 shadow-2xl border border-[#F8BBD0] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-[#FFD1DC]/20 transition"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FFD1DC]/50 flex items-center justify-center text-[#B8860B]">
            <ShieldCheck size={28} />
          </div>

          <h3 className="text-xl font-bold font-serif text-[#4A3B40]">
            Verifikasi Kode OTP
          </h3>

          <p className="text-sm text-[#8C7A82] leading-relaxed">
            Untuk keperluan <span className="font-semibold text-[#4A3B40]">{purpose}</span>, kode OTP resmi telah dikirimkan ke {targetType === 'WHATSAPP' ? 'nomor WhatsApp' : 'alamat email'}:
          </p>

          <div className="inline-block px-3 py-1 bg-[#FFF8E7] rounded-full border border-[#D4AF37]/40 text-xs font-semibold text-[#B8860B]">
            {targetDestination}
          </div>

          {/* Realistic Notification Simulator banner */}
          <div className="bg-[#FFF8E7] border border-[#F8BBD0] p-3 rounded-xl text-left space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#B8860B]">
              <span>Simulasi Notifikasi {targetType}:</span>
              <span className="text-[10px] bg-[#FFD1DC] text-[#4A3B40] px-1.5 py-0.5 rounded">Baru saja</span>
            </div>
            <p className="text-xs text-[#4A3B40]">
              [Lyra&apos;s Nail-Lash] Kode OTP rahasia Anda adalah: <strong className="text-sm tracking-wider font-mono text-[#D4AF37]">{mockGeneratedOtp}</strong>. Jangan bagikan kepada siapa pun.
            </p>
            <button
              type="button"
              onClick={() => setOtp(mockGeneratedOtp)}
              className="text-[11px] text-[#B8860B] underline hover:text-[#4A3B40] font-medium pt-1"
            >
              Isi otomatis kode ini
            </button>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-[#4A3B40] mb-2 text-left">
              Masukkan 6-Digit Kode OTP:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-xl border border-[#F8BBD0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-500 mt-2 text-left font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#8C7A82] pt-1">
            <span>Tidak menerima kode?</span>
            {countdown > 0 ? (
              <span className="text-[#B8860B]">Kirim ulang dalam {countdown}d</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw size={12} /> Kirim Ulang
              </button>
            )}
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isVerifying || otp.length < 6}
              className="flex-1 py-2.5 px-4 rounded-xl gold-button text-sm font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <KeyRound size={16} />
              {isVerifying ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
