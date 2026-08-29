import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { AutoReplacementDrawer } from '../../components/risk/AutoReplacementDrawer';
import { AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export const ShortfallsRecoveryPage: React.FC = () => {
  const { activeShortfallAlerts } = useApp();
  const { navigate } = useNavigation();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const activeAlert = activeShortfallAlerts.find(a => a.commitmentId === selectedEntityId) || activeShortfallAlerts[0];
  const [inspectingAlert, setInspectingAlert] = useState<typeof activeAlert | null>(null);

  var selectedEntityId = selectedAlertId;

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Buyer Procurement', path: '/buyer' }, { label: 'Shortfalls & Recovery' }]}
        title="Projected Shortfalls & Recovery"
        description="Verify confidence-adjusted supply deficits caused by climatic events and launch automated replacement sourcing plans."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns: Active Shortfalls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Active Sourcing Shortfall Alerts ({activeShortfallAlerts.length})
              </h3>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              {activeShortfallAlerts.map(alert => (
                <div
                  key={alert.commitmentId}
                  onClick={() => setInspectingAlert(alert)}
                  className="p-4 hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">Order #{alert.orderNumber}</span>
                      <span className="enterprise-tag enterprise-tag-rose">
                        Deficit: {alert.projectedShortfallKg} kg
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Buyer: {alert.buyerName} • Store: {alert.storeName} • Crop: {alert.cropType} • Drop: {alert.currentFulfillmentProb}% certainty.
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingAlert(alert);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--badge-rose-text)] text-white hover:opacity-90 font-semibold text-[11px] cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Recover 1-Click</span>
                  </button>
                </div>
              ))}

              {activeShortfallAlerts.length === 0 && (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[var(--accent-primary)] mx-auto" />
                  <p className="font-semibold text-[var(--text-primary)]">All Store Demands Fully Covered</p>
                  <p className="text-[11px]">No deficits or shortages detected across the Bengaluru retail supply network.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Platform SLA */}
        <div className="space-y-5">
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)] flex items-center gap-1.5">
              <span>Sourcing SLA Guarantee</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              FutureSupply automatically locks uncommitted P10 safe capacity bounds at unaffected grower holdings nearby, ensuring retail fulfillment levels stay above &gt;95%.
            </p>
          </div>
        </div>

      </div>

      <AutoReplacementDrawer
        alert={inspectingAlert}
        onClose={() => setInspectingAlert(null)}
      />
    </div>
  );
};
