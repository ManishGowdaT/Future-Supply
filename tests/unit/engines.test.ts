import { describe, it, expect } from 'vitest';
import { predictYield } from '../../src/engines/yieldPredictor';
import { computeReliabilityScore } from '../../src/engines/reliabilityEngine';
import { calculateFreshness } from '../../src/engines/freshnessCalculator';
import { scoreSupplyMatch } from '../../src/engines/matchingEngine';
import { optimizeMultiFarmMatchPlan } from '../../src/engines/multiFarmOptimizer';
import { evaluateCommitmentRisk } from '../../src/engines/riskEngine';
import { findAutomatedReplacements } from '../../src/engines/replacementEngine';
import { InMemoryRepository } from '../../src/infrastructure/repositories/inMemoryRepository';
import { FutureDemandPosition, FutureSupplyPosition, ForwardCommitment, RiskEvent } from '../../src/types';

describe('1. Yield & Harvest Prediction Engine', () => {
  it('should predict probabilistic yield with P10 <= P50 <= P90 intervals', () => {
    const result = predictYield({
      cropType: 'Tomato',
      variety: 'Hybrid Saaho',
      acreage: 2.0,
      plantingDate: '2026-07-20',
      irrigationType: 'Drip',
      region: 'Ramanagara',
      cropStage: 'FRUIT_FORMATION'
    });

    expect(result.expectedYieldKg).toBeGreaterThan(0);
    expect(result.yieldP10Kg).toBeLessThanOrEqual(result.yieldP50Kg);
    expect(result.yieldP50Kg).toBeLessThanOrEqual(result.yieldP90Kg);
    expect(result.predictionConfidence).toBeGreaterThanOrEqual(0.70);
    expect(result.expectedGradeAProbability).toBeGreaterThan(0.70);
  });
});

describe('2. Farmer Reliability Engine', () => {
  it('should calculate 6-factor weighted reliability score', () => {
    const score = computeReliabilityScore('F-102', [
      {
        promisedYieldKg: 2000,
        actualHarvestKg: 1950,
        promisedHarvestDate: '2026-08-10',
        actualHarvestDate: '2026-08-11',
        promisedGradeAPercent: 80,
        actualGradeAPercent: 78,
        committedQuantityKg: 1000,
        deliveredQuantityKg: 980,
        cancelledByFarmer: false,
        disputed: false
      }
    ]);

    expect(score.overallScore).toBeGreaterThanOrEqual(80);
    expect(score.quantityAccuracy).toBeGreaterThan(90);
    expect(score.fulfillmentRate).toBeGreaterThan(90);
  });
});

describe('3. Freshness & Shelf-Life Engine', () => {
  it('should calculate remaining shelf life and detect temperature acceleration', () => {
    const fresh = calculateFreshness({
      cropType: 'Tomato',
      harvestTimestamp: new Date().toISOString(),
      pickupDepartureTime: new Date().toISOString(),
      transitHours: 3,
      temperatureControlled: true
    }, 4);

    expect(fresh.estimatedRemainingShelfLifeDays).toBeGreaterThanOrEqual(6.0);
    expect(fresh.meetsBuyerRequirement).toBe(true);
    expect(fresh.riskStatus).toBe('FRESH');
  });
});

describe('4. 7-Factor Matching Engine', () => {
  it('should compute weighted match scores with transparent factors', async () => {
    const repo = new InMemoryRepository();
    const supplies = await repo.getAll();
    const demands = await repo.getAllDemands();

    const match = scoreSupplyMatch(supplies[0], demands[0]);
    expect(match.overallMatchScore).toBeGreaterThan(0);
    expect(match.factors.length).toBe(7);

    const totalWeight = match.factors.reduce((acc, f) => acc + f.weightPercent, 0);
    expect(totalWeight).toBe(100);
  });
});

describe('5. Multi-Farm Combinatorial Optimizer', () => {
  it('should aggregate multiple smallholder farms to fulfill large demand', async () => {
    const repo = new InMemoryRepository();
    const supplies = await repo.getAll();
    const demand: FutureDemandPosition = {
      id: 'FD-TEST-01',
      buyerId: 'BUYER-01',
      buyerName: 'Vikram Mehta',
      buyerOrg: 'FreshRoute',
      store: {
        storeId: 'STORE-1',
        storeName: 'Test Store',
        chainName: 'FreshRoute',
        address: 'Bangalore',
        region: 'Koramangala',
        coordinates: { lat: 12.93, lng: 77.62 }
      },
      cropType: 'Tomato',
      requiredQuantityKg: 3000,
      dailyCadenceKg: 500,
      requirementStart: '2026-09-10',
      requirementEnd: '2026-09-17',
      deliveryWindowStart: '05:00',
      deliveryWindowEnd: '08:00',
      minimumGrade: 'Grade A',
      maximumAcceptablePricePerKg: 30,
      minimumFreshnessShelfLifeDays: 4,
      securedQuantityKg: 0,
      reliableQuantityKg: 0,
      atRiskQuantityKg: 0,
      fulfillmentProbability: 90,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const plan = optimizeMultiFarmMatchPlan(demand, supplies);
    expect(plan.allocatedQuantityKg).toBeGreaterThanOrEqual(2500);
    expect(plan.matches.length).toBeGreaterThanOrEqual(2);
    expect(plan.coveragePercent).toBeGreaterThan(70);
  });
});

describe('6. Risk Engine & Shortfall Detection', () => {
  it('should detect high risk and projected shortfall on regional weather shock', async () => {
    const repo = new InMemoryRepository();
    const commitments = await repo.getAllCommitments();
    const supply = await repo.getById(commitments[0].supplyPositionId);

    const weatherShock: RiskEvent = {
      id: 'RISK-TEST-1',
      timestamp: new Date().toISOString(),
      eventType: 'WEATHER_SHOCK',
      severity: 'HIGH',
      affectedRegion: 'Ramanagara',
      title: 'Unseasonal Heavy Downpour',
      description: 'Severe waterlogging risk in Channapatna belt',
      estimatedImpactPercent: 35,
      active: true
    };

    const assessment = evaluateCommitmentRisk(commitments[0], supply, [weatherShock]);
    expect(assessment.newFulfillmentProb).toBeLessThan(75);
    expect(assessment.isShortfallTriggered).toBe(true);
    expect(assessment.projectedShortfallKg).toBeGreaterThan(0);
  });
});

describe('7. Automated Replacement Sourcing Engine', () => {
  it('should automatically find ranked alternative backup farms', async () => {
    const repo = new InMemoryRepository();
    const commitments = await repo.getAllCommitments();
    const supplies = await repo.getAll();

    const replacement = findAutomatedReplacements(
      commitments[0],
      350,
      supplies,
      [{
        id: 'EVT-1',
        timestamp: new Date().toISOString(),
        eventType: 'WEATHER_SHOCK',
        severity: 'HIGH',
        affectedRegion: 'Ramanagara',
        title: 'Heavy Rain',
        description: 'Flooding',
        estimatedImpactPercent: 40,
        active: true
      }]
    );

    expect(replacement.recommendedCandidates.length).toBeGreaterThanOrEqual(1);
    expect(replacement.totalReplacementAllocatedKg).toBeGreaterThanOrEqual(350);
    expect(replacement.restoredFulfillmentProb).toBeGreaterThanOrEqual(90);
  });
});

describe('8. Overcommitment Prevention Guardrail', () => {
  it('should throw error when attempting to reserve beyond safe P10 limit', async () => {
    const repo = new InMemoryRepository();
    const supplies = await repo.getAll();
    const target = supplies[0]; // yieldP10 is 1850 kg, committed 900 kg -> safe remaining is 950 kg

    // Attempting to reserve 2000 kg must throw error
    await expect(repo.reserveCapacity(target.id, 2000)).rejects.toThrow(/Overcommitment Error/);
  });
});
