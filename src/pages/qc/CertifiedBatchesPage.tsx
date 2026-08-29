import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search, ArrowRight } from 'lucide-react';

export const CertifiedBatchesPage: React.FC = () => {
  const { batches } = useApp();
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');

  const filtered = batches.filter(
    b => b.farmerName.toLowerCase().includes(query.toLowerCase()) ||
         b.cropType.toLowerCase().includes(query.toLowerCase()) ||
         b.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub', path: '/qc' }, { label: 'Certified Batches' }]}
        title="Certified Produce Batches"
        description="Verify physical grading metrics and dispatch batch status for the aggregation hubs."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Certified Batches registry ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search batch or supplier..."
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
                <th>Batch ID</th>
                <th>Grower / Farm</th>
                <th>Category</th>
                <th>Actual Weight</th>
                <th>Certified Grade</th>
                <th>Logistics Status</th>
                <th>QR Provenance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr
                  key={b.id}
                  onClick={() => navigate(`/qc/batches/${b.id}`)}
                  className="hover:bg-[var(--table-row-hover)] cursor-pointer"
                >
                  <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                    #{b.id}
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{b.farmerName}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{b.farmLocation}</div>
                  </td>
                  <td className="text-xs text-[var(--text-primary)] font-semibold">{b.cropType}</td>
                  <td className="font-mono text-xs font-semibold">{b.actualHarvestedKg.toLocaleString()} kg</td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">{b.certifiedGrade}</span>
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-blue">{b.status}</span>
                  </td>
                  <td>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">QR-FS-82931</span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/qc/batches/${b.id}`);
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
                  <td colSpan={8} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No certified produce batches registered.
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
