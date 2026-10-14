import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, CheckCircle2, Clock, Flame, Search, ExternalLink, Award, Sparkles, TrendingUp } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import '../../styles/modules.css';

export default function LearningView({ learning = [], onOpenQuickAction }) {
  const { user, setAuthModalOpen } = useAuth();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loggingId, setLoggingId] = useState(null);

  // Fetch full learning items from API or fallback to props
  const fetchLearningData = async () => {
    if (!user) {
      const rawList = Array.isArray(learning) ? learning : (learning?.skills || []);
      setItems(rawList.map((s, idx) => ({
        id: s.id || `local-${idx}`,
        skill: s.skill || s.name,
        topic: s.topic || 'Core Curriculum',
        course: s.course,
        hours: typeof s.hours === 'number' ? s.hours : (parseFloat(s.hours) || 0),
        total_hours: s.total_hours || (typeof s.hours === 'number' ? s.hours : (parseFloat(s.hours) || 0)),
        progress: s.progress || (s.hours ? Math.min(100, Math.round(s.hours * 10)) : 0),
        difficulty: s.difficulty || 'Intermediate',
        status: s.status || 'Learning',
        resource_url: s.resource_url
      })));
      return;
    }

    try {
      const list = await api.learning.list();
      if (list && list.length > 0) {
        setItems(list);
      } else {
        const rawList = Array.isArray(learning) ? learning : (learning?.skills || []);
        setItems(rawList.map((s, idx) => ({
          id: s.id || `local-${idx}`,
          skill: s.skill || s.name,
          topic: s.topic || 'Core Curriculum',
          course: s.course,
          hours: typeof s.hours === 'number' ? s.hours : (parseFloat(s.hours) || 0),
          total_hours: s.total_hours || (typeof s.hours === 'number' ? s.hours : (parseFloat(s.hours) || 0)),
          progress: s.progress || (s.hours ? Math.min(100, Math.round(s.hours * 10)) : 0),
          difficulty: s.difficulty || 'Intermediate',
          status: s.status || 'Learning',
          resource_url: s.resource_url
        })));
      }
    } catch (err) {
      console.error('Failed to load learning data:', err);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, [user, learning]);

  // Telemetry KPIs
  const kpis = useMemo(() => {
    const total = items.length;
    const totalHours = items.reduce((acc, item) => acc + (Number(item.total_hours ?? item.hours) || 0), 0);
    const mastered = items.filter(item => (item.progress || 0) >= 100 || item.status?.toLowerCase() === 'mastered').length;
    const avgMastery = total > 0 
      ? Math.round(items.reduce((acc, item) => acc + (Number(item.progress) || 0), 0) / total) 
      : 0;

    return { total, totalHours: Math.round(totalHours * 10) / 10, mastered, avgMastery };
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = (item.skill || item.name || '').toLowerCase();
      const topic = (item.topic || '').toLowerCase();
      const course = (item.course || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !searchQuery || name.includes(q) || topic.includes(q) || course.includes(q);
      const matchesDiff = selectedDifficulty === 'All' || item.difficulty === selectedDifficulty;
      
      const isDone = (item.progress || 0) >= 100 || item.status?.toLowerCase() === 'mastered';
      const matchesStatus = 
        selectedStatus === 'All' ? true :
        selectedStatus === 'Mastered' ? isDone :
        selectedStatus === 'Learning' ? !isDone : true;

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [items, searchQuery, selectedDifficulty, selectedStatus]);

  // Quick Log +1h Study Session
  const handleQuickStudyHour = async (item, e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newHours = (Number(item.total_hours ?? item.hours) || 0) + 1;
    const newProgress = Math.min(100, (item.progress || 0) + 10);

    // Optimistic UI update
    setItems(prev => prev.map(it => it.id === item.id ? {
      ...it,
      total_hours: newHours,
      hours: newHours,
      progress: newProgress,
      status: newProgress >= 100 ? 'Mastered' : it.status
    } : it));

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.65 }
      });
    } catch (e) {
      // safe fallback
    }

    try {
      setLoggingId(item.id);
      await api.learning.logSession(item.id, {
        hours: 1.0,
        date: todayStr,
        notes: 'Quick study session logged'
      });
    } catch (err) {
      console.error('Failed to log learning session:', err);
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <div className="view-transition-container">
      {/* View Header */}
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Learning Curriculum & Mastery</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Deliberate practice, hours logged, and structured skill acquisition.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => onOpenQuickAction ? onOpenQuickAction('learning') : null}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)' }}
        >
          <Plus size={16} />
          <span>Log Study Time</span>
        </button>
      </div>

      {/* Telemetry KPI Strip */}
      <div className="mod-kpi-grid animate-fade-in-up stagger-2">
        <div className="mod-kpi-card">
          <div className="mod-kpi-icon purple">
            <BookOpen size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.total}</span>
            <span className="mod-kpi-lbl">Skills Tracked</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon cyan">
            <Clock size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.totalHours}h</span>
            <span className="mod-kpi-lbl">Logged Deliberate Study</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon emerald">
            <Award size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.mastered}</span>
            <span className="mod-kpi-lbl">Skills Mastered</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon amber">
            <TrendingUp size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.avgMastery}%</span>
            <span className="mod-kpi-lbl">Average Mastery</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="mod-toolbar animate-fade-in-up stagger-3">
        <div className="mod-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="mod-search-input"
            placeholder="Search skills, topics, courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mod-pills-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 2 }}>STATUS:</span>
            {['All', 'Learning', 'Mastered'].map(st => (
              <button
                key={st}
                className={`mod-pill-btn ${selectedStatus === st ? 'active' : ''}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 2 }}>LEVEL:</span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
              <button
                key={diff}
                className={`mod-pill-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No learning curriculum logged yet"
          description="Structured knowledge acquisition, deliberate practice hours, and curriculum milestones will be tracked here."
          actionLabel="+ Log First Study Session"
          presets={[
            { label: 'System Design Architecture' },
            { label: 'Distributed Systems & Raft Consensus' },
            { label: 'Advanced TypeScript & React Internals' }
          ]}
          onAction={() => onOpenQuickAction ? onOpenQuickAction('learning') : null}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No matching curriculum items"
          description="Try adjusting your search terms or filters."
          actionLabel="Clear Filters"
          onAction={() => { setSearchQuery(''); setSelectedDifficulty('All'); setSelectedStatus('All'); }}
        />
      ) : (
        <div className="learning-grid">
          {filteredItems.map((item, idx) => {
            const isMastered = (item.progress || 0) >= 100 || item.status?.toLowerCase() === 'mastered';
            const hoursVal = item.total_hours ?? item.hours ?? 0;

            return (
              <div 
                key={item.id || idx} 
                className={`learning-card animate-fade-in-up stagger-${Math.min(idx + 3, 8)}`}
              >
                <div>
                  <div className="learning-top-row">
                    <span className="learning-level-pill">{item.difficulty || 'Technical'}</span>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: isMastered ? '#10B981' : 'var(--primary-400)' 
                      }}
                    >
                      {item.progress || 0}% Mastery
                    </span>
                  </div>

                  <h3 className="learning-skill-name">{item.skill || item.name}</h3>

                  {(item.topic || item.course) && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {item.course ? `Course: ${item.course}` : item.topic}
                    </p>
                  )}

                  <div className="learning-stats-row">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      <strong>{hoursVal}h</strong> invested
                    </span>
                    {item.resource_url && (
                      <a 
                        href={item.resource_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--primary-400)', textDecoration: 'none' }}
                      >
                        <ExternalLink size={12} />
                        Link
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <div className="goal-progress-track" style={{ marginBottom: '0.85rem' }}>
                    <div 
                      className={`goal-progress-fill ${isMastered ? 'done' : ''}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.progress || 0))}%` }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {isMastered ? 'Skill Mastered ✓' : 'Practice regularly'}
                    </span>
                    <button
                      className="mod-pill-btn"
                      onClick={(e) => handleQuickStudyHour(item, e)}
                      disabled={loggingId === item.id}
                      style={{
                        background: 'rgba(14, 165, 233, 0.12)',
                        color: '#38bdf8',
                        borderColor: 'rgba(14, 165, 233, 0.25)'
                      }}
                    >
                      <Plus size={12} />
                      <span>+1h Session</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
