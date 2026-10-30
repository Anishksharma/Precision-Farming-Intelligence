import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0B0A' }}>
      <Sidebar />
      <TopBar />
      <main
        className="pt-14 min-h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? 64 : 260,
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

