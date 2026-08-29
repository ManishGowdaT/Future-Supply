import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Activity, ShieldCheck, TrendingUp, DollarSign, Zap } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { supplies, commitments } = useApp();
  const { navigate } = useNavigation();

  // North Star Calculations
  const totalSupplyListedKg = supplies.reduce((acc, s) => acc + s.expectedYieldKg, 0);
  const totalSafeP10Kg = supplies.reduce((acc, s) => acc + s.yieldP10Kg, 0);
  const totalCommittedKg = commitments.reduce((acc, c) => acc + c.committedQuantityKg, 0);
  const totalReliableFulfilledKg = commitments
    .filter(c => c.status === 'SETTLED' || c.status === 'QC_APPROVED' || c.status === 'SECURED')
    .reduce((acc, c) => acc + Math.round(c.committedQuantityKg * (c.fulfillmentProbability / 100)), 0);

  const totalGMVInr = commitments.reduce((acc, c) => acc + c.totalOrderValueInr, 0);
  const takeRateRevenueInr = Math.round(totalGMVInr * 0.012); // 1.2% platform take rate

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Command Center' }, { label: 'Overview' }]}
        title="Network Command Center"
        badge={<span className="enterprise-tag enterprise-tag-purple">Administrator</span>}
        description="Verify platform North Star metrics, total network capacity, active contracts, and take-rate billing."
        actions={
          <button
            onClick={() => navigate('/simulator/weather')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border border-[var(--badge-amber-border)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Launch Shock Simulator</span>
          </button>
        }
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Reliable Fulfilled Supply (North Star)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              {(totalReliableFulfilledKg / 1000).toFixed(1)} T
            </span>
            <span className="text-[11px] text-[var(--accent-primary)] font-semibold">
              {totalCommittedKg > 0 ? `${Math.round((totalReliableFulfilledKg / totalCommittedKg) * 100)}% Success` : '100%'}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-2">
            Fulfillability weighted tonnage
          </span>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Total Listed Supply
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {totalSupplyListedKg.toLocaleString()} kg
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/network')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View network matrix</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Platform GMV Locked
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              ₹{totalGMVInr.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/audit')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View audit log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Take Rate Revenue (1.2%)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600 font-mono">
              ₹{takeRateRevenueInr.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-amber-600 mt-2 font-medium">Transaction fee billing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Guardrail Callout */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Overcommitment Guardrail Monitor
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Ensure that forward orders locked against grower holdings are strictly bounded within conservative P10 safe yield limits.
            </p>
            <button
              onClick={() => navigate('/admin/guardrails')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Guardrail Console</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
import { ArrowRight } from 'lucide-react';
