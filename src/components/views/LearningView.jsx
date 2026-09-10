import React from 'react';
import { BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function LearningView({ learning = [], onOpenQuickAction }) {
  const rawList = Array.isArray(learning) ? learning : (learning?.skills || []);
  const skills = rawList.map(s => ({
    name: s.skill || s.name,
    hours: typeof s.hours === 'number' ? `${s.hours}h` : s.hours || '0h',
    progress: s.progress || (s.hours ? Math.min(100, Math.round(s.hours * 10)) : 0),
    level: s.status || 'Active'
  }));
  const modules = [];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Learning Curriculum & Mastery</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Structured knowledge acquisition, deliberate practice hours, and course progress.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenQuickAction('learning')}>
          <Plus size={16} />
          <span>Log Study Time</span>
        </button>
      </div>

      {skills.length === 0 && modules.length === 0 ? (
        <EmptyState
          title="No learning activity yet"
          description="Structured knowledge acquisition, deliberate practice hours, and curriculum progress will be tracked here."
          actionLabel="+ Log Study Time"
          onAction={() => onOpenQuickAction('learning')}
        />
      ) : (
        <>
          {skills.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {skills.map((s, idx) => (
                <div key={idx} className="nexus-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span className="pill pill-primary">{s.level}</span>
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{s.progress}%</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{s.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                    Logged: {s.hours}
                  </p>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill progress-bar-primary" style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {modules.length > 0 && (
            <div className="nexus-card">
              <h3 className="section-title" style={{ marginBottom: '1rem' }}>Active Modules</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {modules.map((m, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color={m.completed ? "var(--success-500)" : "var(--text-muted)"} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {m.skills.map((sk, i) => (
                          <span key={i} className="pill pill-muted" style={{ fontSize: '0.68rem' }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                    <span className="pill pill-primary" style={{ fontSize: '0.75rem' }}>{m.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
