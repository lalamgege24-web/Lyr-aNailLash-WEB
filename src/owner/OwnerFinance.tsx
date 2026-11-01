import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Filter, 
  BarChart3, 
  Receipt, 
  ArrowUpRight, 
  Percent 
} from 'lucide-react';
import { Reservation } from '../types/salon';

interface OwnerFinanceProps {
  reservations: Reservation[];
}

type TimeFilterMode = 'TODAY' | 'DATE' | 'WEEK' | 'MONTH' | 'YEAR';

export const OwnerFinance: React.FC<OwnerFinanceProps> = ({ reservations }) => {
  const [filterMode, setFilterMode] = useState<TimeFilterMode>('MONTH');

  // Input filter states
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedWeekStart, setSelectedWeekStart] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState('2026-10'); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState('2026');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter reservations based on selected mode
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Must not be rejected
      if (r.status === 'REJECTED') return false;

      const resDate = r.appointmentDate || r.createdAt.slice(0, 10);

      if (filterMode === 'TODAY') {
        return resDate === todayStr;
      }
      if (filterMode === 'DATE') {
        return resDate === selectedDate;
      }
      if (filterMode === 'WEEK') {
        // 7 days window from selectedWeekStart
        const start = new Date(selectedWeekStart);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        const current = new Date(resDate);
        return current >= start && current < end;
      }
      if (filterMode === 'MONTH') {
        return resDate.startsWith(selectedMonth);
      }
      if (filterMode === 'YEAR') {
        return resDate.startsWith(selectedYear);
      }
      return true;
    });
  }, [reservations, filterMode, todayStr, selectedDate, selectedWeekStart, selectedMonth, selectedYear]);

  // Aggregate numbers
  const grossServicesRevenue = filteredReservations.reduce((acc, r) => acc + r.servicesSubtotal, 0);
  const totalDeliveryRevenue = filteredReservations.reduce((acc, r) => acc + r.deliveryFee, 0);
  const totalDiscounts = filteredReservations.reduce((acc, r) => acc + (r.voucherDiscount + r.coinDiscount), 0);
  const totalNetRevenue = filteredReservations.reduce((acc, r) => acc + r.totalPrice, 0);
  const totalTransactions = filteredReservations.length;
  const completedTransactions = filteredReservations.filter(r => r.status === 'FINISHED').length;

  // Render Bar Chart on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI Canvas setup
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 600;
    const height = 240;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Group revenue by category or day
    const categoryTotals: Record<string, number> = {
      'NAIL ART': 0,
      'EYELASH': 0,
      'LASH LIFT': 0,
      'HOME SERVICE': 0
    };

    filteredReservations.forEach(r => {
      categoryTotals['HOME SERVICE'] += r.deliveryFee || 0;
      if (r.type === 'GABUNGAN' && r.groupMembers) {
        r.groupMembers.forEach(gm => {
          gm.services.forEach(s => {
            const cat = s.categoryName || 'NAIL ART';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + s.finalPrice;
          });
        });
      } else {
        r.services.forEach(s => {
          const cat = s.categoryName || 'NAIL ART';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + s.finalPrice;
        });
      }
    });

    const entries = Object.entries(categoryTotals);
    const maxVal = Math.max(...entries.map(e => e[1]), 100000);

    const paddingX = 40;
    const paddingY = 30;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;
    const barWidth = Math.min(50, chartWidth / entries.length - 20);

    // Draw grid lines
    ctx.strokeStyle = '#F8BBD0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = paddingY + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();

      const labelVal = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#8C7A82';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Rp ${(labelVal / 1000).toFixed(0)}k`, paddingX - 6, y + 3);
    }

    // Draw Bars
    entries.forEach(([cat, val], index) => {
      const x = paddingX + (chartWidth / entries.length) * index + (chartWidth / entries.length - barWidth) / 2;
      const barHeight = (val / maxVal) * chartHeight;
      const y = height - paddingY - barHeight;

      // Bar gradient (Gold to Pink)
      const grad = ctx.createLinearGradient(0, y, 0, height - paddingY);
      if (cat === 'NAIL ART') {
        grad.addColorStop(0, '#D4AF37');
        grad.addColorStop(1, '#FFD1DC');
      } else if (cat === 'EYELASH') {
        grad.addColorStop(0, '#B8860B');
        grad.addColorStop(1, '#F8BBD0');
      } else if (cat === 'LASH LIFT') {
        grad.addColorStop(0, '#E8A598');
        grad.addColorStop(1, '#FFF8E7');
      } else {
        grad.addColorStop(0, '#A78BFA');
        grad.addColorStop(1, '#FFD1DC');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Top value text
      ctx.fillStyle = '#4A3B40';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      if (val > 0) {
        ctx.fillText(`Rp ${(val / 1000).toFixed(0)}k`, x + barWidth / 2, y - 6);
      }

      // Bottom Category label
      ctx.fillStyle = '#4A3B40';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cat, x + barWidth / 2, height - paddingY + 16);
    });

  }, [filteredReservations]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#F8BBD0] gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#4A3B40] flex items-center gap-2">
            <DollarSign size={24} className="text-[#D4AF37]" />
            <span>Laporan Keuangan Dinamis & Analisis Omset</span>
          </h2>
          <p className="text-xs text-[#8C7A82] mt-0.5">
            Filter fleksibel: Hari ini, pilih tanggal, pilih minggu, pilih bulan, dan pilih tahun.
          </p>
        </div>

        {/* Time Filter Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-[#F8BBD0] shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterMode('TODAY')}
            className={`py-1 px-3 rounded-lg text-xs font-semibold transition ${
              filterMode === 'TODAY' ? 'gold-button shadow-2xs' : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('DATE')}
            className={`py-1 px-3 rounded-lg text-xs font-semibold transition ${
              filterMode === 'DATE' ? 'gold-button shadow-2xs' : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            Pilih Tanggal
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('WEEK')}
            className={`py-1 px-3 rounded-lg text-xs font-semibold transition ${
              filterMode === 'WEEK' ? 'gold-button shadow-2xs' : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            Pilih Minggu
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('MONTH')}
            className={`py-1 px-3 rounded-lg text-xs font-semibold transition ${
              filterMode === 'MONTH' ? 'gold-button shadow-2xs' : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            Pilih Bulan
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('YEAR')}
            className={`py-1 px-3 rounded-lg text-xs font-semibold transition ${
              filterMode === 'YEAR' ? 'gold-button shadow-2xs' : 'text-[#8C7A82] hover:text-[#4A3B40]'
            }`}
          >
            Pilih Tahun
          </button>
        </div>
      </div>

      {/* Dynamic Date Pickers depending on filterMode */}
      <div className="luxury-card p-4 bg-[#FFF8E7]/50 border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#B8860B]" />
          <span className="font-bold text-[#4A3B40]">
            Rentang Waktu yang Sedang Dicek:
          </span>
        </div>

        {filterMode === 'DATE' && (
          <div className="flex items-center gap-2">
            <label className="font-semibold text-[#8C7A82]">Tanggal:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-medium"
            />
          </div>
        )}

        {filterMode === 'WEEK' && (
          <div className="flex items-center gap-2">
            <label className="font-semibold text-[#8C7A82]">Minggu Dimulai Tanggal:</label>
            <input
              type="date"
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-medium"
            />
          </div>
        )}

        {filterMode === 'MONTH' && (
          <div className="flex items-center gap-2">
            <label className="font-semibold text-[#8C7A82]">Pilih Bulan & Tahun:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-medium"
            />
          </div>
        )}

        {filterMode === 'YEAR' && (
          <div className="flex items-center gap-2">
            <label className="font-semibold text-[#8C7A82]">Pilih Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-[#F8BBD0] bg-white font-medium"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="2024">Tahun 2024</option>
            </select>
          </div>
        )}

        {filterMode === 'TODAY' && (
          <span className="font-bold text-[#B8860B] bg-white px-3 py-1 rounded-full border border-[#D4AF37]/30">
            Hari Ini: {todayStr}
          </span>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset Bersih */}
        <div className="luxury-card p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FFF8E7] to-[#FFD1DC]/40 border-[#D4AF37] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8860B] block">
            Total Omset Bersih (Net)
          </span>
          <div className="font-serif text-2xl font-bold text-[#4A3B40] mt-1">
            Rp {totalNetRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-[#8C7A82] mt-1">
            Dari {totalTransactions} transaksi tercatat
          </p>
        </div>

        {/* Subtotal Treatment */}
        <div className="luxury-card p-5 bg-white border-[#F8BBD0]/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A82] block">
            Omset Treatment Salon
          </span>
          <div className="font-serif text-2xl font-bold text-[#4A3B40] mt-1">
            Rp {grossServicesRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-[#8C7A82] mt-1">
            Nail art, eyelash & lash lift
          </p>
        </div>

        {/* Ongkir Home Service */}
        <div className="luxury-card p-5 bg-white border-[#F8BBD0]/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A82] block">
            Pendapatan Home Service
          </span>
          <div className="font-serif text-2xl font-bold text-[#4A3B40] mt-1">
            Rp {totalDeliveryRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-[#8C7A82] mt-1">
            Ongkos transport terapis PP
          </p>
        </div>

        {/* Total Diskon */}
        <div className="luxury-card p-5 bg-white border-[#F8BBD0]/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
            Total Diskon Diberikan
          </span>
          <div className="font-serif text-2xl font-bold text-rose-600 mt-1">
            -Rp {totalDiscounts.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-[#8C7A82] mt-1">
            Potongan voucher & koin member
          </p>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#D4AF37]/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base text-[#4A3B40]">
              Grafik Komposisi Pendapatan per Kategori Layanan
            </h3>
          </div>
          <span className="text-xs text-[#8C7A82]">
            Visualisasi Canvas Interaktif
          </span>
        </div>

        <div className="w-full flex justify-center overflow-x-auto py-2">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>
      </div>

      {/* Detailed Customer Transaction Items Table */}
      <div className="luxury-card p-5 sm:p-6 bg-white border-[#F8BBD0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8BBD0] pb-3">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base text-[#4A3B40]">
              Rincian Item Transaksi per Customer
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF8E7] text-[#B8860B] border border-[#D4AF37]/30">
            {filteredReservations.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4A3B40]">
            <thead className="bg-[#FFF8E7] text-[#8C7A82] uppercase text-[10px] tracking-wider border-b border-[#F8BBD0]/50">
              <tr>
                <th className="py-2.5 px-3">Kode Booking</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Rincian Item</th>
                <th className="py-2.5 px-3">Subtotal</th>
                <th className="py-2.5 px-3">Diskon</th>
                <th className="py-2.5 px-3">Transport</th>
                <th className="py-2.5 px-3">Total Bayar</th>
                <th className="py-2.5 px-3">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-[#FFFDF9] transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#B8860B]">
                    {res.bookingCode}
                  </td>
                  <td className="py-2.5 px-3 font-semibold">
                    {res.fullName}
                  </td>
                  <td className="py-2.5 px-3 text-[#8C7A82]">
                    {res.appointmentDate}
                  </td>
                  <td className="py-2.5 px-3 max-w-[220px]">
                    <span className="truncate block">
                      {res.services[0]?.subSubCategoryName || res.services[0]?.subCategoryName || 'Treatment Rombongan'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    Rp {res.servicesSubtotal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-600">
                    {res.voucherDiscount + res.coinDiscount > 0
                      ? `-Rp ${(res.voucherDiscount + res.coinDiscount).toLocaleString('id-ID')}`
                      : 'Rp 0'}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    Rp {res.deliveryFee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#B8860B]">
                    Rp {res.totalPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      res.paymentStatus === 'LUNAS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {res.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
