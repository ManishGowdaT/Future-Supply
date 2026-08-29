import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { GradeLevel } from '../../types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const QCInspectionPage: React.FC = () => {
  const { commitments, performQCInspection } = useApp();
  const { navigate } = useNavigation();

  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>(commitments[0]?.id || '');
  const [inspectorName, setInspectorName] = useState('Anil Deshmukh (Lic #QC-BLR-04)');
  const [inspectionCenter, setInspectionCenter] = useState('Devanahalli Agri-Aggregation Hub');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(900);
  const [gradeAQuantityKg, setGradeAQuantityKg] = useState<number>(765);
  const [gradeBQuantityKg, setGradeBQuantityKg] = useState<number>(115);
  const [processingQuantityKg, setProcessingQuantityKg] = useState<number>(20);
  const [rejectedQuantityKg, setRejectedQuantityKg] = useState<number>(0);
  const [overallGrade, setOverallGrade] = useState<GradeLevel>('Grade A');
  const [isInspecting, setIsInspecting] = useState(false);

  const activeCommitment = commitments.find(c => c.id === selectedCommitmentId) || commitments[0];

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommitment) return;
    setIsInspecting(true);
    try {
      await performQCInspection({
        commitmentId: activeCommitment.id,
        inspectorName,
        inspectionCenter,
        grossWeightKg: Number(grossWeightKg),
        gradeAQuantityKg: Number(gradeAQuantityKg),
        gradeBQuantityKg: Number(gradeBQuantityKg),
        processingQuantityKg: Number(processingQuantityKg),
        rejectedQuantityKg: Number(rejectedQuantityKg),
        overallGrade,
        items: [
          { attribute: 'Uniform Diameter (55-70mm)', measuredValue: '62mm avg', specRequirement: '≥ 80% in range', passed: true },
          { attribute: 'Color & Maturity Stage', measuredValue: 'Stage 4 (Pink/Light Red)', specRequirement: 'Stage 3-5', passed: true },
          { attribute: 'Defects / Skin Blemishes', measuredValue: '2.8%', specRequirement: '≤ 5%', passed: true },
          { attribute: 'Firmness Index', measuredValue: '4.7 kg/cm²', specRequirement: '≥ 4.0 kg/cm²', passed: true }
        ]
      });
      navigate('/qc/batches');
    } catch (err) {
      console.error(err);
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'QC & Logistics Hub', path: '/qc' }, { label: 'QC Inspection' }]}
        title="Physical batch grading terminal"
        description="Verify incoming farm dispatches against retail grade specifications and compliance criteria."
      />

      <div className="enterprise-panel p-5">
        <form onSubmit={handleInspect} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Select Incoming Forward Order</label>
              <select
                value={selectedCommitmentId}
                onChange={(e) => setSelectedCommitmentId(e.target.value)}
                className="w-full enterprise-input"
              >
                {commitments.map(comm => (
                  <option key={comm.id} value={comm.id}>
                    Order #{comm.id} — {comm.farmerName} ({comm.cropType} {comm.committedQuantityKg} kg)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Inspection Center Terminal</label>
              <input
                type="text"
                value={inspectionCenter}
                onChange={(e) => setInspectionCenter(e.target.value)}
                className="w-full enterprise-input"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Weighment Fractions Allocation (kg)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">Gross Weight</label>
                <input
                  type="number"
                  value={grossWeightKg}
                  onChange={(e) => setGrossWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full enterprise-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[var(--accent-primary)] mb-1">Grade A (Premium)</label>
                <input
                  type="number"
                  value={gradeAQuantityKg}
                  onChange={(e) => setGradeAQuantityKg(parseFloat(e.target.value) || 0)}
                  className="w-full enterprise-input font-mono font-semibold text-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-amber-600 mb-1">Grade B</label>
                <input
                  type="number"
                  value={gradeBQuantityKg}
                  onChange={(e) => setGradeBQuantityKg(parseFloat(e.target.value) || 0)}
                  className="w-full enterprise-input font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-rose-600 mb-1">Rejected</label>
                <input
                  type="number"
                  value={rejectedQuantityKg}
                  onChange={(e) => setRejectedQuantityKg(parseFloat(e.target.value) || 0)}
                  className="w-full enterprise-input font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Quality Parameter Scan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Diameter Range (55-70mm)', value: 'Passed', val: '62mm avg' },
                { label: 'Defects & Blemishes', value: 'Passed', val: '2.8% skin damage' },
                { label: 'Firmness Index', value: 'Passed', val: '4.7 kg/cm²' },
                { label: 'Chemical Residue Scan (Simulated)', value: 'Passed', val: '0% Residue' }
              ].map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                  <span className="text-[var(--accent-primary)] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isInspecting}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isInspecting ? 'Certifying Batch...' : 'Certify ProduceBatch & Issue QR Tag'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
