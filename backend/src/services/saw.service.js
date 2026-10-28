const DEFAULT_WEIGHTS = {
  impact: 0.35,
  urgency: 0.30,
  ease: 0.20,
  cost: 0.15,
};

function calculateSAW(actions, weights = DEFAULT_WEIGHTS) {
  if (!actions || actions.length === 0) return [];

  const activeWeights = { ...DEFAULT_WEIGHTS, ...weights };

  const maxImpact = Math.max(...actions.map(a => a.impact_score || 0)) || 1;
  const maxUrgency = Math.max(...actions.map(a => a.urgency_score || 0)) || 1;
  const maxEase = Math.max(...actions.map(a => a.ease_score || 0)) || 1;
  const minCost = Math.min(...actions.map(a => a.cost_score || 1)) || 1;

  const scoredActions = actions.map(action => {
    const impactScore = action.impact_score || 0;
    const urgencyScore = action.urgency_score || 0;
    const easeScore = action.ease_score || 0;
    const costScore = action.cost_score || 1;

    const rImpact = impactScore / maxImpact;
    const rUrgency = urgencyScore / maxUrgency;
    const rEase = easeScore / maxEase;
    const rCost = minCost / costScore;

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
    };
  });

  scoredActions.sort((a, b) => b.preferenceValue - a.preferenceValue);

  const rankedActions = scoredActions.map((action, index) => ({
    ...action,
    rank: index + 1,
  }));

  return rankedActions;
}

module.exports = { calculateSAW };


