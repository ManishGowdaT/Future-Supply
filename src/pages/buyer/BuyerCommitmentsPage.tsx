import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, ArrowRight } from 'lucide-react';

export const BuyerCommitmentsPage: React.FC = () => {
  const { commitments } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');

  const filtered = commitments.filter(
    c => c.farmerName.toLowerCase().includes(query.toLowerCase()) ||
         c.cropType.toLowerCase().includes(query.toLowerCase()) ||
         c.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Commitments' }]}
        title="Forward Order Commitments"
        description="Monitor active contract execution state, simulated escrow balances, and FSSAI quality parameters."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Active Forward Commitments ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search contract number or supplier..."
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
                <th>Supplier Farm</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Delivered Value</th>
                <th>Simulated Escrow</th>
                <th>Delivery Window</th>
                <th>Status</th>
                <th>Match Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(comm => (
                <tr
                  key={comm.id}
                  onClick={() => navigate(`/buyer/commitments/${comm.id}`)}
                  className="hover:bg-[var(--table-row-hover)] cursor-pointer"
                >
                  <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                    #{comm.id}
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{comm.farmName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Grower: {comm.farmerName}</div>
                  </td>
                  <td className="text-xs text-[var(--text-primary)] font-semibold">{comm.cropType}</td>
                  <td className="font-mono text-xs font-semibold">{comm.committedQuantityKg.toLocaleString()} kg</td>
                  <td className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    ₹{comm.totalOrderValueInr.toLocaleString()}
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">
                      Funded (20%)
                    </span>
                  </td>
                  <td className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    {comm.deliveryDate}
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">{comm.status}</span>
                  </td>
                  <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                    {comm.fulfillmentProbability}%
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/buyer/commitments/${comm.id}`);
                      }}
                      className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No active forward contracts found.
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
