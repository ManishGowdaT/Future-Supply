import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, Sparkles } from 'lucide-react';

export const DemandPositionsPage: React.FC = () => {
  const { demands } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');

  const filtered = demands.filter(
    d => d.store.storeName.toLowerCase().includes(query.toLowerCase()) ||
         d.cropType.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Demand Positions' }]}
        title="Store Demand Requirements"
        description="Configure target fresh produce daily requirements at grocery outlets and cold storage nodes."
        actions={
          <button
            onClick={() => navigate('/buyer/demand/create')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Create Demand Position</span>
          </button>
        }
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Outlet Requirements list ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search store or category..."
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
                <th>Store Outlet</th>
                <th>Crop & Preferred</th>
                <th>Daily Quantity</th>
                <th>Grade Spec</th>
                <th>Delivery Window</th>
                <th>Price Ceiling</th>
                <th>Freshness Shelf Life</th>
                <th>Secured Ratio</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dem => {
                const ratio = Math.min(100, Math.round((dem.securedQuantityKg / dem.requiredQuantityKg) * 100));
                return (
                  <tr key={dem.id}>
                    <td>
                      <div className="font-semibold text-xs text-[var(--text-primary)]">
                        {dem.store.storeName}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">{dem.store.region} Hub</div>
                    </td>
                    <td>
                      <div className="text-xs text-[var(--text-primary)] font-semibold">{dem.cropType}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{dem.varietyPreferred || 'Standard Spec'}</div>
                    </td>
                    <td className="font-mono text-xs font-semibold">{dem.requiredQuantityKg.toLocaleString()} kg</td>
                    <td>
                      <span className="enterprise-tag enterprise-tag-emerald">{dem.minimumGrade}</span>
                    </td>
                    <td className="text-xs text-[var(--text-secondary)] font-mono">
                      {dem.deliveryWindowStart} - {dem.deliveryWindowEnd}
                    </td>
                    <td className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                      ₹{dem.maximumAcceptablePricePerKg.toFixed(2)}/kg
                    </td>
                    <td className="text-xs text-[var(--text-secondary)]">
                      &ge; {dem.minimumFreshnessShelfLifeDays} Days
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">{ratio}%</span>
                        <div className="w-16 bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[var(--accent-primary)] h-full"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate('/buyer/matching')}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--accent-subtle)] hover:bg-[var(--accent-border)] text-[var(--accent-primary)] text-[11px] font-semibold border border-[var(--accent-border)] transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run Match</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No active store demands configured.
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
