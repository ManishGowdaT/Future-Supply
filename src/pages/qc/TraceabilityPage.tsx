import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { QrCode, CheckCircle2 } from 'lucide-react';

export const TraceabilityPage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub', path: '/qc' }, { label: 'Traceability' }]}
        title="Interactive Provenance Traceability"
        description="Verify end-to-end provenance timeline from registered farm seed to store gate delivery."
      />

      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2 flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Farm-to-Store Provenance Timeline</span>
        </h3>

        {/* Provenance Steps */}
        <div className="space-y-4 text-xs">
          {[
            { step: '1. Supply Listing Registered', desc: 'Listing #SUP-F-102 registered by Chennappa Gowda in Ramanagara.', active: true },
            { step: '2. Sowing & Crop Growth', desc: 'Drip irrigated Saaho Tomato monitored through Seedling to Maturity stages.', active: true },
            { step: '3. QC Inspection & Certification', desc: 'Passed physical diameter, defect %, and chemical residue scans at Devanahalli Hub.', active: true },
            { step: '4. Batch QR Tag Generated', desc: 'ProduceBatch #PB-82931 certified and dispatched in reefer carrier.', active: true },
            { step: '5. Retail Outlet Delivery', desc: 'Gate receipt confirmed at FreshRoute Koramangala Hub #17.', active: true }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex gap-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[var(--text-primary)] block">{item.step}</span>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
