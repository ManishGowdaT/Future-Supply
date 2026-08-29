import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherShockModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { injectWeatherShock, riskEvents, resolveRiskEvent } = useApp();

  const [region, setRegion] = useState('Ramanagara');
  const [shockType, setShockType] = useState<'Heavy Rain' | 'Heatwave' | 'Pest Shock'>('Heavy Rain');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [impactPercent, setImpactPercent] = useState<number>(35);
  const [isInjecting, setIsInjecting] = useState(false);

  if (!isOpen) return null;

  const handleInject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);
    try {
      const title =
        shockType === 'Heavy Rain'
          ? 'Unseasonal Heavy Downpour & Waterlogging'
          : shockType === 'Heatwave'
          ? 'Severe 42°C Heatwave Spike'
          : 'Tuta Absoluta Pest Infestation';

      const desc =
        shockType === 'Heavy Rain'
          ? `Excess rainfall reported across ${region} horticulture belt. Potential harvest delay and localized root damage.`
          : `High ambient temperature accelerating field senescence in ${region}.`;

      await injectWeatherShock(region, severity, title, desc, Number(impactPercent));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInjecting(false);
    }
  };

  const activeEvents = riskEvents.filter(e => e.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--badge-amber-border)] rounded-lg w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--badge-amber-border)] bg-[var(--badge-amber-bg)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[var(--badge-amber-border)] text-[var(--badge-amber-text)]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-[var(--badge-amber-text)]">
                Agricultural Shock Simulator
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Simulate climate/pest disruptions to test automated replacement sourcing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleInject} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full enterprise-input"
              >
                <option value="Ramanagara">Ramanagara (Gowda Farms)</option>
                <option value="Kolar">Kolar (Murthy Agro)</option>
                <option value="Chikkaballapur">Chikkaballapur</option>
                <option value="Tumakuru">Tumakuru</option>
                <option value="Doddaballapura">Doddaballapura</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Shock Event</label>
              <select
                value={shockType}
                onChange={(e) => setShockType(e.target.value as any)}
                className="w-full enterprise-input"
              >
                <option value="Heavy Rain">Heavy Rainstorm / Waterlogging</option>
                <option value="Heatwave">Extreme Heatwave (Flower Drop)</option>
                <option value="Pest Shock">Pest Shock (Tuta Infestation)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Severity Tier</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full enterprise-input"
              >
                <option value="MEDIUM">Medium (15-25% Yield Deficit)</option>
                <option value="HIGH">High (30-45% Yield Shortfall)</option>
                <option value="CRITICAL">Critical (50%+ Crop Loss)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Impact Penalty (%)</label>
              <input
                type="number"
                min="10"
                max="80"
                value={impactPercent}
                onChange={(e) => setImpactPercent(parseInt(e.target.value) || 30)}
                className="w-full enterprise-input font-mono font-bold text-amber-600"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1 text-xs">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Event-Driven Domain Recalculation:</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Injecting this shock will trigger recalculation in <strong>{region}</strong>: Yield confidence decreases &rarr; Order fulfillment probability drops &rarr; Shortfall is flagged &rarr; Automated replacement engine allocates backup farms.
            </p>
          </div>

          {activeEvents.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Active Injected Shocks ({activeEvents.length})
              </span>
              {activeEvents.map(evt => (
                <div key={evt.id} className="p-2 rounded bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[var(--badge-rose-text)]">{evt.title} ({evt.affectedRegion})</span>
                    <span className="text-[10px] text-[var(--text-muted)] block">-{evt.estimatedImpactPercent}% impact</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => resolveRiskEvent(evt.id)}
                    className="px-2 py-0.5 rounded bg-[var(--badge-rose-border)] hover:opacity-80 text-[var(--badge-rose-text)] text-[10px] font-semibold cursor-pointer"
                  >
                    Clear Shock
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInjecting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[var(--badge-amber-text)] hover:opacity-90 text-white text-xs font-semibold shadow-xs transition-opacity cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isInjecting ? 'Injecting...' : '⚡ Inject Agricultural Shock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
