import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { calculateFreshness } from '../../engines/freshnessCalculator';
import { Clock } from 'lucide-react';

export const FreshnessMonitorPage: React.FC = () => {
  const { commitments } = useApp();

  const activeCommitment = commitments[0];

  const freshness = calculateFreshness({
    cropType: activeCommitment?.cropType || 'Tomato',
    harvestTimestamp: new Date().toISOString(),
    pickupDepartureTime: new Date().toISOString(),
    transitHours: 2.5,
    temperatureControlled: true,
    ambientTempCelsius: 28
  }, 4);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub', path: '/qc' }, { label: 'Freshness Clock' }]}
        title="Cold-Chain Freshness Monitor"
        description="Verify remaining shelf life and thermal degradation index calculated on field-to-hub transit hours."
      />

      <div className="enterprise-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Thermal degradation Remaining Shelf Life</span>
          </div>
          <span className="enterprise-tag enterprise-tag-emerald">
            {freshness.riskStatus}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Remaining Shelf Life:</span>
            <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
              {freshness.estimatedRemainingShelfLifeDays} Days
            </span>
          </div>
          <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)]">
            <div
              className="bg-[var(--accent-primary)] h-full"
              style={{ width: `${freshness.freshnessScorePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Transit: 2.5 hrs • Temperature Controlled Reefer at 14°C • Meets buyer standard (&gt; 4 days).
          </p>
        </div>
      </div>
    </div>
  );
};
