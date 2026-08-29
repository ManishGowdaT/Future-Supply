import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Lock } from 'lucide-react';

export const OvercommitmentGuardPage: React.FC = () => {
  const { supplies } = useApp();

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Command Center', path: '/admin' }, { label: 'Overcommitment Guard' }]}
        title="Overcommitment Guardrail Monitor"
        description="Rigorous enforcement of the core platform rule: Committed + Reserved &le; conservative P10 Safe Yield."
      />

      <div className="enterprise-panel p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
          <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Platform Guardrail Formula Status</span>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          The domain engine mathematically prevents commitments exceeding P10 safe yield limits.
        </p>

        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Farm / Grower</th>
                <th>Crop Variety</th>
                <th>P10 Safe Yield</th>
                <th>Committed</th>
                <th>Reserved Capacity</th>
                <th>Remaining Headroom</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map(sup => {
                const ratio = Math.min(100, Math.round((sup.committedQuantityKg / sup.yieldP10Kg) * 100));
                const isBlocked = ratio >= 100;
                const isWarning = ratio >= 80 && ratio < 100;

                return (
                  <tr key={sup.id}>
                    <td>
                      <div className="font-semibold text-xs text-[var(--text-primary)]">{sup.farmName}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{sup.farmerName}</div>
                    </td>
                    <td>
                      <div className="text-xs text-[var(--text-primary)] font-semibold">{sup.cropType}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{sup.variety}</div>
                    </td>
                    <td className="font-mono text-xs text-[var(--text-primary)] font-semibold">
                      {sup.yieldP10Kg.toLocaleString()} kg
                    </td>
                    <td className="font-mono text-xs">{sup.committedQuantityKg.toLocaleString()} kg</td>
                    <td className="font-mono text-xs">0 kg</td>
                    <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                      {sup.safeAvailableCapacityKg.toLocaleString()} kg
                    </td>
                    <td>
                      <span
                        className={`enterprise-tag ${
                          isBlocked
                            ? 'enterprise-tag-rose'
                            : isWarning
                            ? 'enterprise-tag-amber'
                            : 'enterprise-tag-emerald'
                        }`}
                      >
                        {isBlocked ? 'BLOCKED' : isWarning ? 'WARNING' : 'SAFE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
