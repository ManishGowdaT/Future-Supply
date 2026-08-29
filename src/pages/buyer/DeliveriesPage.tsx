import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Clock, MapPin, Truck } from 'lucide-react';

export const DeliveriesPage: React.FC = () => {
  const { commitments } = useApp();

  const activeDeliveries = commitments.filter(
    c => c.status === 'QC_APPROVED' || c.status === 'DISPATCHED' || c.status === 'DELIVERED'
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Store Deliveries' }]}
        title="Store Delivery Schedules"
        description="Verify daily gate arrival slots, dispatch transit routes, and cold-chain temperature readings."
      />

      <div className="enterprise-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Incoming dispatch queue ({activeDeliveries.length})
          </h2>
        </div>

        <div className="divide-y divide-[var(--border-hairline)]">
          {activeDeliveries.map(comm => (
            <div key={comm.id} className="p-4 hover:bg-[var(--table-row-hover)] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">Order #{comm.id}</span>
                  <span className="enterprise-tag enterprise-tag-blue">
                    {comm.status}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Carrier: <strong>FreshRoute Logistics</strong> • {comm.committedQuantityKg} kg {comm.cropType} to {comm.destinationStore.storeName}.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  ETA: 07:15 AM
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  Devanahalli aggregation
                </span>
              </div>
            </div>
          ))}

          {activeDeliveries.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] space-y-2">
              <Truck className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <p className="font-semibold text-[var(--text-primary)]">No Deliveries in Transit</p>
              <p className="text-[11px]">Advance crop stages to harvest and complete QC inspection to trigger logistics dispatches.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
