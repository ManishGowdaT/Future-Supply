import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { CropType, GradeLevel } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

export const DemandCreatePage: React.FC = () => {
  const { stores, createDemandPosition } = useApp();
  const { navigate } = useNavigation();

  const [storeId, setStoreId] = useState(stores[0]?.storeId || 'STORE-BLR-01');
  const [cropType, setCropType] = useState<CropType>('Tomato');
  const [varietyPreferred, setVarietyPreferred] = useState('Hybrid Saaho / Abhinav');
  const [requiredQuantityKg, setRequiredQuantityKg] = useState<number>(3000);
  const [requirementStart, setRequirementStart] = useState('2026-09-10');
  const [requirementEnd, setRequirementEnd] = useState('2026-09-17');
  const [deliveryWindowStart, setDeliveryWindowStart] = useState('05:30');
  const [deliveryWindowEnd, setDeliveryWindowEnd] = useState('08:00');
  const [minimumGrade, setMinimumGrade] = useState<GradeLevel>('Grade A');
  const [maximumAcceptablePricePerKg, setMaximumAcceptablePricePerKg] = useState<number>(30.00);
  const [minimumFreshnessShelfLifeDays, setMinimumFreshnessShelfLifeDays] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDemandPosition({
        storeId,
        cropType,
        varietyPreferred,
        requiredQuantityKg: Number(requiredQuantityKg),
        requirementStart,
        requirementEnd,
        deliveryWindowStart,
        deliveryWindowEnd,
        minimumGrade,
        maximumAcceptablePricePerKg: Number(maximumAcceptablePricePerKg),
        minimumFreshnessShelfLifeDays: Number(minimumFreshnessShelfLifeDays)
      });
      navigate('/buyer/demand');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Buyer Procurement', path: '/buyer' },
          { label: 'Demand Positions', path: '/buyer/demand' },
          { label: 'Create Demand' }
        ]}
        title="Configure Outlet Demand Position"
        description="List daily fresh produce targets at store gates, specifying acceptable grade levels and cold chain limits."
        actions={
          <button
            onClick={() => navigate('/buyer/demand')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      <div className="enterprise-panel p-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Retail Outlet</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full enterprise-input"
              >
                {stores.map(st => (
                  <option key={st.storeId} value={st.storeId}>
                    {st.storeName} ({st.region})
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Quantity (kg)</label>
              <input
                type="number"
                step="100"
                value={requiredQuantityKg}
                onChange={(e) => setRequiredQuantityKg(parseFloat(e.target.value) || 1000)}
                className="w-full enterprise-input font-mono font-bold text-[var(--accent-primary)]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Variety Preference Spec</label>
              <input
                type="text"
                value={varietyPreferred}
                onChange={(e) => setVarietyPreferred(e.target.value)}
                className="w-full enterprise-input"
                placeholder="e.g. Saaho Hybrid"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Requirement Start Date</label>
              <input
                type="date"
                value={requirementStart}
                onChange={(e) => setRequirementStart(e.target.value)}
                className="w-full enterprise-input"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Requirement End Date</label>
              <input
                type="date"
                value={requirementEnd}
                onChange={(e) => setRequirementEnd(e.target.value)}
                className="w-full enterprise-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Delivery Slot</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={deliveryWindowStart}
                  onChange={(e) => setDeliveryWindowStart(e.target.value)}
                  className="w-1/2 enterprise-input font-mono text-[11px]"
                  placeholder="05:30"
                />
                <span>-</span>
                <input
                  type="text"
                  value={deliveryWindowEnd}
                  onChange={(e) => setDeliveryWindowEnd(e.target.value)}
                  className="w-1/2 enterprise-input font-mono text-[11px]"
                  placeholder="08:00"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Price Budget (₹/kg)</label>
              <input
                type="number"
                step="0.5"
                value={maximumAcceptablePricePerKg}
                onChange={(e) => setMaximumAcceptablePricePerKg(parseFloat(e.target.value) || 25)}
                className="w-full enterprise-input font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Min Freshness (Days)</label>
              <input
                type="number"
                min="2"
                value={minimumFreshnessShelfLifeDays}
                onChange={(e) => setMinimumFreshnessShelfLifeDays(parseInt(e.target.value) || 4)}
                className="w-full enterprise-input font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 gap-3">
            <button
              type="button"
              onClick={() => navigate('/buyer/demand')}
              className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Configure Demand'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
