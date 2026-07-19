import {
  ForwardCommitment,
  FutureSupplyPosition,
  ReplacementPlan,
  ReplacementCandidate,
  RiskEvent
} from '../types';

export function findAutomatedReplacements(
  commitment: ForwardCommitment,
  shortfallKg: number,
  allSupplies: FutureSupplyPosition[],
  activeRiskEvents: RiskEvent[] = []
): ReplacementPlan {
  // Find affected regions to avoid routing to another farm under the same shock
  const affectedRegions = new Set(
    activeRiskEvents
      .filter(e => e.active && e.severity !== 'LOW')
      .map(e => e.affectedRegion.toLowerCase())
  );

  // Eligible candidate supplies
  const candidates = allSupplies.filter(s => {
    // Same crop
    if (s.cropType !== commitment.cropType) return false;
    // Don't re-select the original farm
    if (s.id === commitment.supplyPositionId || s.farmerId === commitment.farmerId) return false;
    // Must have available safe capacity
    if (s.safeAvailableCapacityKg <= 50) return false;
    // Exclude if farm is in an active shock region
    if (affectedRegions.has(s.location.region.toLowerCase())) return false;
    // Must be verified
    if (!['ACTIVE', 'VERIFIED', 'PARTIALLY_COMMITTED'].includes(s.status)) return false;
    return true;
  });

  // Score candidate suitability
  const scoredCandidates: ReplacementCandidate[] = candidates.map(s => {
    const distanceKm = s.location.distanceKmToBangaloreCenter ?? 50;
    const reliability = s.farmerReliability?.overallScore ?? 75;
    const gradeA = Math.round(s.expectedGradeAProbability * 100);
    const price = s.askingPricePerKg;

    // Fast ranking composite
    const score = Math.round(
      reliability * 0.40 +
      gradeA * 0.30 +
      Math.max(0, 100 - distanceKm * 0.8) * 0.20 +
      Math.max(0, 100 - (price - 20) * 4) * 0.10
    );

    return {
      supplyPosition: s,
      offeredQuantityKg: Math.min(s.safeAvailableCapacityKg, Math.round(shortfallKg * 1.1)),
      pricePerKg: price,
      distanceKm,
      harvestWindow: `${s.harvestWindowStart} to ${s.harvestWindowEnd}`,
      gradeAProb: gradeA,
      reliabilityScore: reliability,
      matchScore: score
    };
  });

  // Sort by match score descending
  scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

  const selectedCandidates: ReplacementCandidate[] = [];
  let allocatedKg = 0;
  let weightedPriceTotal = 0;

  // We aim to cover shortfall + 5% buffer if possible
  const targetWithBuffer = Math.round(shortfallKg * 1.05);

  for (const cand of scoredCandidates) {
    if (allocatedKg >= targetWithBuffer) break;

    const remainingNeeded = targetWithBuffer - allocatedKg;
    const allocate = Math.min(cand.supplyPosition.safeAvailableCapacityKg, remainingNeeded);

    if (allocate > 0) {
      cand.offeredQuantityKg = allocate;
      selectedCandidates.push(cand);
      allocatedKg += allocate;
      weightedPriceTotal += allocate * cand.pricePerKg;
    }
  }

  const blendedPrice = allocatedKg > 0
    ? Number((weightedPriceTotal / allocatedKg).toFixed(2))
    : commitment.unitPricePerKg;

  // With replacement secured, fulfillment prob is restored to 95-98%
  const restoredProb = allocatedKg >= shortfallKg ? 96 : Math.round((allocatedKg / shortfallKg) * 90);

  return {
    shortfallAlertId: `SF-ALERT-${Date.now().toString().slice(-6)}`,
    originalCommitmentId: commitment.id,
    shortfallKg,
    recommendedCandidates: selectedCandidates,
    totalReplacementAllocatedKg: allocatedKg,
    restoredFulfillmentProb: restoredProb,
    blendedReplacementPricePerKg: blendedPrice,
    createdAt: new Date().toISOString()
  };
}
