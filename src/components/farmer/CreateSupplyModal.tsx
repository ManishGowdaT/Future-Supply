import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CropType } from '../../types';
import { X, Sprout, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { predictYield } from '../../engines/yieldPredictor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSupplyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createSupplyPosition } = useApp();

  const [step, setStep] = useState(1);
  const [cropType, setCropType] = useState<CropType>('Tomato');
  const [variety, setVariety] = useState('Hybrid Saaho 3251');
  const [acreage, setAcreage] = useState<number>(2.0);
  const [plantingDate, setPlantingDate] = useState('2026-07-25');
  const [irrigationType, setIrrigationType] = useState<'Drip' | 'Canal' | 'Rainfed' | 'Borewell Sprinkler'>('Drip');
  const [soilType, setSoilType] = useState<'Red Loam' | 'Black Soil' | 'Sandy Loam' | 'Clay Loam'>('Red Loam');
  const [region, setRegion] = useState('Ramanagara');
  const [subDistrict, setSubDistrict] = useState('Channapatna');
  const [askingPricePerKg, setAskingPricePerKg] = useState<number>(26.50);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const previewPrediction = predictYield({
    cropType,
    variety,
    acreage: Number(acreage) || 1,
    plantingDate,
    irrigationType,
    region,
    cropStage: 'SEEDLING'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSupplyPosition({
        cropType,
        variety,
        acreage: Number(acreage),
        plantingDate,
        irrigationType,
        soilType,
        region,
        subDistrict,
        askingPricePerKg: Number(askingPricePerKg),
        notes
      });
      onClose();
      setStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[var(--accent-primary)]" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">Register Future Supply Position</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Declare growing crop for forward matching</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Step Breadcrumb */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)] text-[11px]">
            <span className={`font-semibold ${step >= 1 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>1. Crop Details</span>
            <ArrowRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className={`font-semibold ${step >= 2 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>2. Farm & Irrigation</span>
            <ArrowRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className={`font-semibold ${step >= 3 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>3. Yield & Price</span>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Produce Category</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value as CropType)}
                    className="w-full enterprise-input"
                  >
                    <option value="Tomato">Tomato (Hybrid)</option>
                    <option value="Onion">Onion (Rabi/Kharif)</option>
                    <option value="Beans">French Beans</option>
                    <option value="Capsicum">Capsicum</option>
                    <option value="Potato">Potato</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Variety / Hybrid Strain</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full enterprise-input"
                    placeholder="e.g. Saaho 3251, Abhinav"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Sowing Date</label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full enterprise-input"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Cultivated Acreage</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={acreage}
                    onChange={(e) => setAcreage(parseFloat(e.target.value) || 1)}
                    className="w-full enterprise-input font-mono font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold transition-colors"
                >
                  Continue to Farm Details
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Irrigation System</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value as any)}
                    className="w-full enterprise-input"
                  >
                    <option value="Drip">Drip Irrigation (Automated)</option>
                    <option value="Borewell Sprinkler">Borewell Sprinkler</option>
                    <option value="Canal">Canal Surface</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Soil Composition</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full enterprise-input"
                  >
                    <option value="Red Loam">Red Loam</option>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clay Loam">Clay Loam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Region / Horticultural Hub</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full enterprise-input"
                  >
                    <option value="Ramanagara">Ramanagara (~54 km)</option>
                    <option value="Kolar">Kolar (~68 km)</option>
                    <option value="Chikkaballapur">Chikkaballapur (~58 km)</option>
                    <option value="Tumakuru">Tumakuru (~72 km)</option>
                    <option value="Doddaballapura">Doddaballapura (~44 km)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Taluk / Sub-District</label>
                  <input
                    type="text"
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    className="w-full enterprise-input"
                    placeholder="e.g. Channapatna"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold transition-colors"
                >
                  Preview Yield & Price
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {/* Yield Forecast */}
              <div className="p-3.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                    Predictive Yield Model ({previewPrediction.modelVersion})
                  </span>
                  <span className="enterprise-tag enterprise-tag-emerald font-mono text-[10px]">
                    Confidence: {Math.round(previewPrediction.predictionConfidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <span className="text-[9px] uppercase font-bold text-amber-600 block">P10 Safe Limit</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] font-mono">{previewPrediction.yieldP10Kg} kg</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--accent-primary)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--accent-primary)] block">P50 Expected</span>
                    <span className="text-sm font-bold text-[var(--accent-primary)] font-mono">{previewPrediction.yieldP50Kg} kg</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <span className="text-[9px] uppercase font-bold text-blue-600 block">P90 Ceiling</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] font-mono">{previewPrediction.yieldP90Kg} kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1">
                  <span>Harvest Window:</span>
                  <span className="font-semibold text-[var(--text-primary)] font-mono">
                    {previewPrediction.harvestWindowStart} → {previewPrediction.harvestWindowEnd}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Asking Price (₹ / kg)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={askingPricePerKg}
                    onChange={(e) => setAskingPricePerKg(parseFloat(e.target.value) || 20)}
                    className="w-full enterprise-input font-mono font-bold text-[var(--accent-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Notes / Farming Standards</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full enterprise-input"
                    placeholder="e.g. Mulched beds, GAP certified"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[11px] text-[var(--text-muted)] flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span>Overcommitment guardrail will safely bind commitments up to <strong>{previewPrediction.yieldP10Kg} kg (P10)</strong>.</span>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm & Publish Position'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
