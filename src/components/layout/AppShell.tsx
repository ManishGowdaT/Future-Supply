import React from 'react';
import { Header } from '../common/Header';
import { Sidebar } from './Sidebar';
import { useNavigation } from '../../context/NavigationContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isSidebarCollapsed } = useNavigation();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      {/* Top Global Header */}
      <Header />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 relative min-h-0">
        
        {/* Persistent Collapsible Sidebar */}
        <Sidebar />

        {/* Workspace content region */}
        <main
          className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto"
        >
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
