import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

export const WeatherShockSimulatorPage: React.FC = () => {
  const { injectWeatherShock, riskEvents, resolveRiskEvent, supplies, commitments } = useApp();

  const [region, setRegion] = useState('Ramanagara');
  const [shockType, setShockType] = useState<'Heavy Rain' | 'Heatwave' | 'Pest Shock'>('Heavy Rain');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [impactPercent, setImpactPercent] = useState<number>(35);
  const [isInjecting, setIsInjecting] = useState(false);

  const activeEvents = riskEvents.filter(e => e.active);

  // Compute before/after stats
  const totalSafeP10Kg = supplies.reduce((acc, s) => acc + s.yieldP10Kg, 0);
  const totalCommittedKg = commitments.reduce((acc, c) => acc + c.committedQuantityKg, 0);
  const currentReliableKg = commitments.reduce(
    (acc, c) => acc + Math.round(c.committedQuantityKg * (c.fulfillmentProbability / 100)),
    0
  );

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Simulation Engine' }, { label: 'Weather Shock Simulator' }]}
        title="Agricultural & Climate Shock Simulator"
        badge={
          <span className="enterprise-tag enterprise-tag-amber font-mono">
            Demo Simulator Mode
          </span>
        }
        description="Inject localized rainfall storms, extreme heatwaves, or pest shocks to test predictive shortfall and automated recovery cascade."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns: Simulator Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Simulated Shock Parameters</span>
            </h3>

            <form onSubmit={handleInject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Region Location</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full enterprise-input"
                  >
                    <option value="Ramanagara">Ramanagara (Gowda Farms)</option>
                    <option value="Kolar">Kolar (Murthy Farms)</option>
                    <option value="Chikkaballapur">Chikkaballapur</option>
                    <option value="Tumakuru">Tumakuru</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Shock Incident Event</label>
                  <select
                    value={shockType}
                    onChange={(e) => setShockType(e.target.value as any)}
                    className="w-full enterprise-input"
                  >
                    <option value="Heavy Rain">Heavy Rainstorm / Waterlogging</option>
                    <option value="Heatwave">Severe 42°C Heatwave (Flower Drop)</option>
                    <option value="Pest Shock">Pest Outbreak (Tuta Infestation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Severity tier</label>
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

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isInjecting}
                  className="flex items-center gap-1.5 px-4.5 py-2 rounded-md bg-[var(--badge-amber-text)] text-white hover:opacity-90 font-bold shadow-xs transition-opacity cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isInjecting ? 'Injecting shock...' : '⚡ Inject Agricultural Shock'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Injected Shocks list */}
          <div className="enterprise-panel p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
              Active Injected Shocks ({activeEvents.length})
            </h3>

            <div className="space-y-2">
              {activeEvents.map(evt => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-md bg-[var(--badge-rose-bg)] border border-[var(--badge-rose-border)] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-[var(--badge-rose-text)] block">{evt.title} ({evt.affectedRegion})</span>
                    <p className="text-[11px] text-[var(--text-secondary)]">{evt.description}</p>
                  </div>
                  <button
                    onClick={() => resolveRiskEvent(evt.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--badge-rose-border)] text-[var(--badge-rose-text)] hover:opacity-85 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Shock</span>
                  </button>
                </div>
              ))}
              {activeEvents.length === 0 && (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[var(--accent-primary)] mx-auto" />
                  <p className="font-semibold text-[var(--text-primary)]">All Regions Stable</p>
                  <p className="text-[11px]">No active climate shocks or disruptions injected in the workspace.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Cascade Details */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)]">
              Simulation Cascade Flow
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase">Network Reliable Volume</span>
                <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{currentReliableKg.toLocaleString()} kg</span>
              </div>

              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase">Risk State</span>
                <span className={`text-base font-extrabold font-mono ${activeEvents.length > 0 ? 'text-rose-600' : 'text-[var(--accent-primary)]'}`}>
                  {activeEvents.length > 0 ? 'HIGH RISK' : 'LOW RISK'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
