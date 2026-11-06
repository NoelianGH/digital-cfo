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
  
  // --- KELOMPOK CASH RUNWAY: PENDEK (R1 - R9) ---
  const a1 = Math.min(cr.pendek, ue.rendah, ta.turun); rules.push({ alpha: a1, z: getZDown(a1, 0, 100) });
  const a2 = Math.min(cr.pendek, ue.rendah, ta.stabil); rules.push({ alpha: a2, z: getZDown(a2, 0, 100) });
  const a3 = Math.min(cr.pendek, ue.rendah, ta.naik);   rules.push({ alpha: a3, z: getZDown(a3, 0, 100) });
  
  const a4 = Math.min(cr.pendek, ue.sedang, ta.turun); rules.push({ alpha: a4, z: getZDown(a4, 0, 100) });
  const a5 = Math.min(cr.pendek, ue.sedang, ta.stabil); rules.push({ alpha: a5, z: getZDown(a5, 0, 100) });
  const a6 = Math.min(cr.pendek, ue.sedang, ta.naik);   rules.push({ alpha: a6, z: getZUp(a6, 30, 70) });

  const a7 = Math.min(cr.pendek, ue.tinggi, ta.turun); rules.push({ alpha: a7, z: getZDown(a7, 0, 100) });
  const a8 = Math.min(cr.pendek, ue.tinggi, ta.stabil); rules.push({ alpha: a8, z: getZUp(a8, 30, 70) });
  const a9 = Math.min(cr.pendek, ue.tinggi, ta.naik);   rules.push({ alpha: a9, z: getZUp(a9, 30, 70) });

  // --- KELOMPOK CASH RUNWAY: SEDANG (R10 - R18) ---
  const a10 = Math.min(cr.sedang, ue.rendah, ta.turun); rules.push({ alpha: a10, z: getZDown(a10, 0, 100) });
  const a11 = Math.min(cr.sedang, ue.rendah, ta.stabil);rules.push({ alpha: a11, z: getZUp(a11, 30, 70) });
  const a12 = Math.min(cr.sedang, ue.rendah, ta.naik);  rules.push({ alpha: a12, z: getZUp(a12, 30, 70) });

  const a13 = Math.min(cr.sedang, ue.sedang, ta.turun); rules.push({ alpha: a13, z: getZUp(a13, 30, 70) });
  const a14 = Math.min(cr.sedang, ue.sedang, ta.stabil);rules.push({ alpha: a14, z: getZUp(a14, 30, 70) });
  const a15 = Math.min(cr.sedang, ue.sedang, ta.naik);  rules.push({ alpha: a15, z: getZUp(a15, 0, 100) }); // SEHAT

  const a16 = Math.min(cr.sedang, ue.tinggi, ta.turun); rules.push({ alpha: a16, z: getZUp(a16, 30, 70) });
  const a17 = Math.min(cr.sedang, ue.tinggi, ta.stabil);rules.push({ alpha: a17, z: getZUp(a17, 0, 100) });
  const a18 = Math.min(cr.sedang, ue.tinggi, ta.naik);  rules.push({ alpha: a18, z: getZUp(a18, 0, 100) });

  // --- KELOMPOK CASH RUNWAY: PANJANG (R19 - R27) ---
  const a19 = Math.min(cr.panjang, ue.rendah, ta.turun); rules.push({ alpha: a19, z: getZUp(a19, 30, 70) });
  const a20 = Math.min(cr.panjang, ue.rendah, ta.stabil);rules.push({ alpha: a20, z: getZUp(a20, 30, 70) });
  const a21 = Math.min(cr.panjang, ue.rendah, ta.naik);  rules.push({ alpha: a21, z: getZUp(a21, 0, 100) });

  const a22 = Math.min(cr.panjang, ue.sedang, ta.turun); rules.push({ alpha: a22, z: getZUp(a22, 30, 70) });
  const a23 = Math.min(cr.panjang, ue.sedang, ta.stabil);rules.push({ alpha: a23, z: getZUp(a23, 0, 100) });
  const a24 = Math.min(cr.panjang, ue.sedang, ta.naik);  rules.push({ alpha: a24, z: getZUp(a24, 0, 100) });

  const a25 = Math.min(cr.panjang, ue.tinggi, ta.turun); rules.push({ alpha: a25, z: getZUp(a25, 0, 100) });
  const a26 = Math.min(cr.panjang, ue.tinggi, ta.stabil);rules.push({ alpha: a26, z: getZUp(a26, 0, 100) });
  const a27 = Math.min(cr.panjang, ue.tinggi, ta.naik);  rules.push({ alpha: a27, z: getZUp(a27, 0, 100) });

  let totalAlphaZ = 0;
  let totalAlpha = 0;

  for (const r of rules) {
    totalAlphaZ += r.alpha * r.z;
    totalAlpha += r.alpha;
  }

  const finalScore = totalAlpha > 0 ? (totalAlphaZ / totalAlpha) : 50;

  let category = 'WASPADA';
  if (finalScore <= 40) {
    category = 'KRITIS';
  } else if (finalScore > 70) {
    category = 'SEHAT';
  }

  return {
    score: parseFloat(finalScore.toFixed(2)),
    category: category,
    indicators: {
      cashRunwayBulan: cr.runwayBulan,
      profitMargin: ue.margin,
      trendGrowth: ta.growth,
    },
  };
}

module.exports = {healthScore,};