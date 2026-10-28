/**
 * saw.service.js
 * Simple Additive Weighting (SAW) Decision Support System
 * 
 * Criteria:
 * 1. impact_score  (Benefit, weight 0.35)
 * 2. urgency_score (Benefit, weight 0.30)
 * 3. ease_score    (Benefit, weight 0.20)
 * 4. cost_score    (Cost, weight 0.15 - lower cost is preferred)
 */

function calculateSAW(actionList) {
  if (!Array.isArray(actionList) || actionList.length === 0) {
    return [];
  }

  const weights = {
    impact: 0.35,
    urgency: 0.30,
    ease: 0.20,
    cost: 0.15,
  };

  // 1. Cari nilai ekstrem (Max untuk benefit, Min untuk cost)
  let maxImpact = 0;
  let maxUrgency = 0;
  let maxEase = 0;
  let minCost = Infinity;

  for (const a of actionList) {
    const impact = Number(a.impact_score) || 0.1;
    const urgency = Number(a.urgency_score) || 0.1;
    const ease = Number(a.ease_score) || 0.1;
    const cost = Number(a.cost_score) || 0.1;

    if (impact > maxImpact) maxImpact = impact;
    if (urgency > maxUrgency) maxUrgency = urgency;
    if (ease > maxEase) maxEase = ease;
    if (cost < minCost) minCost = cost;
  }

  if (maxImpact <= 0) maxImpact = 1;
  if (maxUrgency <= 0) maxUrgency = 1;
  if (maxEase <= 0) maxEase = 1;
  if (minCost === Infinity || minCost <= 0) minCost = 0.1;

  // 2. Normalisasi matriks R dan hitung nilai preferensi V
  const evaluated = actionList.map((a) => {
    const impact = Number(a.impact_score) || 0.1;
    const urgency = Number(a.urgency_score) || 0.1;
    const ease = Number(a.ease_score) || 0.1;
    const cost = Number(a.cost_score) || 0.1;

    // Normalisasi (Benefit: x / max, Cost: min / x)
    const rImpact = impact / maxImpact;
    const rUrgency = urgency / maxUrgency;
    const rEase = ease / maxEase;
    const rCost = minCost / cost;

    const preferenceValue = (
      weights.impact * rImpact +
      weights.urgency * rUrgency +
      weights.ease * rEase +
      weights.cost * rCost
    );

    return {
      actionId: a.id,
      action: a,
      preference_value: parseFloat(preferenceValue.toFixed(4)),
    };
  });

  // 3. Urutkan berdasarkan nilai preferensi tertinggi
  evaluated.sort((a, b) => b.preference_value - a.preference_value);

  // 4. Beri peringkat (rank)
  return evaluated.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

module.exports = {
  calculateSAW,
};
