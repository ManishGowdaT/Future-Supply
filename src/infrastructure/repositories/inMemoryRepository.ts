import {
  FutureSupplyPosition,
  FutureDemandPosition,
  ForwardCommitment,
  ProduceBatch,
  QCRecord,
  AggregationPlan,
  RiskEvent,
  AuditEvent,
  CropType,
  SupplyPositionStatus,
  CommitmentStatus,
  Role
} from '../../types';
import {
  ISupplyRepository,
  IDemandRepository,
  ICommitmentRepository,
  IQCRepository,
  IRiskEventRepository,
  IAuditRepository
} from './interfaces';
import {
  SEED_SUPPLY_POSITIONS,
  SEED_DEMAND_POSITIONS,
  SEED_COMMITMENTS,
  SEED_PRODUCE_BATCHES,
  SEED_QC_RECORDS,
  SEED_RISK_EVENTS,
  SEED_AUDIT_EVENTS
} from '../../data/seedData';

export class InMemoryRepository
  implements
    ISupplyRepository,
    IDemandRepository,
    ICommitmentRepository,
    IQCRepository,
    IRiskEventRepository,
    IAuditRepository
{
  private supplies: Map<string, FutureSupplyPosition> = new Map();
  private demands: Map<string, FutureDemandPosition> = new Map();
  private commitments: Map<string, ForwardCommitment> = new Map();
  private batches: Map<string, ProduceBatch> = new Map();
  private qcRecords: Map<string, QCRecord> = new Map();
  private aggregationPlans: Map<string, AggregationPlan> = new Map();
  private riskEvents: Map<string, RiskEvent> = new Map();
  private auditLogs: AuditEvent[] = [];

  constructor() {
    this.seed();
  }

  public seed(): void {
    this.supplies.clear();
    this.demands.clear();
    this.commitments.clear();
    this.batches.clear();
    this.qcRecords.clear();
    this.aggregationPlans.clear();
    this.riskEvents.clear();
    this.auditLogs = [];

    SEED_SUPPLY_POSITIONS.forEach(s => this.supplies.set(s.id, structuredClone(s)));
    SEED_DEMAND_POSITIONS.forEach(d => this.demands.set(d.id, structuredClone(d)));
    SEED_COMMITMENTS.forEach(c => this.commitments.set(c.id, structuredClone(c)));
    SEED_PRODUCE_BATCHES.forEach(b => this.batches.set(b.id, structuredClone(b)));
    SEED_QC_RECORDS.forEach(q => this.qcRecords.set(q.id, structuredClone(q)));
    SEED_RISK_EVENTS.forEach(r => this.riskEvents.set(r.id, structuredClone(r)));
    this.auditLogs = structuredClone(SEED_AUDIT_EVENTS);
  }

  // --- ISupplyRepository ---
  async getAll(): Promise<FutureSupplyPosition[]> {
    return Array.from(this.supplies.values(), item => structuredClone(item));
  }

  async getById(id: string): Promise<FutureSupplyPosition | null> {
    const item = this.supplies.get(id);
    return item ? structuredClone(item) : null;
  }

  async getByFarmer(farmerId: string): Promise<FutureSupplyPosition[]> {
    return Array.from(this.supplies.values()).filter(s => s.farmerId === farmerId).map(item => structuredClone(item));
  }

  async getByCrop(cropType: CropType): Promise<FutureSupplyPosition[]> {
    return Array.from(this.supplies.values()).filter(s => s.cropType === cropType).map(item => structuredClone(item));
  }

  async getByRegion(region: string): Promise<FutureSupplyPosition[]> {
    return Array.from(this.supplies.values()).filter(
      s => s.location.region.toLowerCase() === region.toLowerCase()
    ).map(item => structuredClone(item));
  }

  async create(position: Omit<FutureSupplyPosition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FutureSupplyPosition> {
    const id = `FS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newPos: FutureSupplyPosition = {
      ...position,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.supplies.set(id, newPos);
    await this.log({
      actorId: position.farmerId,
      actorRole: 'FARMER',
      actorName: position.farmerName,
      eventType: 'SUPPLY_POSITION_CREATED',
      entityType: 'SUPPLY',
      entityId: id,
      description: `New future supply position created for ${position.cropType} (${position.expectedYieldKg} kg predicted).`,
      newState: position.status
    });
    return { ...newPos };
  }

  async update(id: string, updates: Partial<FutureSupplyPosition>): Promise<FutureSupplyPosition> {
    const existing = this.supplies.get(id);
    if (!existing) throw new Error(`Supply position ${id} not found`);

    const updated: FutureSupplyPosition = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.supplies.set(id, updated);
    return { ...updated };
  }

  async updateStatus(id: string, status: SupplyPositionStatus): Promise<FutureSupplyPosition> {
    const existing = this.supplies.get(id);
    if (!existing) throw new Error(`Supply position ${id} not found`);
    const prev = existing.status;
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    this.supplies.set(id, existing);

    await this.log({
      actorId: 'SYSTEM',
      actorRole: 'PLATFORM_ADMIN',
      actorName: 'Supply Engine',
      eventType: 'SUPPLY_STATUS_CHANGED',
      entityType: 'SUPPLY',
      entityId: id,
      description: `Supply position status updated from ${prev} to ${status}.`,
      previousState: prev,
      newState: status
    });
    return { ...existing };
  }

  async reserveCapacity(id: string, quantityKg: number): Promise<boolean> {
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      throw new Error('Reservation quantity must be a positive finite number.');
    }
    const item = this.supplies.get(id);
    if (!item) return false;

    // Overcommitment prevention check
    const safeLimit = item.yieldP10Kg;
    const currentAllocated = item.committedQuantityKg + item.reservedQuantityKg;
    if (currentAllocated + quantityKg > safeLimit) {
      throw new Error(`Overcommitment Error: Cannot reserve ${quantityKg} kg. Safe P10 limit is ${safeLimit} kg (Already allocated: ${currentAllocated} kg).`);
    }

    item.reservedQuantityKg += quantityKg;
    item.safeAvailableCapacityKg = Math.max(0, item.yieldP10Kg - item.committedQuantityKg - item.reservedQuantityKg);
    item.updatedAt = new Date().toISOString();
    this.supplies.set(id, item);
    return true;
  }

  async releaseCapacity(id: string, quantityKg: number): Promise<boolean> {
    if (!Number.isFinite(quantityKg) || quantityKg < 0) {
      throw new Error('Release quantity must be a nonnegative finite number.');
    }
    const item = this.supplies.get(id);
    if (!item) return false;
    item.reservedQuantityKg = Math.max(0, item.reservedQuantityKg - quantityKg);
    item.safeAvailableCapacityKg = Math.max(0, item.yieldP10Kg - item.committedQuantityKg - item.reservedQuantityKg);
    item.updatedAt = new Date().toISOString();
    this.supplies.set(id, item);
    return true;
  }

  // --- IDemandRepository ---
  async getAllDemands(): Promise<FutureDemandPosition[]> {
    return Array.from(this.demands.values());
  }

  async getDemandById(id: string): Promise<FutureDemandPosition | null> {
    const item = this.demands.get(id);
    return item ? { ...item } : null;
  }

  async getDemandsByBuyer(buyerId: string): Promise<FutureDemandPosition[]> {
    return Array.from(this.demands.values()).filter(d => d.buyerId === buyerId);
  }

  async getDemandsByStore(storeId: string): Promise<FutureDemandPosition[]> {
    return Array.from(this.demands.values()).filter(d => d.store.storeId === storeId);
  }

  async createDemand(demand: Omit<FutureDemandPosition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FutureDemandPosition> {
    const id = `FD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newDemand: FutureDemandPosition = {
      ...demand,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.demands.set(id, newDemand);
    await this.log({
      actorId: demand.buyerId,
      actorRole: 'BUYER_PROCUREMENT',
      actorName: demand.buyerName,
      eventType: 'DEMAND_POSITION_CREATED',
      entityType: 'DEMAND',
      entityId: id,
      description: `Future demand created for ${demand.requiredQuantityKg} kg of ${demand.cropType} for ${demand.store.storeName}.`,
      newState: demand.status
    });
    return { ...newDemand };
  }

  async updateDemand(id: string, updates: Partial<FutureDemandPosition>): Promise<FutureDemandPosition> {
    const existing = this.demands.get(id);
    if (!existing) throw new Error(`Demand position ${id} not found`);
    const updated: FutureDemandPosition = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.demands.set(id, updated);
    return { ...updated };
  }

  // --- ICommitmentRepository ---
  async getAllCommitments(): Promise<ForwardCommitment[]> {
    return Array.from(this.commitments.values());
  }

  async getCommitmentById(id: string): Promise<ForwardCommitment | null> {
    const item = this.commitments.get(id);
    return item ? { ...item } : null;
  }

  async getCommitmentsByBuyer(buyerId: string): Promise<ForwardCommitment[]> {
    return Array.from(this.commitments.values()).filter(c => c.buyerId === buyerId);
  }

  async getCommitmentsByFarmer(farmerId: string): Promise<ForwardCommitment[]> {
    return Array.from(this.commitments.values()).filter(c => c.farmerId === farmerId);
  }

  async createCommitment(commitment: Omit<ForwardCommitment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ForwardCommitment> {
    const id = `FO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newCommitment: ForwardCommitment = {
      ...commitment,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.commitments.set(id, newCommitment);

    // Update supply position accounting
    const supply = this.supplies.get(commitment.supplyPositionId);
    if (supply) {
      supply.committedQuantityKg += commitment.committedQuantityKg;
      supply.safeAvailableCapacityKg = Math.max(0, supply.yieldP10Kg - supply.committedQuantityKg - supply.reservedQuantityKg);
      supply.status = supply.safeAvailableCapacityKg <= 100 ? 'FULLY_COMMITTED' : 'PARTIALLY_COMMITTED';
      this.supplies.set(supply.id, supply);
    }

    // Update demand position accounting
    const demand = this.demands.get(commitment.demandPositionId);
    if (demand) {
      demand.securedQuantityKg += commitment.committedQuantityKg;
      demand.reliableQuantityKg += Math.round(commitment.committedQuantityKg * (commitment.fulfillmentProbability / 100));
      demand.status = demand.securedQuantityKg >= demand.requiredQuantityKg ? 'FULLY_SECURED' : 'PARTIALLY_SECURED';
      this.demands.set(demand.id, demand);
    }

    await this.log({
      actorId: commitment.buyerId,
      actorRole: 'BUYER_PROCUREMENT',
      actorName: commitment.buyerName,
      eventType: 'COMMITMENT_CREATED',
      entityType: 'COMMITMENT',
      entityId: id,
      description: `Forward supply commitment created for ${commitment.committedQuantityKg} kg of ${commitment.cropType} from ${commitment.farmerName}.`,
      newState: newCommitment.status
    });

    return { ...newCommitment };
  }

  async updateCommitment(id: string, updates: Partial<ForwardCommitment>): Promise<ForwardCommitment> {
    const existing = this.commitments.get(id);
    if (!existing) throw new Error(`Commitment ${id} not found`);
    const updated: ForwardCommitment = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.commitments.set(id, updated);
    return { ...updated };
  }

  async updateCommitmentStatus(id: string, status: CommitmentStatus): Promise<ForwardCommitment> {
    const existing = this.commitments.get(id);
    if (!existing) throw new Error(`Commitment ${id} not found`);
    const prev = existing.status;
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    this.commitments.set(id, existing);

    await this.log({
      actorId: 'SYSTEM',
      actorRole: 'PLATFORM_ADMIN',
      actorName: 'Commitment State Machine',
      eventType: 'COMMITMENT_STATUS_TRANSITION',
      entityType: 'COMMITMENT',
      entityId: id,
      description: `Commitment #${id} transitioned from ${prev} to ${status}.`,
      previousState: prev,
      newState: status
    });
    return { ...existing };
  }

  // --- IQCRepository ---
  async getAllRecords(): Promise<QCRecord[]> {
    return Array.from(this.qcRecords.values());
  }

  async getRecordById(id: string): Promise<QCRecord | null> {
    const item = this.qcRecords.get(id);
    return item ? { ...item } : null;
  }

  async createRecord(record: Omit<QCRecord, 'id'>): Promise<QCRecord> {
    const id = `QC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: QCRecord = { ...record, id };
    this.qcRecords.set(id, newRecord);

    await this.log({
      actorId: 'QC-INSPECTOR-01',
      actorRole: 'QC_INSPECTOR',
      actorName: record.inspectorName,
      eventType: 'QC_INSPECTION_COMPLETED',
      entityType: 'QC',
      entityId: id,
      description: `QC Grading completed for Batch ${record.produceBatchId}: ${record.overallGrade} (${record.grossWeightKg} kg). Passed: ${record.passed}.`,
      newState: record.overallGrade
    });
    return { ...newRecord };
  }

  async getAllBatches(): Promise<ProduceBatch[]> {
    return Array.from(this.batches.values());
  }

  async getBatchById(id: string): Promise<ProduceBatch | null> {
    const item = this.batches.get(id);
    return item ? { ...item } : null;
  }

  async createBatch(batch: ProduceBatch): Promise<ProduceBatch> {
    this.batches.set(batch.id, { ...batch });
    await this.log({
      actorId: batch.farmerId,
      actorRole: 'FARMER',
      actorName: batch.farmerName,
      eventType: 'PRODUCE_BATCH_GENERATED',
      entityType: 'SUPPLY',
      entityId: batch.id,
      description: `Produce batch #${batch.id} generated for ${batch.actualHarvestedKg} kg of ${batch.cropType}.`,
      newState: batch.status
    });
    return { ...batch };
  }

  async updateBatchStatus(id: string, status: ProduceBatch['status']): Promise<ProduceBatch> {
    const existing = this.batches.get(id);
    if (!existing) throw new Error(`Batch ${id} not found`);
    existing.status = status;
    this.batches.set(id, existing);
    return { ...existing };
  }

  async getAllAggregationPlans(): Promise<AggregationPlan[]> {
    return Array.from(this.aggregationPlans.values());
  }

  async createAggregationPlan(plan: AggregationPlan): Promise<AggregationPlan> {
    this.aggregationPlans.set(plan.id, { ...plan });
    await this.log({
      actorId: 'LOGISTICS-HUB',
      actorRole: 'LOGISTICS_OPERATOR',
      actorName: 'Aggregation Engine',
      eventType: 'AGGREGATION_PLAN_CREATED',
      entityType: 'LOGISTICS',
      entityId: plan.id,
      description: `Aggregation plan created for ${plan.destinationStore.storeName}: ${plan.targetTotalKg} kg combined across ${plan.collectedBatches.length} farm batches.`,
      newState: plan.status
    });
    return { ...plan };
  }

  // --- IRiskEventRepository ---
  async getAllRiskEvents(): Promise<RiskEvent[]> {
    return Array.from(this.riskEvents.values());
  }

  async getActiveRiskEvents(): Promise<RiskEvent[]> {
    return Array.from(this.riskEvents.values()).filter(e => e.active);
  }

  async createRiskEvent(event: Omit<RiskEvent, 'id' | 'timestamp'>): Promise<RiskEvent> {
    const id = `RISK-EVT-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newEvent: RiskEvent = { ...event, id, timestamp: now };
    this.riskEvents.set(id, newEvent);

    await this.log({
      actorId: 'RISK_SIMULATOR',
      actorRole: 'PLATFORM_ADMIN',
      actorName: 'Agricultural Risk Monitor',
      eventType: 'RISK_EVENT_TRIGGERED',
      entityType: 'RISK',
      entityId: id,
      description: `Risk Event [${event.severity}]: ${event.title} in ${event.affectedRegion} (-${event.estimatedImpactPercent}% impact).`,
      newState: 'ACTIVE'
    });
    return { ...newEvent };
  }

  async deactivateRiskEvent(id: string): Promise<boolean> {
    const existing = this.riskEvents.get(id);
    if (!existing) return false;
    existing.active = false;
    this.riskEvents.set(id, existing);

    await this.log({
      actorId: 'SYSTEM',
      actorRole: 'PLATFORM_ADMIN',
      actorName: 'Risk Clearer',
      eventType: 'RISK_EVENT_RESOLVED',
      entityType: 'RISK',
      entityId: id,
      description: `Risk event #${id} (${existing.title}) marked as resolved.`,
      previousState: 'ACTIVE',
      newState: 'RESOLVED'
    });
    return true;
  }

  // --- IAuditRepository ---
  async getAllAuditLogs(): Promise<AuditEvent[]> {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const id = `AUDIT-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullEvent: AuditEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(fullEvent);
    return fullEvent;
  }
}
