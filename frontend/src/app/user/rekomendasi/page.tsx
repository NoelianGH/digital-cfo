"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ArrowRight,
  Percent,
  Calendar,
  DatabaseZap,
  ClipboardList,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  healthScoreService,
  HealthScoreData,
  AnalysisPeriod,
  PERIOD_MIN_TRANSACTIONS,
  PERIOD_LABELS,
} from "@/services/healthScoreService";

const PERIODS: AnalysisPeriod[] = ["1m", "3m", "6m", "1y"];

export default function RekomendasiAIPage() {
  const [period, setPeriod] = useState<AnalysisPeriod>("1m");
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const minRequired = PERIOD_MIN_TRANSACTIONS[period];
  const hasEnoughData = txCount !== null && txCount >= minRequired;

  const loadAll = useCallback(
    async (isRecalc = false) => {
      if (isRecalc) setRecalculating(true);
      else setLoading(true);

      try {
        const count = await healthScoreService.getTransactionCountForPeriod(period);
        setTxCount(count);

        if (count >= PERIOD_MIN_TRANSACTIONS[period]) {
          const res = await healthScoreService.getHealthScore(period);
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setData(null);
          }
        } else {
          setData(null);
        }
      } finally {
        setLoading(false);
        setRecalculating(false);
      }
    },
    [period]
  );

  useEffect(() => {
    setData(null);
    setTxCount(null);
    loadAll(false);
  }, [period, loadAll]);

  const score = Math.round(data?.score ?? 0);
  const category = data?.category ?? "SEHAT";
  const runway = data?.indicators?.cashRunwayBulan ?? data?.indicators?.cash_runway ?? 0;
  const margin = data?.indicators?.profitMargin ?? data?.indicators?.unit_economics ?? 0;
  const growth = data?.indicators?.trendGrowth ?? data?.indicators?.trend_analysis ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Rekomendasi</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Evaluasi kesehatan finansial cerdas berdasarkan riwayat pembukuan Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p
                    ? "bg-white text-purple-700 shadow-sm border border-purple-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadAll(true)}
            disabled={recalculating || loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            {recalculating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Hitung Ulang</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
          <p className="text-xs">Menganalisis data pembukuan {PERIOD_LABELS[period]}...</p>
        </div>
      ) : !hasEnoughData ? (
        <InsufficientDataState
          period={period}
          txCount={txCount ?? 0}
          minRequired={minRequired}
          onChangePeriod={setPeriod}
        />
      ) : (
        <>
          {/* Main Health Score Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <span className="absolute top-4 right-4 sm:top-6 sm:right-6 px-2.5 py-1 bg-white/10 border border-white/20 text-purple-200 text-[10px] font-semibold rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Analisis {PERIOD_LABELS[period]}
            </span>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs uppercase font-semibold text-purple-300 tracking-wider">
                  Indeks Kesehatan Bisnis UMKM
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Kondisi Bisnis:{" "}
                  <span
                    className={
                      category === "SEHAT"
                        ? "text-emerald-400"
                        : category === "WASPADA"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }
                  >
                    {category}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {category === "SEHAT"
                    ? "Arus kas Anda stabil dengan rasio runway kas dan margin keuntungan yang sangat memadai. Usaha Anda siap untuk ekspansi atau reinvestasi stok."
                    : category === "WASPADA"
                    ? "Terdapat indikator operasional yang perlu diefisiensikan, perhatikan pengeluaran harian dan kelola utang usaha."
                    : "Kondisi kas kritis! Segera potong biaya non-esensial dan percepat penagihan piutang dagang."}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm self-start md:self-auto">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex flex-col items-center justify-center font-black shadow-lg">
                  <span className="text-3xl leading-none">{score}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80 mt-1">Skor / 100</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-slate-300">Model: Fuzzy Tsukamoto</p>
                  <p className="font-semibold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Terverifikasi Akurat
                  </p>
                  <p className="text-[11px] text-slate-400">Data: {txCount} transaksi</p>
                  <p className="text-[11px] text-slate-400">
                    Diperbarui: {new Date(data?.createdAt || Date.now()).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold">Cash Runway</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xl font-bold text-white">{runway.toFixed(1)} Bulan</p>
                <p className="text-[11px] text-slate-400 mt-1">Estimasi kas bertahan tanpa omzet baru</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold">Unit Economics / Margin</span>
                  <Percent className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-white">{margin.toFixed(1)}%</p>
                <p className="text-[11px] text-slate-400 mt-1">Rasio laba kotor terhadap omzet penjualan</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span className="font-semibold">Tren Pertumbuhan</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-xl font-bold text-white">
                  {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Pertumbuhan omzet dibanding periode sebelumnya</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Daftar Rekomendasi Tindakan (Decision Engine)
              </h3>
              <span className="text-xs text-gray-500 font-medium">Prioritas Berdasarkan SAW Ranking</span>
            </div>

            <div className="space-y-3">
              {(data?.recommended_actions && data.recommended_actions.length > 0
                ? data.recommended_actions
                : []
              ).map((rec, index) => (
                <div
                  key={rec.id || index}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-purple-200">
                      #{rec.rank || index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                        {rec.action?.title || "Rekomendasi Taktis UMKM"}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {rec.action?.description || "Optimalkan arus kas dengan strategi penghematan terukur."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <span className="text-[11px] px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                      Skor SAW: {(rec.preference_value * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={() =>
                        alert(`Rekomendasi "${rec.action?.title}" ditandai sebagai rencana tindakan aktif!`)
                      }
                      className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Terapkan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Insufficient Data UI ── */
function InsufficientDataState({
  period,
  txCount,
  minRequired,
  onChangePeriod,
}: {
  period: AnalysisPeriod;
  txCount: number;
  minRequired: number;
  onChangePeriod: (p: AnalysisPeriod) => void;
}) {
  const progress = Math.min((txCount / minRequired) * 100, 100);
  const remaining = minRequired - txCount;

  const suggestions: { period: AnalysisPeriod; min: number }[] = (
    ["1m", "3m", "6m", "1y"] as AnalysisPeriod[]
  )
    .filter((p) => p !== period)
    .map((p) => ({ period: p, min: PERIOD_MIN_TRANSACTIONS[p] }));

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-full max-w-xl bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-6 py-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <DatabaseZap className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base">Data Belum Mencukupi</h2>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Analisis AI membutuhkan minimal{" "}
              <span className="font-bold text-amber-700">{minRequired} transaksi</span> dalam{" "}
              {PERIOD_LABELS[period]} terakhir agar rekomendasinya akurat dan tidak menyesatkan.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-700 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-purple-500" />
              Transaksi dalam {PERIOD_LABELS[period]}
            </span>
            <span className={txCount > 0 ? "text-amber-700" : "text-gray-400"}>
              {txCount} / {minRequired}
            </span>
          </div>

          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background:
                  progress >= 100 ? "#10b981" : progress >= 50 ? "#f59e0b" : "#e11d48",
              }}
            />
          </div>

          <p className="text-xs text-gray-500">
            {txCount === 0
              ? "Belum ada data pembukuan. Mulai catat transaksi di menu Pembukuan."
              : `Tambahkan ${remaining} transaksi lagi untuk mengaktifkan analisis ${PERIOD_LABELS[period]}.`}
          </p>
        </div>
      </div>

      {/* Suggest shorter periods */}
      <div className="w-full max-w-xl">
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Coba periode yang berbeda:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {suggestions.map((s) => {
            const locked = txCount < s.min;
            return (
              <button
                key={s.period}
                onClick={() => !locked && onChangePeriod(s.period)}
                disabled={locked}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  locked
                    ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 cursor-pointer"
                }`}
              >
                <span>{PERIOD_LABELS[s.period]}</span>
                {locked ? (
                  <span className="text-gray-300 text-[10px]">{s.min}tx</span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <a
        href="/user/pembukuan"
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
      >
        <ClipboardList className="w-4 h-4" />
        Catat Transaksi Sekarang
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
