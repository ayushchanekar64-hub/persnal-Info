import React, { useState } from 'react';
import { Code2, Plus, Calendar, Clock, BarChart2, Target, AlertCircle, RefreshCw, ChevronRight, Activity, Search, Filter, Sparkles, Terminal } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import CodeStudioPlayground from '../coding/CodeStudioPlayground';

export default function CodingView({
  coding = {},
  onOpenQuickAction,
  onRefreshCoding
}) {
  const [activeSubTab, setActiveSubTab] = useState('studio'); // studio, dashboard, problems, topics, mistakes, revisit, analytics
  const [searchQuery, setSearchQuery] = useState('');

  const {
    problems = [],
    sessions = [],
    mistakes = [],
    topics = [],
    solvedTotal = 0,
    attemptedTotal = 0,
    revisitTotal = 0,
    masteredTotal = 0,
    totalProblems = 0,
    totalCodingTime = 0, // in minutes
    streakDays = 0,
    longestStreak = 0
  } = coding;

  const handleLogSession = () => {
    // We will trigger a quick action for 'coding-session' later, for now we will assume it uses 'coding' type
    onOpenQuickAction('coding-session');
  };

  const filteredProblems = problems.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="view-transition-container">
      {/* HEADER */}
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">CODING</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Master your problem-solving journey.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenQuickAction('coding-session')}>
            <Clock size={15} />
            <span>Session</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onOpenQuickAction('coding-mistake')}>
            <AlertCircle size={15} />
            <span>Mistake</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenQuickAction('coding')}>
            <Plus size={15} />
            <span>Problem</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION */}
      <div 
        className="tab-navigation animate-fade-in-up stagger-1" 
        style={{ 
          marginBottom: '1.5rem', 
          display: 'flex', 
          gap: '0.75rem', 
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '2px'
        }}
      >
        {[
          { id: 'studio', label: '⚡ Studio & AI Judge' },
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'problems', label: 'Problems' },
          { id: 'topics', label: 'Topics' },
          { id: 'mistakes', label: 'Mistakes' },
          { id: 'revisit', label: 'Revisit' },
          { id: 'analytics', label: 'Analytics' }
        ].map(({ id, label }) => (
          <button 
            key={id}
            onClick={() => setActiveSubTab(id)}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              color: activeSubTab === id ? 'var(--primary-400)' : 'var(--text-muted)',
              borderBottom: activeSubTab === id ? '2px solid var(--primary-500)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeSubTab === 'studio' && (
        <CodeStudioPlayground onLogProblemSuccess={onRefreshCoding} />
      )}

      {activeSubTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* STATS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="nexus-card motion-card animate-fade-in-up stagger-2">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Problems</span>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0' }}>{totalProblems}</div>
            </div>
            <div className="nexus-card motion-card animate-fade-in-up stagger-3">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Solved</span>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success-500)', margin: '0.25rem 0' }}>{solvedTotal}</div>
            </div>
            <div className="nexus-card motion-card animate-fade-in-up stagger-4">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Mastered</span>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-400)', margin: '0.25rem 0' }}>{masteredTotal}</div>
            </div>
            <div className="nexus-card motion-card animate-fade-in-up stagger-5">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Revisit</span>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning-500)', margin: '0.25rem 0' }}>{revisitTotal}</div>
            </div>
            <div className="nexus-card motion-card animate-fade-in-up stagger-6">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Current Streak</span>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-400)', margin: '0.25rem 0' }}>{streakDays}</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Longest: {longestStreak}</span>
            </div>
            <div className="nexus-card motion-card animate-fade-in-up stagger-7">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Coding Time</span>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0' }}>{Math.floor(totalCodingTime / 60)}h {totalCodingTime % 60}m</div>
            </div>
          </div>

          {/* ACTIVITY HEATMAP (Placeholder for UI) */}
          <div className="nexus-card animate-fade-in-up stagger-8">
            <h3 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> Coding Activity
            </h3>
            {problems.length === 0 && sessions.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                 <p style={{ fontSize: '0.9rem' }}>No coding activity yet</p>
                 <p style={{ fontSize: '0.75rem' }}>Start solving problems to build your coding history.</p>
               </div>
            ) : (
               <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {/* Generate 30 days of mock blocks to show concept visually, real implementation would map actual dates */}
                  {Array.from({length: 60}).map((_, i) => (
                    <div key={i} style={{ 
                      width: '12px', height: '12px', borderRadius: '2px',
                      background: Math.random() > 0.7 ? 'var(--primary-600)' : 'var(--bg-surface-elevated)'
                    }} />
                  ))}
               </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'problems' && (
        <div className="nexus-card animate-fade-in-up stagger-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h3 className="section-title">Problem Tracker</h3>
             <div className="search-bar" style={{ width: '250px' }}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search problem..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          
          {filteredProblems.length === 0 ? (
            <EmptyState
              title="No problems yet."
              description="Start your first coding problem to track your journey."
              actionLabel="Add Problem"
              onAction={() => onOpenQuickAction('coding')}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Problem</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Platform</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Topic</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Difficulty</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} className="hover-row">
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{p.title}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{p.platform}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{p.topic}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`pill ${p.difficulty === 'Easy' ? 'pill-success' : p.difficulty === 'Medium' ? 'pill-warning' : 'pill-danger'}`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ 
                          color: p.status === 'Solved' ? 'var(--success-400)' : p.status === 'Mastered' ? 'var(--primary-400)' : p.status === 'Revisit' ? 'var(--warning-400)' : 'var(--text-muted)'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{p.time_taken_minutes || '-'}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'topics' && (
        <div className="nexus-card animate-fade-in-up stagger-2">
           <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Topic Mastery</h3>
           {topics.length === 0 ? (
             <EmptyState
                title="No topics available yet."
                description="Solve problems to build topic mastery."
              />
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               {topics.map(t => (
                 <div key={t.name}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                     <span style={{ fontWeight: 600 }}>{t.name}</span>
                     <span style={{ color: 'var(--text-muted)' }}>{t.solved + t.mastered} / {t.count}</span>
                   </div>
                   <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                     <div style={{ width: `${Math.min(100, ((t.solved + t.mastered) / t.count) * 100)}%`, height: '100%', background: t.color, borderRadius: '3px' }} />
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {activeSubTab === 'mistakes' && (
        <div className="nexus-card animate-fade-in-up stagger-2">
           <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Mistake Log</h3>
           {mistakes.length === 0 ? (
             <EmptyState
                title="No mistakes logged yet."
                description="Learning from failure is the path to mastery. Log mistakes to improve."
              />
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mistakes.map(m => (
                  <div key={m.id} style={{ padding: '1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--danger-500)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{m.problem_title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>Topic: {m.topic}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Why I Failed:</strong> {m.why_failed}
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {activeSubTab === 'revisit' && (
        <div className="nexus-card animate-fade-in-up stagger-2">
           <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Needs Revision</h3>
           {problems.filter(p => p.status === 'Revisit').length === 0 ? (
             <EmptyState
                title="Nothing to revisit."
                description="You have no problems marked for revision."
              />
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {problems.filter(p => p.status === 'Revisit').map(p => (
                   <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>{p.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.topic} • {p.difficulty}</span>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Review Now</button>
                   </div>
                ))}
             </div>
           )}
        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="nexus-card animate-fade-in-up stagger-2">
           <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Coding Analytics</h3>
           {totalProblems === 0 ? (
             <EmptyState
                title="Insufficient data."
                description="Keep solving problems to unlock detailed analytics."
              />
           ) : (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Simplified Analytics Placeholder */}
                <div style={{ padding: '1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Difficulty Distribution</span>
                  <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
                     {/* Bars representing Easy, Medium, Hard */}
                     {['Easy', 'Medium', 'Hard'].map(diff => {
                       const count = problems.filter(p => p.difficulty === diff).length;
                       const height = count === 0 ? 0 : Math.max(10, (count / totalProblems) * 100);
                       const color = diff === 'Easy' ? 'var(--success-500)' : diff === 'Medium' ? 'var(--warning-500)' : 'var(--danger-500)';
                       return (
                         <div key={diff} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100%', height: `${height}%`, background: color, borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                            <span style={{ fontSize: '0.65rem' }}>{diff}</span>
                         </div>
                       );
                     })}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Language Usage</span>
                  {/* List of languages */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {Array.from(new Set(problems.map(p => p.programming_language).filter(Boolean))).slice(0,4).map(lang => {
                      const count = problems.filter(p => p.programming_language === lang).length;
                      return (
                        <div key={lang} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                           <span>{lang}</span>
                           <span style={{ color: 'var(--text-muted)' }}>{Math.round((count/totalProblems)*100)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
             </div>
           )}
        </div>
      )}

    </div>
  );
}
