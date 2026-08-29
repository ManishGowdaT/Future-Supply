import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Zap,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';

export const AdminCommandCenter: React.FC<{ onOpenSimulator: () => void }> = ({ onOpenSimulator }) => {
  const { supplies, demands, commitments, auditLogs } = useApp();
  const [searchFilter, setSearchFilter] = useState('');

  // North Star Calculations
  const totalSupplyListedKg = supplies.reduce((acc, s) => acc + s.expectedYieldKg, 0);
  const totalSafeP10Kg = supplies.reduce((acc, s) => acc + s.yieldP10Kg, 0);
  const totalCommittedKg = commitments.reduce((acc, c) => acc + c.committedQuantityKg, 0);
  const totalReliableFulfilledKg = commitments
    .filter(c => c.status === 'SETTLED' || c.status === 'QC_APPROVED' || c.status === 'SECURED')
    .reduce((acc, c) => acc + Math.round(c.committedQuantityKg * (c.fulfillmentProbability / 100)), 0);

  const totalGMVInr = commitments.reduce((acc, c) => acc + c.totalOrderValueInr, 0);
  const takeRateRevenueInr = Math.round(totalGMVInr * 0.012); // 1.2% platform take rate

  const filteredLogs = auditLogs.filter(
    l => l.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
         l.eventType.toLowerCase().includes(searchFilter.toLowerCase()) ||
         l.actorName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
            <span>Administration</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span>Platform Operations</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className="text-[var(--text-primary)] font-medium">Network Command Center</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Network Command Center & Audit Control
            </h1>
            <span className="enterprise-tag enterprise-tag-purple">
              Administrator
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border border-[var(--badge-amber-border)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Launch Climate Shock Simulator</span>
        </button>
      </div>

      {/* 2. North Star KPI Hero Strip */}
      <div className="enterprise-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
              Core Platform North Star Metric
            </span>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">
              Reliable Fulfilled Fresh Supply
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              kg of fresh produce delivered within agreed quantity, quality, and cold-chain constraints.
            </p>
          </div>

          <div className="text-right">
            <div className="font-mono font-extrabold text-3xl text-[var(--accent-primary)]">
              {(totalReliableFulfilledKg / 1000).toFixed(1)} <span className="text-base font-semibold text-[var(--text-secondary)]">Tonnes</span>
            </div>
            <span className="text-xs font-semibold text-[var(--accent-primary)]">
              {totalCommittedKg > 0 ? `${Math.round((totalReliableFulfilledKg / totalCommittedKg) * 100)}% Fulfillment Success` : '100%'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Total Listed Supply
            </span>
            <span className="font-mono font-bold text-base text-[var(--text-primary)]">
              {totalSupplyListedKg.toLocaleString()} kg
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">Gross P50 Predicted</span>
          </div>

          <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Safe Capacity (P10)
            </span>
            <span className="font-mono font-bold text-base text-[var(--accent-primary)]">
              {totalSafeP10Kg.toLocaleString()} kg
            </span>
            <span className="text-[10px] text-[var(--accent-primary)] block font-medium">Overcommitment Guard</span>
          </div>

          <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Platform GMV
            </span>
            <span className="font-mono font-bold text-base text-[var(--text-primary)]">
              ₹{totalGMVInr.toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">Locked Contracts</span>
          </div>

          <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Take Rate Revenue (1.2%)
            </span>
            <span className="font-mono font-bold text-base text-amber-600">
              ₹{takeRateRevenueInr.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-600 block font-medium">Transaction Fee</span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Overcommitment Guard & Searchable Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Overcommitment Prevention Monitor */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Overcommitment Guardrail
                </h3>
              </div>
              <span className="enterprise-tag enterprise-tag-emerald text-[10px]">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              The domain engine mathematically prevents commitments exceeding conservative $P10$ safe yield:
            </p>

            <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] font-mono text-[11px] text-[var(--accent-primary)]">
              Committed + Reserved &le; Safe P10 Yield
            </div>

            <div className="space-y-2 text-xs">
              {supplies.slice(0, 4).map(s => {
                const ratio = Math.min(100, Math.round((s.committedQuantityKg / s.yieldP10Kg) * 100));
                return (
                  <div key={s.id} className="p-2.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text-primary)]">{s.farmName}</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{ratio}% bound</span>
                    </div>
                    <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)] mt-1.5">
                      <div
                        className={`h-full rounded-full ${ratio > 90 ? 'bg-amber-500' : 'bg-[var(--accent-primary)]'}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Searchable Immutable Audit Log Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Immutable Operational Audit Log ({filteredLogs.length})
                </h3>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter audit event or actor..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md pl-7 pr-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Event Type</th>
                    <th>Entity</th>
                    <th>Actor</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td className="font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className="enterprise-tag enterprise-tag-neutral font-mono text-[10px]">
                          {log.eventType}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[var(--text-secondary)]">
                        {log.entityType} #{log.entityId}
                      </td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">{log.actorName}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{log.actorRole}</div>
                      </td>
                      <td className="text-xs text-[var(--text-secondary)] max-w-xs">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
