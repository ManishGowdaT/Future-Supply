import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Sprout,
  PlusCircle,
  ShieldCheck,
  FileText,
  TrendingUp,
  MapPin,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  Zap,
  Truck,
  QrCode,
  Clock,
  Activity,
  Layers,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  Radio,
  Calendar,
  Search,
  Server
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'emerald' | 'amber' | 'rose' | 'neutral';
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    role,
    currentPath,
    navigate,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    closeMobileSidebar
  } = useNavigation();

  const {
    supplies,
    demands,
    commitments,
    batches,
    activeShortfallAlerts,
    riskEvents
  } = useApp();

  // Role-specific Navigation Groups
  const farmerNavGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Overview', path: '/farmer', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'FARM MANAGEMENT',
      items: [
        { label: 'My Future Crops', path: '/farmer/crops', icon: <Sprout className="w-4 h-4" />, badge: supplies.filter(s => s.farmerId === 'F-102' || s.farmerId === 'F-105').length },
        { label: 'Register Crop', path: '/farmer/crops/register', icon: <PlusCircle className="w-4 h-4" /> },
        { label: 'Farm Profile', path: '/farmer/profile', icon: <MapPin className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'COMMERCIAL',
      items: [
        { label: 'Commitments', path: '/farmer/commitments', icon: <FileText className="w-4 h-4" />, badge: commitments.filter(c => c.farmerId === 'F-102' || c.farmerId === 'F-105').length },
        { label: 'Buyer Demand', path: '/farmer/demand', icon: <ShoppingBag className="w-4 h-4" />, badge: demands.length, badgeVariant: 'emerald' }
      ]
    },
    {
      groupTitle: 'PERFORMANCE',
      items: [
        { label: 'Reliability', path: '/farmer/reliability', icon: <ShieldCheck className="w-4 h-4" />, badge: '91/100', badgeVariant: 'emerald' }
      ]
    }
  ];

  const buyerNavGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Overview', path: '/buyer', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'DEMAND',
      items: [
        { label: 'Demand Positions', path: '/buyer/demand', icon: <ShoppingBag className="w-4 h-4" />, badge: demands.length },
        { label: 'Create Demand', path: '/buyer/demand/create', icon: <PlusCircle className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'SUPPLY',
      items: [
        { label: 'Supply Network', path: '/buyer/supply', icon: <Sprout className="w-4 h-4" />, badge: supplies.length }
      ]
    },
    {
      groupTitle: 'DECISIONING',
      items: [
        { label: 'Match & Optimize', path: '/buyer/matching', icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
        { label: 'Risk Monitor', path: '/buyer/risks', icon: <Radio className="w-4 h-4" />, badge: riskEvents.filter(r => r.active).length > 0 ? riskEvents.filter(r => r.active).length : undefined, badgeVariant: 'amber' },
        { label: 'Shortfalls & Recovery', path: '/buyer/shortfalls', icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, badge: activeShortfallAlerts.length > 0 ? activeShortfallAlerts.length : undefined, badgeVariant: 'rose' }
      ]
    },
    {
      groupTitle: 'ORDERS',
      items: [
        { label: 'Commitments', path: '/buyer/commitments', icon: <FileText className="w-4 h-4" />, badge: commitments.length },
        { label: 'Deliveries', path: '/buyer/deliveries', icon: <Calendar className="w-4 h-4" /> }
      ]
    }
  ];

  const qcNavGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Overview', path: '/qc', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'QUALITY',
      items: [
        { label: 'Incoming Orders', path: '/qc/orders', icon: <ShoppingBag className="w-4 h-4" />, badge: commitments.length },
        { label: 'QC Inspection', path: '/qc/inspection', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Certified Batches', path: '/qc/batches', icon: <Layers className="w-4 h-4" />, badge: batches.length },
        { label: 'Traceability', path: '/qc/traceability', icon: <QrCode className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'LOGISTICS',
      items: [
        { label: 'Logistics Routes', path: '/qc/logistics', icon: <Truck className="w-4 h-4" /> },
        { label: 'Freshness Clock', path: '/qc/freshness', icon: <Clock className="w-4 h-4" /> }
      ]
    }
  ];

  const adminNavGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        { label: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'NETWORK',
      items: [
        { label: 'Network Matrix', path: '/admin/network', icon: <Activity className="w-4 h-4" /> }
      ]
    },
    {
      groupTitle: 'RISK & CONTROL',
      items: [
        { label: 'Risk & Anomalies', path: '/admin/anomalies', icon: <Radio className="w-4 h-4" />, badge: riskEvents.filter(r => r.active).length > 0 ? `${riskEvents.filter(r => r.active).length} Active` : undefined, badgeVariant: 'rose' },
        { label: 'Overcommitment Guard', path: '/admin/guardrails', icon: <Lock className="w-4 h-4 text-emerald-500" /> }
      ]
    },
    {
      groupTitle: 'GOVERNANCE',
      items: [
        { label: 'Audit Log', path: '/admin/audit', icon: <FileText className="w-4 h-4" /> },
        { label: 'System Health', path: '/admin/system', icon: <Server className="w-4 h-4" /> }
      ]
    }
  ];

  const simulatorNavGroups: NavGroup[] = [
    {
      groupTitle: 'SIMULATION',
      items: [
        { label: 'Weather Shock Simulator', path: '/simulator/weather', icon: <Zap className="w-4 h-4 text-amber-500" /> }
      ]
    }
  ];

  const currentGroups: NavGroup[] =
    role === 'FARMER' || role === 'FPO_ADMIN'
      ? farmerNavGroups
      : role === 'BUYER_PROCUREMENT' || role === 'BUYER'
      ? buyerNavGroups
      : role === 'QC_INSPECTOR' || role === 'LOGISTICS_OPERATOR'
      ? qcNavGroups
      : role === 'PLATFORM_ADMIN'
      ? adminNavGroups
      : simulatorNavGroups;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-hairline)] select-none">
      
      {/* Role Context Pill / Header inside Sidebar */}
      <div className="px-3.5 py-3 border-b border-[var(--border-hairline)] flex items-center justify-between">
        {!isSidebarCollapsed ? (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Active Workspace
            </span>
            <span className="text-xs font-bold text-[var(--accent-primary)] truncate block">
              {role === 'FARMER'
                ? 'Farmer / FPO Portal'
                : role === 'BUYER_PROCUREMENT'
                ? 'Buyer Procurement'
                : role === 'QC_INSPECTOR'
                ? 'QC & Logistics Hub'
                : role === 'PLATFORM_ADMIN'
                ? 'Admin Command Center'
                : 'Shock Simulator'}
            </span>
          </div>
        ) : (
          <div className="w-full flex justify-center text-[var(--accent-primary)]">
            <Activity className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 no-scrollbar">
        {currentGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {group.groupTitle}
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = currentPath === item.path || (item.path !== '/farmer' && item.path !== '/buyer' && item.path !== '/qc' && item.path !== '/admin' && currentPath.startsWith(item.path));

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-between'
                    } ${
                      isActive
                        ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-semibold border border-[var(--accent-border)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                          item.badgeVariant === 'emerald'
                            ? 'bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)]'
                            : item.badgeVariant === 'amber'
                            ? 'bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)]'
                            : item.badgeVariant === 'rose'
                            ? 'bg-[var(--badge-rose-bg)] text-[var(--badge-rose-text)]'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Shortcut in Footer */}
      <div className="p-2.5 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]">
        <button
          onClick={() => navigate('/simulator/weather')}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border border-[var(--badge-amber-border)] hover:opacity-90 transition-opacity cursor-pointer ${
            isSidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Agricultural Shock Simulator"
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          {!isSidebarCollapsed && <span>Shock Simulator</span>}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 sticky top-14 h-[calc(100vh-3.5rem)] z-30 ${
          isSidebarCollapsed ? 'w-16' : 'w-56 xl:w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobileSidebar}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[var(--bg-surface)] z-10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-hairline)]">
              <span className="font-semibold text-xs text-[var(--text-primary)]">Navigation Menu</span>
              <button
                onClick={closeMobileSidebar}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
