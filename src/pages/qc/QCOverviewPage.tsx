import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { ShieldCheck, Truck, Clock, Layers, ArrowRight } from 'lucide-react';

export const QCOverviewPage: React.FC = () => {
  const { commitments, batches } = useApp();
  const { navigate } = useNavigation();

  const pendingQC = commitments.filter(c => c.status === 'HARVESTED' || c.status === 'QC_PENDING');
  const certifiedCount = batches.length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub' }, { label: 'Overview' }]}
        title="Quality Assurance Overview"
        badge={<span className="enterprise-tag enterprise-tag-blue">FSSAI Terminal</span>}
        description="Verify incoming harvests, conduct physical parameter grading, and generate certified ProduceBatch QR codes."
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Awaiting QC Inspection
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {pendingQC.length}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">Orders</span>
          </div>
          <button
            onClick={() => navigate('/qc/inspection')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>Launch grading terminal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Certified ProduceBatches
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--accent-primary)] font-mono">
              {certifiedCount}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">Batches</span>
          </div>
          <button
            onClick={() => navigate('/qc/batches')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View registry</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Cold Chain active Routes
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              2
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">Dispatches</span>
          </div>
          <button
            onClick={() => navigate('/qc/logistics')}
            className="text-[10px] text-[var(--accent-primary)] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            <span>View logistics planner</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="enterprise-kpi">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Hub Temperature (Simulated)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              14.2°C
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-2">Optimal reefer zone</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Inspection Callout */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Digital Collection Hub Inspection
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Grade incoming crop parcels against FSSAI and buyer parameters (diameter range, defects %, penetrometer firmness).
            </p>
            <button
              onClick={() => navigate('/qc/inspection')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Physical Grading Terminal</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
