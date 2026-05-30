import React, { useState } from 'react';
import { useTenant } from '../../core/context/tenant.context';
import { Shield, Key, RefreshCw, Cpu, Database } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { tenantId, userId, userRole, tenantName, updateSimSettings } = useTenant();
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({ tenantId, userId, userRole, tenantName });

  const [services, setServices] = useState([
    { name: 'API Gateway (Proxy)', port: '3000', status: 'Healthy', latency: '4ms' },
    { name: 'Identity Service', port: '3001', status: 'Healthy', latency: '12ms' },
    { name: 'Job Service', port: '3002', status: 'Healthy', latency: '8ms' },
    { name: 'Candidate Service', port: '3003', status: 'Healthy', latency: '15ms' },
    { name: 'Pipeline Service', port: '3004', status: 'Healthy', latency: '6ms' },
    { name: 'Document Service', port: '3005', status: 'Healthy', latency: '22ms' },
    { name: 'AI Reasoning Engine', port: '3006', status: 'Healthy', latency: '142ms' },
    { name: 'Communication Sync', port: '3007', status: 'Healthy', latency: '35ms' },
    { name: 'Audit Cryptography', port: '3008', status: 'Healthy', latency: '3ms' },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSimSettings(formData.tenantId, formData.userId, formData.userRole, formData.tenantName);
    setShowSettings(false);
  };

  const handleResetServices = () => {
    setServices(services.map(s => ({ ...s, latency: `${Math.floor(Math.random() * 20) + 4}ms` })));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem' }}>
            System Terminal
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Welcome back to the Aegis HR Dashboard. Acting as tenant <strong style={{ color: '#fff' }}>{tenantName}</strong>.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSettings(!showSettings)}>
          <Shield size={18} />
          Configure Tenant Simulation
        </button>
      </div>

      {/* Settings Modal Simulator */}
      {showSettings && (
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--color-indigo)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', color: '#fff' }}>Simulation Configuration</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group">
              <label className="metric-label">Tenant Name</label>
              <input type="text" className="form-control" value={formData.tenantName} onChange={e => setFormData({ ...formData, tenantName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="metric-label">Tenant ID</label>
              <input type="text" className="form-control" value={formData.tenantId} onChange={e => setFormData({ ...formData, tenantId: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="metric-label">User ID</label>
              <input type="text" className="form-control" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="metric-label">User Role</label>
              <select className="form-control" value={formData.userRole} onChange={e => setFormData({ ...formData, userRole: e.target.value })}>
                <option value="ADMIN">ADMIN</option>
                <option value="RECRUITER">RECRUITER</option>
                <option value="INTERVIEWER">INTERVIEWER</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Apply Settings</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="glass-panel metric-card">
          <span className="metric-label">Active Job Openings</span>
          <span className="metric-val">14</span>
          <span style={{ color: 'var(--color-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>+12% this week</span>
        </div>
        <div className="glass-panel metric-card">
          <span className="metric-label">Total Candidate Pools</span>
          <span className="metric-val">348</span>
          <span style={{ color: 'var(--color-violet)', fontSize: '0.8rem', fontWeight: 600 }}>52 Scanned by AI</span>
        </div>
        <div className="glass-panel metric-card">
          <span className="metric-label">AI Tokens Burned</span>
          <span className="metric-val">78.4K</span>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Limit: 1,000,000</span>
        </div>
        <div className="glass-panel metric-card">
          <span className="metric-label">Cumulative Cost Savings</span>
          <span className="metric-val">$1,240</span>
          <span style={{ color: 'var(--color-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>Avg $15.5 per vacancy</span>
        </div>
      </div>

      {/* Lower section: Monorepo Microservices Health Panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.4rem', color: '#fff' }}>
              Backend Microservices Registry
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Real-time cluster telemetry inside standard Docker Compose subnet.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleResetServices}>
            <RefreshCw size={14} />
            Refresh Telemetry
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {services.map((svc) => (
            <div key={svc.name} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-indigo)', padding: '0.5rem', borderRadius: '8px' }}>
                  {svc.name.includes('Gateway') ? <Key size={18} /> : svc.name.includes('AI') ? <Cpu size={18} /> : <Database size={18} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{svc.name}</h4>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Port {svc.port}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="column-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  {svc.status}
                </span>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem' }}>{svc.latency}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
