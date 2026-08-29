import React from 'react';
import { AppProvider } from './context/AppContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AppShell } from './components/layout/AppShell';

// Farmer Pages
import { FarmerOverviewPage } from './pages/farmer/FarmerOverviewPage';
import { MyFutureCropsPage } from './pages/farmer/MyFutureCropsPage';
import { CropDetailPage } from './pages/farmer/CropDetailPage';
import { CropRegistrationPage } from './pages/farmer/CropRegistrationPage';
import { FarmerCommitmentsPage } from './pages/farmer/FarmerCommitmentsPage';
import { FarmerCommitmentDetailPage } from './pages/farmer/FarmerCommitmentDetailPage';
import { FarmerDemandPage } from './pages/farmer/FarmerDemandPage';
import { FarmerReliabilityPage } from './pages/farmer/FarmerReliabilityPage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';

// Buyer Pages
import { BuyerOverviewPage } from './pages/buyer/BuyerOverviewPage';
import { DemandPositionsPage } from './pages/buyer/DemandPositionsPage';
import { DemandCreatePage } from './pages/buyer/DemandCreatePage';
import { SupplyNetworkPage } from './pages/buyer/SupplyNetworkPage';
import { MatchAndOptimizePage } from './pages/buyer/MatchAndOptimizePage';
import { MatchDetailPage } from './pages/buyer/MatchDetailPage';
import { BuyerCommitmentsPage } from './pages/buyer/BuyerCommitmentsPage';
import { BuyerCommitmentDetailPage } from './pages/buyer/BuyerCommitmentDetailPage';
import { RiskMonitorPage } from './pages/buyer/RiskMonitorPage';
import { ShortfallsRecoveryPage } from './pages/buyer/ShortfallsRecoveryPage';
import { DeliveriesPage } from './pages/buyer/DeliveriesPage';

// QC Pages
import { QCOverviewPage } from './pages/qc/QCOverviewPage';
import { IncomingOrdersPage } from './pages/qc/IncomingOrdersPage';
import { QCInspectionPage } from './pages/qc/QCInspectionPage';
import { CertifiedBatchesPage } from './pages/qc/CertifiedBatchesPage';
import { BatchDetailPage } from './pages/qc/BatchDetailPage';
import { TraceabilityPage } from './pages/qc/TraceabilityPage';
import { LogisticsPage } from './pages/qc/LogisticsPage';
import { FreshnessMonitorPage } from './pages/qc/FreshnessMonitorPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { NetworkPage } from './pages/admin/NetworkPage';
import { RiskAnomaliesPage } from './pages/admin/RiskAnomaliesPage';
import { OvercommitmentGuardPage } from './pages/admin/OvercommitmentGuardPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { SystemHealthPage } from './pages/admin/SystemHealthPage';

// Simulator Page
import { WeatherShockSimulatorPage } from './pages/simulation/WeatherShockSimulatorPage';

const MainWorkspaceRouter: React.FC = () => {
  const { currentPath } = useNavigation();

  // Basic client-side route matchers
  const renderRoute = () => {
    // 1. Farmer routes
    if (currentPath === '/farmer') return <FarmerOverviewPage />;
    if (currentPath === '/farmer/crops') return <MyFutureCropsPage />;
    if (currentPath === '/farmer/crops/register') return <CropRegistrationPage />;
    if (currentPath.startsWith('/farmer/crops/')) return <CropDetailPage />;
    if (currentPath === '/farmer/commitments') return <FarmerCommitmentsPage />;
    if (currentPath.startsWith('/farmer/commitments/')) return <FarmerCommitmentDetailPage />;
    if (currentPath === '/farmer/demand') return <FarmerDemandPage />;
    if (currentPath === '/farmer/reliability') return <FarmerReliabilityPage />;
    if (currentPath === '/farmer/profile') return <FarmerProfilePage />;

    // 2. Buyer routes
    if (currentPath === '/buyer') return <BuyerOverviewPage />;
    if (currentPath === '/buyer/demand') return <DemandPositionsPage />;
    if (currentPath === '/buyer/demand/create') return <DemandCreatePage />;
    if (currentPath === '/buyer/supply') return <SupplyNetworkPage />;
    if (currentPath === '/buyer/matching') return <MatchAndOptimizePage />;
    if (currentPath.startsWith('/buyer/matching/')) return <MatchDetailPage />;
    if (currentPath === '/buyer/commitments') return <BuyerCommitmentsPage />;
    if (currentPath.startsWith('/buyer/commitments/')) return <BuyerCommitmentDetailPage />;
    if (currentPath === '/buyer/risks') return <RiskMonitorPage />;
    if (currentPath === '/buyer/shortfalls') return <ShortfallsRecoveryPage />;
    if (currentPath === '/buyer/deliveries') return <DeliveriesPage />;

    // 3. QC routes
    if (currentPath === '/qc') return <QCOverviewPage />;
    if (currentPath === '/qc/orders') return <IncomingOrdersPage />;
    if (currentPath === '/qc/inspection') return <QCInspectionPage />;
    if (currentPath === '/qc/batches') return <CertifiedBatchesPage />;
    if (currentPath.startsWith('/qc/batches/')) return <BatchDetailPage />;
    if (currentPath === '/qc/traceability') return <TraceabilityPage />;
    if (currentPath === '/qc/logistics') return <LogisticsPage />;
    if (currentPath === '/qc/freshness') return <FreshnessMonitorPage />;

    // 4. Admin routes
    if (currentPath === '/admin') return <AdminOverviewPage />;
    if (currentPath === '/admin/network') return <NetworkPage />;
    if (currentPath === '/admin/anomalies') return <RiskAnomaliesPage />;
    if (currentPath === '/admin/guardrails') return <OvercommitmentGuardPage />;
    if (currentPath === '/admin/audit') return <AuditLogPage />;
    if (currentPath === '/admin/system') return <SystemHealthPage />;

    // 5. Simulator route
    if (currentPath === '/simulator/weather') return <WeatherShockSimulatorPage />;

    // Default Fallback
    return <FarmerOverviewPage />;
  };

  return <AppShell>{renderRoute()}</AppShell>;
};

export function App() {
  return (
    <AppProvider>
      <NavigationProvider>
        <MainWorkspaceRouter />
      </NavigationProvider>
    </AppProvider>
  );
}

export default App;
