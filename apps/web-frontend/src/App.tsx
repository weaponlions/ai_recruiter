import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { TenantProvider, useTenant } from './core/context/tenant.context';
import { DashboardView } from './views/Dashboard/DashboardView';
import { JobsView } from './views/Jobs/JobsView';
import { CandidatesView } from './views/Candidates/CandidatesView';
import { PipelineView } from './views/Pipeline/PipelineView';
import { LayoutGrid, Briefcase, Users, GitMerge, Shield, User } from 'lucide-react';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { tenantName, userRole } = useTenant();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { path: '/jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { path: '/candidates', label: 'Candidates', icon: <Users size={18} /> },
    { path: '/pipeline', label: 'Pipeline', icon: <GitMerge size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand-title">
            <span>⚡</span> Aegis HR AI
          </h1>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path} className={`menu-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            <Shield size={14} style={{ color: 'var(--color-indigo)' }} />
            <span>Multi-Tenant Sandbox</span>
          </div>
        </div>
      </aside>

      {/* Main Core Area */}
      <main className="main-content">
        {/* Topbar Info Grid */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Active Workspace:</span>
            <span className="column-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#fff', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              🏢 {tenantName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <User size={14} style={{ color: 'var(--color-cyan)' }} />
              <span style={{ color: '#94a3b8' }}>Role:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{userRole}</span>
            </div>
            <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--color-emerald)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-emerald)' }}></span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Gateway Online</span>
            </div>
          </div>
        </header>

        {/* Viewport content */}
        <div className="content-viewport">
          <Routes>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/jobs" element={<JobsView />} />
            <Route path="/candidates" element={<CandidatesView />} />
            <Route path="/pipeline" element={<PipelineView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TenantProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TenantProvider>
  );
};
