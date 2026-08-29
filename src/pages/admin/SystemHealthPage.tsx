import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Server, Activity } from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Command Center', path: '/admin' }, { label: 'System Health' }]}
        title="Predictive Engine Health & Configuration"
        description="Verify active mathematical engine versions, calibration parameters, and operational status."
      />

      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2 flex items-center gap-1.5">
          <Server className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Horticultural Engine Version Registry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            { engine: 'Matching Engine', version: 'v1.4.2', status: 'Optimal', desc: '7-Factor weighted matcher solver' },
            { engine: 'Multi-Farm Optimizer', version: 'v1.0.8', status: 'Optimal', desc: 'Combinatorial integer linear programming model' },
            { engine: 'Risk & Shortfall Engine', version: 'v2.1.0', status: 'Optimal', desc: 'Deterministic weather and phenological risk matrix' },
            { engine: 'Yield Predictor (P10/P50/P90)', version: 'v3.2.4', status: 'Optimal', desc: 'Probabilistic yield curve estimator' }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex justify-between gap-3">
              <div>
                <span className="font-bold text-[var(--text-primary)] block">{item.engine}</span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-semibold block">{item.version}</span>
                <span className="enterprise-tag enterprise-tag-emerald mt-1">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
