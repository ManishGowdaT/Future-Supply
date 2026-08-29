import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { CropType } from '../../types';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, ChevronRight } from 'lucide-react';
import { predictYield } from '../../engines/yieldPredictor';

export const CropRegistrationPage: React.FC = () => {
  const { createSupplyPosition } = useApp();
  const { navigate } = useNavigation();

  const [step, setStep] = useState(1);
  const [cropType, setCropType] = useState<CropType>('Tomato');
  const [variety, setVariety] = useState('Saaho Hybrid');
  const [acreage, setAcreage] = useState<number>(2.0);
  const [plantingDate, setPlantingDate] = useState('2026-07-25');
  const [irrigationType, setIrrigationType] = useState<'Drip' | 'Canal' | 'Rainfed' | 'Borewell Sprinkler'>('Drip');
  const [soilType, setSoilType] = useState<'Red Loam' | 'Black Soil' | 'Sandy Loam' | 'Clay Loam'>('Red Loam');
  const [region, setRegion] = useState('Ramanagara');
  const [subDistrict, setSubDistrict] = useState('Channapatna');
  const [askingPricePerKg, setAskingPricePerKg] = useState<number>(28.50);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      navigate('/farmer/crops');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Farmer Portal', path: '/farmer' },
          { label: 'My Future Crops', path: '/farmer/crops' },
          { label: 'Register Crop' }
        ]}
        title="Register Future Crop listing"
        description="List a growing field crop to declare future harvest availability for commercial B2B buyer contracts."
        actions={
          <button
            onClick={() => navigate('/farmer/crops')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      {/* Progress Indicator */}
      <div className="flex items-center justify-between p-3.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs">
        {[
          { num: 1, label: 'Crop & Variety' },
          { num: 2, label: 'Farm & Acreage' },
          { num: 3, label: 'Planting & Sowing' },
          { num: 4, label: 'Yield Expectation' },
          { num: 5, label: 'Asking Pricing' }
        ].map((s, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= s.num
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-hairline)]'
              }`}
            >
              {s.num}
            </span>
            <span className={`hidden sm:inline font-semibold ${step >= s.num ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              {s.label}
            </span>
            {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Wizard Form Panels */}
      <div className="enterprise-panel p-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
                Step 1: Crop Classification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Produce Category</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value as CropType)}
                    className="w-full enterprise-input"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Beans">French Beans</option>
                    <option value="Capsicum">Capsicum</option>
                    <option value="Potato">Potato</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Hybrid Strain / Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full enterprise-input"
                    placeholder="e.g. Saaho Hybrid, Seminis"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
                Step 2: Farm Location & Size
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Field Acreage (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={acreage}
                    onChange={(e) => setAcreage(parseFloat(e.target.value) || 1)}
                    className="w-full enterprise-input font-mono font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Soil Type</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Horticulture Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full enterprise-input"
                  >
                    <option value="Ramanagara">Ramanagara</option>
                    <option value="Kolar">Kolar</option>
                    <option value="Tumakuru">Tumakuru</option>
                    <option value="Chikkaballapur">Chikkaballapur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Taluk / Sub-District</label>
                  <input
                    type="text"
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    className="w-full enterprise-input"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3">
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
                Step 3: Planting Date & Sowing Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full enterprise-input"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Irrigation System</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value as any)}
                    className="w-full enterprise-input"
                  >
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Canal">Canal</option>
                    <option value="Rainfed">Rainfed</option>
                    <option value="Borewell Sprinkler">Borewell Sprinkler</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
                Step 4: Yield Estimation (P10 / P50 / P90 Forecast)
              </h3>
              
              {/* Yield Forecast Panel */}
              <div className="p-4 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--accent-primary)] uppercase text-[10px] tracking-wider">
                    Predictive Model Yield Output
                  </span>
                  <span className="enterprise-tag enterprise-tag-emerald">
                    Confidence: {Math.round(previewPrediction.predictionConfidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <span className="text-[9px] uppercase font-bold text-amber-600 block">P10 Safe Bound</span>
                    <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{previewPrediction.yieldP10Kg.toLocaleString()} kg</span>
                  </div>

                  <div className="p-2.5 rounded bg-[var(--bg-surface)] border border-[var(--accent-primary)]">
                    <span className="text-[9px] uppercase font-bold text-[var(--accent-primary)] block">P50 Expected</span>
                    <span className="text-base font-extrabold text-[var(--accent-primary)] font-mono">{previewPrediction.yieldP50Kg.toLocaleString()} kg</span>
                  </div>

                  <div className="p-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                    <span className="text-[9px] uppercase font-bold text-blue-600 block">P90 Ceiling</span>
                    <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{previewPrediction.yieldP90Kg.toLocaleString()} kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Harvest Window Forecast:</span>
                  <span className="font-semibold text-[var(--text-primary)] font-mono">
                    {previewPrediction.harvestWindowStart} → {previewPrediction.harvestWindowEnd}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
                Step 5: Base Pricing & Remarks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Asking Price (₹ / kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={askingPricePerKg}
                    onChange={(e) => setAskingPricePerKg(parseFloat(e.target.value) || 20)}
                    className="w-full enterprise-input font-mono font-bold text-[var(--accent-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Operational Remarks</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full enterprise-input"
                    placeholder="e.g. Mulched beds, Drip system active"
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[11px] text-[var(--text-muted)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span>By registering, the system will apply the overcommitment guardrail: maximum commitments capped at P10 safe capacity ({previewPrediction.yieldP10Kg.toLocaleString()} kg).</span>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Register Crop Position'}</span>
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};
