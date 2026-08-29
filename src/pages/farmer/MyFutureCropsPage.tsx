import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, Plus, ArrowRight } from 'lucide-react';

export const MyFutureCropsPage: React.FC = () => {
  const { supplies } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');

  // Primary Farmer F-102 / F-105 supplies
  const farmerSupplies = supplies.filter(s => s.farmerId === 'F-102' || s.farmerId === 'F-105');

  const filtered = farmerSupplies.filter(
    s => s.cropType.toLowerCase().includes(query.toLowerCase()) ||
         s.variety.toLowerCase().includes(query.toLowerCase()) ||
         s.farmName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Farmer Portal', path: '/farmer' }, { label: 'My Future Crops' }]}
        title="My Registered Future Crops"
        description="Comprehensive list of registered parcels, soil types, expected yields, and committed capacity allocations."
        actions={
          <button
            onClick={() => navigate('/farmer/crops/register')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Future Crop</span>
          </button>
        }
      />

      {/* Main Table Panel */}
      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Active Farm Listings ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search crop, variety, or field..."
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
                <th>Crop & Variety</th>
                <th>Farm / Area</th>
                <th>P10 Safe Yield</th>
                <th>P50 Expected</th>
                <th>P90 Ceiling</th>
                <th>Committed</th>
                <th>Safe Available</th>
                <th>Asking Price</th>
                <th>Harvest Window</th>
                <th>Stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sup => (
                <tr
                  key={sup.id}
                  onClick={() => navigate(`/farmer/crops/${sup.id}`)}
                  className="hover:bg-[var(--table-row-hover)] cursor-pointer"
                >
                  <td className="font-semibold text-xs text-[var(--text-primary)]">
                    <div>{sup.cropType}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{sup.variety}</div>
                  </td>
                  <td>
                    <div className="text-xs text-[var(--text-secondary)]">{sup.farmName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{sup.acreage} Acres • {sup.soilType}</div>
                  </td>
                  <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                    {sup.yieldP10Kg.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs text-[var(--text-primary)]">
                    {sup.yieldP50Kg.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs text-[var(--text-muted)]">
                    {sup.yieldP90Kg.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs font-semibold">{sup.committedQuantityKg.toLocaleString()} kg</td>
                  <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                    {sup.safeAvailableCapacityKg.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    ₹{sup.askingPricePerKg.toFixed(2)}/kg
                  </td>
                  <td className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                    {sup.harvestWindowStart.slice(5)} → {sup.harvestWindowEnd.slice(5)}
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">{sup.cropStage}</span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/farmer/crops/${sup.id}`);
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
                  <td colSpan={11} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No matching registered supply positions found.
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
