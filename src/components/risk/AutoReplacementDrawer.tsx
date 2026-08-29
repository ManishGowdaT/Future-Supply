import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShortfallAlert, ReplacementPlan } from '../../types';
import {
  X,
  AlertTriangle,
  Zap,
  ShieldCheck,
  MapPin
} from 'lucide-react';

interface Props {
  alert: ShortfallAlert | null;
  onClose: () => void;
}

export const AutoReplacementDrawer: React.FC<Props> = ({ alert, onClose }) => {
  const { getAutoReplacementPlan, executeAutoReplacement } = useApp();
  const [isExecuting, setIsExecuting] = useState(false);

  if (!alert) return null;

  const plan = getAutoReplacementPlan(alert);

  const handleExecute = async () => {
    if (!plan) return;
    setIsExecuting(true);
    try {
      await executeAutoReplacement(plan);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--badge-rose-border)] rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--badge-rose-border)] bg-[var(--badge-rose-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--badge-rose-border)] text-[var(--badge-rose-text)]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-[var(--badge-rose-text)]">
                  Automated Replacement Sourcing Drawer
                </h2>
                <span className="enterprise-tag enterprise-tag-rose text-[10px]">
                  Shortfall Detected
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Order #{alert.orderNumber} • {alert.cropType} for {alert.storeName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Deficit Summary Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Required Demand</span>
              <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{alert.requiredQuantityKg} kg</span>
            </div>
            <div className="p-2.5 rounded-md bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--badge-rose-text)] block">Projected Shortfall</span>
              <span className="font-mono font-bold text-sm text-[var(--badge-rose-text)]">{alert.projectedShortfallKg} kg</span>
            </div>
            <div className="p-2.5 rounded-md bg-[var(--badge-emerald-bg)] border border-[var(--badge-emerald-border)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--badge-emerald-text)] block">Restored Fulfillment</span>
              <span className="font-mono font-bold text-sm text-[var(--badge-emerald-text)]">{plan?.restoredFulfillmentProb || 96}%</span>
            </div>
          </div>

          {/* Replacement Candidate List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Recommended Backup Supply Allocations ({plan?.recommendedCandidates.length || 0} Farms)
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Excludes active shock zones
              </span>
            </div>

            {plan && plan.recommendedCandidates.length > 0 ? (
              <div className="space-y-2">
                {plan.recommendedCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1.5 hover:border-[var(--accent-primary)] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[var(--text-primary)]">
                            {cand.supplyPosition.farmName}
                          </span>
                          <span className="enterprise-tag enterprise-tag-emerald text-[10px]">
                            {cand.supplyPosition.cropStage}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                          <span>Grower: {cand.supplyPosition.farmerName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--accent-primary)]" />
                            {cand.supplyPosition.location.region} (~{cand.distanceKm} km)
                          </span>
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-[var(--accent-primary)]">
                          +{cand.offeredQuantityKg} kg
                        </span>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          ₹{cand.pricePerKg.toFixed(2)}/kg
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-hairline)]">
                      <span>Harvest: <strong className="font-mono text-[var(--text-primary)]">{cand.harvestWindow}</strong></span>
                      <span>Reliability: <strong className="text-[var(--accent-primary)] font-mono">{cand.reliabilityScore}/100</strong></span>
                      <span>Grade A Probability: <strong className="text-[var(--accent-primary)] font-mono">{cand.gradeAProb}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] rounded-md border border-[var(--border-hairline)]">
                No backup uncommitted farms available in unaffected regions.
              </div>
            )}
          </div>

          <div className="p-3 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-xs text-[var(--text-secondary)] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <div>
              <strong>1-Click Automated Recovery:</strong> Executing this plan will split and lock forward commitments with the selected backup farms, transfer escrow coverage, and guarantee full delivery to {alert.storeName}.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-hairline)] bg-[var(--table-header-bg)] flex items-center justify-between">
          <div className="text-xs text-[var(--text-secondary)]">
            Total Allocated: <strong className="font-mono text-[var(--accent-primary)]">{plan?.totalReplacementAllocatedKg} kg</strong> (Blended: ₹{plan?.blendedReplacementPricePerKg}/kg)
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting || !plan || plan.recommendedCandidates.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Locking...' : 'Lock Replacement Supply (1-Click)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
