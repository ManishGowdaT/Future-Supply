import {
  FutureSupplyPosition,
  FutureDemandPosition,
  SupplyMatch,
  MatchScoreFactor,
  RiskEvent
} from '../types';

export interface MatchingOptions {
  activeRiskEvents?: RiskEvent[];
}

export function scoreSupplyMatch(
  supply: FutureSupplyPosition,
  demand: FutureDemandPosition,
  options: MatchingOptions = {}
): SupplyMatch {
  const factors: MatchScoreFactor[] = [];
  const riskIndicators: string[] = [];

  // Factor 1: Fulfillment Probability (30% weight)
  let fulfillmentBase = (supply.predictionConfidence * 100);
  // Check for regional risk events
  if (options.activeRiskEvents) {
    const regionalShock = options.activeRiskEvents.find(
      e => e.active && e.affectedRegion.toLowerCase() === supply.location.region.toLowerCase()
    );
    if (regionalShock) {
      fulfillmentBase = Math.max(25, fulfillmentBase - regionalShock.estimatedImpactPercent);
      riskIndicators.push(`Regional Alert: ${regionalShock.title} in ${supply.location.region} (-${regionalShock.estimatedImpactPercent}% risk)`);
    }
  }
  const fulfillmentScore = Math.min(100, Math.max(10, Math.round(fulfillmentBase)));
  factors.push({
    factor: 'Fulfillment Probability',
    weightPercent: 30,
    score: fulfillmentScore,
    weightedScore: Number((fulfillmentScore * 0.30).toFixed(1)),
    rationale: `High stage confidence (${Math.round(supply.predictionConfidence * 100)}%) at stage ${supply.cropStage}.`
  });

  // Factor 2: Harvest Window Fit (20% weight)
  const supStart = new Date(supply.harvestWindowStart).getTime();
  const supEnd = new Date(supply.harvestWindowEnd).getTime();
  const demStart = new Date(demand.requirementStart).getTime();
  const demEnd = new Date(demand.requirementEnd).getTime();

  let timingScore = 50;
  if (supStart <= demStart && supEnd >= demEnd) {
    timingScore = 100; // Perfect full coverage
  } else if (supEnd < demStart || supStart > demEnd) {
    const daysApart = Math.abs(supEnd < demStart ? (demStart - supEnd) : (supStart - demEnd)) / (1000 * 60 * 60 * 24);
    timingScore = Math.max(10, 80 - daysApart * 15);
    riskIndicators.push(`Timing Gap: Harvest is ~${Math.round(daysApart)} days offset from requirement window.`);
  } else {
    // Partial overlap
    timingScore = 85;
  }
  factors.push({
    factor: 'Harvest Window Fit',
    weightPercent: 20,
    score: Math.round(timingScore),
    weightedScore: Number((timingScore * 0.20).toFixed(1)),
    rationale: `Harvest window (${supply.harvestWindowStart} to ${supply.harvestWindowEnd}) aligns with buyer period.`
  });

  // Factor 3: Geographic Proximity (15% weight)
  const distanceKm = supply.location.distanceKmToBangaloreCenter || 50;
  // 30km = 100 score, 100km = 40 score
  const proximityScore = Math.max(20, Math.min(100, Math.round(110 - distanceKm * 0.75)));
  factors.push({
    factor: 'Geographic Proximity',
    weightPercent: 15,
    score: proximityScore,
    weightedScore: Number((proximityScore * 0.15).toFixed(1)),
    rationale: `Farm located in ${supply.location.region} (~${distanceKm} km from Bangalore Central hub).`
  });

  // Factor 4: Quality Probability (15% weight)
  const gradeAScore = Math.round(supply.expectedGradeAProbability * 100);
  factors.push({
    factor: 'Quality Probability (Grade A)',
    weightPercent: 15,
    score: gradeAScore,
    weightedScore: Number((gradeAScore * 0.15).toFixed(1)),
    rationale: `Predicted Grade A yield ratio: ${gradeAScore}% with minimal processing residue.`
  });

  // Factor 5: Price Competitiveness (10% weight)
  const maxPrice = demand.maximumAcceptablePricePerKg || 35;
  const askingPrice = supply.askingPricePerKg;
  let priceScore = 50;
  if (askingPrice <= maxPrice) {
    const savingsPercent = ((maxPrice - askingPrice) / maxPrice) * 100;
    priceScore = Math.min(100, Math.round(75 + savingsPercent * 2.5));
  } else {
    const overPercent = ((askingPrice - maxPrice) / maxPrice) * 100;
    priceScore = Math.max(0, Math.round(50 - overPercent * 3));
    riskIndicators.push(`Price Premium: Asking ₹${askingPrice}/kg exceeds target ₹${maxPrice}/kg ceiling.`);
  }
  factors.push({
    factor: 'Price Competitiveness',
    weightPercent: 10,
    score: priceScore,
    weightedScore: Number((priceScore * 0.10).toFixed(1)),
    rationale: `Asking ₹${askingPrice.toFixed(2)}/kg vs buyer max ₹${maxPrice.toFixed(2)}/kg budget.`
  });

  // Factor 6: Farmer Reliability (5% weight)
  const relScore = supply.farmerReliability?.overallScore || 75;
  factors.push({
    factor: 'Farmer Reliability Score',
    weightPercent: 5,
    score: relScore,
    weightedScore: Number((relScore * 0.05).toFixed(1)),
    rationale: `Historical score ${relScore}/100 across ${supply.farmerReliability?.completedBatchesCount || 0} completed harvests.`
  });

  // Factor 7: Logistics Cost (5% weight)
  // Approx ₹1.20/kg base + ₹0.02/kg/km
  const estLogisticsPerKg = Number((1.20 + distanceKm * 0.025).toFixed(2));
  const logScore = Math.max(20, Math.min(100, Math.round(100 - estLogisticsPerKg * 12)));
  factors.push({
    factor: 'Logistics Cost Efficiency',
    weightPercent: 5,
    score: logScore,
    weightedScore: Number((logScore * 0.05).toFixed(1)),
    rationale: `Est. transit freight ₹${estLogisticsPerKg}/kg to store gate.`
  });

  // Total weighted score calculation
  const totalMatchScore = Math.round(
    factors.reduce((acc, f) => acc + f.weightedScore, 0)
  );

  const availableSafeCap = Math.max(0, supply.safeAvailableCapacityKg);
  const recAllocatedKg = Math.min(availableSafeCap, demand.requiredQuantityKg);

  return {
    supplyPosition: supply,
    overallMatchScore: Math.min(100, Math.max(0, totalMatchScore)),
    recommendedAllocatedKg: recAllocatedKg,
    estimatedDeliveredPricePerKg: Number((supply.askingPricePerKg + estLogisticsPerKg).toFixed(2)),
    freshnessScoreDays: 5.5,
    fulfillmentProbability: fulfillmentScore,
    factors,
    riskIndicators
  };
}
