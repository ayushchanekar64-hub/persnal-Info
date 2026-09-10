import React from 'react';
import { Target, Plus } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function GoalsView({ goals = [], onOpenQuickAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Goals & OKRs</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            High-level ambitions translated into measurable milestones.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenQuickAction('goal')}>
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="High-level ambitions translated into measurable milestones. Set your first goal."
          actionLabel="+ New Goal"
          onAction={() => onOpenQuickAction('goal')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {goals.map((g) => (
            <div key={g.id} className="nexus-card nexus-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <span className="pill pill-muted">{g.category}</span>
                  <span className="pill pill-success">{g.status}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{g.name}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
                  Target deadline: <strong style={{ color: 'var(--text-primary)' }}>{g.deadline}</strong>
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Milestone Progress</span>
                  <span className="font-mono" style={{ color: 'var(--primary-600)' }}>{g.progress}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: 8 }}>
                  <div
                    className="progress-bar-fill progress-bar-primary"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
