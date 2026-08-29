import type {
  FutureSupplyPosition,
  FutureDemandPosition,
  ForwardCommitment,
  QCRecord,
  ProduceBatch,
  AggregationPlan,
  RiskEvent,
  AuditEvent,
  CropType,
  SupplyPositionStatus,
  CommitmentStatus,
} from '../../types';

export interface ISupplyRepository {
  getAll(): Promise<FutureSupplyPosition[]>;
  getById(id: string): Promise<FutureSupplyPosition | null>;
  getByFarmer(farmerId: string): Promise<FutureSupplyPosition[]>;
  getByCrop(cropType: CropType): Promise<FutureSupplyPosition[]>;
  getByRegion(region: string): Promise<FutureSupplyPosition[]>;
  create(position: Omit<FutureSupplyPosition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FutureSupplyPosition>;
  update(id: string, updates: Partial<FutureSupplyPosition>): Promise<FutureSupplyPosition>;
  updateStatus(id: string, status: SupplyPositionStatus): Promise<FutureSupplyPosition>;
  reserveCapacity(id: string, quantityKg: number): Promise<boolean>;
  releaseCapacity(id: string, quantityKg: number): Promise<boolean>;
}

export interface IDemandRepository {
  getAllDemands(): Promise<FutureDemandPosition[]>;
  getDemandById(id: string): Promise<FutureDemandPosition | null>;
  getDemandsByBuyer(buyerId: string): Promise<FutureDemandPosition[]>;
  getDemandsByStore(storeId: string): Promise<FutureDemandPosition[]>;
  createDemand(demand: Omit<FutureDemandPosition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FutureDemandPosition>;
  updateDemand(id: string, updates: Partial<FutureDemandPosition>): Promise<FutureDemandPosition>;
}

export interface ICommitmentRepository {
  getAllCommitments(): Promise<ForwardCommitment[]>;
  getCommitmentById(id: string): Promise<ForwardCommitment | null>;
  getCommitmentsByBuyer(buyerId: string): Promise<ForwardCommitment[]>;
  getCommitmentsByFarmer(farmerId: string): Promise<ForwardCommitment[]>;
  createCommitment(commitment: Omit<ForwardCommitment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForwardCommitment>;
  updateCommitment(id: string, updates: Partial<ForwardCommitment>): Promise<ForwardCommitment>;
  updateCommitmentStatus(id: string, status: CommitmentStatus): Promise<ForwardCommitment>;
}

export interface IQCRepository {
  getAllRecords(): Promise<QCRecord[]>;
  getRecordById(id: string): Promise<QCRecord | null>;
  createRecord(record: Omit<QCRecord, 'id'>): Promise<QCRecord>;
  getAllBatches(): Promise<ProduceBatch[]>;
  getBatchById(id: string): Promise<ProduceBatch | null>;
  createBatch(batch: ProduceBatch): Promise<ProduceBatch>;
  updateBatchStatus(id: string, status: ProduceBatch['status']): Promise<ProduceBatch>;
  getAllAggregationPlans(): Promise<AggregationPlan[]>;
  createAggregationPlan(plan: AggregationPlan): Promise<AggregationPlan>;
}

export interface IRiskEventRepository {
  getAllRiskEvents(): Promise<RiskEvent[]>;
  getActiveRiskEvents(): Promise<RiskEvent[]>;
  createRiskEvent(event: Omit<RiskEvent, 'id' | 'timestamp'>): Promise<RiskEvent>;
  deactivateRiskEvent(id: string): Promise<boolean>;
}

export interface IAuditRepository {
  getAllAuditLogs(): Promise<AuditEvent[]>;
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
}
