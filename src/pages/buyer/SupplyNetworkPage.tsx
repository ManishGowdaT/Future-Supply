import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search } from 'lucide-react';

export const SupplyNetworkPage: React.FC = () => {
  const { supplies } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const filtered = supplies.filter(
    s => (s.cropType.toLowerCase().includes(query.toLowerCase()) || s.farmName.toLowerCase().includes(query.toLowerCase())) &&
         (regionFilter === '' || s.location.region === regionFilter)
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Supply Network' }]}
        title="Supply Network Explorer"
        description="Discover available forward capacity listings across smallholders and horticultural belts in Karnataka."
      />

      {/* Filters Strip */}
      <div className="enterprise-panel-subtle p-3 flex flex-wrap gap-3 items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search crop or farm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md pl-7 pr-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-52"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="enterprise-input py-1"
          >
            <option value="">All Regions</option>
            <option value="Ramanagara">Ramanagara</option>
            <option value="Kolar">Kolar</option>
            <option value="Chikkaballapur">Chikkaballapur</option>
            <option value="Tumakuru">Tumakuru</option>
          </select>
        </div>

        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          Total: {filtered.length} listings available
        </span>
      </div>

      {/* Network listings Table */}
      <div className="enterprise-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Grower & Farm</th>
                <th>Crop Variety</th>
                <th>P10 Safe Capacity</th>
                <th>P50 Expected</th>
                <th>Asking Price</th>
                <th>Harvest Window</th>
                <th>Growth Stage</th>
                <th>Grower Reliability</th>
                <th>Region Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sup => (
                <tr key={sup.id}>
                  <td>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">
                      {sup.farmName}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">Grower: {sup.farmerName}</div>
                  </td>
                  <td>
                    <div className="text-xs text-[var(--text-primary)] font-semibold">{sup.cropType}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{sup.variety}</div>
                  </td>
                  <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                    {sup.yieldP10Kg.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                    {sup.yieldP50Kg.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                    ₹{sup.askingPricePerKg.toFixed(2)}/kg
                  </td>
                  <td className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    {sup.harvestWindowStart} to {sup.harvestWindowEnd}
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-neutral">{sup.cropStage}</span>
                  </td>
                  <td>
                    <span className="font-mono font-bold text-[var(--accent-primary)]">
                      {sup.farmerReliability.overallScore}/100
                    </span>
                  </td>
                  <td>
                    <div className="text-xs text-[var(--text-secondary)] font-semibold">{sup.location.region}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Distance: ~{sup.location.distanceKmToBangaloreCenter} km</div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No active supply listings discovered.
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
