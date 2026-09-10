import React from 'react';
import {
  Calendar,
  Clock,
  PlusCircle,
  Target,
  FileText,
  BookOpen,
  Code2,
  CheckCircle2
} from 'lucide-react';

export default function RightPanel({
  upcoming = [],
  recentActivity = [],
  onOpenQuickAction,
  onCompleteTask
}) {
  return (
    <aside className="right-panel">
      {/* SECTION 1: UPCOMING */}
      <section className="right-panel-section">
        <div className="right-panel-header">
          <div className="right-panel-title">
            <Calendar size={16} color="var(--primary-600)" />
            <span>Upcoming</span>
          </div>
          <span className="pill pill-muted" style={{ fontSize: '0.68rem' }}>
            {upcoming.length} Pending
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div
            style={{
              padding: '1.25rem 1rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-light)',
              color: 'var(--text-tertiary)'
            }}
          >
            <p style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              No upcoming items
            </p>
            <p style={{ fontSize: '0.735rem', lineHeight: 1.4 }}>
              Deadlines and scheduled events will appear here.
            </p>
          </div>
        ) : (
          <div className="upcoming-list">
            {upcoming.map((item) => (
              <div key={item.id} className="upcoming-item">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.825rem' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: '0.71rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {item.date}
                  </span>
                </div>
                <span className={`pill ${item.badge === 'High' ? 'pill-danger' : 'pill-primary'}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: RECENT ACTIVITY */}
      <section className="right-panel-section">
        <div className="right-panel-header">
          <div className="right-panel-title">
            <Clock size={16} color="var(--accent-600)" />
            <span>Recent Activity</span>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div
            style={{
              padding: '1.25rem 1rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-light)',
              color: 'var(--text-tertiary)'
            }}
          >
            <p style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              No recent activity
            </p>
            <p style={{ fontSize: '0.735rem', lineHeight: 1.4 }}>
              Completed tasks and progress will be logged here.
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((act) => {
              let IconComp = CheckCircle2;
              if (act.type === 'learning') IconComp = BookOpen;
              if (act.type === 'coding') IconComp = Code2;
              if (act.type === 'goal') IconComp = Target;

              return (
                <div key={act.id} className="activity-item">
                  <div
                    className="activity-icon-bubble"
                    style={{
                      background: act.type === 'task' ? 'var(--success-50)' :
                                  act.type === 'learning' ? 'var(--primary-50)' :
                                  act.type === 'coding' ? 'var(--accent-50)' : 'var(--warning-50)',
                      color: act.color
                    }}
                  >
                    <IconComp size={14} />
                  </div>
                  <div className="activity-content">
                    <span className="activity-title">{act.title}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: QUICK ACTIONS */}
      <section className="right-panel-section">
        <div className="right-panel-header">
          <div className="right-panel-title">
            <PlusCircle size={16} color="var(--primary-600)" />
            <span>Quick Actions</span>
          </div>
        </div>

        <div className="quick-actions-grid">
          <button
            className="quick-action-btn"
            onClick={() => onOpenQuickAction('task')}
          >
            <CheckCircle2 size={15} color="var(--primary-600)" />
            <span>+ Add Task</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => onOpenQuickAction('goal')}
          >
            <Target size={15} color="var(--accent-600)" />
            <span>+ Add Goal</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => onOpenQuickAction('note')}
          >
            <FileText size={15} color="var(--warning-600)" />
            <span>+ Add Note</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => onOpenQuickAction('learning')}
          >
            <BookOpen size={15} color="var(--primary-500)" />
            <span>+ Log Learning</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => onOpenQuickAction('coding')}
          >
            <Code2 size={15} color="var(--success-600)" />
            <span>+ Log Coding</span>
          </button>
        </div>
      </section>
    </aside>
  );
}
