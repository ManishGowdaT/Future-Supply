import { FarmerReliabilityScore } from '../types';

export interface HistoricalTransactionRecord {
  promisedYieldKg: number;
  actualHarvestKg: number;
  promisedHarvestDate: string;
  actualHarvestDate: string;
  promisedGradeAPercent: number;
  actualGradeAPercent: number;
  committedQuantityKg: number;
  deliveredQuantityKg: number;
  cancelledByFarmer: boolean;
  disputed: boolean;
}

export function computeReliabilityScore(
  farmerId: string,
  history: HistoricalTransactionRecord[]
): FarmerReliabilityScore {
  if (!history || history.length === 0) {
    return {
      farmerId,
      overallScore: 70, // Baseline new verified farmer score
      quantityAccuracy: 75,
      harvestTimingAccuracy: 75,
      gradeConsistency: 75,
      fulfillmentRate: 80,
      cancellationRate: 0,
      disputeRate: 0,
      completedBatchesCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }

  let totalQtyAccuracy = 0;
  let totalTimingAccuracy = 0;
  let totalGradeConsistency = 0;
  let totalFulfillment = 0;
  let cancellations = 0;
  let disputes = 0;

  for (const record of history) {
    // 1. Quantity accuracy: how close actual was to promised (within +- 20%)
    const qtyRatio = record.promisedYieldKg > 0 ? Math.min(record.actualHarvestKg / record.promisedYieldKg, 1.2) : 1;
    const qtyAccuracy = Math.max(0, 100 - Math.abs(1.0 - qtyRatio) * 100);
    totalQtyAccuracy += qtyAccuracy;

    // 2. Timing accuracy: harvest within +- 2 days
    const promisedTime = new Date(record.promisedHarvestDate).getTime();
    const actualTime = new Date(record.actualHarvestDate).getTime();
    const dayDiff = Math.abs((actualTime - promisedTime) / (1000 * 60 * 60 * 24));
    const timingAccuracy = Math.max(0, 100 - dayDiff * 10);
    totalTimingAccuracy += timingAccuracy;

    // 3. Grade consistency
    const gradeDiff = Math.abs(record.promisedGradeAPercent - record.actualGradeAPercent);
    const gradeConsistency = Math.max(0, 100 - gradeDiff);
    totalGradeConsistency += gradeConsistency;

    // 4. Fulfillment rate: delivered / committed
    const fulfillment = record.committedQuantityKg > 0
      ? Math.min(100, (record.deliveredQuantityKg / record.committedQuantityKg) * 100)
      : 100;
    totalFulfillment += fulfillment;

    if (record.cancelledByFarmer) cancellations++;
    if (record.disputed) disputes++;
  }

  const n = history.length;
  const avgQtyAcc = Math.round(totalQtyAccuracy / n);
  const avgTimingAcc = Math.round(totalTimingAccuracy / n);
  const avgGradeCons = Math.round(totalGradeConsistency / n);
  const avgFulfillment = Math.round(totalFulfillment / n);
  const cancelRate = Math.round((cancellations / n) * 100);
  const disputeRate = Math.round((disputes / n) * 100);

  // Weighted overall reliability formula
  const overall = Math.round(
    avgQtyAcc * 0.25 +
    avgTimingAcc * 0.20 +
    avgGradeCons * 0.20 +
    avgFulfillment * 0.25 -
    cancelRate * 0.5 -
    disputeRate * 0.5
  );

  return {
    farmerId,
    overallScore: Math.max(10, Math.min(99, overall)),
    quantityAccuracy: avgQtyAcc,
    harvestTimingAccuracy: avgTimingAcc,
    gradeConsistency: avgGradeCons,
    fulfillmentRate: avgFulfillment,
    cancellationRate: cancelRate,
    disputeRate: disputeRate,
    completedBatchesCount: n,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}
