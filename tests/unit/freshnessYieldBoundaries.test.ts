import { describe, it, expect } from 'vitest';
import { calculateFreshness, type FreshnessCalculationInput } from '../../src/engines/freshnessCalculator';
import { predictYield, type YieldPredictionInput } from '../../src/engines/yieldPredictor';

const freshInput: FreshnessCalculationInput = {
  cropType: 'Tomato', harvestTimestamp: '2026-09-01T00:00:00Z',
  pickupDepartureTime: '2026-09-01T00:00:00Z', transitHours: 3,
  temperatureControlled: true
};
const yieldInput: YieldPredictionInput = {
  cropType: 'Tomato', variety: 'Hybrid Saaho', acreage: 2,
  plantingDate: '2026-07-20', irrigationType: 'Drip',
  region: 'Ramanagara', cropStage: 'FRUIT_FORMATION'
};

describe('Freshness boundaries', () => {
  it('fails closed for invalid timestamps', () => {
    expect(calculateFreshness({ ...freshInput, harvestTimestamp: 'invalid' }).riskStatus).toBe('DEGRADED');
  });
  it('rejects departure before harvest', () => {
    expect(calculateFreshness({ ...freshInput, pickupDepartureTime: '2026-08-31T00:00:00Z' }).meetsBuyerRequirement).toBe(false);
  });
  it('rejects negative and infinite transit', () => {
    for (const transitHours of [-1, Infinity]) {
      expect(calculateFreshness({ ...freshInput, transitHours }).freshnessScorePercent).toBe(0);
    }
  });
  it('reports zero life for expired produce', () => {
    const result = calculateFreshness({ ...freshInput, transitHours: 1000 }, 0);
    expect(result.estimatedRemainingShelfLifeDays).toBe(0);
    expect(result.meetsBuyerRequirement).toBe(false);
  });
  it('rejects invalid buyer requirements', () => {
    expect(calculateFreshness(freshInput, -1).meetsBuyerRequirement).toBe(false);
  });
});

describe('Yield boundaries', () => {
  it('prevents negative and nonfinite acreage predictions', () => {
    for (const acreage of [-2, Infinity, NaN]) {
      expect(predictYield({ ...yieldInput, acreage }).yieldP10Kg).toBe(0);
    }
  });
  it('keeps the expected UTC harvest date stable', () => {
    expect(predictYield(yieldInput).harvestP50Date).toBe('2026-09-18');
  });
});
