import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, ArrowRight } from 'lucide-react';

export const FarmerCommitmentsPage: React.FC = () => {
  const { commitments } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');

  // Primary Farmer F-102 / F-105 commitments
  const farmerCommitments = commitments.filter(
    c => c.farmerId === 'F-102' || c.farmerId === 'F-105'
  );

  const filtered = farmerCommitments.filter(
    c => c.buyerOrg.toLowerCase().includes(query.toLowerCase()) ||
         c.cropType.toLowerCase().includes(query.toLowerCase()) ||
         c.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Farmer Portal', path: '/farmer' }, { label: 'Commitments' }]}
        title="My Forward Commitments"
        description="Monitor status of locked forward supply contracts, FSSAI grading expectations, and simulated escrow payout schedules."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Forward Orders list ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search order number or buyer..."
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
                <th>Buyer / Client</th>
                <th>Crop Type</th>
                <th>Contract Quantity</th>
                <th>Contract Value</th>
                <th>Escrow Status</th>
                <th>Delivery Window</th>
                <th>Order Status</th>
                <th>Fulfillment Probability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(comm => (
                <tr
                  key={comm.id}
                  onClick={() => navigate(`/farmer/commitments/${comm.id}`)}
                  className="hover:bg-[var(--table-row-hover)] cursor-pointer"
                >
                  <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                    #{comm.id}
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{comm.buyerOrg}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{comm.destinationStore.storeName}</div>
                  </td>
                  <td className="text-xs text-[var(--text-primary)]">{comm.cropType}</td>
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
                        navigate(`/farmer/commitments/${comm.id}`);
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
                    No active forward commitments found.
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
