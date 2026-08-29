import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { AlertTriangle } from 'lucide-react';

export const RiskAnomaliesPage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Command Center', path: '/admin' }, { label: 'Risk & Anomalies' }]}
        title="Operational Risk & Anomaly Monitor"
        description="Tracks yield deviations, unexpected cancellation patterns, and QC discrepancies across forward commitments."
      />

      <div className="enterprise-panel overflow-hidden">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Anomaly Detected</th>
              <th>Severity</th>
              <th>Target Entity</th>
              <th>Detected At</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { anomaly: 'Yield Deviation Alert', severity: 'MEDIUM', entity: 'SUPPLY #102', time: '10 mins ago', reason: 'Expected P50 output dropped by 18% due to unseasonal rain', status: 'Under Review' },
              { anomaly: 'Logistics ETA Variance', severity: 'LOW', entity: 'DISPATCH #409', time: '1 hr ago', reason: 'Reefer speed variance on NH-48 aggregation route', status: 'Monitored' }
            ].map((row, i) => (
              <tr key={i}>
                <td>
                  <div className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    {row.anomaly}
                  </div>
                </td>
                <td>
                  <span className={`enterprise-tag ${row.severity === 'HIGH' ? 'enterprise-tag-rose' : 'enterprise-tag-amber'}`}>
                    {row.severity}
                  </span>
                </td>
                <td className="font-mono text-xs text-[var(--text-secondary)]">{row.entity}</td>
                <td className="text-xs text-[var(--text-muted)]">{row.time}</td>
                <td className="text-xs text-[var(--text-secondary)] max-w-xs">{row.reason}</td>
                <td>
                  <span className="enterprise-tag enterprise-tag-neutral">{row.status}</span>
                </td>
                <td>
                  <button className="text-xs text-[var(--accent-primary)] hover:underline font-semibold cursor-pointer">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
