import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../context/NavigationContext';
import { Role } from '../../types';
import {
  Sprout,
  ShoppingBag,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  Zap,
  Sun,
  Moon,
  Menu,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme, activeShortfallAlerts, resetToSeed } = useApp();
  const { role, setRole, navigate, toggleMobileSidebar } = useNavigation();

  const roleOptions: { role: Role | 'SIMULATOR'; label: string; icon: React.ReactNode }[] = [
    { role: 'FARMER', label: 'Farmer / FPO Portal', icon: <Sprout className="w-3.5 h-3.5" /> },
    { role: 'BUYER_PROCUREMENT', label: 'Buyer Procurement Center', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { role: 'QC_INSPECTOR', label: 'QC & Logistics Hub', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { role: 'PLATFORM_ADMIN', label: 'Admin Command Center', icon: <Activity className="w-3.5 h-3.5" /> },
    { role: 'SIMULATOR', label: 'Shock Simulator', icon: <Zap className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full flex items-center justify-between h-14 gap-4">
        
        {/* Left: Mobile Toggle + Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-md lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/farmer')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">
                Future<span className="text-[var(--accent-primary)]">Supply</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-hairline)] hidden sm:inline-block">
                B2B Predictive
              </span>
            </div>
          </button>
        </div>

        {/* Center: Role Workspace Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="appearance-none bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-hairline)] rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            >
              {roleOptions.map(opt => (
                <option key={opt.role} value={opt.role}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right Tools: Shortfall Alert, Shock Sim, Theme Toggle, Seed Reset, User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Active Shortfall Pill */}
          {activeShortfallAlerts.length > 0 && (
            <button
              onClick={() => navigate('/buyer/shortfalls')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--badge-rose-bg)] text-[var(--badge-rose-text)] border border-[var(--badge-rose-border)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>{activeShortfallAlerts.length} Shortfall</span>
            </button>
          )}

          {/* Shock Simulator Action */}
          <button
            onClick={() => navigate('/simulator/weather')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border border-[var(--badge-amber-border)] hover:opacity-90 transition-opacity cursor-pointer"
            title="Climate / Pest Risk Simulator"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simulator</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-hairline)] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Reset Seed Data */}
          <button
            onClick={resetToSeed}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-hairline)] transition-colors hidden sm:block cursor-pointer"
            title="Reset to Bengaluru Seed Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-hairline)] text-xs">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] flex items-center justify-center font-bold text-xs">
              CG
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-semibold text-xs text-[var(--text-primary)] leading-tight">Chennappa Gowda</div>
              <div className="text-[10px] text-[var(--text-muted)] leading-tight">Ramanagara Hub</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
