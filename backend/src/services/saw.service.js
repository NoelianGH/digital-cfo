// backend/src/services/saw.service.js

const DEFAULT_WEIGHTS = {
  impact: 0.40,
  urgency: 0.30,
  ease: 0.20,
  cost: 0.10,
};

const ACTION_PROFILES = {
  // --- KONDISI KRITIS (Liquidity Recovery) ---
  LOAN_INJECTION: { type: 'LIQUIDITY', baseEase: 3.0, baseCost: 2.0 },
  NEGOTIATE_SUPPLIER: { type: 'LIQUIDITY', baseEase: 4.0, baseCost: 1.0 },
  DEAD_STOCK_CLEARANCE: { type: 'LIQUIDITY', baseEase: 4.0, baseCost: 2.0 },
  ZERO_WASTE_DISCOUNT: { type: 'MARGIN_OPPORTUNITY', baseEase: 5.0, baseCost: 1.0 },
  CUT_EXPENSES: { type: 'LIQUIDITY', baseEase: 4.0, baseCost: 1.0 },

  // --- KONDISI WASPADA (Margin & Efficiency) ---
  IDLE_DAYS_PROMO: { type: 'MARGIN_REVENUE', baseEase: 4.0, baseCost: 2.0 },
  PRODUCT_BUNDLING: { type: 'MARGIN_REVENUE', baseEase: 4.5, baseCost: 1.5 },
  VOLUME_DISCOUNT: { type: 'MARGIN_REVENUE', baseEase: 4.0, baseCost: 2.0 },
  SERVICE_SUBSCRIPTION: { type: 'MARGIN_REVENUE', baseEase: 4.0, baseCost: 1.0 },
  PRICE_OPTIMIZATION: { type: 'MARGIN_REVENUE', baseEase: 5.0, baseCost: 1.0 },

  // --- KONDISI SEHAT (Scale Up & Retention) ---
  LOYALTY_PROGRAM: { type: 'GROWTH', baseEase: 4.0, baseCost: 2.0 },
  NEW_PREMIUM_VARIANT: { type: 'GROWTH', baseEase: 3.0, baseCost: 3.0 },
  EQUIPMENT_UPGRADE: { type: 'GROWTH', baseEase: 3.0, baseCost: 4.0 },
  EXPANSION_BRANCH: { type: 'GROWTH', baseEase: 2.0, baseCost: 5.0 },
};

function calculateUrgency(actionKey, indicators) {
  const runway = indicators?.cashRunwayBulan ?? 3.0;
  const margin = indicators?.profitMargin ?? 0.15;
  const profile = ACTION_PROFILES[actionKey] || { type: 'GENERAL', baseEase: 3.0, baseCost: 2.0 };

  // Rasio risiko likuiditas (0.0 aman s.d. 1.0 kritis bila runway < 3 bulan)
  const liquidityRisk = Math.max(0, Math.min(1, (3.0 - runway) / 3.0));
  // Rasio defisit margin terhadap target 20%
  const marginGap = Math.max(0, Math.min(1, (0.20 - margin) / 0.20));

  if (profile.type === 'LIQUIDITY') {
    // Aksi suntik kas / tunda supplier: Sangat mendesak saat kas kritis (< 1 bulan)
    return parseFloat((1.0 + 4.0 * liquidityRisk).toFixed(2));
  } else if (profile.type === 'MARGIN_REVENUE' || profile.type === 'MARGIN_OPPORTUNITY') {
    // Aksi bundling / menu engineering: Mendesak saat margin tertekan
    return parseFloat((2.0 + 3.0 * marginGap).toFixed(2));
  } else {
    // Aksi ekspansi / upgrade mesin: Hanya mendesak jika kas surplus aman (> 3 bulan)
    const surplusRatio = Math.max(0, Math.min(1, (runway - 3.0) / 3.0));
    return parseFloat((1.0 + 3.5 * surplusRatio).toFixed(2));
  }
}

function calculateImpact(actionKey, indicators) {
  const runway = indicators?.cashRunwayBulan ?? 3.0;
  const margin = indicators?.profitMargin ?? 0.15;
  const profile = ACTION_PROFILES[actionKey] || { type: 'GENERAL', baseEase: 3.0, baseCost: 2.0 };

  const liquidityRisk = Math.max(0, Math.min(1, (3.0 - runway) / 3.0));
  const marginGap = Math.max(0, Math.min(1, (0.20 - margin) / 0.20));

  if (profile.type === 'LIQUIDITY') {
    // Dampak likuiditas tertinggi dirasakan saat kas benar-benar menipis
    return parseFloat((3.0 + 2.0 * liquidityRisk).toFixed(2));
  } else if (profile.type === 'MARGIN_REVENUE' || profile.type === 'MARGIN_OPPORTUNITY') {
    // Dampak pemulihan margin tertinggi bila margin saat ini rendah
    return parseFloat((3.0 + 2.0 * marginGap).toFixed(2));
  } else {
    // Dampak ekspansi: Tinggi jika kas surplus, rendah jika kas defisit
    const surplusRatio = Math.max(0, Math.min(1, (runway - 3.0) / 3.0));
    return parseFloat((2.5 + 2.5 * surplusRatio).toFixed(2));
  }
}

function calculateEase(actionKey) {
  const profile = ACTION_PROFILES[actionKey];
  return profile ? profile.baseEase : 3.0;
}

function calculateCost(actionKey) {
  const profile = ACTION_PROFILES[actionKey];
  return profile ? profile.baseCost : 2.0;
}

function calculateContextualScores(action, indicators) {
  const key = action.action_type || action.key || '';
  
  const dynamicUrgency = indicators ? calculateUrgency(key, indicators) : (action.urgency_score || 3.0);
  const dynamicImpact = indicators ? calculateImpact(key, indicators) : (action.impact_score || 3.0);
  const dynamicEase = calculateEase(key) || (action.ease_score || 3.0);
  const dynamicCost = calculateCost(key) || (action.cost_score || 2.0);

  return {
    ...action,
    urgency_score: dynamicUrgency,
    impact_score: dynamicImpact,
    ease_score: dynamicEase,
    cost_score: dynamicCost,
  };
}

function calculateSAW(actions, indicators = null, weights = DEFAULT_WEIGHTS) {
  if (!actions || actions.length === 0) return [];

  const activeWeights = { ...DEFAULT_WEIGHTS, ...weights };

  // Langkah 1: Bangun Matriks Keputusan X (Dihitung Dinamis dari Indikator Keuangan)
  const contextualActions = actions.map(a => calculateContextualScores(a, indicators));

  // Langkah 2: Cari Nilai Ekstrem (Max untuk Benefit, Min untuk Cost)
  const maxImpact = Math.max(...contextualActions.map(a => a.impact_score || 0)) || 1;
  const maxUrgency = Math.max(...contextualActions.map(a => a.urgency_score || 0)) || 1;
  const maxEase = Math.max(...contextualActions.map(a => a.ease_score || 0)) || 1;
  const minCost = Math.min(...contextualActions.map(a => a.cost_score || 1)) || 1;

  // Langkah 3: Normalisasi Matriks R dan Hitung Nilai Preferensi V
  const scoredActions = contextualActions.map(action => {
    const impactScore = action.impact_score || 0;
    const urgencyScore = action.urgency_score || 0;
    const easeScore = action.ease_score || 0;
    const costScore = action.cost_score || 1;

    // Normalisasi Benefit: r_ij = x_ij / max(x_j)
    const rImpact = impactScore / maxImpact;
    const rUrgency = urgencyScore / maxUrgency;
    const rEase = easeScore / maxEase;
    // Normalisasi Cost: r_ij = min(x_j) / x_ij
    const rCost = minCost / costScore;

    // Penjumlahan Terbobot: V_i = sum(w_j * r_ij)
    const preferenceValue =
      (activeWeights.impact * rImpact) +
      (activeWeights.urgency * rUrgency) +
      (activeWeights.ease * rEase) +
      (activeWeights.cost * rCost);

    const prefFloat = parseFloat(preferenceValue.toFixed(4));

    return {
      ...action,
      preferenceValue: prefFloat,
      preference_value: prefFloat,
      // Metadata transparansi matematis (Explainable AI / DSS)
      sawCalculation: {
        rawScores: {
          impact: impactScore,
          urgency: urgencyScore,
          ease: easeScore,
          cost: costScore,
        },
        normalized: {
          rImpact: parseFloat(rImpact.toFixed(4)),
          rUrgency: parseFloat(rUrgency.toFixed(4)),
          rEase: parseFloat(rEase.toFixed(4)),
          rCost: parseFloat(rCost.toFixed(4)),
        },
        weights: activeWeights,
      },
    };
  });

  // Langkah 4: Urutkan Berdasarkan Preferensi Tertinggi (Ranking)
  scoredActions.sort((a, b) => b.preferenceValue - a.preferenceValue);

  const rankedActions = scoredActions.map((action, index) => ({
    ...action,
    rank: index + 1,
  }));

  return rankedActions;
}

module.exports = {
  calculateImpact,
  calculateUrgency,
  calculateEase,
  calculateCost,
  calculateContextualScores,
  calculateSAW,
  DEFAULT_WEIGHTS,
  ACTION_PROFILES,
};
