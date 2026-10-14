import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Target,
  Plus,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import EmptyState from '../common/EmptyState';

export default function TodayPriorities({ tasks = [], onToggleTask, onOpenQuickAction }) {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleToggle = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366F1', '#8B5CF6', '#10B981']
        });
      } catch (e) {
        // Confetti optional
      }
    }
    onToggleTask(id);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'pill-danger';
      case 'medium': return 'pill-warning';
      case 'low': return 'pill-success';
      default: return 'pill-muted';
    }
  };

  return (
    <div className="nexus-card motion-card animate-fade-in-up stagger-3">
      <div className="nexus-card-header">
        <div className="nexus-card-title-group">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
            <CheckSquare size={16} />
          </div>
          <div>
            <h2 className="card-title">Today's Priorities</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Complete tasks directly to keep momentum
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tasks.length > 0 && (
            <div style={{ display: 'flex', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
              <button
                className={`btn-ghost btn-sm ${filter === 'all' ? 'pill-primary' : ''}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                onClick={() => setFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button
                className={`btn-ghost btn-sm ${filter === 'pending' ? 'pill-primary' : ''}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                onClick={() => setFilter('pending')}
              >
                Pending ({tasks.filter(t => !t.completed).length})
              </button>
              <button
                className={`btn-ghost btn-sm ${filter === 'completed' ? 'pill-primary' : ''}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                onClick={() => setFilter('completed')}
              >
                Done ({tasks.filter(t => t.completed).length})
              </button>
            </div>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onOpenQuickAction('task')}
            title="Add new task"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Add your first task to start organizing your day."
          actionLabel="+ Add Task"
          presets={[
            { label: 'Morning Deep Work' },
            { label: 'Review Pull Requests' },
            { label: 'System Design Session' }
          ]}
          onAction={() => onOpenQuickAction('task')}
        />
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={28} style={{ margin: '0 auto 0.4rem', opacity: 0.6, color: 'var(--success-500)' }} />
          <p style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>All caught up!</p>
          <p style={{ fontSize: '0.75rem' }}>No tasks found in this filter.</p>
        </div>
      ) : (
        <div className="priorities-list">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`priority-item ${t.completed ? 'completed' : ''}`}
            >
              <div className="priority-left">
                <input
                  type="checkbox"
                  className="nexus-checkbox"
                  checked={t.completed}
                  onChange={() => handleToggle(t.id)}
                  aria-label={`Mark "${t.title}" as complete`}
                />
                <div className="priority-details">
                  <span className="priority-title">{t.title}</span>
                  <div className="priority-meta">
                    <span className="pill pill-muted">{t.category}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> {t.due}
                    </span>
                    {t.goal && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--primary-600)' }}>
                        <Target size={11} /> {t.goal}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="priority-right">
                <span className={`pill ${getPriorityBadgeClass(t.priority)}`}>
                  {t.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
