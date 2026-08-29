import React from 'react';
import { SupplyMatch } from '../../types';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
  match: SupplyMatch | null;
  onClose: () => void;
}

export const MatchScoreBreakdownModal: React.FC<Props> = ({ match, onClose }) => {
  if (!match) return null;
  const sup = match.supplyPosition;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] flex items-center justify-center font-bold text-xs">
              {match.overallMatchScore}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-[var(--text-primary)]">Why This Match?</h2>
                <span className="enterprise-tag enterprise-tag-emerald text-[10px]">
                  {match.overallMatchScore}% Match Score
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {sup.farmName} ({sup.location.region}) • Grower: {sup.farmerName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Factors Breakdown Table */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span className="font-semibold text-[var(--text-primary)]">Recommended Allocation:</span>
              <span className="font-mono font-bold text-[var(--accent-primary)]">{match.recommendedAllocatedKg} kg</span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Delivered Price: <strong className="text-[var(--text-primary)] font-mono">₹{match.estimatedDeliveredPricePerKg}/kg</strong>
            </div>
          </div>

          {/* 7-Factor Weighted Rows */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              7-Factor Algorithmic Score Weighting
            </span>

            <div className="space-y-2">
              {match.factors.map((f, idx) => (
                <div key={idx} className="p-2.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">{f.factor}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">({f.weightPercent}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-[var(--text-muted)] text-[10px]">{f.score}/100</span>
                      <span className="font-bold text-[var(--accent-primary)] text-xs">+{f.weightedScore} pts</span>
                    </div>
                  </div>

                  <div className="w-full bg-[var(--bg-subtle)] h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--accent-primary)] h-full rounded-full"
                      style={{ width: `${f.score}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-[var(--text-muted)]">{f.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Alerts if any */}
          {match.riskIndicators.length > 0 && (
            <div className="p-3 rounded-md bg-[var(--badge-amber-bg)] border border-[var(--badge-amber-border)] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--badge-amber-text)] text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Risk & Variance Factor Warnings</span>
              </div>
              <ul className="space-y-0.5 text-[11px] text-[var(--badge-amber-text)] pl-4 list-disc">
                {match.riskIndicators.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-hairline)] bg-[var(--table-header-bg)] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
