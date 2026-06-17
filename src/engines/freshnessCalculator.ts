import { CropType } from '../types';

export interface FreshnessCalculationInput {
  cropType: CropType;
  harvestTimestamp: string;
  pickupDepartureTime: string;
  transitHours: number;
  temperatureControlled: boolean;
  ambientTempCelsius?: number;
}

export interface FreshnessResult {
  freshnessScorePercent: number; // 0 - 100
  estimatedRemainingShelfLifeDays: number;
  shelfLifeDecayRatePerDay: number;
  meetsBuyerRequirement: boolean;
  riskStatus: 'FRESH' | 'MODERATE' | 'DEGRADED';
}

const CROP_BASE_SHELF_LIFE_DAYS: Record<CropType, number> = {
  Tomato: 7.5,
  Beans: 5.0,
  Onion: 35.0,
  Capsicum: 8.0,
  Potato: 45.0
};

export function calculateFreshness(
  input: FreshnessCalculationInput,
  minRequiredDays: number = 4
): FreshnessResult {
  const baseShelfLife = CROP_BASE_SHELF_LIFE_DAYS[input.cropType] || 7.0;

  const harvestTime = new Date(input.harvestTimestamp).getTime();
  const pickupTime = new Date(input.pickupDepartureTime).getTime();
  if (!Number.isFinite(harvestTime) || !Number.isFinite(pickupTime) || pickupTime < harvestTime) {
    return {
      freshnessScorePercent: 0,
      estimatedRemainingShelfLifeDays: 0,
      shelfLifeDecayRatePerDay: Number((1.0 / baseShelfLife).toFixed(2)),
      meetsBuyerRequirement: false,
      riskStatus: 'DEGRADED'
    };
  }
  const farmToPickupHours = (pickupTime - harvestTime) / (1000 * 60 * 60);

  const totalTransitHours = farmToPickupHours + input.transitHours;

  // Temperature acceleration multiplier: ambient heat speeds up respiration decay
  const tempMultiplier = input.temperatureControlled ? 1.0 : (input.ambientTempCelsius && input.ambientTempCelsius > 30 ? 1.6 : 1.25);

  const hoursDeducted = totalTransitHours * tempMultiplier;
  const daysLostInTransit = hoursDeducted / 24;

  const remainingDays = Math.max(0.5, Number((baseShelfLife - daysLostInTransit).toFixed(1)));
  const freshnessScore = Math.min(100, Math.max(10, Math.round((remainingDays / baseShelfLife) * 100)));

  const riskStatus: FreshnessResult['riskStatus'] =
    remainingDays >= minRequiredDays + 1 ? 'FRESH' : remainingDays >= minRequiredDays ? 'MODERATE' : 'DEGRADED';

  return {
    freshnessScorePercent: freshnessScore,
    estimatedRemainingShelfLifeDays: remainingDays,
    shelfLifeDecayRatePerDay: Number((1.0 / baseShelfLife).toFixed(2)),
    meetsBuyerRequirement: remainingDays >= minRequiredDays,
    riskStatus
  };
}
