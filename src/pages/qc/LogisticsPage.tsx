import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Truck, Clock, MapPin } from 'lucide-react';

export const LogisticsPage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub', path: '/qc' }, { label: 'Logistics Routes' }]}
        title="Aggregation & Route Logistics"
        description="Verify multi-farm aggregation dispatches, transit durations, and reefer coordinates."
      />

      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Active Transit Dispatch Route</span>
        </h3>

        <div className="space-y-3.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Aggregation Point</span>
              <span>Devanahalli Aggregation Hub Terminal A</span>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-[var(--border-hairline)] pt-3">
            <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Transit Duration & ETA</span>
              <span>2.5 hrs estimated transit • Expected gate arrival: 07:15 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
