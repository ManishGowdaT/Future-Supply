import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { FutureDemandPosition, MultiFarmMatchPlan, SupplyMatch } from '../../types';
import { MatchScoreBreakdownModal } from '../../components/buyer/MatchScoreBreakdownModal';
import { Sparkles, Info, ShieldCheck, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

export const MatchAndOptimizePage: React.FC = () => {
  const { demands, getMatchPlanForDemand, commitMatchPlan } = useApp();
  const { navigate } = useNavigation();

  const [selectedDemandId, setSelectedDemandId] = useState<string>(demands[0]?.id || '');
  const [activePlan, setActivePlan] = useState<MultiFarmMatchPlan | null>(null);
  const [inspectingMatch, setInspectingMatch] = useState<SupplyMatch | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const activeDemand = demands.find(d => d.id === selectedDemandId) || demands[0];

  const handleRunMatch = () => {
    if (!activeDemand) return;
    const plan = getMatchPlanForDemand(activeDemand.id);
    setActivePlan(plan);
  };

  const handleCommitPlan = async () => {
    if (!activeDemand || !activePlan) return;
    setIsCommitting(true);
    try {
      await commitMatchPlan(activeDemand.id, activePlan);
      setActivePlan(null);
      navigate('/buyer/commitments');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Match & Optimize' }]}
        title="Multi-Farm Sourcing Matcher"
        description="Launch transparent 7-factor matching and aggregate smallholder farm supplies into unified procurement plans."
      />

      {/* Select open demand to match */}
      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
          Select Target Store Demand
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 items-end text-xs">
          <div className="flex-1">
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Store Outlet Target Demand Requirement</label>
            <select
              value={selectedDemandId}
              onChange={(e) => {
                setSelectedDemandId(e.target.value);
                setActivePlan(null);
              }}
              className="w-full enterprise-input"
            >
              {demands.map(d => (
                <option key={d.id} value={d.id}>
                  {d.store.storeName} — {d.requiredQuantityKg.toLocaleString()} kg {d.cropType} (Ceiling: ₹{d.maximumAcceptablePricePerKg}/kg)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunMatch}
            disabled={!activeDemand}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Optimal Match Plan</span>
          </button>
        </div>
      </div>

      {/* Optimal Allocation Results */}
      {activePlan && activeDemand && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Sourcing Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="enterprise-panel p-5 space-y-4 border-[var(--accent-border)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Combinatorial Allocation Plan Recommendations
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {activePlan.optimizationSummary}
                  </p>
                </div>
                <span className="enterprise-tag enterprise-tag-emerald">
                  Optimal
                </span>
              </div>

              {/* Candidates Allocation list */}
              <div className="space-y-2">
                {activePlan.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[var(--accent-primary)] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">
                          {match.supplyPosition.farmName}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ({match.supplyPosition.farmerName} • {match.supplyPosition.location.region})
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                        Recommended split allocation: <strong>{match.recommendedAllocatedKg.toLocaleString()} kg</strong> @ ₹{match.supplyPosition.askingPricePerKg.toFixed(2)}/kg.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setInspectingMatch(match)}
                        className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline font-semibold"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Why this match?</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lock commitments */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCommitPlan}
                  disabled={isCommitting}
                  className="flex items-center gap-2 px-4.5 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isCommitting ? 'Funding Escrow & Locking...' : 'Lock Sourcing Plan (Fund 20% Forward Escrow)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Aggregated Sourcing Plan stats */}
          <div className="space-y-5">
            <div className="enterprise-panel p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)]">
                Aggregated Sourcing Metrics
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Total matched volume</span>
                  <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">
                    {activePlan.allocatedQuantityKg.toLocaleString()} kg ({activePlan.coveragePercent}% Coverage)
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border(--border-hairline)">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Blended Delivered price</span>
                  <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">
                    ₹{activePlan.blendedPricePerKg.toFixed(2)} / kg
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Average Fulfillment Confidence</span>
                  <span className="text-base font-extrabold text-[var(--accent-primary)] font-mono">
                    {activePlan.averageFulfillmentProbability}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      <MatchScoreBreakdownModal
        match={inspectingMatch}
        onClose={() => setInspectingMatch(null)}
      />
    </div>
  );
};
