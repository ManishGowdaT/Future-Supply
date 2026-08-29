import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/layout/PageHeader';

export const NetworkPage: React.FC = () => {
  const { supplies, demands } = useApp();

  const regions = ['Ramanagara', 'Kolar', 'Tumakuru', 'Chikkaballapur'];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Admin Command Center', path: '/admin' }, { label: 'Network Matrix' }]}
        title="Supply & Demand Network Matrix"
        description="Verify macro regional supply listings, safe planning capacity bounds, and target store requirements."
      />

      <div className="enterprise-panel overflow-hidden">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Growers Listed</th>
              <th>Total P50 Yield</th>
              <th>Safe P10 Capacity</th>
              <th>Buyer Demands</th>
              <th>Security Ratio</th>
            </tr>
          </thead>
          <tbody>
            {regions.map(reg => {
              const regSupplies = supplies.filter(s => s.location.region === reg);
              const totalP50 = regSupplies.reduce((acc, s) => acc + s.yieldP50Kg, 0);
              const totalP10 = regSupplies.reduce((acc, s) => acc + s.yieldP10Kg, 0);

              return (
                <tr key={reg}>
                  <td className="font-semibold text-xs text-[var(--text-primary)]">{reg}</td>
                  <td className="font-mono text-xs">{regSupplies.length} Farms</td>
                  <td className="font-mono text-xs">{totalP50.toLocaleString()} kg</td>
                  <td className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                    {totalP10.toLocaleString()} kg
                  </td>
                  <td className="font-mono text-xs">
                    {demands.filter(d => d.store.region === reg).length} Demands
                  </td>
                  <td>
                    <span className="enterprise-tag enterprise-tag-emerald">Optimal</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
