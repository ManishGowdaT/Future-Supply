import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MapPin, Droplets, Landmark } from 'lucide-react';

export const FarmerProfilePage: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Farmer Portal', path: '/farmer' }, { label: 'Farm Profile' }]}
        title="Farm holdings profile"
        description="Verify your registered farm parcels, FPO membership standing, and irrigation metadata."
      />

      <div className="enterprise-panel p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-hairline)] pb-2">
          Land & Holdings Information
        </h3>

        <div className="space-y-3.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Registered Holdings Location</span>
              <span>Channapatna Taluk, Ramanagara Region, Karnataka State, India</span>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-[var(--border-hairline)] pt-3">
            <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">Irrigation Resources</span>
              <span>Central Borewell Sprinkler + Drip Fertigation system on main block</span>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-[var(--border-hairline)] pt-3">
            <Landmark className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-primary)] block">FPO Membership Standing</span>
              <span>Ramanagara Horticulture Producers Cooperative Society Ltd. (Registered grower)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
