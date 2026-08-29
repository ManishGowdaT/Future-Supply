import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';

export const MatchDetailPage: React.FC = () => {
  const { supplies } = useApp();
  const { selectedEntityId, navigate } = useNavigation();

  // Find target supply match details
  const sup = supplies.find(s => s.id === selectedEntityId) || supplies[0];

  if (!sup) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No active match listing details selected. Go to <button onClick={() => navigate('/buyer/matching')} className="text-[var(--accent-primary)] underline">Matching Workspace</button>.
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Buyer Procurement', path: '/buyer' },
          { label: 'Match & Optimize', path: '/buyer/matching' },
          { label: `Match Detail — ${sup.farmName}` }
        ]}
        title={`Match Candidate: ${sup.farmName}`}
        description="Detailed 7-factor matching score analysis breakdown and candidate farm attributes."
        actions={
          <button
            onClick={() => navigate('/buyer/matching')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Matches</span>
          </button>
        }
      />

      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>7-Factor Sourcing Algorithm Breakdown</span>
        </h3>

        <div className="space-y-3.5 text-xs text-[var(--text-secondary)]">
          <div className="p-3.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)]">Fulfillment Probability (30% weight)</span>
            <span className="font-mono font-bold text-[var(--accent-primary)]">28.8 / 30 pts</span>
          </div>

          <div className="p-3.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)]">Window Fit (20% weight)</span>
            <span className="font-mono font-bold text-[var(--accent-primary)]">19.6 / 20 pts</span>
          </div>

          <div className="p-3.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)]">Proximity (15% weight)</span>
            <span className="font-mono font-bold text-[var(--accent-primary)]">13.7 / 15 pts</span>
          </div>

          <div className="p-3.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)]">Quality (15% weight)</span>
            <span className="font-mono font-bold text-[var(--accent-primary)]">14.1 / 15 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
