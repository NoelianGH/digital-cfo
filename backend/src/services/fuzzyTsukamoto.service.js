function linearDown(x, a, b){
    if (x <= a) return 1;
    if (x >= b) return 0;
    return (b - x) / (b - a);
}

function linearUp(x, a, b){
    if (x <= a) return 0;
    if (x >= b) return 1;
    return (x - a) / (b - a);
}

function triangle(x, a, b, c){
    if (x <= a || x >= c) return 0;
    if (x > a && x <= b) return (x - a) / (b - a);
    if (x > b && x < c) return (c - x) / (c - b);
    return 0;
}

function getZUp(alpha, zMin, zMax){
    return zMin + alpha * (zMax - zMin);
}

function getZDown(alpha, zMin, zMax){
    return zMax - alpha * (zMax - zMin);
}

function fuzzyCashRunaway(saldo, meanPengeluaran){
    if(meanPengeluaran <= 0){
        return{
            runwayBulan:12,
            pendek:0,
            sedang:0,
            panjang:1,
        }
    }
    const cash_runaway = saldo/meanPengeluaran;
    const pendek = linearDown(cash_runaway, 0, 3);
    const sedang = triangle(cash_runaway, 2, 4, 6);
    const panjang = linearUp(cash_runaway, 5, 8);

    return {
        runwayBulan: cash_runaway,
        pendek: pendek,
        sedang: sedang,
        panjang: panjang,
    };
}

function fuzzyUnitEconomics(totalPenjualan, totalPengeluaran){
    if(totalPenjualan <= 0){
        return{
            runwayPenjualan:99999999,
            rendah:1,
            sedang:0,
            tinggi:0,
        }
    }
    const margin = (totalPenjualan - totalPengeluaran) / totalPenjualan;
    const rendah = linearDown(margin, 0, 0.15);
    const sedang = triangle(margin, 0.10, 0.20, 0.30);
    const tinggi = linearUp(margin, 0.25, 0.40);

    return {
        margin: margin,
        rendah: rendah,
        sedang: sedang,
        tinggi: tinggi,
    };
}

function fuzzyTrendAnalysis(currentPenjualan, lastPenjualan){
    if (lastPenjualan <= 0) {
        return {
            growth: 0,
            turun: 0,
            stabil: 1,
            naik: 0,
        };
    }
    const Tren = (currentPenjualan - lastPenjualan) / lastPenjualan;
    const turun = linearDown(Tren, -0.50, 0);
    const stabil = triangle(Tren, -0.05, 0.10, 0.20);
    const naik = linearUp(Tren, 0.10, 0.30);

    return {
        growth: Tren,
        turun: turun,
        stabil: stabil,
        naik: naik,
    };
}

function healthScore(saldo, meanPengeluaran, totalPenjualan, totalPengeluaran, currentPenjualan, lastPenjualan){
  const cr = fuzzyCashRunaway(saldo, meanPengeluaran);
  const ue = fuzzyUnitEconomics(totalPenjualan, totalPengeluaran);
  const ta = fuzzyTrendAnalysis(currentPenjualan, lastPenjualan);
  const rules = [];
  
  // R1: IF PENDEK AND RENDAH AND TURUN THEN KRITIS
  const a1 = Math.min(cr.pendek, ue.rendah, ta.turun);
  const z1 = getZDown(a1, 0, 100);
  rules.push({ alpha: a1, z: z1 });

  // R2: IF PENDEK AND RENDAH AND NAIK THEN KRITIS
  const a2 = Math.min(cr.pendek, ue.rendah, ta.naik);
  const z2 = getZDown(a2, 0, 100);
  rules.push({ alpha: a2, z: z2 });

  // R3: IF PENDEK AND TINGGI AND TURUN THEN KRITIS
  const a3 = Math.min(cr.pendek, ue.tinggi, ta.turun);
  const z3 = getZDown(a3, 0, 100);
  rules.push({ alpha: a3, z: z3 });

  // R4: IF PENDEK AND TINGGI AND NAIK THEN WASPADA
  const a4 = Math.min(cr.pendek, ue.tinggi, ta.naik);
  const z4 = getZUp(a4, 30, 70); // rentang tengah
  rules.push({ alpha: a4, z: z4 });

  // R5: IF SEDANG AND SEDANG AND STABIL THEN WASPADA
  const a5 = Math.min(cr.sedang, ue.sedang, ta.stabil);
  const z5 = getZUp(a5, 30, 70);
  rules.push({ alpha: a5, z: z5 });

  // R6: IF SEDANG AND RENDAH AND TURUN THEN KRITIS
  const a6 = Math.min(cr.sedang, ue.rendah, ta.turun);
  const z6 = getZDown(a6, 0, 100);
  rules.push({ alpha: a6, z: z6 });

  // R7: IF SEDANG AND TINGGI AND NAIK THEN SEHAT
  const a7 = Math.min(cr.sedang, ue.tinggi, ta.naik);
  const z7 = getZUp(a7, 0, 100);
  rules.push({ alpha: a7, z: z7 });

  // R8: IF PANJANG AND RENDAH AND TURUN THEN WASPADA
  const a8 = Math.min(cr.panjang, ue.rendah, ta.turun);
  const z8 = getZUp(a8, 30, 70);
  rules.push({ alpha: a8, z: z8 });

  // R9: IF PANJANG AND SEDANG AND STABIL THEN SEHAT
  const a9 = Math.min(cr.panjang, ue.sedang, ta.stabil);
  const z9 = getZUp(a9, 0, 100);
  rules.push({ alpha: a9, z: z9 });

  // R10: IF PANJANG AND TINGGI AND NAIK THEN SEHAT
  const a10 = Math.min(cr.panjang, ue.tinggi, ta.naik);
  const z10 = getZUp(a10, 0, 100);
  rules.push({ alpha: a10, z: z10 });

  let totalAlphaZ = 0;
  let totalAlpha = 0;

  for (const r of rules) {
    totalAlphaZ += r.alpha * r.z;
    totalAlpha += r.alpha;
  }

  // Jika semua alpha bernilai 0 (kondisi di luar batas), beri nilai default 50 (Waspada)
  const finalScore = totalAlpha > 0 ? (totalAlphaZ / totalAlpha) : 50;

  // Tentukan label kategori akhir
  let category = 'WASPADA';
  if (finalScore <= 40) {
    category = 'KRITIS';
  } else if (finalScore > 70) {
    category = 'SEHAT';
  }

  return {
    score: parseFloat(finalScore.toFixed(2)), // bulatkan 2 desimal (misal: 78.45)
    category: category,
    indicators: {
      cashRunwayBulan: cr.runwayBulan,
      profitMargin: ue.margin,
      trendGrowth: ta.growth,
    },
  };
}

module.exports = {healthScore,};