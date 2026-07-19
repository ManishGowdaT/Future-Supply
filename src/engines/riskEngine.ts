import {
  ForwardCommitment,
  FutureSupplyPosition,
  RiskEvent,
  RiskLevel
} from '../types';

export interface CommitmentRiskAssessment {
  commitmentId: string;
  previousFulfillmentProb: number;
  newFulfillmentProb: number;
  riskLevel: RiskLevel;
  primaryRiskFactor?: string;
  projectedShortfallKg: number;
  isShortfallTriggered: boolean;
  activeRiskEvents: RiskEvent[];
  recommendedAction: string;
}

export function evaluateCommitmentRisk(
  commitment: ForwardCommitment,
  supply: FutureSupplyPosition | null,
  activeEvents: RiskEvent[] = []
): CommitmentRiskAssessment {
  const previousProb = commitment.fulfillmentProbability ?? 90;

  if (!supply) {
    return {
      commitmentId: commitment.id,
      previousFulfillmentProb: previousProb,
      newFulfillmentProb: 40,
      riskLevel: 'CRITICAL',
      primaryRiskFactor: 'Supply Position Missing or Unlinked',
      projectedShortfallKg: commitment.committedQuantityKg,
      isShortfallTriggered: true,
      activeRiskEvents: [],
      recommendedAction: 'Source 100% replacement supply immediately.'
    };
  }

  // 1. Base probability from supply prediction confidence & farmer reliability
  const baseConfidence = supply.predictionConfidence * 100;
  const relScore = supply.farmerReliability?.overallScore ?? 75;
  let score = baseConfidence * 0.6 + relScore * 0.4;

  // 2. Evaluate active regional shocks
  const matchingEvents = activeEvents.filter(
    e => e.active && e.affectedRegion.toLowerCase() === supply.location.region.toLowerCase()
  );

  let totalDeduction = 0;
  let primaryRisk = 'Optimal Conditions';

  if (matchingEvents.length > 0) {
    for (const evt of matchingEvents) {
      totalDeduction += evt.estimatedImpactPercent;
      primaryRisk = `${evt.title} in ${supply.location.region}`;
    }
  }

  // 3. Evaluate stage delay risk if crop stage is lagging behind expected harvest
  const daysUntilHarvest = (new Date(commitment.expectedHarvestStart).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilHarvest <= 10 && ['SEEDLING', 'VEGETATIVE'].includes(supply.cropStage)) {
    totalDeduction += 30;
    primaryRisk = 'Severe Phenological Stage Delay (Flowering not initiated)';
  }

  score = Math.max(15, Math.min(99, score - totalDeduction));
  const finalProb = Math.round(score);

  // Risk level categorization
  let riskLevel: RiskLevel = 'LOW';
  if (finalProb < 50) riskLevel = 'CRITICAL';
  else if (finalProb < 75) riskLevel = 'HIGH';
  else if (finalProb < 85) riskLevel = 'MEDIUM';

  // Shortfall calculation: if prob < 80%, projected shortfall kicks in
  let shortfallKg = 0;
  if (finalProb < 80) {
    const deficitRatio = (85 - finalProb) / 100;
    shortfallKg = Math.round(commitment.committedQuantityKg * Math.min(0.85, deficitRatio * 1.5));
  }

  const isShortfall = shortfallKg > 0 || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

  let recAction = 'Healthy order fulfillment on schedule.';
  if (riskLevel === 'CRITICAL') {
    recAction = `Immediate Replacement Required: Projected shortfall of ${shortfallKg} kg.`;
  } else if (riskLevel === 'HIGH') {
    recAction = `Initiate Automated Replacement Search: Secure buffer supply for ${shortfallKg} kg.`;
  } else if (riskLevel === 'MEDIUM') {
    recAction = 'Monitor farm stage updates and check daily moisture readings.';
  }

  return {
    commitmentId: commitment.id,
    previousFulfillmentProb: previousProb,
    newFulfillmentProb: finalProb,
    riskLevel,
    primaryRiskFactor: primaryRisk !== 'Optimal Conditions' ? primaryRisk : (finalProb < 85 ? 'Varietal Yield Uncertainty' : 'Optimal Conditions'),
    projectedShortfallKg: shortfallKg,
    isShortfallTriggered: isShortfall,
    activeRiskEvents: matchingEvents,
    recommendedAction: recAction
  };
}
