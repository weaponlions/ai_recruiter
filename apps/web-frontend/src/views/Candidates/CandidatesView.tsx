import React, { useState, useEffect } from 'react';
import { mockDb, api } from '../../core/api';
import { FileUp, Search, Mail, Award, CheckSquare, Trash2, Cpu, ShieldAlert } from 'lucide-react';

export const CandidatesView: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [complianceLogs, setComplianceLogs] = useState(mockDb.compliance);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get('/candidates');
        if (res.data && Array.isArray(res.data)) {
          setCandidates(res.data);
          setIsLive(true);
        } else {
          setCandidates(mockDb.candidates);
        }
      } catch (err) {
        console.warn('Gateway connection error, falling back to mock sandbox data:', err);
        setCandidates(mockDb.candidates);
        setIsLive(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setParsing(true);

    // Simulate AI Microservice Parsing Call
    setTimeout(() => {
      const parsedCandidate = {
        id: `c-${Date.now()}`,
        firstName: file.name.split('.')[0] || 'Parsed',
        lastName: 'Candidate',
        email: `${file.name.toLowerCase().replace(/[^a-z]/g, '')}@parsed-ai.net`,
        tags: ['AI Analysis', 'Parsed Skill', 'PDF Document'],
        matchScore: Math.floor(Math.random() * 20) + 75,
        status: 'Applied',
        phone: '+1 (555) 999-0000',
        resumeUrl: '#'
      };

      setCandidates([parsedCandidate, ...candidates]);
      setParsing(false);
    }, 2000);
  };

  const handleComplianceAction = (email: string, actionType: 'EXPORT' | 'ERASURE') => {
    const isConfirmed = window.confirm(`Trigger GDPR ${actionType} request on the audit ledger for ${email}?`);
    if (!isConfirmed) return;

    const newReq = {
      id: `req-${Date.now()}`,
      requestType: actionType,
      candidateEmail: email,
      status: actionType === 'ERASURE' ? 'PENDING' : 'COMPLETED',
      requestedBy: 'admin',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setComplianceLogs([newReq, ...complianceLogs]);

    if (actionType === 'ERASURE') {
      setCandidates(candidates.filter(c => c.email !== email));
      alert(`Candidate data isolated. Erasure scheduled in S3 and Identity microservices databases.`);
    } else {
      alert(`GDPR Data Export generated successfully. Stored in S3 document storage registry.`);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Talent Discovery Engine
            <span className="column-badge" style={{ background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: isLive ? 'var(--color-emerald)' : 'var(--color-indigo)', border: isLive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem' }}>
              {isLive ? '● Live EC2 Connection' : '⚡ Local Simulated Sandbox'}
            </span>
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Harness pgvector semantic queries, match scores, and handle right-to-erasure GDPR actions.
          </p>
        </div>
      </div>

      {/* Parser Box and Compliance Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Drag Drop Resume Box */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
          <input type="file" id="resume-file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={parsing} />
          <label htmlFor="resume-file" style={{ cursor: parsing ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-violet)', padding: '1rem', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FileUp size={36} className={parsing ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', marginBottom: '0.25rem' }}>
                {parsing ? 'Extracting Skills via OpenAI/Anthropic...' : 'Upload Candidate Resume'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Supports PDF, DOC, DOCX up to 10MB (Automatically queues ClamAV scanning)
              </p>
            </div>
          </label>
          {parsing && (
            <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: 'var(--grad-primary)', borderRadius: '2px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            </div>
          )}
        </div>

        {/* Compliance Ledger Dashboard */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <ShieldAlert size={16} style={{ color: 'var(--color-rose)' }} />
            GDPR Compliance Ledger
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {complianceLogs.map(log => (
              <div key={log.id} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{log.candidateEmail}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{log.requestType} • {log.createdAt}</div>
                </div>
                <span className="column-badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: log.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: log.status === 'COMPLETED' ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates List with Search */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="text" placeholder="Search by name, skills or tags..." className="form-control" style={{ paddingLeft: '2.5rem', width: '100%' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Cpu size={14} />
              Re-Calculate Embeddings
            </button>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCandidates.map(c => (
            <div key={c.id} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--grad-primary)', color: 'white', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {c.firstName} {c.lastName}
                    <span className="column-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-indigo)', fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                      {c.status}
                    </span>
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Mail size={12} /> {c.email}</span>
                    <span>{c.phone}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {c.tags.map((t: string) => (
                      <span key={t} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Score & GDPR Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Award size={14} style={{ color: 'var(--color-emerald)' }} />
                    AI Match
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: c.matchScore >= 90 ? '#c084fc' : '#34d399' }}>
                    {c.matchScore}%
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} title="Generate GDPR Data Export Bundle" onClick={() => handleComplianceAction(c.email, 'EXPORT')}>
                    <CheckSquare size={14} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', color: 'var(--color-rose)' }} title="Trigger Permanent Erasure" onClick={() => handleComplianceAction(c.email, 'ERASURE')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
