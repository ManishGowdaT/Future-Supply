import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role } from '../types';

export interface NavigationContextType {
  role: Role | 'SIMULATOR';
  setRole: (role: Role | 'SIMULATOR') => void;
  currentPath: string;
  navigate: (path: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Default starting path per role
const DEFAULT_ROLE_PATHS: Record<string, string> = {
  FARMER: '/farmer',
  BUYER_PROCUREMENT: '/buyer',
  QC_INSPECTOR: '/qc',
  PLATFORM_ADMIN: '/admin',
  SIMULATOR: '/simulator/weather'
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname && window.location.pathname !== '/'
      ? window.location.pathname
      : '/farmer';
  });

  const [role, setRoleState] = useState<Role | 'SIMULATOR'>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/buyer')) return 'BUYER_PROCUREMENT';
    if (path.startsWith('/qc')) return 'QC_INSPECTOR';
    if (path.startsWith('/admin')) return 'PLATFORM_ADMIN';
    if (path.startsWith('/simulator')) return 'SIMULATOR';
    return 'FARMER';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('futuresupply_sidebar_collapsed') === 'true';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('futuresupply_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const navigate = useCallback((path: string, entityId?: string) => {
    if (entityId) {
      setSelectedEntityId(entityId);
    }
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileSidebarOpen(false);

    // Synchronize active role with path
    if (path.startsWith('/farmer')) setRoleState('FARMER');
    else if (path.startsWith('/buyer')) setRoleState('BUYER_PROCUREMENT');
    else if (path.startsWith('/qc')) setRoleState('QC_INSPECTOR');
    else if (path.startsWith('/admin')) setRoleState('PLATFORM_ADMIN');
    else if (path.startsWith('/simulator')) setRoleState('SIMULATOR');
  }, []);

  const setRole = useCallback((newRole: Role | 'SIMULATOR') => {
    setRoleState(newRole);
    const targetPath = DEFAULT_ROLE_PATHS[newRole] || '/farmer';
    navigate(targetPath);
  }, [navigate]);

  // Handle browser back / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/farmer';
      setCurrentPath(path);
      if (path.startsWith('/farmer')) setRoleState('FARMER');
      else if (path.startsWith('/buyer')) setRoleState('BUYER_PROCUREMENT');
      else if (path.startsWith('/qc')) setRoleState('QC_INSPECTOR');
      else if (path.startsWith('/admin')) setRoleState('PLATFORM_ADMIN');
      else if (path.startsWith('/simulator')) setRoleState('SIMULATOR');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        role,
        setRole,
        currentPath,
        navigate,
        isSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        selectedEntityId,
        setSelectedEntityId
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
