import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Search } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [query, setQuery] = useState('');

  const filtered = auditLogs.filter(
    log => log.description.toLowerCase().includes(query.toLowerCase()) ||
           log.eventType.toLowerCase().includes(query.toLowerCase()) ||
           log.actorName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Command Center', path: '/admin' }, { label: 'Audit Log' }]}
        title="Operational Audit Event Log"
        description="Searchable timeline of immutable operational ledger logs. Exposes all key state transitions."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Audit Event Ledger ({filtered.length})
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search event, actor, or details..."
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
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Entity Target</th>
                <th>Actor Trigger</th>
                <th>Operational Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
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
                  <td className="text-xs text-[var(--text-secondary)] max-w-lg">
                    {log.description}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)]">
                    No operational audit logs indexed matching criteria.
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
