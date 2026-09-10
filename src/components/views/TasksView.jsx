import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import EmptyState from '../common/EmptyState';

export default function TasksView({ tasks = [], onToggleTask, onOpenQuickAction }) {
  const [filterPriority, setFilterPriority] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.category.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Tasks & Daily Execution</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Manage, prioritize and conquer your high-impact action items.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenQuickAction('task')}>
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="nexus-card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: 360 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              className="form-input"
              placeholder="Filter tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: 0 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Priority:</span>
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                className={`btn-ghost btn-sm ${filterPriority === p ? 'pill-primary' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                onClick={() => setFilterPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks List or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Start by creating your first action item to conquer your daily priorities."
          actionLabel="+ New Task"
          onAction={() => onOpenQuickAction('task')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`nexus-card ${t.completed ? 'completed' : ''}`}
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: t.completed ? 0.65 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <input
                  type="checkbox"
                  className="nexus-checkbox"
                  checked={t.completed}
                  onChange={() => {
                    if (!t.completed) {
                      try {
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                      } catch (e) {}
                    }
                    onToggleTask(t.id);
                  }}
                />
                <div>
                  <span style={{
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    textDecoration: t.completed ? 'line-through' : 'none',
                    color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>
                    {t.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span className="pill pill-muted">{t.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={12} /> {t.due}
                    </span>
                    {t.goal && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--primary-600)' }}>
                        <Target size={12} /> {t.goal}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`pill ${t.priority === 'High' ? 'pill-danger' : t.priority === 'Medium' ? 'pill-warning' : 'pill-success'}`}>
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
