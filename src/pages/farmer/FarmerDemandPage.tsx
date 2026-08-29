import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, Sparkles } from 'lucide-react';

export const FarmerDemandPage: React.FC = () => {
  const { demands } = useApp();
  const [query, setQuery] = useState('');

  const filtered = demands.filter(
    d => d.buyerOrg.toLowerCase().includes(query.toLowerCase()) ||
         d.cropType.toLowerCase().includes(query.toLowerCase()) ||
         d.store.region.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Farmer Portal', path: '/farmer' }, { label: 'Buyer Demand' }]}
        title="Nearby Buyer Requirements"
        description="Explore active demand requirements from commercial grocery chains and fresh food hubs in Bengaluru."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Market Demand Opportunities ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search buyer, crop, or region..."
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
                <th>Buyer / Client</th>
                <th>Required Produce</th>
                <th>Volume Required</th>
                <th>Price Ceiling</th>
                <th>Store Location</th>
                <th>Harvest Window Slot</th>
                <th>Minimum Grade</th>
                <th>Freshness Threshold</th>
                <th>Match Potential</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dem => (
                <tr key={dem.id}>
                  <td className="font-semibold text-xs text-[var(--text-primary)]">
                    {dem.buyerOrg}
                  </td>
                  <td className="text-xs text-[var(--text-primary)] font-semibold">{dem.cropType}</td>
                  <td className="font-mono text-xs font-semibold">{dem.requiredQuantityKg.toLocaleString()} kg</td>
                  <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                    ₹{dem.maximumAcceptablePricePerKg.toFixed(2)}/kg
                  </td>
                  <td>
                    <div className="text-xs text-[var(--text-secondary)]">{dem.store.storeName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{dem.store.region} Hub</div>
                  </td>
                  <td className="text-xs text-[var(--text-secondary)]">
                    {dem.requirementStart} to {dem.requirementEnd}
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">{dem.minimumGrade}</span>
                  </td>
                  <td className="text-xs text-[var(--text-secondary)]">
                    &ge; {dem.minimumFreshnessShelfLifeDays} Days
                  </td>
                  <td>
                    <span className="text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      ~94% Match
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No active buyer demands found.
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
