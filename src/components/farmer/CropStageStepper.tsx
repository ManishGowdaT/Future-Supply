import React from 'react';
import { CropStage } from '../../types';
import { Check, Circle } from 'lucide-react';

const STAGES: { stage: CropStage; label: string; desc: string }[] = [
  { stage: 'SEEDLING', label: '1. Seedling', desc: 'Germination' },
  { stage: 'VEGETATIVE', label: '2. Vegetative', desc: 'Canopy growth' },
  { stage: 'FLOWERING', label: '3. Flowering', desc: 'Bud bloom' },
  { stage: 'FRUIT_FORMATION', label: '4. Fruit Set', desc: 'Pod formation' },
  { stage: 'MATURITY', label: '5. Maturity', desc: 'Color break' },
  { stage: 'HARVEST', label: '6. Harvest', desc: 'Field pick' }
];

interface Props {
  currentStage: CropStage;
  onUpdateStage: (stage: CropStage) => void;
  disabled?: boolean;
}

export const CropStageStepper: React.FC<Props> = ({ currentStage, onUpdateStage, disabled }) => {
  const currentIndex = STAGES.findIndex(s => s.stage === currentStage);

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {STAGES.map((s, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <button
              key={s.stage}
              type="button"
              disabled={disabled}
              onClick={() => onUpdateStage(s.stage)}
              className={`p-2.5 rounded-md border text-left transition-all ${
                disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
              } ${
                isCurrent
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]'
                  : isPassed
                  ? 'bg-[var(--bg-surface)] border-[var(--border-hairline)] hover:border-[var(--border-subtle)]'
                  : 'bg-[var(--bg-subtle)] border-[var(--border-hairline)] opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold tracking-tight ${
                  isCurrent
                    ? 'text-[var(--accent-primary)]'
                    : isPassed
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}>
                  {s.label}
                </span>

                {isPassed ? (
                  <span className="w-4 h-4 rounded-full bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                )}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
