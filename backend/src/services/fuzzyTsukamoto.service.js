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
    const cash_runaway = Math.max(0, saldo / meanPengeluaran);
    const pendek = linearDown(cash_runaway, 0, 2);
    const sedang = triangle(cash_runaway, 1.5, 3, 5);
    const panjang = linearUp(cash_runaway, 4, 6);

    return {
        runwayBulan: parseFloat(cash_runaway.toFixed(2)),
        pendek: pendek,
        sedang: sedang,
        panjang: panjang,
    };
}

function fuzzyUnitEconomics(totalPenjualan, totalPengeluaran){
    if(totalPenjualan <= 0){
        return{
            margin: 0,
            rendah: 1,
            sedang: 0,
            tinggi: 0,
        }
    }
    const margin = (totalPenjualan - totalPengeluaran) / totalPenjualan;
    const rendah = linearDown(margin, -0.10, 0.12);
    const sedang = triangle(margin, 0.08, 0.18, 0.28);
    const tinggi = linearUp(margin, 0.20, 0.35);

    return {
        margin: parseFloat(margin.toFixed(4)),
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
    const turun = linearDown(Tren, -0.35, 0);
    const stabil = triangle(Tren, -0.10, 0.05, 0.20);
    const naik = linearUp(Tren, 0.10, 0.30);

    return {
        growth: parseFloat(Tren.toFixed(4)),
        turun: turun,
        stabil: stabil,
        naik: naik,
    };
}
function zKritis(alpha) {
  return 50 - (alpha * 50);
}

function zWaspada(alpha) {
  return 40 + (alpha * 20);
}

function zSehat(alpha) {
  return 50 + (alpha * 50);
}

function healthScore(saldo, meanPengeluaran, totalPenjualan, totalPengeluaran, currentPenjualan, lastPenjualan){
  const cr = fuzzyCashRunaway(saldo, meanPengeluaran);
  const ue = fuzzyUnitEconomics(totalPenjualan, totalPengeluaran);
  const ta = fuzzyTrendAnalysis(currentPenjualan, lastPenjualan);
  const rules = [];
  
  // --- KELOMPOK CASH RUNWAY: PENDEK (R1 - R9) ---
  // Likuiditas kas darurat kritis (< 2 bulan)
  rules.push({ alpha: Math.min(cr.pendek, ue.rendah, ta.turun), z: zKritis });  // R1
  rules.push({ alpha: Math.min(cr.pendek, ue.rendah, ta.stabil), z: zKritis }); // R2
  rules.push({ alpha: Math.min(cr.pendek, ue.rendah, ta.naik), z: zKritis });   // R3
  rules.push({ alpha: Math.min(cr.pendek, ue.sedang, ta.turun), z: zKritis });  // R4
  rules.push({ alpha: Math.min(cr.pendek, ue.sedang, ta.stabil), z: zWaspada });// R5
  rules.push({ alpha: Math.min(cr.pendek, ue.sedang, ta.naik), z: zWaspada });  // R6
  rules.push({ alpha: Math.min(cr.pendek, ue.tinggi, ta.turun), z: zWaspada }); // R7
  rules.push({ alpha: Math.min(cr.pendek, ue.tinggi, ta.stabil), z: zWaspada });// R8
  rules.push({ alpha: Math.min(cr.pendek, ue.tinggi, ta.naik), z: zWaspada });  // R9

  // --- KELOMPOK CASH RUNWAY: SEDANG (R10 - R18) ---
  // Likuiditas kas aman operasional (1.5 - 5 bulan)
  rules.push({ alpha: Math.min(cr.sedang, ue.rendah, ta.turun), z: zKritis });  // R10
  rules.push({ alpha: Math.min(cr.sedang, ue.rendah, ta.stabil), z: zWaspada });// R11
  rules.push({ alpha: Math.min(cr.sedang, ue.rendah, ta.naik), z: zWaspada });  // R12
  rules.push({ alpha: Math.min(cr.sedang, ue.sedang, ta.turun), z: zWaspada }); // R13
  rules.push({ alpha: Math.min(cr.sedang, ue.sedang, ta.stabil), z: zWaspada });// R14
  rules.push({ alpha: Math.min(cr.sedang, ue.sedang, ta.naik), z: zSehat });    // R15
  rules.push({ alpha: Math.min(cr.sedang, ue.tinggi, ta.turun), z: zWaspada }); // R16
  rules.push({ alpha: Math.min(cr.sedang, ue.tinggi, ta.stabil), z: zSehat });   // R17
  rules.push({ alpha: Math.min(cr.sedang, ue.tinggi, ta.naik), z: zSehat });     // R18

  // --- KELOMPOK CASH RUNWAY: PANJANG (R19 - R27) ---
  // Likuiditas kas surplus (> 4 - 6 bulan)
  rules.push({ alpha: Math.min(cr.panjang, ue.rendah, ta.turun), z: zWaspada });// R19
  rules.push({ alpha: Math.min(cr.panjang, ue.rendah, ta.stabil), z: zWaspada });// R20
  rules.push({ alpha: Math.min(cr.panjang, ue.rendah, ta.naik), z: zSehat });   // R21
  rules.push({ alpha: Math.min(cr.panjang, ue.sedang, ta.turun), z: zWaspada });// R22
  rules.push({ alpha: Math.min(cr.panjang, ue.sedang, ta.stabil), z: zSehat }); // R23
  rules.push({ alpha: Math.min(cr.panjang, ue.sedang, ta.naik), z: zSehat });   // R24
  rules.push({ alpha: Math.min(cr.panjang, ue.tinggi, ta.turun), z: zSehat });  // R25
  rules.push({ alpha: Math.min(cr.panjang, ue.tinggi, ta.stabil), z: zSehat }); // R26
  rules.push({ alpha: Math.min(cr.panjang, ue.tinggi, ta.naik), z: zSehat });   // R27

  let totalAlphaZ = 0;
  let totalAlpha = 0;

  for (const r of rules) {
    if (r.alpha > 0) {
      const zVal = typeof r.z === 'function' ? r.z(r.alpha) : r.z;
      totalAlphaZ += r.alpha * zVal;
      totalAlpha += r.alpha;
    }
  }

  const finalScore = totalAlpha > 0 ? (totalAlphaZ / totalAlpha) : 50;

  let category = 'WASPADA';
  if (finalScore <= 45) {
    category = 'KRITIS';
  } else if (finalScore >= 68) {
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