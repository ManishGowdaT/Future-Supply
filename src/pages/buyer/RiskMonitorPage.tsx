import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Radio, AlertTriangle, ArrowRight } from 'lucide-react';

export const RiskMonitorPage: React.FC = () => {
  const { commitments, riskEvents } = useApp();
  const { navigate } = useNavigation();

  const activeRisks = commitments.filter(
    c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL'
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Risk Monitor' }]}
        title="Live Fulfillment Risk Monitor"
        description="Scans climate factors, phenological delays, and historical supplier default models to flag potential shortfalls."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns: Active Risk Listings */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Farms / Listings under High Risk ({activeRisks.length})
              </h3>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {activeRisks.map(comm => (
                <div
                  key={comm.id}
                  onClick={() => navigate('/buyer/shortfalls')}
                  className="p-4 hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">#{comm.id} — {comm.farmName}</span>
                      <span className="enterprise-tag enterprise-tag-rose">
                        {comm.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Fulfillment Drop: <strong>{comm.fulfillmentProbability}% Probability</strong> • Crop: {comm.cropType} • region: {comm.destinationStore.region}.
                    </p>
                  </div>
                  <button className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline font-semibold">
                    <span>Resolve Sourcing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {activeRisks.length === 0 && (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                  All active grower listings reporting normal crop stage development.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Drivers */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)] flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Active Climate & Pest Shocks ({riskEvents.filter(e => e.active).length})</span>
            </h3>

            <div className="space-y-2 text-xs">
              {riskEvents.filter(e => e.active).map(evt => (
                <div key={evt.id} className="p-3 rounded bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)] text-[var(--badge-rose-text)] space-y-1">
                  <span className="font-bold block uppercase text-[9px] tracking-wider">{evt.title}</span>
                  <p className="text-[11px]">
                    Impact penalty: -{evt.estimatedImpactPercent}% expected yield in {evt.affectedRegion}.
                  </p>
                </div>
              ))}
              {riskEvents.filter(e => e.active).length === 0 && (
                <p className="text-center text-[var(--text-muted)] py-4">
                  0 active weather alerts reported.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
