import React from 'react';
import {
  BookOpen,
  Code2,
  Flame,
  Award
} from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function LearningAndCoding({
  learning = { skills: [], weeklyHours: 0, streak: '0 days' },
  coding = { solvedTotal: 0, thisWeek: 0, streakDays: 0, topics: [] },
  onOpenQuickAction
}) {
  const skills = learning?.skills || [];
  const topics = coding?.topics || [];

  return (
    <div className="learning-coding-grid">
      {/* 1. LEARNING CARD */}
      <div className="nexus-card">
        <div className="nexus-card-header">
          <div className="nexus-card-title-group">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--info-500)' }}>
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="card-title">Learning Velocity</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Active curriculum & hours
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {learning?.weeklyHours || 0}h
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {learning?.weeklyHours > 0 ? `${learning.weeklyHours}h this wk` : "0h this week"}
            </span>
          </div>
        </div>

        {skills.length === 0 ? (
          <EmptyState
            title="No learning activity yet"
            description="Log study hours to track your skills and velocity."
            actionLabel="+ Log Learning"
            onAction={() => onOpenQuickAction('learning')}
          />
        ) : (
          <div className="skills-progress-list">
            {skills.map((skill, idx) => (
              <div key={idx} className="skill-row">
                <div className="skill-header">
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{skill.name}</span>
                  <span className="font-mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                    {skill.progress}% <span style={{ color: 'var(--text-muted)' }}>({skill.hours})</span>
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill progress-bar-primary"
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Award size={13} color="var(--primary-600)" />
            {skills.length > 0 ? "Track: Active Learning" : "Track: No active track"}
          </span>
          <button
            className="btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.74rem' }}
            onClick={() => onOpenQuickAction('learning')}
          >
            + Log Study Hours
          </button>
        </div>
      </div>

      {/* 2. CODING CARD */}
      <div className="nexus-card">
        <div className="nexus-card-header">
          <div className="nexus-card-title-group">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-600)' }}>
              <Code2 size={16} />
            </div>
            <div>
              <h2 className="card-title">Coding Mastery</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                DSA & algorithmic consistency
              </span>
            </div>
          </div>

          <span className="pill pill-muted" style={{ gap: 3 }}>
            <Flame size={12} color="var(--warning-500)" /> {coding?.streakDays || 0}d streak
          </span>
        </div>

        {/* 3 Metric Chips */}
        <div className="coding-stat-chips">
          <div className="coding-chip">
            <div className="coding-chip-val font-mono">{coding?.solvedTotal || 0}</div>
            <div className="coding-chip-label">Total Solved</div>
          </div>
          <div className="coding-chip">
            <div className="coding-chip-val font-mono" style={{ color: 'var(--primary-600)' }}>
              {coding?.thisWeek || 0}
            </div>
            <div className="coding-chip-label">This Week</div>
          </div>
          <div className="coding-chip">
            <div className="coding-chip-val font-mono" style={{ color: 'var(--success-600)' }}>
              {coding?.streakDays || 0} Days
            </div>
            <div className="coding-chip-label">Active Streak</div>
          </div>
        </div>

        {topics.length === 0 ? (
          <EmptyState
            title="No coding activity yet"
            description="Solve problems to track topic distribution and streaks."
            actionLabel="+ Log Solved Problem"
            onAction={() => onOpenQuickAction('coding')}
          />
        ) : (
          <>
            {/* Topic Distribution Segmented Bar */}
            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
              Topic Distribution
            </div>
            <div className="topics-distribution-bar">
              {topics.map((t, idx) => (
                <div
                  key={idx}
                  className="topic-segment"
                  style={{
                    width: `${t.percentage}%`,
                    background: t.color
                  }}
                  title={`${t.name}: ${t.percentage}%`}
                />
              ))}
            </div>

            <div className="topics-legend">
              {topics.map((t, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-color-dot" style={{ background: t.color }} />
                  <span>{t.name} <strong style={{ color: 'var(--text-primary)' }}>{t.percentage}%</strong></span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
