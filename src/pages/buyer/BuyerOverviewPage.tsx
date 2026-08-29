import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { AlertTriangle, Zap, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export const BuyerOverviewPage: React.FC = () => {
  const { demands, commitments, activeShortfallAlerts } = useApp();
  const { navigate } = useNavigation();

  // Compute Control Center aggregates
  const totalRequiredKg = demands.reduce((acc, d) => acc + d.requiredQuantityKg, 0);
  const totalSecuredKg = commitments.reduce((acc, c) => acc + c.committedQuantityKg, 0);
  const totalReliableKg = commitments.reduce((acc, c) => acc + Math.round(c.committedQuantityKg * (c.fulfillmentProbability / 100)), 0);
  const totalAtRiskKg = commitments.reduce((acc, c) => acc + (c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL' ? c.committedQuantityKg : 0), 0);
  const coveragePercent = totalRequiredKg > 0 ? Math.min(100, Math.round((totalReliableKg / totalRequiredKg) * 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement' }, { label: 'Overview' }]}
        title="Bengaluru Procurement Control Tower"
        badge={<span className="enterprise-tag enterprise-tag-emerald">Live Network</span>}
        description="Monitor macro procurement targets, forward coverage ratios, active risks, and cold-chain dispatches."
        actions={
          <button
            onClick={() => navigate('/buyer/demand/create')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Create Store Demand</span>
          </button>
        }
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Total Target Volume
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {totalRequiredKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <button
            onClick={() => navigate('/buyer/demand')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View demands</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Secured Supply
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              {totalSecuredKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <button
            onClick={() => navigate('/buyer/commitments')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View commitments</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Reliable Expected
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {totalReliableKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-2">
            Confidence adjusted
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            At-Risk Shortfall
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-2xl font-extrabold font-mono ${totalAtRiskKg > 0 ? 'text-rose-600' : 'text-[var(--text-muted)]'}`}>
              {totalAtRiskKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">kg</span>
          </div>
          {totalAtRiskKg > 0 ? (
            <button
              onClick={() => navigate('/buyer/shortfalls')}
              className="text-[10px] text-rose-600 hover:underline mt-2 flex items-center gap-1 font-semibold"
            >
              <span>Resolve shortfall</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[10px] text-[var(--text-muted)] mt-2">0 kg at Risk</span>
          )}
        </div>

        <div className="enterprise-kpi col-span-2 sm:col-span-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Network Coverage
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              {coveragePercent}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)] mt-2">
            <div
              className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-300"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Alerts & Shortfalls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Direct Matching Shortcut */}
          <div className="enterprise-panel p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Multi-Farm Matching Solver
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Select an open store demand requirement to execute the transparent 7-factor matching and multi-farm optimizer.
            </p>
            <button
              onClick={() => navigate('/buyer/matching')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Matching Workspace</span>
            </button>
          </div>

          {/* Pending Commitments summary */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Recent Forward Commitments
              </h3>
              <button
                onClick={() => navigate('/buyer/commitments')}
                className="text-xs text-[var(--accent-primary)] hover:underline font-semibold"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {commitments.slice(0, 4).map(comm => (
                <div
                  key={comm.id}
                  onClick={() => navigate(`/buyer/commitments/${comm.id}`)}
                  className="p-4 hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">#{comm.id}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">from {comm.farmerName}</span>
                      <span className="enterprise-tag enterprise-tag-emerald">{comm.status}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Total: <strong>{comm.committedQuantityKg} kg {comm.cropType}</strong> @ ₹{comm.unitPricePerKg}/kg • delivery window: {comm.deliveryDate}.
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    ₹{comm.totalOrderValueInr.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-5">
          
          {/* Critical Alerts */}
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 pb-2 border-b border-[var(--border-hairline)]">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Fulfillment Risks & Alerts</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {activeShortfallAlerts.length > 0 ? (
                <div className="p-3 rounded bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)] text-[var(--badge-rose-text)] space-y-1.5">
                  <span className="font-bold block uppercase text-[9px] tracking-wider">Shortfall Detected</span>
                  <p className="text-[11px]">
                    Unseasonal climate shock in Ramanagara region has triggered fulfillment drops across forward contracts.
                  </p>
                  <button
                    onClick={() => navigate('/buyer/shortfalls')}
                    className="text-[10px] font-bold text-rose-700 hover:underline flex items-center gap-1 mt-1"
                  >
                    <span>Execute 1-click recovery</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded bg-[var(--badge-emerald-bg)] border border-[var(--badge-emerald-border)] text-[var(--badge-emerald-text)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold">All commitments verified and secure.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
