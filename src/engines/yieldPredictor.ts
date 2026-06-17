import { CropType, CropStage } from '../types';

export interface YieldPredictionInput {
  cropType: CropType;
  variety: string;
  acreage: number;
  plantingDate: string;
  irrigationType: 'Drip' | 'Canal' | 'Rainfed' | 'Borewell Sprinkler';
  region: string;
  cropStage: CropStage;
}

export interface YieldPredictionResult {
  expectedYieldKg: number;
  yieldP10Kg: number; // Conservative safe commitment limit
  yieldP50Kg: number; // Median
  yieldP90Kg: number; // Favorable ceiling
  predictionConfidence: number; // 0 - 1.0

  harvestWindowStart: string;
  harvestWindowEnd: string;
  harvestP10Date: string;
  harvestP50Date: string;
  harvestP90Date: string;

  expectedGradeAProbability: number;
  expectedGradeBProbability: number;
  expectedProcessingProbability: number;
  modelVersion: string;
}

const CROP_BENCHMARKS: Record<CropType, {
  daysToMaturity: number;
  avgYieldKgPerAcre: number;
  dripBonusFactor: number;
  gradeABaseProb: number;
}> = {
  Tomato: { daysToMaturity: 60, avgYieldKgPerAcre: 900, dripBonusFactor: 1.15, gradeABaseProb: 0.80 },
  Onion: { daysToMaturity: 90, avgYieldKgPerAcre: 1300, dripBonusFactor: 1.10, gradeABaseProb: 0.82 },
  Beans: { daysToMaturity: 45, avgYieldKgPerAcre: 750, dripBonusFactor: 1.12, gradeABaseProb: 0.85 },
  Capsicum: { daysToMaturity: 70, avgYieldKgPerAcre: 850, dripBonusFactor: 1.20, gradeABaseProb: 0.78 },
  Potato: { daysToMaturity: 80, avgYieldKgPerAcre: 1500, dripBonusFactor: 1.08, gradeABaseProb: 0.80 }
};

const STAGE_CONFIDENCE_MAP: Record<CropStage, number> = {
  SEEDLING: 0.55,
  VEGETATIVE: 0.68,
  FLOWERING: 0.76,
  FRUIT_FORMATION: 0.85,
  MATURITY: 0.92,
  HARVEST: 0.98
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return d.toISOString().split('T')[0];
}

export function predictYield(input: YieldPredictionInput): YieldPredictionResult {
  const benchmark = CROP_BENCHMARKS[input.cropType] || CROP_BENCHMARKS.Tomato;
  const irrigationMultiplier = input.irrigationType === 'Drip' ? benchmark.dripBonusFactor : 1.0;

  const baseYield = input.acreage * benchmark.avgYieldKgPerAcre * irrigationMultiplier;
  const confidence = STAGE_CONFIDENCE_MAP[input.cropStage] || 0.70;

  // Probabilistic variance calculation: uncertainty narrows as crop matures
  const varianceSpan = (1.0 - confidence) * 0.45; // e.g. at Seedling: ~20% span; at Maturity: ~3.6%
  const yieldP10 = Math.round(baseYield * (1.0 - varianceSpan));
  const yieldP50 = Math.round(baseYield);
  const yieldP90 = Math.round(baseYield * (1.0 + varianceSpan * 0.8));

  // Harvest date predictions
  const plantingTime = input.plantingDate || new Date().toISOString().split('T')[0];
  const targetDays = benchmark.daysToMaturity;

  const harvestP10 = addDays(plantingTime, targetDays - 3);
  const harvestP50 = addDays(plantingTime, targetDays);
  const harvestP90 = addDays(plantingTime, targetDays + 4);

  const windowStart = addDays(plantingTime, targetDays - 4);
  const windowEnd = addDays(plantingTime, targetDays + 5);

  const gradeAProb = Math.min(0.95, benchmark.gradeABaseProb + (input.irrigationType === 'Drip' ? 0.04 : 0));
  const gradeBProb = Math.max(0.04, (1.0 - gradeAProb) * 0.75);
  const processingProb = Math.max(0.01, 1.0 - gradeAProb - gradeBProb);

  return {
    expectedYieldKg: yieldP50,
    yieldP10Kg: yieldP10,
    yieldP50Kg: yieldP50,
    yieldP90Kg: yieldP90,
    predictionConfidence: confidence,
    harvestWindowStart: windowStart,
    harvestWindowEnd: windowEnd,
    harvestP10Date: harvestP10,
    harvestP50Date: harvestP50,
    harvestP90Date: harvestP90,
    expectedGradeAProbability: Number(gradeAProb.toFixed(2)),
    expectedGradeBProbability: Number(gradeBProb.toFixed(2)),
    expectedProcessingProbability: Number(processingProb.toFixed(2)),
    modelVersion: 'crop-yield-v3.4-probabilistic'
  };
}
