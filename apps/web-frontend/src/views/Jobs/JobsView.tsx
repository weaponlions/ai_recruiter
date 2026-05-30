import React, { useState, useEffect } from 'react';
import { mockDb, api } from '../../core/api';
import { MapPin, Eye, Plus } from 'lucide-react';

export const JobsView: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    type: 'FULL_TIME',
    description: '',
    requirements: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.data && Array.isArray(res.data)) {
          setJobs(res.data);
          setIsLive(true);
        } else {
          setJobs(mockDb.jobs);
        }
      } catch (err) {
        console.warn('Gateway connection error, falling back to mock sandbox data:', err);
        setJobs(mockDb.jobs);
        setIsLive(false);
      }
    };
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title) return;

    const jobToAdd = {
      title: newJob.title,
      location: newJob.location || 'Remote',
      type: newJob.type,
      description: newJob.description || 'No description provided.',
    };

    if (isLive) {
      try {
        const res = await api.post('/jobs', jobToAdd);
        setJobs([res.data, ...jobs]);
      } catch (err) {
        console.error('Failed to create job on backend, adding to local sandbox:', err);
        setJobs([{ id: `job-${Date.now()}`, ...jobToAdd, status: 'DRAFT', createdBy: 'admin', applicants: 0 }, ...jobs]);
      }
    } else {
      setJobs([{ id: `job-${Date.now()}`, ...jobToAdd, status: 'DRAFT', createdBy: 'admin', applicants: 0 }, ...jobs]);
    }

    setIsCreating(false);
    setNewJob({ title: '', location: '', type: 'FULL_TIME', description: '', requirements: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Job Postings & Pipelines
            <span className="column-badge" style={{ background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: isLive ? 'var(--color-emerald)' : 'var(--color-indigo)', border: isLive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem' }}>
              {isLive ? '● Live EC2 Connection' : '⚡ Local Simulated Sandbox'}
            </span>
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Create vacancies, deploy to external job-boards, and select parsed template structures.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
          <Plus size={18} />
          Publish New Vacancy
        </button>
      </div>

      {/* Wizard Form */}
      {isCreating && (
        <form onSubmit={handleCreateJob} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.2rem' }}>Create Job Requisition</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="metric-label">Job Title</label>
              <input type="text" placeholder="e.g. Senior Machine Learning Engineer" className="form-control" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="metric-label">Location / Setting</label>
              <input type="text" placeholder="e.g. San Francisco (Hybrid)" className="form-control" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="metric-label">Employment Type</label>
              <select className="form-control" value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label className="metric-label">Templates Integration</label>
              <select className="form-control">
                <option value="">(None - Custom Structure)</option>
                <option value="temp-ai">Standard AI/ML Template</option>
                <option value="temp-product">Product & UI Design Template</option>
                <option value="temp-dev">Backend Engineering Template</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="metric-label">Job Outline & AI Context</label>
            <textarea placeholder="Describe the key responsibilities..." rows={4} className="form-control" style={{ resize: 'vertical' }} value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Save as Draft</button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {jobs.map((job) => (
          <div key={job.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="column-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-indigo)', textTransform: 'capitalize' }}>
                  {job.type.replace('_', ' ')}
                </span>
                <span className="column-badge" style={{ background: job.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: job.status === 'PUBLISHED' ? 'var(--color-emerald)' : 'var(--color-amber)', border: job.status === 'PUBLISHED' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)' }}>
                  {job.status}
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{job.title}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <MapPin size={14} />
                <span>{job.location}</span>
              </div>
              
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.4 }}>
                {job.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                <strong>{job.applicants}</strong> active applicants
              </span>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Eye size={12} />
                View Candidates
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
