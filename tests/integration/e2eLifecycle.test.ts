import { describe, it, expect } from 'vitest';
import { InMemoryRepository } from '../../src/infrastructure/repositories/inMemoryRepository';
import { predictYield } from '../../src/engines/yieldPredictor';
import { optimizeMultiFarmMatchPlan } from '../../src/engines/multiFarmOptimizer';
import { evaluateCommitmentRisk } from '../../src/engines/riskEngine';
import { findAutomatedReplacements } from '../../src/engines/replacementEngine';
import { calculateFreshness } from '../../src/engines/freshnessCalculator';
import { computeReliabilityScore } from '../../src/engines/reliabilityEngine';

describe('Complete End-to-End Predictive Agri-Procurement Lifecycle', () => {
  it('should execute the full 20-step predictive procurement workflow flawlessly', async () => {
    const repo = new InMemoryRepository();

    // 1. Initial State: Verified Future Supply Positions in DB
    const initialSupplies = await repo.getAll();
    expect(initialSupplies.length).toBeGreaterThanOrEqual(8);
    const tomatoSupplies = initialSupplies.filter(s => s.cropType === 'Tomato');
    expect(tomatoSupplies.length).toBeGreaterThanOrEqual(4);

    // 2. Buyer creates future demand (3,000 kg Tomato for Koramangala Store)
    const demand = await repo.createDemand({
      buyerId: 'BUYER-01',
      buyerName: 'Vikram Mehta',
      buyerOrg: 'FreshRoute Supermarkets',
      store: {
        storeId: 'STORE-BLR-01',
        storeName: 'FreshRoute Koramangala Hub #17',
        chainName: 'FreshRoute',
        address: 'Koramangala, Bengaluru',
        region: 'Koramangala',
        coordinates: { lat: 12.9352, lng: 77.6245 }
      },
      cropType: 'Tomato',
      varietyPreferred: 'Hybrid Saaho',
      requiredQuantityKg: 3000,
      dailyCadenceKg: 500,
      requirementStart: '2026-09-10',
      requirementEnd: '2026-09-17',
      deliveryWindowStart: '05:30',
      deliveryWindowEnd: '08:00',
      minimumGrade: 'Grade A',
      maximumAcceptablePricePerKg: 30.00,
      minimumFreshnessShelfLifeDays: 4,
      securedQuantityKg: 0,
      reliableQuantityKg: 0,
      atRiskQuantityKg: 0,
      fulfillmentProbability: 95,
      status: 'OPEN'
    });
    expect(demand.id).toBeDefined();

    // 3. Run Matching Engine & Multi-Farm Optimization
    const matchPlan = optimizeMultiFarmMatchPlan(demand, initialSupplies);
    expect(matchPlan.matches.length).toBeGreaterThanOrEqual(2);
    expect(matchPlan.allocatedQuantityKg).toBeGreaterThanOrEqual(2500);
    expect(matchPlan.coveragePercent).toBeGreaterThanOrEqual(80);

    // 4. Lock Forward Commitments for matched farms with Escrow Funding
    const primaryMatch = matchPlan.matches[0];
    const sup0 = primaryMatch.supplyPosition;

    const initialCommitment = await repo.createCommitment({
      demandPositionId: demand.id,
      supplyPositionId: sup0.id,
      buyerId: demand.buyerId,
      buyerName: demand.buyerName,
      buyerOrg: demand.buyerOrg,
      farmerId: sup0.farmerId,
      farmerName: sup0.farmerName,
      farmName: sup0.farmName,
      farmRegion: sup0.location.region,
      cropType: demand.cropType,
      variety: sup0.variety,
      committedQuantityKg: primaryMatch.recommendedAllocatedKg,
      unitPricePerKg: sup0.askingPricePerKg,
      totalOrderValueInr: primaryMatch.recommendedAllocatedKg * sup0.askingPricePerKg,
      allowedVariancePercent: 10,
      expectedHarvestStart: sup0.harvestWindowStart,
      expectedHarvestEnd: sup0.harvestWindowEnd,
      deliveryDate: demand.requirementStart,
      deliveryWindow: `${demand.deliveryWindowStart} - ${demand.deliveryWindowEnd}`,
      destinationStore: demand.store,
      qualitySpecs: {
        minimumGrade: 'Grade A',
        minGradeAPercent: 80,
        maxDefectPercent: 5,
        firmnessRequirement: 'Firm index >= 4.0'
      },
      escrowStatus: 'FUNDED',
      depositAmountInr: Math.round(primaryMatch.recommendedAllocatedKg * sup0.askingPricePerKg * 0.20),
      balanceAmountInr: Math.round(primaryMatch.recommendedAllocatedKg * sup0.askingPricePerKg * 0.80),
      fulfillmentProbability: 92,
      riskLevel: 'LOW',
      shortfallAmountKg: 0,
      status: 'SECURED',
      signedAgreementHash: '0xabc123456789'
    });

    expect(initialCommitment.id).toBeDefined();
    expect(initialCommitment.escrowStatus).toBe('FUNDED');

    // 5. Inject Climate Shock in Ramanagara region
    const weatherShock = await repo.createRiskEvent({
      eventType: 'WEATHER_SHOCK',
      severity: 'HIGH',
      affectedRegion: 'Ramanagara',
      title: 'Unseasonal Heavy Downpour & Waterlogging',
      description: 'Flooding risk across Channapatna tomato fields',
      estimatedImpactPercent: 40,
      active: true
    });
    expect(weatherShock.active).toBe(true);

    // 6. Risk Engine re-evaluates commitment
    const activeRiskEvents = await repo.getActiveRiskEvents();
    const updatedSupply = await repo.getById(initialCommitment.supplyPositionId);
    const riskAssessment = evaluateCommitmentRisk(initialCommitment, updatedSupply, activeRiskEvents);

    expect(riskAssessment.newFulfillmentProb).toBeLessThan(70);
    expect(riskAssessment.isShortfallTriggered).toBe(true);
    expect(riskAssessment.projectedShortfallKg).toBeGreaterThan(0);

    // 7. Automated Replacement Engine executes
    const allSupplies = await repo.getAll();
    const replacementPlan = findAutomatedReplacements(
      initialCommitment,
      riskAssessment.projectedShortfallKg,
      allSupplies,
      activeRiskEvents
    );

    expect(replacementPlan.recommendedCandidates.length).toBeGreaterThanOrEqual(1);
    // Verified that replacement farms are outside the affected Ramanagara shock zone
    replacementPlan.recommendedCandidates.forEach(cand => {
      expect(cand.supplyPosition.location.region.toLowerCase()).not.toBe('ramanagara');
    });
    expect(replacementPlan.restoredFulfillmentProb).toBeGreaterThanOrEqual(90);

    // 8. Execute Replacement Commitment (1-Click)
    const backupCandidate = replacementPlan.recommendedCandidates[0];
    const replacementCommitment = await repo.createCommitment({
      demandPositionId: demand.id,
      supplyPositionId: backupCandidate.supplyPosition.id,
      buyerId: demand.buyerId,
      buyerName: demand.buyerName,
      buyerOrg: demand.buyerOrg,
      farmerId: backupCandidate.supplyPosition.farmerId,
      farmerName: backupCandidate.supplyPosition.farmerName,
      farmName: backupCandidate.supplyPosition.farmName,
      farmRegion: backupCandidate.supplyPosition.location.region,
      cropType: demand.cropType,
      variety: backupCandidate.supplyPosition.variety,
      committedQuantityKg: backupCandidate.offeredQuantityKg,
      unitPricePerKg: backupCandidate.pricePerKg,
      totalOrderValueInr: backupCandidate.offeredQuantityKg * backupCandidate.pricePerKg,
      allowedVariancePercent: 10,
      expectedHarvestStart: backupCandidate.supplyPosition.harvestWindowStart,
      expectedHarvestEnd: backupCandidate.supplyPosition.harvestWindowEnd,
      deliveryDate: demand.requirementStart,
      deliveryWindow: '05:30 - 08:00 AM',
      destinationStore: demand.store,
      qualitySpecs: initialCommitment.qualitySpecs,
      escrowStatus: 'FUNDED',
      depositAmountInr: Math.round(backupCandidate.offeredQuantityKg * backupCandidate.pricePerKg * 0.20),
      balanceAmountInr: Math.round(backupCandidate.offeredQuantityKg * backupCandidate.pricePerKg * 0.80),
      fulfillmentProbability: 96,
      riskLevel: 'LOW',
      shortfallAmountKg: 0,
      status: 'SECURED',
      signedAgreementHash: '0xrep987654321'
    });
    expect(replacementCommitment.id).toBeDefined();

    // 9. Harvest & Physical QC Grading Terminal Execution
    const batchId = 'PB-E2E-9901';
    const qcRecord = await repo.createRecord({
      commitmentId: replacementCommitment.id,
      supplyPositionId: replacementCommitment.supplyPositionId,
      produceBatchId: batchId,
      cropType: 'Tomato',
      inspectorName: 'Anil Deshmukh (Lic #QC-BLR-04)',
      inspectionCenter: 'Devanahalli Agri-Hub',
      inspectionTimestamp: new Date().toISOString(),
      grossWeightKg: backupCandidate.offeredQuantityKg,
      sampleSizeKg: 25,
      gradeAQuantityKg: Math.round(backupCandidate.offeredQuantityKg * 0.85),
      gradeBQuantityKg: Math.round(backupCandidate.offeredQuantityKg * 0.12),
      processingQuantityKg: Math.round(backupCandidate.offeredQuantityKg * 0.03),
      rejectedQuantityKg: 0,
      overallGrade: 'Grade A',
      items: [
        { attribute: 'Diameter', measuredValue: '62mm', specRequirement: '55-70mm', passed: true },
        { attribute: 'Firmness', measuredValue: '4.8 kg/cm²', specRequirement: '> 4.0', passed: true }
      ],
      photoEvidenceUrls: [],
      passed: true
    });
    expect(qcRecord.passed).toBe(true);

    const produceBatch = await repo.createBatch({
      id: batchId,
      commitmentId: replacementCommitment.id,
      farmerId: replacementCommitment.farmerId,
      farmerName: replacementCommitment.farmerName,
      farmLocation: replacementCommitment.farmRegion,
      cropType: 'Tomato',
      variety: replacementCommitment.variety,
      harvestTimestamp: new Date().toISOString(),
      actualHarvestedKg: backupCandidate.offeredQuantityKg,
      qcRecordId: qcRecord.id,
      certifiedGrade: 'Grade A',
      traceabilityQrCode: `https://futuresupply.agri/batch/${batchId}`,
      status: 'QC_PASSED'
    });
    expect(produceBatch.certifiedGrade).toBe('Grade A');

    // 10. Freshness Shelf-life check during cold chain transit
    const freshness = calculateFreshness({
      cropType: 'Tomato',
      harvestTimestamp: new Date().toISOString(),
      pickupDepartureTime: new Date().toISOString(),
      transitHours: 2.0,
      temperatureControlled: true
    }, 4);
    expect(freshness.meetsBuyerRequirement).toBe(true);
    expect(freshness.estimatedRemainingShelfLifeDays).toBeGreaterThanOrEqual(6.0);

    // 11. Delivery Confirmation & Full Escrow Settlement
    await repo.updateCommitment(replacementCommitment.id, {
      status: 'SETTLED',
      escrowStatus: 'RELEASED'
    });
    const settledCommitment = await repo.getCommitmentById(replacementCommitment.id);
    expect(settledCommitment?.status).toBe('SETTLED');
    expect(settledCommitment?.escrowStatus).toBe('RELEASED');

    // 12. Farmer Historical Reliability Updated
    const updatedReliability = computeReliabilityScore(backupCandidate.supplyPosition.farmerId, [
      {
        promisedYieldKg: backupCandidate.offeredQuantityKg,
        actualHarvestKg: backupCandidate.offeredQuantityKg,
        promisedHarvestDate: demand.requirementStart,
        actualHarvestDate: demand.requirementStart,
        promisedGradeAPercent: 80,
        actualGradeAPercent: 85,
        committedQuantityKg: backupCandidate.offeredQuantityKg,
        deliveredQuantityKg: backupCandidate.offeredQuantityKg,
        cancelledByFarmer: false,
        disputed: false
      }
    ]);
    expect(updatedReliability.overallScore).toBeGreaterThanOrEqual(85);
    expect(updatedReliability.fulfillmentRate).toBe(100);

    // 13. Audit Log Completeness Check
    const logs = await repo.getAllAuditLogs();
    expect(logs.length).toBeGreaterThanOrEqual(5);
  });
});
