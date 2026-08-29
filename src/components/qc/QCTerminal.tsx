import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, ForwardCommitment } from '../../types';
import { calculateFreshness } from '../../engines/freshnessCalculator';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Truck,
  QrCode,
  Clock,
  Camera,
  Layers,
  Sparkles,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const QCTerminal: React.FC = () => {
  const { commitments, batches, qcRecords, performQCInspection, confirmDeliveryAndSettle } = useApp();

  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>(
    commitments[0]?.id || ''
  );
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

  const freshnessPreview = calculateFreshness({
    cropType: activeCommitment?.cropType || 'Tomato',
    harvestTimestamp: new Date().toISOString(),
    pickupDepartureTime: new Date().toISOString(),
    transitHours: 2.5,
    temperatureControlled: true,
    ambientTempCelsius: 28
  }, 4);

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
          { attribute: 'Firmness Index', measuredValue: '4.7 kg/cm²', specRequirement: '≥ 4.0 kg/cm²', passed: true },
          { attribute: 'FSSAI Chemical Residue Scan', measuredValue: 'Clean / Passed', specRequirement: 'FSSAI 2026 standard', passed: true }
        ]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
            <span>Quality & Logistics</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span>Inspection Terminals</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className="text-[var(--text-primary)] font-medium">Devanahalli Agri-Aggregation Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              QC Inspection & Logistics Terminal
            </h1>
            <span className="enterprise-tag enterprise-tag-blue">
              FSSAI Lic #QC-BLR-04
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] px-3 py-1.5 rounded-md border border-[var(--border-hairline)]">
          <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>Cold Chain Clock: <strong className="text-[var(--text-primary)] font-mono">{freshnessPreview.estimatedRemainingShelfLifeDays} Days</strong> shelf life</span>
        </div>
      </div>

      {/* 2. Main Grid: Digital QC Terminal & Produce Batches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Inspection Console & Active Batches */}
        <div className="lg:col-span-2 space-y-5">
          
          <div className="enterprise-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Physical Batch Grading Console
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Commodity grading, weighment calibration, and digital certification
                </p>
              </div>
              <span className="enterprise-tag enterprise-tag-neutral text-[10px]">
                Standardized Sampling (25 kg Spec)
              </span>
            </div>

            <form onSubmit={handleInspect} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Select Incoming Forward Order</label>
                  <select
                    value={selectedCommitmentId}
                    onChange={(e) => setSelectedCommitmentId(e.target.value)}
                    className="w-full enterprise-input"
                  >
                    {commitments.map(comm => (
                      <option key={comm.id} value={comm.id}>
                        #{comm.id} — {comm.farmerName} ({comm.cropType} {comm.committedQuantityKg} kg)
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

              {/* Weight Fraction Calibration */}
              <div className="p-3.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Weighment Calibration & Fraction Allocation (kg)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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

              {/* Parameter Scan */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Commodity Quality Parameter Scan ({activeCommitment?.cropType || 'Tomato'})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Diameter (55-70mm)', value: '62mm avg', pass: true },
                    { label: 'Defects / Blemishes', value: '2.8% (Target < 5%)', pass: true },
                    { label: 'Penetrometer Firmness', value: '4.7 kg/cm² (Target > 4.0)', pass: true },
                    { label: 'FSSAI Chemical Scan', value: '0% Residue Detected', pass: true }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                      <span className="text-[var(--accent-primary)] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.value}
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

          {/* Certified Batches Table */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between bg-[var(--table-header-bg)]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Certified Produce Batches ({batches.length})
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Batches graded and ready for store gate aggregation & dispatch
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Farmer & Farm</th>
                    <th>Crop & Qty</th>
                    <th>Certified Grade</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(b => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                        #{b.id}
                      </td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">{b.farmerName}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{b.farmLocation}</div>
                      </td>
                      <td>
                        <span className="font-mono font-semibold text-xs">{b.actualHarvestedKg} kg</span>
                        <span className="text-[11px] text-[var(--text-muted)] ml-1">({b.cropType})</span>
                      </td>
                      <td>
                        <span className="enterprise-tag enterprise-tag-emerald">
                          {b.certifiedGrade || 'Grade A'}
                        </span>
                      </td>
                      <td>
                        <span className="enterprise-tag enterprise-tag-blue">
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => confirmDeliveryAndSettle(b.commitmentId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-[11px] font-semibold border border-[var(--border-subtle)] transition-colors cursor-pointer"
                        >
                          <Truck className="w-3 h-3 text-[var(--accent-primary)]" />
                          <span>Confirm Gate Settle</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Cold Chain Clock & Provenance */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Cold-Chain Freshness Clock
                </h3>
              </div>
              <span className="enterprise-tag enterprise-tag-emerald text-[10px]">
                {freshnessPreview.riskStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Remaining Shelf Life:</span>
                <span className="font-mono font-bold text-sm text-[var(--accent-primary)]">
                  {freshnessPreview.estimatedRemainingShelfLifeDays} Days
                </span>
              </div>
              <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-hairline)]">
                <div
                  className="bg-[var(--accent-primary)] h-full rounded-full"
                  style={{ width: `${freshnessPreview.freshnessScorePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Transit: 2.5 hrs • Temperature Controlled Reefer at 14°C • Meets buyer standard (&gt; 4 days).
              </p>
            </div>
          </div>

          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 pb-2 border-b border-[var(--border-hairline)]">
              <QrCode className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Full Batch Traceability Provenance</span>
            </h3>
            <div className="text-xs space-y-2 font-mono">
              <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[var(--text-muted)] block text-[10px]">SUPPLY ORIGIN:</span>
                F-102 (Chennappa Gowda) / Parcel B
              </div>
              <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[var(--text-muted)] block text-[10px]">QC CERTIFICATE:</span>
                QC-9901 / Lic #QC-BLR-04
              </div>
              <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[var(--text-muted)] block text-[10px]">BUYER DESTINATION:</span>
                FreshRoute Koramangala Hub #17
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
