import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CropType, GradeLevel } from '../../types';
import { X, ShoppingBag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDemandModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { stores, createDemandPosition } = useApp();

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

  if (!isOpen) return null;

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
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[var(--accent-primary)]" />
            <div>
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">Create Future Demand Position</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Store-level produce requirements for forward matching</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Destination Retail Hub</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Required Volume (kg)</label>
              <input
                type="number"
                step="100"
                min="500"
                max="50000"
                value={requiredQuantityKg}
                onChange={(e) => setRequiredQuantityKg(parseFloat(e.target.value) || 1000)}
                className="w-full enterprise-input font-mono font-bold text-[var(--accent-primary)]"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Preferred Variety / Spec</label>
              <input
                type="text"
                value={varietyPreferred}
                onChange={(e) => setVarietyPreferred(e.target.value)}
                className="w-full enterprise-input"
                placeholder="e.g. Saaho, Abhinav"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Delivery Slot</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={deliveryWindowStart}
                  onChange={(e) => setDeliveryWindowStart(e.target.value)}
                  className="w-1/2 enterprise-input font-mono text-[11px]"
                  placeholder="05:30"
                />
                <span className="text-[var(--text-muted)]">-</span>
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
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Max Budget (₹/kg)</label>
              <input
                type="number"
                step="0.5"
                value={maximumAcceptablePricePerKg}
                onChange={(e) => setMaximumAcceptablePricePerKg(parseFloat(e.target.value) || 30)}
                className="w-full enterprise-input font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Min Freshness (Days)</label>
              <input
                type="number"
                min="2"
                max="30"
                value={minimumFreshnessShelfLifeDays}
                onChange={(e) => setMinimumFreshnessShelfLifeDays(parseInt(e.target.value) || 4)}
                className="w-full enterprise-input font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Post Demand Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
