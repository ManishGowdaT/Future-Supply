import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  Sprout,
  Plus,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';

export const FarmerOverviewPage: React.FC = () => {
  const { supplies, commitments, demands, activeShortfallAlerts } = useApp();
  const { navigate } = useNavigation();

  // Primary Farmer supplies (Chennappa Gowda F-102 & F-105)
  const farmerSupplies = supplies.filter(s => s.farmerId === 'F-102' || s.farmerId === 'F-105');
  const farmerCommitments = commitments.filter(
    c => c.farmerId === 'F-102' || c.farmerId === 'F-105'
  );

  const totalAcreage = farmerSupplies.reduce((acc, s) => acc + s.acreage, 0);
  const totalSafeP10Kg = farmerSupplies.reduce((acc, s) => acc + s.yieldP10Kg, 0);
  const totalCommittedKg = farmerSupplies.reduce((acc, s) => acc + s.committedQuantityKg, 0);
  const totalAvailableSafeKg = Math.max(0, totalSafeP10Kg - totalCommittedKg);
  const totalForwardValueInr = farmerCommitments.reduce((acc, c) => acc + c.totalOrderValueInr, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Farmer Portal' }, { label: 'Overview' }]}
        title="Gowda Farm Overview"
        badge={<span className="enterprise-tag enterprise-tag-emerald">Level 3 Verified</span>}
        description="Operational overview of registered crop status, harvest forecasts, commitments, and historical performance."
        actions={
          <button
            onClick={() => navigate('/farmer/crops/register')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Future Crop</span>
          </button>
        }
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Active Growing Crops
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {farmerSupplies.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {totalAcreage.toFixed(1)} Acres
            </span>
          </div>
          <button
            onClick={() => navigate('/farmer/crops')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View all crops</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Committed Capacity
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              {totalCommittedKg.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">/ {totalSafeP10Kg.toLocaleString()} kg</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-2">
            Safe P10 planning limit guardrail
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Secured Forward Value
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              ₹{totalForwardValueInr.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => navigate('/farmer/commitments')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>Inspect commitments</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            FPO Supplier Reliability
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              91
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">/ 100</span>
          </div>
          <button
            onClick={() => navigate('/farmer/reliability')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View performance analytics</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Recommended Actions, Alerts, and Active Crops list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Active Growing Crops Overview */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--table-header-bg)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Active Crop Fields / Parcels
              </h3>
              <button
                onClick={() => navigate('/farmer/crops')}
                className="text-xs text-[var(--accent-primary)] hover:underline font-semibold"
              >
                Manage crops
              </button>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {farmerSupplies.map(sup => (
                <div
                  key={sup.id}
                  onClick={() => navigate(`/farmer/crops/${sup.id}`)}
                  className="p-4 hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)] text-sm">{sup.cropType}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">({sup.variety})</span>
                      <span className="enterprise-tag enterprise-tag-neutral">{sup.cropStage}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Farm parcel: <strong>{sup.farmName}</strong> • planting date: {sup.plantingDate} • {sup.irrigationType} irrigation.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[var(--text-primary)] block">
                      {sup.yieldP50Kg} kg (P50)
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Available safe P10: {sup.safeAvailableCapacityKg} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forward Contracts Summary */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--table-header-bg)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Active Buyer Commitments
              </h3>
              <button
                onClick={() => navigate('/farmer/commitments')}
                className="text-xs text-[var(--accent-primary)] hover:underline font-semibold"
              >
                Inspect details
              </button>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {farmerCommitments.map(comm => (
                <div
                  key={comm.id}
                  onClick={() => navigate(`/farmer/commitments/${comm.id}`)}
                  className="p-4 hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">#{comm.id}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">to {comm.buyerOrg}</span>
                      <span className="enterprise-tag enterprise-tag-emerald">{comm.status}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Total: <strong>{comm.committedQuantityKg} kg {comm.cropType}</strong> @ ₹{comm.unitPricePerKg}/kg • delivery window: {comm.deliveryDate}.
                    </p>
                  </div>

                  <div className="text-right font-mono font-bold text-[var(--text-primary)]">
                    ₹{comm.totalOrderValueInr.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-5">
          
          {/* Alerts & Recommended Actions */}
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 pb-2 border-b border-[var(--border-hairline)]">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Actions & Alerts</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {activeShortfallAlerts.length > 0 ? (
                <div className="p-3 rounded-md bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)] text-[var(--badge-rose-text)] space-y-1">
                  <span className="font-bold block uppercase text-[9px] tracking-wider">Shortfall Risk Detected</span>
                  <p className="text-[11px]">
                    Regional climate shock has affected yield projections. Review crop stage and prediction values immediately.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-md bg-[var(--badge-emerald-bg)] border border-[var(--badge-emerald-border)] text-[var(--badge-emerald-text)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold">All fields stable. Yield confidence &gt; 94%.</span>
                </div>
              )}

              <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1.5">
                <span className="font-semibold text-[var(--text-primary)] block">Upcoming Crop Stage Shift</span>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Saaho Tomato is approaching mature stages. Click to advance lifecycle and log field telemetry.
                </p>
                <button
                  onClick={() => navigate('/farmer/crops')}
                  className="text-[10px] text-[var(--accent-primary)] font-bold flex items-center gap-1"
                >
                  <span>Advance crop stage</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Market Demand Matcher */}
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 pb-2 border-b border-[var(--border-hairline)]">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Market Match Potential</span>
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)]">
              There are currently <strong>{demands.length} active demands</strong> matching your crop profile.
            </p>

            <button
              onClick={() => navigate('/farmer/demand')}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-primary)] hover:bg-[var(--accent-border)] font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Explore Demands</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
