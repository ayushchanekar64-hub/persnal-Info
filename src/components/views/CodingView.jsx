import React from 'react';
import { Code2, Plus } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function CodingView({
  coding = [],
  onOpenQuickAction
}) {
  const problems = Array.isArray(coding)
    ? coding.map(c => ({
        id: c.id,
        title: c.title,
        topic: c.platform || 'LeetCode Algorithm',
        solvedDate: 'Recently',
        difficulty: c.difficulty || 'Medium'
      }))
    : (coding?.problems || []);

  const solvedTotal = Array.isArray(coding) ? coding.length : (coding?.solvedTotal || 0);
  const thisWeek = Array.isArray(coding) ? coding.length : (coding?.thisWeek || 0);
  const streakDays = solvedTotal > 0 ? 1 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Coding & DSA Directory</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Problem solving telemetry, algorithm patterns, and streak maintenance.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenQuickAction('coding')}>
          <Plus size={16} />
          <span>Log Solved Problem</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="nexus-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Total Solved</span>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {solvedTotal}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>All-time total</span>
        </div>

        <div className="nexus-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>This Week</span>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-600)', margin: '0.25rem 0' }}>
            {thisWeek}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Solved this week</span>
        </div>

        <div className="nexus-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Current Streak</span>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning-500)', margin: '0.25rem 0' }}>
            {streakDays} Days
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Active streak</span>
        </div>
      </div>


      {problems.length === 0 ? (
        <EmptyState
          title="No coding activity yet"
          description="Problem solving telemetry, algorithm patterns, and streak maintenance will be logged here."
          actionLabel="+ Log Solved Problem"
          onAction={() => onOpenQuickAction('coding')}
        />
      ) : (
        <div className="nexus-card">
          <h3 className="section-title" style={{ marginBottom: '1rem' }}>Recently Solved</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {problems.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-muted)'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.title}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{p.topic}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.solvedDate}</span>
                  <span className={`pill ${p.difficulty === 'Easy' ? 'pill-success' : p.difficulty === 'Medium' ? 'pill-warning' : 'pill-danger'}`}>
                    {p.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
