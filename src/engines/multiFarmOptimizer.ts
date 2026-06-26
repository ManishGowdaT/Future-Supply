import {
  FutureSupplyPosition,
  FutureDemandPosition,
  MultiFarmMatchPlan,
  SupplyMatch,
  RiskEvent
} from '../types';
import { scoreSupplyMatch } from './matchingEngine';

export function optimizeMultiFarmMatchPlan(
  demand: FutureDemandPosition,
  availableSupplies: FutureSupplyPosition[],
  activeRiskEvents: RiskEvent[] = []
): MultiFarmMatchPlan {
  // 1. Filter eligible supplies: matching crop, active/verified status, positive safe capacity
  const eligible = availableSupplies.filter(
    s => s.cropType === demand.cropType &&
         s.safeAvailableCapacityKg > 0 &&
         ['ACTIVE', 'PARTIALLY_COMMITTED', 'VERIFIED'].includes(s.status)
  );

  // 2. Score all eligible positions
  const scoredMatches: SupplyMatch[] = eligible.map(s =>
    scoreSupplyMatch(s, demand, { activeRiskEvents })
  );

  // 3. Sort by overall match score descending
  scoredMatches.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

  let remainingNeededKg = Math.max(0, demand.requiredQuantityKg - demand.securedQuantityKg);

  const selectedMatches: SupplyMatch[] = [];
  let totalAllocatedKg = 0;
  let totalWeightedPrice = 0;
  let totalWeightedFulfillment = 0;

  for (const match of scoredMatches) {
    if (remainingNeededKg <= 0) break;

    const availableKg = match.supplyPosition.safeAvailableCapacityKg;
    const allocateKg = Math.min(availableKg, remainingNeededKg);

    if (allocateKg > 0) {
      match.recommendedAllocatedKg = allocateKg;
      selectedMatches.push(match);

      totalAllocatedKg += allocateKg;
      totalWeightedPrice += allocateKg * match.estimatedDeliveredPricePerKg;
      totalWeightedFulfillment += allocateKg * match.fulfillmentProbability;
      remainingNeededKg -= allocateKg;
    }
  }

  const coveragePercent = Math.min(
    100,
    Math.round((totalAllocatedKg / (demand.requiredQuantityKg || 1)) * 100)
  );

  const blendedPrice = totalAllocatedKg > 0
    ? Number((totalWeightedPrice / totalAllocatedKg).toFixed(2))
    : 0;

  const avgFulfillment = totalAllocatedKg > 0
    ? Math.round(totalWeightedFulfillment / totalAllocatedKg)
    : 0;

  const summary = selectedMatches.length === 1
    ? `Fully matched via single high-confidence farm (${selectedMatches[0].supplyPosition.farmName}).`
    : selectedMatches.length > 1
    ? `Aggregated ${selectedMatches.length} regional farms across ${Array.from(new Set(selectedMatches.map(m => m.supplyPosition.location.region))).join(', ')} to achieve ${coveragePercent}% coverage with ${avgFulfillment}% fulfillment certainty.`
    : `No sufficient available forward capacity found for ${demand.cropType}.`;

  return {
    demandPositionId: demand.id,
    targetQuantityKg: demand.requiredQuantityKg,
    allocatedQuantityKg: totalAllocatedKg,
    coveragePercent,
    blendedPricePerKg: blendedPrice,
    averageFulfillmentProbability: avgFulfillment,
    matches: selectedMatches,
    optimizationSummary: summary,
    createdAt: new Date().toISOString()
  };
}
