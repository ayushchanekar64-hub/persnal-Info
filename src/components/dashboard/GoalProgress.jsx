import React from 'react';
import {
  Target,
  Plus,
  Calendar
} from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function GoalProgress({ goals = [], onOpenQuickAction }) {
  const getProgressClass = (color) => {
    switch (color) {
      case 'primary': return 'progress-bar-primary';
      case 'accent': return 'progress-bar-accent';
      case 'success': return 'progress-bar-success';
      case 'warning': return 'progress-bar-warning';
      default: return 'progress-bar-primary';
    }
  };

  return (
    <div className="nexus-card">
      <div className="nexus-card-header">
        <div className="nexus-card-title-group">
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
            <Target size={16} />
          </div>
          <div>
            <h2 className="card-title">Goal Progress</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Active milestones & target completion
            </span>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onOpenQuickAction('goal')}
          title="Add new goal"
        >
          <Plus size={14} />
          <span>New Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Define objectives and milestones to track your progress."
          actionLabel="+ New Goal"
          onAction={() => onOpenQuickAction('goal')}
        />
      ) : (
        <div className="goals-list">
          {goals.map((g) => (
            <div key={g.id} className="goal-item">
              <div className="goal-header-row">
                <div className="goal-name-group">
                  <span className="goal-title">{g.name}</span>
                  <span className="pill pill-muted" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                    {g.category}
                  </span>
                </div>
                <span className="goal-percent">{g.progress}%</span>
              </div>

              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${getProgressClass(g.color)}`}
                  style={{ width: `${g.progress}%` }}
                />
              </div>

              <div className="goal-footer-row">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} /> Target: {g.deadline}
                </span>
                <span className={`pill ${g.status === 'On Track' ? 'pill-success' : g.status === 'Needs Focus' ? 'pill-warning' : 'pill-primary'}`} style={{ fontSize: '0.68rem' }}>
                  {g.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
