import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Role,
  FutureSupplyPosition,
  FutureDemandPosition,
  ForwardCommitment,
  ProduceBatch,
  QCRecord,
  RiskEvent,
  AuditEvent,
  StoreLocation,
  MultiFarmMatchPlan,
  ReplacementPlan,
  ShortfallAlert,
  CropStage,
  GradeLevel,
  SupplyPositionStatus,
  CommitmentStatus
} from '../types';
import { InMemoryRepository } from '../infrastructure/repositories/inMemoryRepository';
import { predictYield } from '../engines/yieldPredictor';
import { optimizeMultiFarmMatchPlan } from '../engines/multiFarmOptimizer';
import { evaluateCommitmentRisk } from '../engines/riskEngine';
import { findAutomatedReplacements } from '../engines/replacementEngine';
import { SEED_STORES } from '../data/seedData';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  supplies: FutureSupplyPosition[];
  demands: FutureDemandPosition[];
  commitments: ForwardCommitment[];
  batches: ProduceBatch[];
  qcRecords: QCRecord[];
  riskEvents: RiskEvent[];
  auditLogs: AuditEvent[];
  stores: StoreLocation[];
  activeShortfallAlerts: ShortfallAlert[];

  // Actions
  createSupplyPosition: (input: {
    cropType: any;
    variety: string;
    acreage: number;
    plantingDate: string;
    irrigationType: any;
    soilType: any;
    region: string;
    subDistrict: string;
    askingPricePerKg: number;
    notes?: string;
  }) => Promise<FutureSupplyPosition>;

  updateCropStage: (positionId: string, newStage: CropStage) => Promise<void>;

  createDemandPosition: (input: {
    storeId: string;
    cropType: any;
    varietyPreferred?: string;
    requiredQuantityKg: number;
    requirementStart: string;
    requirementEnd: string;
    deliveryWindowStart: string;
    deliveryWindowEnd: string;
    minimumGrade: GradeLevel;
    maximumAcceptablePricePerKg: number;
    minimumFreshnessShelfLifeDays: number;
  }) => Promise<FutureDemandPosition>;

  getMatchPlanForDemand: (demandId: string) => MultiFarmMatchPlan | null;

  commitMatchPlan: (demandId: string, matchPlan: MultiFarmMatchPlan) => Promise<void>;

  injectWeatherShock: (
    region: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    title: string,
    description: string,
    impactPercent: number
  ) => Promise<void>;

  resolveRiskEvent: (eventId: string) => Promise<void>;

  getAutoReplacementPlan: (alert: ShortfallAlert) => ReplacementPlan | null;

  executeAutoReplacement: (plan: ReplacementPlan) => Promise<void>;

  performQCInspection: (input: {
    commitmentId: string;
    inspectorName: string;
    inspectionCenter: string;
    grossWeightKg: number;
    gradeAQuantityKg: number;
    gradeBQuantityKg: number;
    processingQuantityKg: number;
    rejectedQuantityKg: number;
    overallGrade: GradeLevel;
    items: { attribute: string; measuredValue: string; specRequirement: string; passed: boolean }[];
    rejectionReason?: string;
  }) => Promise<QCRecord>;

  confirmDeliveryAndSettle: (commitmentId: string) => Promise<void>;

  resetToSeed: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const repo = new InMemoryRepository();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('FARMER');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('futuresupply_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('futuresupply_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [supplies, setSupplies] = useState<FutureSupplyPosition[]>([]);
  const [demands, setDemands] = useState<FutureDemandPosition[]>([]);
  const [commitments, setCommitments] = useState<ForwardCommitment[]>([]);
  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [qcRecords, setQcRecords] = useState<QCRecord[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const stores = useMemo(() => SEED_STORES, []);

  // Reload state from repository
  const refreshState = useCallback(async () => {
    const [s, d, c, b, q, r, a] = await Promise.all([
      repo.getAll(),
      repo.getAllDemands(),
      repo.getAllCommitments(),
      repo.getAllBatches(),
      repo.getAllRecords(),
      repo.getAllRiskEvents(),
      repo.getAllAuditLogs()
    ]);

    // Recalculate dynamic risks on all commitments
    const updatedCommitments = c.map(comm => {
      const sup = s.find(item => item.id === comm.supplyPositionId) || null;
      const riskAssessment = evaluateCommitmentRisk(comm, sup, r);
      return {
        ...comm,
        fulfillmentProbability: riskAssessment.newFulfillmentProb,
        riskLevel: riskAssessment.riskLevel,
        primaryRiskFactor: riskAssessment.primaryRiskFactor,
        shortfallAmountKg: riskAssessment.projectedShortfallKg
      };
    });

    setSupplies(s);
    setDemands(d);
    setCommitments(updatedCommitments);
    setBatches(b);
    setQcRecords(q);
    setRiskEvents(r);
    setAuditLogs(a);
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Derived Shortfall Alerts
  const activeShortfallAlerts = useMemo(() => {
    const alerts: ShortfallAlert[] = [];
    commitments.forEach(comm => {
      if (comm.shortfallAmountKg > 0 && ['SECURED', 'PENDING_ACCEPTANCE', 'ACCEPTED'].includes(comm.status)) {
        const demand = demands.find(d => d.id === comm.demandPositionId);
        alerts.push({
          commitmentId: comm.id,
          orderNumber: comm.id,
          buyerName: comm.buyerName,
          storeName: comm.destinationStore.storeName,
          cropType: comm.cropType,
          requiredQuantityKg: demand?.requiredQuantityKg || comm.committedQuantityKg,
          securedQuantityKg: comm.committedQuantityKg,
          projectedShortfallKg: comm.shortfallAmountKg,
          previousFulfillmentProb: 92,
          currentFulfillmentProb: comm.fulfillmentProbability,
          riskReason: comm.primaryRiskFactor || 'Regional Climate Shock',
          timestamp: comm.updatedAt
        });
      }
    });
    return alerts;
  }, [commitments, demands]);

  // 1. Farmer Creates Supply Position
  const createSupplyPosition = async (input: {
    cropType: any;
    variety: string;
    acreage: number;
    plantingDate: string;
    irrigationType: any;
    soilType: any;
    region: string;
    subDistrict: string;
    askingPricePerKg: number;
    notes?: string;
  }) => {
    const prediction = predictYield({
      cropType: input.cropType,
      variety: input.variety,
      acreage: input.acreage,
      plantingDate: input.plantingDate,
      irrigationType: input.irrigationType,
      region: input.region,
      cropStage: 'SEEDLING'
    });

    const newPos = await repo.create({
      farmerId: 'F-102',
      farmerName: 'Chennappa Gowda',
      farmerPhone: '+91 98451 23091',
      fpoName: 'Ramanagara Horticulture Producers Co-op',
      farmId: `FARM-${input.region.slice(0, 3).toUpperCase()}-09`,
      farmName: 'Gowda Farm Lands - Parcel B',
      location: {
        lat: 12.72,
        lng: 77.28,
        region: input.region,
        subDistrict: input.subDistrict,
        distanceKmToBangaloreCenter: 54
      },
      verificationLevel: 3,
      farmerReliability: {
        farmerId: 'F-102',
        overallScore: 91,
        quantityAccuracy: 93,
        harvestTimingAccuracy: 88,
        gradeConsistency: 94,
        fulfillmentRate: 97,
        cancellationRate: 2,
        disputeRate: 1,
        completedBatchesCount: 42,
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      cropType: input.cropType,
      variety: input.variety,
      acreage: input.acreage,
      plantingDate: input.plantingDate,
      irrigationType: input.irrigationType,
      soilType: input.soilType,
      cropStage: 'SEEDLING',
      stageProgressPercent: 10,
      lastStageUpdate: new Date().toISOString(),
      expectedYieldKg: prediction.expectedYieldKg,
      yieldP10Kg: prediction.yieldP10Kg,
      yieldP50Kg: prediction.yieldP50Kg,
      yieldP90Kg: prediction.yieldP90Kg,
      predictionConfidence: prediction.predictionConfidence,
      modelVersion: prediction.modelVersion,
      harvestWindowStart: prediction.harvestWindowStart,
      harvestWindowEnd: prediction.harvestWindowEnd,
      harvestP10Date: prediction.harvestP10Date,
      harvestP50Date: prediction.harvestP50Date,
      harvestP90Date: prediction.harvestP90Date,
      expectedGradeAProbability: prediction.expectedGradeAProbability,
      expectedGradeBProbability: prediction.expectedGradeBProbability,
      expectedProcessingProbability: prediction.expectedProcessingProbability,
      committedQuantityKg: 0,
      reservedQuantityKg: 0,
      safeAvailableCapacityKg: prediction.yieldP10Kg,
      askingPricePerKg: input.askingPricePerKg,
      status: 'ACTIVE',
      notes: input.notes
    });

    await refreshState();
    return newPos;
  };

  // 2. Farmer Updates Crop Stage
  const updateCropStage = async (positionId: string, newStage: CropStage) => {
    const supply = supplies.find(s => s.id === positionId);
    if (!supply) return;

    const progressMap: Record<CropStage, number> = {
      SEEDLING: 10,
      VEGETATIVE: 30,
      FLOWERING: 55,
      FRUIT_FORMATION: 75,
      MATURITY: 90,
      HARVEST: 100
    };

    const newPrediction = predictYield({
      cropType: supply.cropType,
      variety: supply.variety,
      acreage: supply.acreage,
      plantingDate: supply.plantingDate,
      irrigationType: supply.irrigationType,
      region: supply.location.region,
      cropStage: newStage
    });

    let newStatus: SupplyPositionStatus = supply.status;
    if (newStage === 'HARVEST') {
      newStatus = 'HARVESTED';
    }

    await repo.update(positionId, {
      cropStage: newStage,
      stageProgressPercent: progressMap[newStage],
      lastStageUpdate: new Date().toISOString(),
      predictionConfidence: newPrediction.predictionConfidence,
      expectedYieldKg: newPrediction.expectedYieldKg,
      yieldP10Kg: newPrediction.yieldP10Kg,
      yieldP50Kg: newPrediction.yieldP50Kg,
      yieldP90Kg: newPrediction.yieldP90Kg,
      safeAvailableCapacityKg: Math.max(0, newPrediction.yieldP10Kg - supply.committedQuantityKg - supply.reservedQuantityKg),
      status: newStatus
    });

    await repo.log({
      actorId: supply.farmerId,
      actorRole: 'FARMER',
      actorName: supply.farmerName,
      eventType: 'CROP_STAGE_UPDATED',
      entityType: 'SUPPLY',
      entityId: positionId,
      description: `Crop stage progressed to ${newStage} (${progressMap[newStage]}%). Confidence elevated to ${Math.round(newPrediction.predictionConfidence * 100)}%.`,
      previousState: supply.cropStage,
      newState: newStage
    });

    await refreshState();
  };

  // 3. Buyer Creates Demand Position
  const createDemandPosition = async (input: {
    storeId: string;
    cropType: any;
    varietyPreferred?: string;
    requiredQuantityKg: number;
    requirementStart: string;
    requirementEnd: string;
    deliveryWindowStart: string;
    deliveryWindowEnd: string;
    minimumGrade: GradeLevel;
    maximumAcceptablePricePerKg: number;
    minimumFreshnessShelfLifeDays: number;
  }) => {
    const targetStore = stores.find(s => s.storeId === input.storeId) || stores[0];
    const days = Math.max(1, (new Date(input.requirementEnd).getTime() - new Date(input.requirementStart).getTime()) / (1000 * 60 * 60 * 24));
    const cadence = Math.round(input.requiredQuantityKg / days);

    const newDemand = await repo.createDemand({
      buyerId: 'BUYER-01',
      buyerName: 'Vikram Mehta',
      buyerOrg: 'FreshRoute Supermarkets',
      store: targetStore,
      cropType: input.cropType,
      varietyPreferred: input.varietyPreferred,
      requiredQuantityKg: input.requiredQuantityKg,
      dailyCadenceKg: cadence,
      requirementStart: input.requirementStart,
      requirementEnd: input.requirementEnd,
      deliveryWindowStart: input.deliveryWindowStart,
      deliveryWindowEnd: input.deliveryWindowEnd,
      minimumGrade: input.minimumGrade,
      maximumAcceptablePricePerKg: input.maximumAcceptablePricePerKg,
      minimumFreshnessShelfLifeDays: input.minimumFreshnessShelfLifeDays,
      securedQuantityKg: 0,
      reliableQuantityKg: 0,
      atRiskQuantityKg: 0,
      fulfillmentProbability: 95,
      status: 'OPEN'
    });

    await refreshState();
    return newDemand;
  };

  // 4. Generate Multi-Farm Match Plan
  const getMatchPlanForDemand = useCallback((demandId: string): MultiFarmMatchPlan | null => {
    const demand = demands.find(d => d.id === demandId);
    if (!demand) return null;
    return optimizeMultiFarmMatchPlan(demand, supplies, riskEvents.filter(e => e.active));
  }, [demands, supplies, riskEvents]);

  // 5. Commit Match Plan
  const commitMatchPlan = async (demandId: string, plan: MultiFarmMatchPlan) => {
    const demand = demands.find(d => d.id === demandId);
    if (!demand) return;

    for (const match of plan.matches) {
      const sup = match.supplyPosition;
      const orderValue = match.recommendedAllocatedKg * sup.askingPricePerKg;
      const deposit = Math.round(orderValue * 0.20);
      const balance = orderValue - deposit;

      await repo.createCommitment({
        demandPositionId: demand.id,
        supplyPositionId: sup.id,
        buyerId: demand.buyerId,
        buyerName: demand.buyerName,
        buyerOrg: demand.buyerOrg,
        farmerId: sup.farmerId,
        farmerName: sup.farmerName,
        farmName: sup.farmName,
        farmRegion: sup.location.region,
        cropType: demand.cropType,
        variety: sup.variety,
        committedQuantityKg: match.recommendedAllocatedKg,
        unitPricePerKg: sup.askingPricePerKg,
        totalOrderValueInr: orderValue,
        allowedVariancePercent: 10,
        expectedHarvestStart: sup.harvestWindowStart,
        expectedHarvestEnd: sup.harvestWindowEnd,
        deliveryDate: demand.requirementStart,
        deliveryWindow: `${demand.deliveryWindowStart} - ${demand.deliveryWindowEnd}`,
        destinationStore: demand.store,
        qualitySpecs: {
          minimumGrade: demand.minimumGrade,
          minGradeAPercent: Math.round(sup.expectedGradeAProbability * 100),
          maxDefectPercent: 5,
          firmnessRequirement: 'Standard firmness index >= 4.0 kg/cm²'
        },
        escrowStatus: 'FUNDED',
        depositAmountInr: deposit,
        balanceAmountInr: balance,
        fulfillmentProbability: match.fulfillmentProbability,
        riskLevel: 'LOW',
        shortfallAmountKg: 0,
        status: 'SECURED',
        signedAgreementHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`
      });
    }

    await refreshState();
  };

  // 6. Inject Weather Shock
  const injectWeatherShock = async (
    region: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    title: string,
    description: string,
    impactPercent: number
  ) => {
    await repo.createRiskEvent({
      eventType: 'WEATHER_SHOCK',
      severity,
      affectedRegion: region,
      title,
      description,
      estimatedImpactPercent: impactPercent,
      active: true
    });
    await refreshState();
  };

  // 7. Resolve Risk Event
  const resolveRiskEvent = async (eventId: string) => {
    await repo.deactivateRiskEvent(eventId);
    await refreshState();
  };

  // 8. Auto Replacement Plan Generator
  const getAutoReplacementPlan = useCallback((alert: ShortfallAlert): ReplacementPlan | null => {
    const comm = commitments.find(c => c.id === alert.commitmentId);
    if (!comm) return null;
    return findAutomatedReplacements(comm, alert.projectedShortfallKg, supplies, riskEvents);
  }, [commitments, supplies, riskEvents]);

  // 9. Execute Auto Replacement Workflow
  const executeAutoReplacement = async (plan: ReplacementPlan) => {
    const originalComm = commitments.find(c => c.id === plan.originalCommitmentId);
    if (!originalComm) return;

    for (const cand of plan.recommendedCandidates) {
      const sup = cand.supplyPosition;
      const orderValue = cand.offeredQuantityKg * cand.pricePerKg;
      const deposit = Math.round(orderValue * 0.20);
      const balance = orderValue - deposit;

      // Create replacement commitment
      await repo.createCommitment({
        demandPositionId: originalComm.demandPositionId,
        supplyPositionId: sup.id,
        buyerId: originalComm.buyerId,
        buyerName: originalComm.buyerName,
        buyerOrg: originalComm.buyerOrg,
        farmerId: sup.farmerId,
        farmerName: sup.farmerName,
        farmName: sup.farmName,
        farmRegion: sup.location.region,
        cropType: sup.cropType,
        variety: sup.variety,
        committedQuantityKg: cand.offeredQuantityKg,
        unitPricePerKg: cand.pricePerKg,
        totalOrderValueInr: orderValue,
        allowedVariancePercent: 10,
        expectedHarvestStart: sup.harvestWindowStart,
        expectedHarvestEnd: sup.harvestWindowEnd,
        deliveryDate: originalComm.deliveryDate,
        deliveryWindow: originalComm.deliveryWindow,
        destinationStore: originalComm.destinationStore,
        qualitySpecs: originalComm.qualitySpecs,
        escrowStatus: 'FUNDED',
        depositAmountInr: deposit,
        balanceAmountInr: balance,
        fulfillmentProbability: 96,
        riskLevel: 'LOW',
        shortfallAmountKg: 0,
        status: 'SECURED',
        signedAgreementHash: `0xREP${Math.random().toString(16).slice(2, 10)}`
      });
    }

    // Lower original shortfall flag on original commitment
    await repo.updateCommitment(originalComm.id, {
      shortfallAmountKg: 0,
      riskLevel: 'MEDIUM',
      fulfillmentProbability: 75
    });

    await repo.log({
      actorId: 'AUTO_REPLACEMENT_ENGINE',
      actorRole: 'PLATFORM_ADMIN',
      actorName: 'Predictive Procurement Agent',
      eventType: 'AUTO_REPLACEMENT_EXECUTED',
      entityType: 'RISK',
      entityId: plan.shortfallAlertId,
      description: `Automated replacement sourcing executed: Secured ${plan.totalReplacementAllocatedKg} kg across ${plan.recommendedCandidates.length} backup farms. Delivery probability restored to ${plan.restoredFulfillmentProb}%.`,
      newState: 'RESOLVED'
    });

    await refreshState();
  };

  // 10. Perform QC Inspection
  const performQCInspection = async (input: {
    commitmentId: string;
    inspectorName: string;
    inspectionCenter: string;
    grossWeightKg: number;
    gradeAQuantityKg: number;
    gradeBQuantityKg: number;
    processingQuantityKg: number;
    rejectedQuantityKg: number;
    overallGrade: GradeLevel;
    items: { attribute: string; measuredValue: string; specRequirement: string; passed: boolean }[];
    rejectionReason?: string;
  }) => {
    const comm = commitments.find(c => c.id === input.commitmentId);
    if (!comm) throw new Error('Commitment not found');

    const batchId = `PB-${Math.floor(10000 + Math.random() * 90000)}`;
    const passed = input.overallGrade === 'Grade A' || input.overallGrade === 'Grade B';

    const record = await repo.createRecord({
      commitmentId: comm.id,
      supplyPositionId: comm.supplyPositionId,
      produceBatchId: batchId,
      cropType: comm.cropType,
      inspectorName: input.inspectorName,
      inspectionCenter: input.inspectionCenter,
      inspectionTimestamp: new Date().toISOString(),
      grossWeightKg: input.grossWeightKg,
      sampleSizeKg: 25,
      gradeAQuantityKg: input.gradeAQuantityKg,
      gradeBQuantityKg: input.gradeBQuantityKg,
      processingQuantityKg: input.processingQuantityKg,
      rejectedQuantityKg: input.rejectedQuantityKg,
      overallGrade: input.overallGrade,
      items: input.items,
      rejectionReason: input.rejectionReason,
      photoEvidenceUrls: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60'
      ],
      passed
    });

    // Create produce batch
    await repo.createBatch({
      id: batchId,
      commitmentId: comm.id,
      farmerId: comm.farmerId,
      farmerName: comm.farmerName,
      farmLocation: comm.farmRegion,
      cropType: comm.cropType,
      variety: comm.variety,
      harvestTimestamp: new Date().toISOString(),
      actualHarvestedKg: input.grossWeightKg,
      qcRecordId: record.id,
      certifiedGrade: input.overallGrade,
      traceabilityQrCode: `https://futuresupply.agri/batch/${batchId}`,
      status: passed ? 'QC_PASSED' : 'HARVESTED'
    });

    // Update commitment status
    await repo.updateCommitmentStatus(comm.id, passed ? 'QC_APPROVED' : 'QC_REJECTED');

    await refreshState();
    return record;
  };

  // 11. Confirm Delivery and Settle Escrow
  const confirmDeliveryAndSettle = async (commitmentId: string) => {
    const comm = commitments.find(c => c.id === commitmentId);
    if (!comm) return;

    await repo.updateCommitment(commitmentId, {
      status: 'SETTLED',
      escrowStatus: 'RELEASED'
    });

    await repo.log({
      actorId: 'SETTLEMENT_ENGINE',
      actorRole: 'FINANCE_ADMIN',
      actorName: 'Escrow Settlement Gateway',
      eventType: 'ESCROW_SETTLED_AND_RELEASED',
      entityType: 'ESCROW',
      entityId: commitmentId,
      description: `Delivery verified at ${comm.destinationStore.storeName}. Escrow balance (₹${comm.balanceAmountInr.toLocaleString()}) released to ${comm.farmerName}. Full settlement complete.`,
      previousState: 'HELD',
      newState: 'RELEASED'
    });

    await refreshState();
  };

  // 12. Reset Data
  const resetToSeed = async () => {
    repo.seed();
    await refreshState();
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        supplies,
        demands,
        commitments,
        batches,
        qcRecords,
        riskEvents,
        auditLogs,
        stores,
        activeShortfallAlerts,
        createSupplyPosition,
        updateCropStage,
        createDemandPosition,
        getMatchPlanForDemand,
        commitMatchPlan,
        injectWeatherShock,
        resolveRiskEvent,
        getAutoReplacementPlan,
        executeAutoReplacement,
        performQCInspection,
        confirmDeliveryAndSettle,
        resetToSeed
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
