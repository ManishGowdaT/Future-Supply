import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { ReliabilityScoreCard } from '../../components/farmer/ReliabilityScoreCard';

export const FarmerReliabilityPage: React.FC = () => {
  const { supplies } = useApp();

  // Primary Farmer supply position for Chennappa Gowda
  const supply = supplies.find(s => s.farmerId === 'F-102' || s.farmerId === 'F-105') || supplies[0];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Farmer Portal', path: '/farmer' }, { label: 'Reliability' }]}
        title="Supplier Reliability Scorecard"
        description="Verify your platform metrics, historical order accuracy calculations, and FPO tier standing."
      />

      {supply ? (
        <ReliabilityScoreCard reliability={supply.farmerReliability} />
      ) : (
        <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-md">
          No farmer reliability metrics available.
        </div>
      )}
    </div>
  );
};
