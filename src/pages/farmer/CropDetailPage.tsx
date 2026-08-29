import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { CropStageStepper } from '../../components/farmer/CropStageStepper';
import {
  Sprout,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const CropDetailPage: React.FC = () => {
  const { supplies, updateCropStage, commitments, auditLogs } = useApp();
  const { selectedEntityId, navigate } = useNavigation();

  // Find target supply listing
  const supply = supplies.find(s => s.id === selectedEntityId) || supplies[0];

  if (!supply) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No active supply listing selected. Go to <button onClick={() => navigate('/farmer/crops')} className="text-[var(--accent-primary)] underline">Crops List</button> to select one.
      </div>
    );
  }

  // Active commitments for this supply listing
  const supplyCommitments = commitments.filter(
    c => c.farmerId === supply.farmerId && c.cropType === supply.cropType
  );

  // Relevant Audit Events for this crop position
  const supplyAudits = auditLogs.filter(
    log => log.entityId === supply.id && log.entityType === 'SUPPLY'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Farmer Portal', path: '/farmer' },
          { label: 'My Future Crops', path: '/farmer/crops' },
          { label: `${supply.cropType} — ${supply.variety}` }
        ]}
        title={`${supply.cropType} Lifecycle Detail`}
        badge={
          <span className="enterprise-tag enterprise-tag-blue font-mono">
            Listing #{supply.id}
          </span>
        }
        description="Monitor field advancing stages, inspect yields probabilistic distribution parameters, and track linked forward orders."
        actions={
          <button
            onClick={() => navigate('/farmer/crops')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Crops</span>
          </button>
        }
      />

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Columns: Stage Monitor & Details */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Stepper Monitor */}
          <div className="enterprise-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Live Crop Phenological Monitor
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Click timeline stages to record field advancement in real-time
                </p>
              </div>
              <span className="enterprise-tag enterprise-tag-emerald font-mono">
                Model Confidence: {Math.round(supply.predictionConfidence * 100)}%
              </span>
            </div>

            <CropStageStepper
              currentStage={supply.cropStage}
              onUpdateStage={(stage) => updateCropStage(supply.id, stage)}
            />
          </div>

          {/* Core Parameters Specifications */}
          <div className="enterprise-panel p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)]">
              Field Parameter Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Cultivated Area</span>
                <span className="font-bold text-sm text-[var(--text-primary)]">{supply.acreage} Acres</span>
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{supply.soilType} Soil</span>
              </div>

              <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Irrigation System</span>
                <span className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  {supply.irrigationType}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Automated Drip flow</span>
              </div>

              <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Asking Price</span>
                <span className="font-bold text-sm text-[var(--text-primary)]">₹{supply.askingPricePerKg.toFixed(2)}/kg</span>
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Base price ceiling</span>
              </div>

              <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">Expected Window</span>
                <span className="font-semibold text-xs text-[var(--text-primary)] block mt-0.5 whitespace-nowrap">
                  {supply.harvestWindowStart}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">To {supply.harvestWindowEnd}</span>
              </div>
            </div>
          </div>

          {/* Crop Audit Log */}
          <div className="enterprise-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-hairline)] bg-[var(--table-header-bg)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Listing Change Event Trail
              </h3>
            </div>
            
            <div className="divide-y divide-[var(--border-hairline)]">
              {supplyAudits.map(log => (
                <div key={log.id} className="p-3 hover:bg-[var(--table-row-hover)] text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[var(--text-primary)]">{log.eventType}</span>
                    <p className="text-[11px] text-[var(--text-muted)]">{log.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {supplyAudits.length === 0 && (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                  No listing modification history generated yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Yield Forecast Curves & Commitments */}
        <div className="space-y-5">
          
          {/* Yield Forecast Curves */}
          <div className="enterprise-panel p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)]">
              Yield Forecast Intervals
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[9px] uppercase font-bold text-amber-600 block">P10 Safe planning capacity</span>
                <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{supply.yieldP10Kg.toLocaleString()} kg</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Safe planning boundary; commitments strictly guarded by this ceiling.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[9px] uppercase font-bold text-[var(--accent-primary)] block">P50 Expected yield</span>
                <span className="text-base font-extrabold text-[var(--accent-primary)] font-mono">{supply.yieldP50Kg.toLocaleString()} kg</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Probabilistic median curve forecast.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
                <span className="text-[9px] uppercase font-bold text-blue-600 block">P90 Optimistic ceiling</span>
                <span className="text-base font-extrabold text-[var(--text-primary)] font-mono">{supply.yieldP90Kg.toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          {/* Linked Forward Contracts */}
          <div className="enterprise-panel p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-hairline)] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Forward Commitments ({supplyCommitments.length})</span>
            </h3>

            <div className="space-y-2">
              {supplyCommitments.map(comm => (
                <div
                  key={comm.id}
                  onClick={() => navigate(`/farmer/commitments/${comm.id}`)}
                  className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)]">#{comm.id}</span>
                    <span className="enterprise-tag enterprise-tag-emerald">{comm.status}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Allocated: <strong>{comm.committedQuantityKg} kg</strong> to {comm.buyerOrg}.
                  </p>
                </div>
              ))}
              {supplyCommitments.length === 0 && (
                <p className="text-center py-4 text-xs text-[var(--text-muted)]">
                  No buyer commitments locked yet.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
