import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { ArrowLeft, FileText, Landmark } from 'lucide-react';
import { CommitmentStatus } from '../../types';

const STATES: { status: CommitmentStatus; label: string }[] = [
  { status: 'DRAFT', label: 'Draft' },
  { status: 'PENDING_ACCEPTANCE', label: 'Pending Acceptance' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'DEPOSIT_PENDING', label: 'Deposit Pending' },
  { status: 'SECURED', label: 'Secured' },
  { status: 'HARVEST_APPROACHING', label: 'Harvest Approaching' },
  { status: 'HARVESTED', label: 'Harvested' },
  { status: 'QC_PENDING', label: 'QC Pending' },
  { status: 'QC_APPROVED', label: 'QC Approved' },
  { status: 'DISPATCHED', label: 'In Transit' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'SETTLED', label: 'Settled' }
];

export const BuyerCommitmentDetailPage: React.FC = () => {
  const { commitments, auditLogs } = useApp();
  const { selectedEntityId, navigate } = useNavigation();

  const comm = commitments.find(c => c.id === selectedEntityId) || commitments[0];

  if (!comm) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No active commitment selected. Go to <button onClick={() => navigate('/buyer/commitments')} className="text-[var(--accent-primary)] underline">Commitments List</button> to select one.
      </div>
    );
  }

  const activeIndex = STATES.findIndex(s => s.status === comm.status);
  const commAudits = auditLogs.filter(
    log => log.entityId === comm.id && log.entityType === 'COMMITMENT'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Buyer Procurement', path: '/buyer' },
          { label: 'Commitments', path: '/buyer/commitments' },
          { label: `Order #${comm.id}` }
        ]}
        title={`Forward Order Commitment #${comm.id}`}
        badge={
          <span className="enterprise-tag enterprise-tag-emerald">
            {comm.status}
          </span>
        }
        description="Detailed contract overview, 12-stage lifecycle monitoring, escrow security status, and collection hub inspection logs."
        actions={
          <button
            onClick={() => navigate('/buyer/commitments')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Commitments</span>
          </button>
        }
      />

      {/* 12-Stage Visual Timeline Monitor */}
      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
          12-Stage Visual Commitment Timeline Monitor
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3 pt-2 text-xs">
          {STATES.map((s, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={s.status}
                className={`p-2 rounded-md border text-center transition-colors ${
                  isCurrent
                    ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)] font-semibold'
                    : isCompleted
                    ? 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-subtle)] border-[var(--border-hairline)] text-[var(--text-muted)] opacity-60'
                }`}
              >
                <div className="font-mono text-[10px] text-[var(--text-muted)]">
                  Step {idx + 1}
                </div>
                <div className="truncate mt-0.5" title={s.label}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Agreement Viewer & Simulated Escrow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Commercial Terms Agreement */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Commercial Forward Agreement</span>
              </div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Simulated Agreement
              </span>
            </div>

            {/* Document Body */}
            <div className="text-xs space-y-3.5 text-[var(--text-secondary)] leading-relaxed">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Agreement ID</span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">AGR-{comm.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Supplier Grower</span>
                  <span className="font-semibold text-[var(--text-primary)]">{comm.farmerName} ({comm.farmName})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-[var(--border-hairline)] pt-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Produce Category</span>
                  <span className="font-semibold text-[var(--text-primary)]">{comm.cropType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Contracted Quantity</span>
                  <span className="font-semibold text-[var(--text-primary)] font-mono">{comm.committedQuantityKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Delivered Price</span>
                  <span className="font-semibold text-[var(--text-primary)] font-mono">₹{comm.unitPricePerKg.toFixed(2)} / kg</span>
                </div>
              </div>

              <div className="border-t border-[var(--border-hairline)] pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Target Delivery Date</span>
                  <span className="font-semibold text-[var(--text-primary)]">{comm.deliveryDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Variance Tolerance Limit</span>
                  <span className="font-semibold text-[var(--text-primary)]">±10% (Weight Fraction)</span>
                </div>
              </div>

              <div className="border-t border-[var(--border-hairline)] pt-3 text-[10px] text-[var(--text-muted)]">
                *This document is generated for illustrative purposes in this demo environment and does not constitute a legally binding agreement under local laws.
              </div>
            </div>
          </div>

          {/* Audit log for commitment */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Contract Audit History
              </h3>
            </div>
            
            <div className="divide-y divide-[var(--border-hairline)]">
              {commAudits.map(log => (
                <div key={log.id} className="p-3 hover:bg-[var(--table-row-hover)] text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[var(--text-primary)]">{log.eventType}</span>
                    <p className="text-[11px] text-[var(--text-muted)]">{log.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {commAudits.length === 0 && (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                  No lifecycle transitions audited yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Simulated Escrow */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                <Landmark className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Simulated Escrow Ledger</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">
                Demo Ledger
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block">Escrow Account balance</span>
                <span className="text-xl font-extrabold text-[var(--accent-primary)] font-mono">
                  ₹{comm.balanceAmountInr.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                  Deposit: ₹{comm.depositAmountInr.toLocaleString()} (20% forward deposit funded)
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] block">Ledger Rules:</span>
                <ul className="space-y-1.5 text-[11px] text-[var(--text-secondary)] pl-4 list-disc">
                  <li>20% contract value deposited by buyer immediately on agreement lock.</li>
                  <li>100% contract value held by system upon successful Collection Hub inspection.</li>
                  <li>Escrow balance release automatic upon store gate delivery.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
