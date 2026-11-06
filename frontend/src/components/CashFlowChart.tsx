"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { TransactionItem } from "@/services/transactionService";

interface CashFlowChartProps {
  transactions: TransactionItem[];
  loading?: boolean;
}

export type Timeframe = "hari" | "bulan" | "tahun";

interface ChartDataPoint {
  key: string;
  label: string;
  fullDate: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTH_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function CashFlowChart({ transactions, loading }: CashFlowChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("hari");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Olah data transaksi sesuai timeframe yang dipilih (hari, bulan, atau tahun)
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!transactions || transactions.length === 0) return [];

    // Urutkan transaksi kronologis dari yang terlama ke terbaru
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 1. SORTIR PER HARI
    if (timeframe === "hari") {
      const dailyMap = new Map<string, { income: number; expense: number; count: number; date: Date }>();

      sorted.forEach((t) => {
        const d = new Date(t.date);
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (!dailyMap.has(ymd)) {
          dailyMap.set(ymd, { income: 0, expense: 0, count: 0, date: d });
        }
        const curr = dailyMap.get(ymd)!;
        if (t.type === "MASUK" || t.type === "MODAL") curr.income += t.amount;
        else if (t.type === "KELUAR") curr.expense += t.amount;
        curr.count++;
      });

      return Array.from(dailyMap.entries()).map(([key, val]) => {
        const d = val.date;
        return {
          key,
          label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
          fullDate: `${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`,
          income: val.income,
          expense: val.expense,
          net: val.income - val.expense,
          count: val.count,
        };
      });
    }

    // 2. SORTIR PER BULAN
    if (timeframe === "bulan") {
      const monthlyMap = new Map<string, { income: number; expense: number; count: number; date: Date }>();

      sorted.forEach((t) => {
        const d = new Date(t.date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyMap.has(ym)) {
          monthlyMap.set(ym, { income: 0, expense: 0, count: 0, date: d });
        }
        const curr = monthlyMap.get(ym)!;
        if (t.type === "MASUK" || t.type === "MODAL") curr.income += t.amount;
        else if (t.type === "KELUAR") curr.expense += t.amount;
        curr.count++;
      });

      return Array.from(monthlyMap.entries()).map(([key, val]) => {
        const d = val.date;
        return {
          key,
          label: `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
          fullDate: `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`,
          income: val.income,
          expense: val.expense,
          net: val.income - val.expense,
          count: val.count,
        };
      });
    }

    // 3. SORTIR PER TAHUN
    const yearlyMap = new Map<string, { income: number; expense: number; count: number; date: Date }>();

    sorted.forEach((t) => {
      const d = new Date(t.date);
      const y = `${d.getFullYear()}`;
      if (!yearlyMap.has(y)) {
        yearlyMap.set(y, { income: 0, expense: 0, count: 0, date: d });
      }
      const curr = yearlyMap.get(y)!;
      if (t.type === "MASUK" || t.type === "MODAL") curr.income += t.amount;
      else if (t.type === "KELUAR") curr.expense += t.amount;
      curr.count++;
    });

    return Array.from(yearlyMap.entries()).map(([key, val]) => {
      const d = val.date;
      return {
        key,
        label: `${d.getFullYear()}`,
        fullDate: `Tahun ${d.getFullYear()}`,
        income: val.income,
        expense: val.expense,
        net: val.income - val.expense,
        count: val.count,
      };
    });
  }, [transactions, timeframe]);

  // Otomatis scroll ke ujung kanan (data terbaru) saat chartData atau timeframe berganti
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [chartData, timeframe]);

  // Fungsi navigasi tombol scroller (kiri dan kanan)
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  // Hitung total di periode yang sedang aktif ditampilkan
  const periodTotals = useMemo(() => {
    const inc = chartData.reduce((s, d) => s + d.income, 0);
    const exp = chartData.reduce((s, d) => s + d.expense, 0);
    return {
      income: inc,
      expense: exp,
      net: inc - exp,
    };
  }, [chartData]);

  // Hitung skala Y max
  const maxVal = useMemo(() => {
    if (chartData.length === 0) return 1000000;
    const highest = Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 100000);
    const factor = Math.pow(10, Math.floor(Math.log10(highest)));
    return Math.ceil(highest / (factor / 2)) * (factor / 2) || highest;
  }, [chartData]);

  const activeFocus = hoveredPoint || (chartData.length > 0 ? chartData[chartData.length - 1] : null);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-gray-100">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs">Memuat visualisasi grafik arus kas...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-6 text-center">
        <BarChart3 className="w-10 h-10 text-gray-300 mb-2" />
        <p className="text-sm font-semibold text-gray-700">Belum Ada Riwayat Transaksi</p>
        <p className="text-xs text-gray-400 max-w-sm mt-1">
          Catat transaksi pertama melalui Pembukuan Kas atau POS Kasir untuk melihat tren grafik arus kas bisnis Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header: Period Filter & Navigation Arrows */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Active Highlight Info Card */}
        {activeFocus ? (
          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
            <div className="text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                Periode Terpilih: {activeFocus.fullDate} ({activeFocus.count} transaksi)
              </span>
              <div className="flex items-center gap-3 font-semibold mt-0.5">
                <span className="text-emerald-600 flex items-center gap-0.5" title="Pemasukan Kas">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Rp {activeFocus.income.toLocaleString("id-ID")}
                </span>
                <span className="text-rose-600 flex items-center gap-0.5" title="Pengeluaran Kas">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Rp {activeFocus.expense.toLocaleString("id-ID")}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                  activeFocus.net >= 0 
                    ? "bg-emerald-100/70 text-emerald-800" 
                    : "bg-rose-100/70 text-rose-800"
                }`}>
                  Surplus: {activeFocus.net >= 0 ? "+" : ""}Rp {activeFocus.net.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        ) : <div />}

        {/* Controls: Timeframe Selector (Hari, Bulan, Tahun) + Horizontal Scroller Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap self-start sm:self-auto">
          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeframe("hari")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeframe === "hari"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Per Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("bulan")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeframe === "bulan"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Per Bulan
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("tahun")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeframe === "tahun"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Per Tahun
            </button>
          </div>

          {/* Scroller Nav Buttons (Scroll Kiri & Kanan) */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={handleScrollLeft}
              className="p-1.5 bg-white hover:bg-gray-50 active:bg-gray-200 text-gray-700 rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Geser grafik ke kiri (periode lebih lama)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              className="p-1.5 bg-white hover:bg-gray-50 active:bg-gray-200 text-gray-700 rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Geser grafik ke kanan (periode lebih baru)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Area with Fixed Y-Axis & Horizontal Scrollable X-Axis */}
      <div className="relative border border-gray-200/70 rounded-2xl bg-white p-3 sm:p-4 shadow-2xs">
        <div className="flex">
          {/* Fixed Left Y-Axis Scale */}
          <div className="w-14 sm:w-16 h-60 flex flex-col justify-between text-[10px] text-gray-400 font-mono pb-8 pr-1.5 border-r border-gray-200 flex-shrink-0 select-none text-right">
            <span>Rp {(maxVal / 1000).toLocaleString("id-ID")}k</span>
            <span>Rp {((maxVal * 0.75) / 1000).toLocaleString("id-ID")}k</span>
            <span>Rp {((maxVal * 0.5) / 1000).toLocaleString("id-ID")}k</span>
            <span>Rp {((maxVal * 0.25) / 1000).toLocaleString("id-ID")}k</span>
            <span>Rp 0</span>
          </div>

          {/* Scrollable Container (Horizontal Scroller) */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto pb-2 relative scroll-smooth focus:outline-none"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 #f8fafc",
            }}
          >
            {/* Horizontal Grid lines across the scrollable area */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              <div className="border-b border-gray-100 w-full" />
              <div className="border-b border-gray-100/70 border-dashed w-full" />
              <div className="border-b border-gray-100/70 border-dashed w-full" />
              <div className="border-b border-gray-100/70 border-dashed w-full" />
              <div className="border-b border-gray-200 w-full" />
            </div>

            {/* Bars Flex Row */}
            <div 
              className="relative h-60 flex items-end gap-3 sm:gap-5 px-4"
              style={{ minWidth: `${Math.max(chartData.length * 64, 320)}px` }}
            >
              {chartData.map((d) => {
                const incomeHeight = Math.min(100, Math.max(3, (d.income / maxVal) * 100));
                const expenseHeight = Math.min(100, Math.max(3, (d.expense / maxVal) * 100));
                const isHovered = activeFocus?.key === d.key;

                return (
                  <div
                    key={d.key}
                    onMouseEnter={() => setHoveredPoint(d)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className={`w-14 sm:w-16 flex-shrink-0 h-full flex flex-col items-center justify-end group cursor-pointer transition-transform duration-200 ${
                      isHovered ? "scale-105" : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    {/* Dual Bars (Income & Expense) */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                      {/* Pemasukan Bar (Green) */}
                      <div
                        style={{ height: `${incomeHeight}%` }}
                        className={`w-5 sm:w-6 rounded-t-md transition-all duration-300 relative ${
                          isHovered
                            ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-200"
                            : "bg-gradient-to-t from-emerald-500 to-emerald-400"
                        }`}
                      >
                        {/* Tooltip on bar hover */}
                        {isHovered && d.income > 0 && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 font-semibold shadow-md">
                            +Rp {(d.income / 1000).toFixed(0)}k
                          </div>
                        )}
                      </div>

                      {/* Pengeluaran Bar (Red) */}
                      <div
                        style={{ height: `${expenseHeight}%` }}
                        className={`w-5 sm:w-6 rounded-t-md transition-all duration-300 relative ${
                          isHovered
                            ? "bg-gradient-to-t from-rose-600 to-pink-500 shadow-md shadow-rose-200"
                            : "bg-gradient-to-t from-rose-500 to-rose-400"
                        }`}
                      >
                        {/* Tooltip on bar hover */}
                        {isHovered && d.expense > 0 && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 font-semibold shadow-md">
                            -Rp {(d.expense / 1000).toFixed(0)}k
                          </div>
                        )}
                      </div>
                    </div>

                    {/* X-Axis Label */}
                    <span
                      className={`mt-2 text-[10px] sm:text-xs font-medium truncate whitespace-nowrap transition-colors ${
                        isHovered ? "text-blue-700 font-bold" : "text-gray-500"
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll helper hint */}
        {chartData.length > 5 && (
          <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-gray-400">
            <span>← Geser ke kiri untuk periode lama</span>
            <span className="font-medium text-gray-500">Menampilkan {chartData.length} data {timeframe === "hari" ? "hari" : timeframe === "bulan" ? "bulan" : "tahun"}</span>
            <span>Geser ke kanan untuk periode baru →</span>
          </div>
        )}
      </div>

      {/* Legend & Period Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block shadow-2xs" />
            <span className="text-gray-600 font-medium">Pemasukan Kas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block shadow-2xs" />
            <span className="text-gray-600 font-medium">Pengeluaran Kas</span>
          </div>
        </div>

        {/* Totals in Active View */}
        <div className="flex items-center gap-3 text-gray-500 flex-wrap">
          <span>
            Total Masuk: <strong className="text-emerald-600 font-bold">Rp {periodTotals.income.toLocaleString("id-ID")}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Total Keluar: <strong className="text-rose-600 font-bold">Rp {periodTotals.expense.toLocaleString("id-ID")}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Surplus Kas:{" "}
            <strong className={periodTotals.net >= 0 ? "text-blue-700 font-bold" : "text-rose-700 font-bold"}>
              {periodTotals.net >= 0 ? "+" : ""}Rp {periodTotals.net.toLocaleString("id-ID")}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
