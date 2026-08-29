import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CropStage, FutureSupplyPosition } from '../../types';
import { ReliabilityScoreCard } from './ReliabilityScoreCard';
import { CropStageStepper } from './CropStageStepper';
import { CreateSupplyModal } from './CreateSupplyModal';
import {
  Sprout,
  Plus,
  Calendar,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  Droplets,
  Building,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';

export const FarmerPortal: React.FC = () => {
  const { supplies, updateCropStage, commitments, demands } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSupplyId, setSelectedSupplyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Farmer Persona (Chennappa Gowda F-102 & F-105)
  const farmerSupplies = supplies.filter(s => s.farmerId === 'F-102' || s.farmerId === 'F-105');
  const activePosition = supplies.find(s => s.id === (selectedSupplyId || farmerSupplies[0]?.id)) || farmerSupplies[0];

  // Active commitments for this farmer
  const farmerCommitments = commitments.filter(
    c => c.farmerId === 'F-102' || c.farmerId === 'F-105'
  );

  // Aggregates for KPI Strip
  const totalAcreage = farmerSupplies.reduce((acc, s) => acc + s.acreage, 0);
  const totalExpectedYieldKg = farmerSupplies.reduce((acc, s) => acc + s.expectedYieldKg, 0);
  const totalSafeP10Kg = farmerSupplies.reduce((acc, s) => acc + s.yieldP10Kg, 0);
  const totalCommittedKg = farmerSupplies.reduce((acc, s) => acc + s.committedQuantityKg, 0);
  const totalAvailableSafeKg = Math.max(0, totalSafeP10Kg - totalCommittedKg);
  const totalForwardValueInr = farmerCommitments.reduce((acc, c) => acc + c.totalOrderValueInr, 0);

  const filteredSupplies = farmerSupplies.filter(
    s => s.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.farmName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Breadcrumb & Enterprise Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
            <span>Farmer Portal</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span>Farms & Holdings</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className="text-[var(--text-primary)] font-medium">Gowda Farm Lands (Ramanagara Hub)</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Chennappa Gowda
            </h1>
            <span className="enterprise-tag enterprise-tag-emerald">
              Level 3 Verified
            </span>
            <span className="text-xs text-[var(--text-muted)] hidden md:inline">
              Ramanagara Horticulture Producers Co-op
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Future Crop</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Enterprise KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Active Growing Crops
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
              {farmerSupplies.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {totalAcreage.toFixed(1)} Acres
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            Tomato, Hybrid Saaho & Seminis
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Expected Yield (P50)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
              {totalExpectedYieldKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            Median Probabilistic Yield
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Committed Forward Qty
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--accent-primary)] font-mono">
              {totalCommittedKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--accent-primary)] mt-1 truncate font-medium">
            {Math.round((totalCommittedKg / totalSafeP10Kg) * 100)}% of Safe Capacity
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Available Safe Capacity
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
              {totalAvailableSafeKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            Safe P10 Commitment Bound
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Locked Forward GMV
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
              ₹{totalForwardValueInr.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-[var(--accent-primary)] mt-1 truncate font-medium">
            20% Escrow Funded
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Reliability Score
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--accent-primary)] font-mono">
              91
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">/ 100</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            Top 5% Tier • 42 Batches
          </span>
        </div>
      </div>

      {/* 3. Main Workspace: Active Crops Data Table & Lifecycle Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Data Table & Interactive Timeline */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Active Future Supply Data Table */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Active Future Supply Positions ({filteredSupplies.length})
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Probabilistic forward supply positions linked to buyer matching engine
                </p>
              </div>

              {/* Table Filter / Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter crop or variety..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md pl-7 pr-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-48"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Crop & Variety</th>
                    <th>Parcel / Area</th>
                    <th>P50 Yield</th>
                    <th>Safe (P10)</th>
                    <th>Committed</th>
                    <th>Safe Avail.</th>
                    <th>Asking</th>
                    <th>Harvest Window</th>
                    <th>Growth Stage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplies.map(sup => {
                    const isSelected = activePosition?.id === sup.id;
                    return (
                      <tr
                        key={sup.id}
                        onClick={() => setSelectedSupplyId(sup.id)}
                        className={`cursor-pointer ${isSelected ? 'selected' : ''}`}
                      >
                        <td>
                          <div className="font-semibold text-xs text-[var(--text-primary)]">
                            {sup.cropType}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{sup.variety}</div>
                        </td>
                        <td>
                          <div className="text-xs text-[var(--text-secondary)]">{sup.farmName}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{sup.acreage} ac • {sup.soilType}</div>
                        </td>
                        <td className="font-mono text-xs font-semibold">{sup.yieldP50Kg} kg</td>
                        <td className="font-mono text-xs text-[var(--accent-primary)] font-semibold">{sup.yieldP10Kg} kg</td>
                        <td className="font-mono text-xs font-semibold">{sup.committedQuantityKg} kg</td>
                        <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">{sup.safeAvailableCapacityKg} kg</td>
                        <td className="font-mono text-xs font-semibold text-[var(--text-primary)]">₹{sup.askingPricePerKg.toFixed(2)}</td>
                        <td className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                          {sup.harvestWindowStart.slice(5)} → {sup.harvestWindowEnd.slice(5)}
                        </td>
                        <td>
                          <span className={`enterprise-tag ${
                            sup.cropStage === 'HARVEST'
                              ? 'enterprise-tag-emerald'
                              : sup.cropStage === 'MATURITY' || sup.cropStage === 'FRUIT_FORMATION'
                              ? 'enterprise-tag-blue'
                              : 'enterprise-tag-neutral'
                          }`}>
                            {sup.cropStage}
                          </span>
                        </td>
                        <td>
                          <span className={`enterprise-tag ${
                            sup.status === 'FULLY_COMMITTED'
                              ? 'enterprise-tag-purple'
                              : sup.status === 'PARTIALLY_COMMITTED'
                              ? 'enterprise-tag-emerald'
                              : 'enterprise-tag-blue'
                          }`}>
                            {sup.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Crop Lifecycle & Field Monitoring Terminal */}
          {activePosition && (
            <div className="enterprise-panel p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-[var(--accent-primary)]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Phenological Lifecycle Monitor: {activePosition.cropType} ({activePosition.farmName})
                    </h3>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Click stages to record field advancement and update probabilistic predictive yield intervals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">Model Confidence:</span>
                  <span className="enterprise-tag enterprise-tag-emerald font-mono">
                    {Math.round(activePosition.predictionConfidence * 100)}% Certainty
                  </span>
                </div>
              </div>

              {/* Horizontal Stepper */}
              <CropStageStepper
                currentStage={activePosition.cropStage}
                onUpdateStage={(stage) => updateCropStage(activePosition.id, stage)}
              />

              {/* Probabilistic Forecast Distribution Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    P10 Safe Bound
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                    {activePosition.yieldP10Kg} kg
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block">Conservative Capacity</span>
                </div>

                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    P50 Median Forecast
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {activePosition.yieldP50Kg} kg
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block">Expected Yield</span>
                </div>

                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    Grade A Ratio
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                    {Math.round(activePosition.expectedGradeAProbability * 100)}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block">FSSAI / Retail Spec</span>
                </div>

                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    Irrigation System
                  </span>
                  <span className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    {activePosition.irrigationType}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block">Automated Fertigation</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Forward Commitments Data Table */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--table-header-bg)]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Locked Buyer Forward Contracts ({farmerCommitments.length})
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Commercial commitments with 20% upfront deposit funded in escrow
                </p>
              </div>
              <span className="enterprise-tag enterprise-tag-neutral font-mono">
                Total ₹{totalForwardValueInr.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Buyer / Chain</th>
                    <th>Crop & Qty</th>
                    <th>Contract Value</th>
                    <th>Escrow Deposit</th>
                    <th>Target Delivery</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerCommitments.map(comm => (
                    <tr key={comm.id}>
                      <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                        #{comm.id}
                      </td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">{comm.buyerOrg}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{comm.destinationStore.storeName}</div>
                      </td>
                      <td>
                        <span className="font-mono font-semibold text-xs">{comm.committedQuantityKg} kg</span>
                        <span className="text-[11px] text-[var(--text-muted)] ml-1">({comm.cropType})</span>
                      </td>
                      <td className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        ₹{comm.totalOrderValueInr.toLocaleString()}
                      </td>
                      <td>
                        <span className="enterprise-tag enterprise-tag-emerald">
                          Funded (₹{comm.depositAmountInr.toLocaleString()})
                        </span>
                      </td>
                      <td className="text-xs text-[var(--text-muted)]">
                        {comm.deliveryDate} ({comm.deliveryWindow})
                      </td>
                      <td>
                        <span className="enterprise-tag enterprise-tag-emerald">
                          {comm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Reliability Analytics & Nearby Buyer Demand */}
        <div className="space-y-5">
          {/* Farmer Reliability Card */}
          {activePosition && (
            <ReliabilityScoreCard reliability={activePosition.farmerReliability} />
          )}

          {/* Real Analytics: Parcel Yield Distribution */}
          <div className="enterprise-panel p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Yield vs Commitment Balance
                </h3>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">P10 Benchmark</span>
            </div>

            <div className="space-y-3 pt-1">
              {farmerSupplies.map(sup => {
                const committedRatio = Math.min(100, Math.round((sup.committedQuantityKg / sup.yieldP10Kg) * 100));
                return (
                  <div key={sup.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)]">{sup.variety}</span>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {sup.committedQuantityKg} / {sup.yieldP10Kg} kg ({committedRatio}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-hairline)] flex">
                      <div
                        className="bg-[var(--accent-primary)] h-full"
                        style={{ width: `${committedRatio}%` }}
                      />
                      <div
                        className="bg-[var(--accent-border)] h-full opacity-40"
                        style={{ width: `${100 - committedRatio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nearby Buyer Demand Opportunities */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--table-header-bg)]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Nearby Buyer Demand Feed
                </h3>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Bangalore Hub</span>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {demands.map(dem => (
                <div key={dem.id} className="p-3 hover:bg-[var(--table-row-hover)] transition-colors text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)]">{dem.buyerOrg}</span>
                    <span className="enterprise-tag enterprise-tag-amber font-mono">
                      Target ₹{dem.maximumAcceptablePricePerKg}/kg
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Requires <strong>{dem.requiredQuantityKg} kg {dem.cropType}</strong> for {dem.store.region} store ({dem.requirementStart} to {dem.requirementEnd}).
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
                    <span>Min {dem.minimumGrade}</span>
                    <span className="text-[var(--accent-primary)] font-semibold">Match Certainty: ~94%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Wizard for New Crop Registration */}
      <CreateSupplyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
