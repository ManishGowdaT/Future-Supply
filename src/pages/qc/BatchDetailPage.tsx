import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { ArrowLeft, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const BatchDetailPage: React.FC = () => {
  const { batches } = useApp();
  const { selectedEntityId, navigate } = useNavigation();

  const batch = batches.find(b => b.id === selectedEntityId) || batches[0];

  if (!batch) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No active batch selected. Go to <button onClick={() => navigate('/qc/batches')} className="text-[var(--accent-primary)] underline">Batches List</button>.
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'QC & Logistics Hub', path: '/qc' },
          { label: 'Certified Batches', path: '/qc/batches' },
          { label: `Batch #${batch.id}` }
        ]}
        title={`Certified Batch #${batch.id}`}
        description="Verify physical grading attributes, origin provenance metadata, and aggregation hub specs."
        actions={
          <button
            onClick={() => navigate('/qc/batches')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Batches</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns: QC Graded parameters */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Certified Graded Attributes ({batch.certifiedGrade})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between">
                <span>Diameter specification:</span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">62mm avg (Passed)</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between">
                <span>Defect / Damaged count:</span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">2.8% (Passed)</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between">
                <span>Penetrometer firmness:</span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">4.7 kg/cm² (Passed)</span>
              </div>
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between">
                <span>FSSAI Chemical scan:</span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">0% Residue (Passed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Provenance QR Tagger */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Traceability QR Tag Metadata</span>
            </h3>
            
            <div className="text-xs space-y-2 font-mono">
              <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[var(--text-muted)] block text-[10px]">ORIGIN:</span>
                {batch.farmerName} / {batch.farmLocation}
              </div>
              <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[var(--text-muted)] block text-[10px]">QC HUB:</span>
                Devanahalli Hub / Anil Deshmukh
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
