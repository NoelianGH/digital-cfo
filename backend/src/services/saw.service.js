const DEFAULT_WEIGHTS = {
  impact: 0.35,
  urgency: 0.30,
  ease: 0.20,
  cost: 0.15,
};

function calculateSAW(actions, weights = DEFAULT_WEIGHTS) {
  const maxImpact = Math.max(...actions.map(a => a.impact_score));
  const maxUrgency = Math.max(...actions.map(a => a.urgency_score));
  const maxEase = Math.max(...actions.map(a => a.ease_score));
  const minCost = Math.min(...actions.map(a => a.cost_score));

  const scoredActions = actions.map(action => {
    const rImpact = action.impact_score / maxImpact;
    const rUrgency = action.urgency_score / maxUrgency;
    const rEase = action.ease_score / maxEase;

    const rCost = minCost / action.cost_score;

    const preferenceValue = (DEFAULT_WEIGHTS.impact * rImpact) + (DEFAULT_WEIGHTS.urgency * rUrgency) + (DEFAULT_WEIGHTS.ease * rEase) + (DEFAULT_WEIGHTS.cost * rCost);

    return {
      ...action,
      preferenceValue: parseFloat(preferenceValue.toFixed(4)),
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

