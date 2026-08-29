export type Role =
  | 'FARMER'
  | 'FPO_ADMIN'
  | 'BUYER'
  | 'BUYER_PROCUREMENT'
  | 'QC_INSPECTOR'
  | 'LOGISTICS_OPERATOR'
  | 'PLATFORM_ADMIN'
  | 'FINANCE_ADMIN'
  | 'SUPPORT';

export type CropType = 'Tomato' | 'Onion' | 'Beans' | 'Capsicum' | 'Potato';

export type CropStage =
  | 'SEEDLING'
  | 'VEGETATIVE'
  | 'FLOWERING'
  | 'FRUIT_FORMATION'
  | 'MATURITY'
  | 'HARVEST';

export type GradeLevel = 'Grade A' | 'Grade B' | 'Processing' | 'Rejected';

export type SupplyPositionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'PARTIALLY_COMMITTED'
  | 'FULLY_COMMITTED'
  | 'HARVEST_APPROACHING'
  | 'HARVESTED'
  | 'QC_PENDING'
  | 'QC_APPROVED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'SETTLED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'AT_RISK'
  | 'SHORTFALL'
  | 'REJECTED'
  | 'DISPUTED';

export type DemandPositionStatus =
  | 'OPEN'
  | 'MATCHED'
  | 'PARTIALLY_SECURED'
  | 'FULLY_SECURED'
  | 'AT_RISK'
  | 'FULFILLED'
  | 'CANCELLED';

export type CommitmentStatus =
  | 'DRAFT'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'DEPOSIT_PENDING'
  | 'SECURED'
  | 'HARVEST_APPROACHING'
  | 'HARVESTED'
  | 'QC_PENDING'
  | 'QC_APPROVED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'SETTLED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'SHORTFALL'
  | 'DISPUTED'
  | 'QC_REJECTED';

export type EscrowStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'HELD'
  | 'RELEASED'
  | 'REFUNDED'
  | 'FAILED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskEventType =
  | 'WEATHER_SHOCK'
  | 'YIELD_REDUCTION'
  | 'HARVEST_DELAY'
  | 'QUALITY_DEGRADATION'
  | 'FARMER_CANCELLATION'
  | 'LOGISTICS_DELAY'
  | 'DEMAND_SURGE'
  | 'OVERCOMMITMENT_WARNING';

export type VerificationLevel = 0 | 1 | 2 | 3 | 4;

export interface GeoLocation {
  lat: number;
  lng: number;
  region: string;
  subDistrict?: string;
  distanceKmToBangaloreCenter: number;
}

export interface FarmerReliabilityScore {
  farmerId: string;
  overallScore: number; // 0 - 100
  quantityAccuracy: number; // %
  harvestTimingAccuracy: number; // %
  gradeConsistency: number; // %
  fulfillmentRate: number; // %
  cancellationRate: number; // %
  disputeRate: number; // %
  completedBatchesCount: number;
  lastUpdated: string;
}

export interface FutureSupplyPosition {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  fpoName?: string;
  farmId: string;
  farmName: string;
  location: GeoLocation;
  verificationLevel: VerificationLevel;
  farmerReliability: FarmerReliabilityScore;

  cropType: CropType;
  variety: string;
  acreage: number;
  plantingDate: string;
  irrigationType: 'Drip' | 'Canal' | 'Rainfed' | 'Borewell Sprinkler';
  soilType: 'Red Loam' | 'Black Soil' | 'Sandy Loam' | 'Clay Loam';

  cropStage: CropStage;
  stageProgressPercent: number;
  lastStageUpdate: string;

  // Probabilistic Yield
  expectedYieldKg: number;
  yieldP10Kg: number; // Safe commitment capacity
  yieldP50Kg: number; // Median expectation
  yieldP90Kg: number; // Favorable ceiling
  predictionConfidence: number; // 0 - 1.0 (e.g. 0.84 = 84%)
  modelVersion: string;

  // Probabilistic Harvest Window
  harvestWindowStart: string;
  harvestWindowEnd: string;
  harvestP10Date: string;
  harvestP50Date: string;
  harvestP90Date: string;

  // Quality Breakdown
  expectedGradeAProbability: number;
  expectedGradeBProbability: number;
  expectedProcessingProbability: number;

  // Commitment accounting
  committedQuantityKg: number;
  reservedQuantityKg: number;
  safeAvailableCapacityKg: number; // yieldP10Kg - committedQuantityKg - reservedQuantityKg
  askingPricePerKg: number;

  status: SupplyPositionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreLocation {
  storeId: string;
  storeName: string;
  chainName: string;
  address: string;
  region: string;
  coordinates: { lat: number; lng: number };
}

export interface FutureDemandPosition {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerOrg: string;
  store: StoreLocation;

  cropType: CropType;
  varietyPreferred?: string;
  requiredQuantityKg: number;
  dailyCadenceKg: number;

  requirementStart: string;
  requirementEnd: string;
  deliveryWindowStart: string; // e.g. "05:00"
  deliveryWindowEnd: string; // e.g. "08:00"

  minimumGrade: GradeLevel;
  maximumAcceptablePricePerKg: number;
  minimumFreshnessShelfLifeDays: number;

  securedQuantityKg: number;
  reliableQuantityKg: number;
  atRiskQuantityKg: number;
  fulfillmentProbability: number; // 0 - 100%

  status: DemandPositionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScoreFactor {
  factor: string;
  weightPercent: number;
  score: number; // 0 - 100
  weightedScore: number;
  rationale: string;
}

export interface SupplyMatch {
  supplyPosition: FutureSupplyPosition;
  overallMatchScore: number; // 0 - 100
  recommendedAllocatedKg: number;
  estimatedDeliveredPricePerKg: number;
  freshnessScoreDays: number;
  fulfillmentProbability: number;
  factors: MatchScoreFactor[];
  riskIndicators: string[];
}

export interface MultiFarmMatchPlan {
  demandPositionId: string;
  targetQuantityKg: number;
  allocatedQuantityKg: number;
  coveragePercent: number;
  blendedPricePerKg: number;
  averageFulfillmentProbability: number;
  matches: SupplyMatch[];
  optimizationSummary: string;
  createdAt: string;
}

export interface ForwardCommitment {
  id: string;
  demandPositionId: string;
  supplyPositionId: string;
  buyerId: string;
  buyerName: string;
  buyerOrg: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  farmRegion: string;

  cropType: CropType;
  variety: string;
  committedQuantityKg: number;
  unitPricePerKg: number;
  totalOrderValueInr: number;
  allowedVariancePercent: number; // default: 10% (tolerance buffer)

  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  deliveryDate: string;
  deliveryWindow: string; // e.g. "05:30 - 08:00 AM"
  destinationStore: StoreLocation;

  qualitySpecs: {
    minimumGrade: GradeLevel;
    minGradeAPercent: number;
    maxDefectPercent: number;
    firmnessRequirement: string;
  };

  escrowStatus: EscrowStatus;
  depositAmountInr: number; // 20% commitment deposit
  balanceAmountInr: number; // 80% upon QC & delivery confirmation

  fulfillmentProbability: number; // dynamic live score
  riskLevel: RiskLevel;
  primaryRiskFactor?: string;
  shortfallAmountKg: number;

  status: CommitmentStatus;
  signedAgreementHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskEvent {
  id: string;
  timestamp: string;
  eventType: RiskEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedRegion: string;
  affectedCropType?: CropType;
  title: string;
  description: string;
  estimatedImpactPercent: number;
  active: boolean;
}

export interface ShortfallAlert {
  commitmentId: string;
  orderNumber: string;
  buyerName: string;
  storeName: string;
  cropType: CropType;
  requiredQuantityKg: number;
  securedQuantityKg: number;
  projectedShortfallKg: number;
  previousFulfillmentProb: number;
  currentFulfillmentProb: number;
  riskReason: string;
  timestamp: string;
}

export interface ReplacementCandidate {
  supplyPosition: FutureSupplyPosition;
  offeredQuantityKg: number;
  pricePerKg: number;
  distanceKm: number;
  harvestWindow: string;
  gradeAProb: number;
  reliabilityScore: number;
  matchScore: number;
}

export interface ReplacementPlan {
  shortfallAlertId: string;
  originalCommitmentId: string;
  shortfallKg: number;
  recommendedCandidates: ReplacementCandidate[];
  totalReplacementAllocatedKg: number;
  restoredFulfillmentProb: number;
  blendedReplacementPricePerKg: number;
  createdAt: string;
}

export interface QCInspectionItem {
  attribute: string;
  measuredValue: string | number;
  specRequirement: string;
  passed: boolean;
}

export interface QCRecord {
  id: string;
  commitmentId: string;
  supplyPositionId: string;
  produceBatchId: string;
  cropType: CropType;
  inspectorName: string;
  inspectionCenter: string;
  inspectionTimestamp: string;

  grossWeightKg: number;
  sampleSizeKg: number;
  gradeAQuantityKg: number;
  gradeBQuantityKg: number;
  processingQuantityKg: number;
  rejectedQuantityKg: number;

  overallGrade: GradeLevel;
  items: QCInspectionItem[];
  rejectionReason?: string;
  photoEvidenceUrls: string[];
  passed: boolean;
}

export interface ProduceBatch {
  id: string; // e.g. "PB-82931"
  commitmentId: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  cropType: CropType;
  variety: string;
  harvestTimestamp: string;
  actualHarvestedKg: number;
  qcRecordId?: string;
  certifiedGrade?: GradeLevel;
  traceabilityQrCode: string;
  status: 'HARVESTED' | 'QC_PASSED' | 'AGGREGATED' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface AggregationPlan {
  id: string;
  destinationStore: StoreLocation;
  cropType: CropType;
  targetTotalKg: number;
  collectedBatches: ProduceBatch[];
  collectionHub: string;
  pickupDepartureTime: string;
  estimatedStoreArrivalTime: string;
  transitDurationHours: number;
  estimatedRemainingShelfLifeDays: number;
  status: 'PLANNED' | 'COLLECTING' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: Role;
  actorName: string;
  eventType: string;
  entityType: 'SUPPLY' | 'DEMAND' | 'COMMITMENT' | 'QC' | 'RISK' | 'ESCROW' | 'LOGISTICS';
  entityId: string;
  description: string;
  previousState?: string;
  newState?: string;
  metadata?: Record<string, any>;
}
