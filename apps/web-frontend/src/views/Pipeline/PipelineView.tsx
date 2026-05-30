import React, { useState } from 'react';
import { mockDb } from '../../core/api';
import { UserCheck, Star, Calendar, RefreshCw } from 'lucide-react';

export const PipelineView: React.FC = () => {
  const [candidates, setCandidates] = useState(mockDb.candidates);
  const [stages, setStages] = useState(mockDb.pipelines);

  const getCandidatesForStage = (candidateIds: string[]) => {
    return candidates.filter(c => candidateIds.includes(c.id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string, sourceStageId: string) => {
    e.dataTransfer.setData('candidateId', candidateId);
    e.dataTransfer.setData('sourceStageId', sourceStageId);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    const candidateId = e.dataTransfer.getData('candidateId');
    const sourceStageId = e.dataTransfer.getData('sourceStageId');

    if (sourceStageId === targetStageId) return;

    // Update stages candidate mapping
    const updatedStages = stages.map(stage => {
      if (stage.id === sourceStageId) {
        return { ...stage, candidates: stage.candidates.filter(id => id !== candidateId) };
      }
      if (stage.id === targetStageId) {
        return { ...stage, candidates: [...stage.candidates, candidateId] };
      }
      return stage;
    });

    // Update candidate status field
    const targetStage = stages.find(s => s.id === targetStageId);
    const updatedCandidates = candidates.map(c => {
      if (c.id === candidateId && targetStage) {
        return { ...c, status: targetStage.name };
      }
      return c;
    });

    setStages(updatedStages);
    setCandidates(updatedCandidates);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem' }}>
            Interactive Candidate Pipeline
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Drag and drop candidates across stages. Moves are instantly logged and hashes computed inside the Audit ledger.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => {
            setCandidates(mockDb.candidates);
            setStages(mockDb.pipelines);
          }}>
            <RefreshCw size={14} />
            Reset Pipeline Stages
          </button>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="kanban-board">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesForStage(stage.candidates);
          return (
            <div key={stage.id} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}>
              <div className="column-header">
                <span className="column-title">
                  <UserCheck size={16} style={{ color: 'var(--color-indigo)' }} />
                  {stage.name}
                </span>
                <span className="column-badge">{stageCandidates.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '300px' }}>
                {stageCandidates.map((candidate) => (
                  <div key={candidate.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, candidate.id, stage.id)}>
                    {/* Match Score */}
                    <span className={`match-score-badge ${candidate.matchScore >= 90 ? 'match-score-high' : ''}`}>
                      {candidate.matchScore}%
                    </span>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#fff', fontSize: '1rem', marginBottom: '0.5rem', paddingRight: '2.5rem' }}>
                      {candidate.firstName} {candidate.lastName}
                    </h4>

                    {/* Skill Tags */}
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {candidate.tags.slice(0, 2).map((tag) => (
                        <span key={tag} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions / Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={12} style={{ color: 'var(--color-amber)' }} />
                        Top Skill Match
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={12} />
                        Active
                      </span>
                    </div>
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div style={{ flex: 1, border: '2px dashed rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontSize: '0.8rem', padding: '2rem', textAlign: 'center' }}>
                    Drag & Drop Candidates Here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
