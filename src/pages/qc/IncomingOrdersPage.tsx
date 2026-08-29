import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, ArrowRight } from 'lucide-react';

export const IncomingOrdersPage: React.FC = () => {
  const { commitments } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');

  const filtered = commitments.filter(
    c => c.farmerName.toLowerCase().includes(query.toLowerCase()) ||
         c.cropType.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub', path: '/qc' }, { label: 'Incoming Orders' }]}
        title="Incoming Harvest Orders Queue"
        description="Verify incoming farm dispatches and schedule digital grading slots."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Incoming Orders List ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search supplier or crop..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md pl-7 pr-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Grower / Farm</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Escrow Deposit</th>
                <th>Delivery Window</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(comm => (
                <tr key={comm.id}>
                  <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                    #{comm.id}
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{comm.farmerName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{comm.farmName}</div>
                  </td>
                  <td className="text-xs text-[var(--text-primary)] font-semibold">{comm.cropType}</td>
                  <td className="font-mono text-xs font-semibold">{comm.committedQuantityKg.toLocaleString()} kg</td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">
                      Funded (₹{comm.depositAmountInr.toLocaleString()})
                    </span>
                  </td>
                  <td className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    {comm.deliveryDate}
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-blue">{comm.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate('/qc/inspection')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--accent-subtle)] hover:bg-[var(--accent-border)] text-[var(--accent-primary)] text-[11px] font-semibold border border-[var(--accent-border)] transition-colors cursor-pointer"
                    >
                      <span>Grade Batch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No incoming orders in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
