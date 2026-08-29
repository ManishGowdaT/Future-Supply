import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FutureDemandPosition, MultiFarmMatchPlan, SupplyMatch, ShortfallAlert } from '../../types';
import { CreateDemandModal } from './CreateDemandModal';
import { MatchScoreBreakdownModal } from './MatchScoreBreakdownModal';
import { AutoReplacementDrawer } from '../risk/AutoReplacementDrawer';
import {
  ShoppingBag,
  Plus,
  TrendingUp,
  AlertTriangle,
  Zap,
  Sparkles,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Search,
  Check
} from 'lucide-react';

export const BuyerControlCenter: React.FC = () => {
  const {
    demands,
    commitments,
    activeShortfallAlerts,
    getMatchPlanForDemand,
    commitMatchPlan
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<FutureDemandPosition | null>(null);
  const [activeMatchPlan, setActiveMatchPlan] = useState<MultiFarmMatchPlan | null>(null);
  const [inspectingMatch, setInspectingMatch] = useState<SupplyMatch | null>(null);
  const [activeAlertForReplacement, setActiveAlertForReplacement] = useState<ShortfallAlert | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Compute Control Center aggregates
  const totalRequiredKg = demands.reduce((acc, d) => acc + d.requiredQuantityKg, 0);
  const totalSecuredKg = commitments.reduce((acc, c) => acc + c.committedQuantityKg, 0);
  const totalReliableKg = commitments.reduce((acc, c) => acc + Math.round(c.committedQuantityKg * (c.fulfillmentProbability / 100)), 0);
  const totalAtRiskKg = commitments.reduce((acc, c) => acc + (c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL' ? c.committedQuantityKg : 0), 0);
  const coveragePercent = totalRequiredKg > 0 ? Math.min(100, Math.round((totalReliableKg / totalRequiredKg) * 100)) : 0;

  const handleRunMatch = (demand: FutureDemandPosition) => {
    setSelectedDemand(demand);
    const plan = getMatchPlanForDemand(demand.id);
    setActiveMatchPlan(plan);
  };

  const handleCommitPlan = async () => {
    if (!selectedDemand || !activeMatchPlan) return;
    setIsCommitting(true);
    try {
      await commitMatchPlan(selectedDemand.id, activeMatchPlan);
      setActiveMatchPlan(null);
      setSelectedDemand(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommitting(false);
    }
  };

  const filteredDemands = demands.filter(
    d => d.store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.store.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Shortfall Alert Banner if any commitments are at risk */}
      {activeShortfallAlerts.length > 0 && (
        <div className="p-3.5 rounded-lg bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--badge-rose-border)] text-[var(--badge-rose-text)]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--badge-rose-text)]">
                  Fulfillment Shortfall Detected: {activeShortfallAlerts[0].projectedShortfallKg} kg Deficit
                </h3>
                <span className="enterprise-tag enterprise-tag-rose text-[10px]">
                  {activeShortfallAlerts[0].riskReason}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Order #{activeShortfallAlerts[0].orderNumber} ({activeShortfallAlerts[0].cropType} for {activeShortfallAlerts[0].storeName}) fulfillment dropped to {activeShortfallAlerts[0].currentFulfillmentProb}%.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveAlertForReplacement(activeShortfallAlerts[0])}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--badge-rose-text)] hover:opacity-90 text-white text-xs font-semibold shadow-xs transition-opacity shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch 1-Click Replacement</span>
          </button>
        </div>
      )}

      {/* 1. Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
            <span>Buyer Procurement</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span>Store Network</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className="text-[var(--text-primary)] font-medium">Bengaluru Fresh Produce Supply Control</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Bengaluru Supply Control Center
            </h1>
            <span className="enterprise-tag enterprise-tag-emerald">
              Live Network
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Store Demand Position</span>
        </button>
      </div>

      {/* 2. Compact KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Total Demand Volume
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
              {totalRequiredKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            Across 4 Store Hubs
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Secured Supply
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--accent-primary)] font-mono">
              {totalSecuredKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--accent-primary)] mt-1 truncate font-medium">
            Forward Contracts Locked
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Reliable (Confidence Adjusted)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[var(--accent-primary)] font-mono">
              {totalReliableKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            Fulfillability Weighted
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            At-Risk Shortfall
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-bold font-mono ${totalAtRiskKg > 0 ? 'text-rose-600' : 'text-[var(--text-muted)]'}`}>
              {totalAtRiskKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
            {totalAtRiskKg > 0 ? 'Shortfall Action Required' : '0 kg at Risk'}
          </span>
        </div>

        <div className="enterprise-kpi col-span-2 sm:col-span-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Network Coverage
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-bold font-mono ${coveragePercent >= 90 ? 'text-[var(--accent-primary)]' : 'text-amber-600'}`}>
              {coveragePercent}%
            </span>
            <span className="text-[11px] font-semibold">
              {coveragePercent >= 90 ? '🟢 Optimal' : '🟡 Action Needed'}
            </span>
          </div>
          <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)] mt-1">
            <div
              className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-300"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Layout: Demand Positions Table & Future Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Store Demands & Combinatorial Matching */}
        <div className="lg:col-span-2 space-y-5">
          
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Store Demand Requirements ({filteredDemands.length})
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Store-level forward produce requirements mapped to regional grower positions
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter store or crop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md pl-7 pr-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Store / Hub</th>
                    <th>Crop & Required</th>
                    <th>Period Window</th>
                    <th>Delivery Slot</th>
                    <th>Budget Ceiling</th>
                    <th>Min Freshness</th>
                    <th>Coverage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemands.map(dem => {
                    const ratio = Math.min(100, Math.round((dem.securedQuantityKg / dem.requiredQuantityKg) * 100));
                    return (
                      <tr key={dem.id}>
                        <td>
                          <div className="font-semibold text-xs text-[var(--text-primary)]">
                            {dem.store.storeName}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">{dem.store.region} Hub</div>
                        </td>
                        <td>
                          <span className="font-mono font-semibold text-xs">{dem.requiredQuantityKg} kg</span>
                          <span className="text-[11px] text-[var(--text-muted)] ml-1">({dem.cropType})</span>
                        </td>
                        <td className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {dem.requirementStart.slice(5)} → {dem.requirementEnd.slice(5)}
                        </td>
                        <td className="text-xs text-[var(--text-secondary)] font-mono">
                          {dem.deliveryWindowStart} - {dem.deliveryWindowEnd}
                        </td>
                        <td className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                          ₹{dem.maximumAcceptablePricePerKg.toFixed(2)}/kg
                        </td>
                        <td className="text-xs font-semibold text-[var(--text-secondary)]">
                          ≥ {dem.minimumFreshnessShelfLifeDays} Days
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                              {ratio}%
                            </span>
                            <div className="w-16 bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)]">
                              <div
                                className="bg-[var(--accent-primary)] h-full rounded-full"
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleRunMatch(dem)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--accent-subtle)] hover:bg-[var(--accent-border)] text-[var(--accent-primary)] text-[11px] font-semibold border border-[var(--accent-border)] transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Run Match</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Multi-Farm Match Plan Inspector */}
          {activeMatchPlan && selectedDemand && (
            <div className="enterprise-panel p-5 space-y-4 border-[var(--accent-primary)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Combinatorial Multi-Farm Aggregation Plan ({selectedDemand.store.storeName})
                    </h3>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {activeMatchPlan.optimizationSummary}
                  </p>
                </div>

                <button
                  onClick={() => setActiveMatchPlan(null)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1"
                >
                  Close Plan
                </button>
              </div>

              {/* Aggregation Summary Strip */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    Total Matched Volume
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                    {activeMatchPlan.allocatedQuantityKg} kg ({activeMatchPlan.coveragePercent}%)
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    Blended Delivered Price
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    ₹{activeMatchPlan.blendedPricePerKg.toFixed(2)} / kg
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                    Avg Fulfillment Certainty
                  </span>
                  <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                    {activeMatchPlan.averageFulfillmentProbability}%
                  </span>
                </div>
              </div>

              {/* Matched Supplier Rows */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Allocated Supplier Positions ({activeMatchPlan.matches.length} Verified Farms)
                </span>

                <div className="space-y-2">
                  {activeMatchPlan.matches.map((match, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {match.supplyPosition.farmName}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            ({match.supplyPosition.farmerName} • {match.supplyPosition.location.region})
                          </span>
                          <span className="enterprise-tag enterprise-tag-emerald text-[10px]">
                            {match.overallMatchScore}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Allocating <strong>{match.recommendedAllocatedKg} kg</strong> @ ₹{match.supplyPosition.askingPricePerKg}/kg • Harvest Window: {match.supplyPosition.harvestWindowStart}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setInspectingMatch(match)}
                          className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline font-medium"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Why this match?</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commit Forward Order Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCommitPlan}
                  disabled={isCommitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isCommitting ? 'Funding Escrow & Locking...' : 'Lock Multi-Farm Forward Commitment (20% Escrow)'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Future Demand Calendar & Protection Moat */}
        <div className="space-y-5">
          
          {/* Future Demand Calendar */}
          <div className="enterprise-panel p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Future Demand Calendar
                </h3>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Sep 2026</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { date: 'Sep 10', demand: '4.2T', reliable: '5.0T', status: '🟢 Optimal' },
                { date: 'Sep 11', demand: '4.0T', reliable: '4.1T', status: '🟢 Optimal' },
                { date: 'Sep 12', demand: '4.8T', reliable: '4.2T', status: '🟡 Tight' },
                { date: 'Sep 13', demand: '5.0T', reliable: '3.8T', status: '🔴 Risk' },
                { date: 'Sep 14', demand: '4.5T', reliable: '4.5T', status: '🟢 Optimal' },
                { date: 'Sep 15', demand: '4.0T', reliable: '4.2T', status: '🟢 Optimal' }
              ].map((row, i) => (
                <div key={i} className="p-2 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="font-mono font-bold text-[var(--text-primary)]">{row.date}</span>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Req: <strong className="text-[var(--text-primary)]">{row.demand}</strong> • Rel: <strong className="text-[var(--accent-primary)]">{row.reliable}</strong>
                  </div>
                  <span className="text-[10px] font-semibold">{row.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Protection Moat */}
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Network Protection</span>
            </h3>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span><strong>RBI-Compliant Escrow:</strong> 20% commitment deposit held in segregated ledger.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span><strong>Batch QC Certification:</strong> Physical hub grading with photo provenance.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span><strong>Automated Shortfall Sourcing:</strong> 1-click replacement algorithm.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      <CreateDemandModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <MatchScoreBreakdownModal
        match={inspectingMatch}
        onClose={() => setInspectingMatch(null)}
      />

      <AutoReplacementDrawer
        alert={activeAlertForReplacement}
        onClose={() => setActiveAlertForReplacement(null)}
      />
    </div>
  );
};
