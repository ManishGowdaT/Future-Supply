import React from 'react';
import { FarmerReliabilityScore } from '../../types';
import { ShieldCheck, Award } from 'lucide-react';

interface Props {
  reliability: FarmerReliabilityScore;
}

export const ReliabilityScoreCard: React.FC<Props> = ({ reliability }) => {
  const metrics = [
    { label: 'Quantity Accuracy', value: reliability.quantityAccuracy, desc: 'Harvested vs predicted yield' },
    { label: 'Harvest Timing', value: reliability.harvestTimingAccuracy, desc: 'Delivery within window' },
    { label: 'Grade Consistency', value: reliability.gradeConsistency, desc: 'Grade A compliance' },
    { label: 'Fulfillment Rate', value: reliability.fulfillmentRate, desc: 'Contracted tonnage delivered' },
    { label: 'Low Cancellation', value: Math.max(0, 100 - reliability.cancellationRate), desc: 'Default-free rate' },
    { label: 'Zero Dispute Rate', value: Math.max(0, 100 - reliability.disputeRate), desc: 'Dispute-free settlement' }
  ];

  return (
    <div className="enterprise-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Farmer Reliability Model
          </h3>
        </div>
        <span className="enterprise-tag enterprise-tag-emerald">
          Level 3 Verified
        </span>
      </div>

      {/* Primary Score Row */}
      <div className="flex items-baseline justify-between p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              {reliability.overallScore}
            </span>
            <span className="text-xs font-semibold text-[var(--text-muted)]">/ 100</span>
          </div>
          <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
            Top Tier Supplier (Ranked Top 5% in Ramanagara)
          </div>
        </div>
        <div className="text-right text-[11px] text-[var(--text-muted)]">
          <div>Historical Batches</div>
          <div className="font-bold text-[var(--text-primary)] font-mono">{reliability.completedBatchesCount} Certified</div>
        </div>
      </div>

      {/* 6-Factor Breakdown Grid */}
      <div className="space-y-2.5">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] text-[11px]">{m.label}</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] text-[11px]">
                {m.value}%
              </span>
            </div>
            <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)]">
              <div
                className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-300"
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
