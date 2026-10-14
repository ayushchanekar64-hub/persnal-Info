import React, { useState, useMemo } from 'react';
import { Target, Plus, Search, CheckCircle2, Clock, Calendar, Sparkles, TrendingUp, AlertCircle, ChevronRight, Award, Trash2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import '../../styles/modules.css';

export default function GoalsView({ goals: initialGoals = [], onOpenQuickAction, onRefreshGoals }) {
  const { user, setAuthModalOpen } = useAuth();
  const [goalsList, setGoalsList] = useState(initialGoals);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isUpdating, setIsUpdating] = useState(null);

  // Sync if initialGoals changes
  React.useEffect(() => {
    setGoalsList(initialGoals);
  }, [initialGoals]);

  // Telemetry KPIs
  const kpis = useMemo(() => {
    const total = goalsList.length;
    const completed = goalsList.filter(g => g.progress >= 100 || g.status?.toLowerCase() === 'completed').length;
    const inProgress = total - completed;
    const avgProgress = total > 0 
      ? Math.round(goalsList.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / total)
      : 0;

    return { total, inProgress, completed, avgProgress };
  }, [goalsList]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(['All']);
    goalsList.forEach(g => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [goalsList]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goalsList.filter(g => {
      const matchesSearch = !searchQuery || 
        g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;

      const isDone = g.progress >= 100 || g.status?.toLowerCase() === 'completed';
      const matchesStatus = 
        selectedStatus === 'All' ? true :
        selectedStatus === 'Completed' ? isDone :
        selectedStatus === 'In Progress' ? !isDone : true;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [goalsList, searchQuery, selectedCategory, selectedStatus]);

  // Quick Progress Increment or Completion
  const handleQuickProgress = async (goal, increment = 25) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const currentProg = Number(goal.progress) || 0;
    const newProg = Math.min(100, currentProg + increment);
    const newStatus = newProg >= 100 ? 'Completed' : (goal.status || 'In Progress');

    // Optimistic UI update
    setGoalsList(prev => prev.map(g => g.id === goal.id ? { ...g, progress: newProg, status: newStatus } : g));
    
    if (newProg >= 100 && currentProg < 100) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 }
        });
      } catch (e) {
        // confetti fallback safe
      }
    }

    try {
      setIsUpdating(goal.id);
      await api.goals.update(goal.id, { progress: newProg, status: newStatus });
      if (onRefreshGoals) onRefreshGoals();
    } catch (err) {
      console.error('Failed to update goal progress:', err);
      // Revert if error
      setGoalsList(initialGoals);
    } finally {
      setIsUpdating(null);
    }
  };

  // Quick Delete Goal
  const handleDeleteGoal = async (goalId, e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    setGoalsList(prev => prev.filter(g => g.id !== goalId));
    try {
      await api.goals.delete(goalId);
      if (onRefreshGoals) onRefreshGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
      setGoalsList(initialGoals);
    }
  };

  // Helper for deadline urgency
  const getDeadlineInfo = (deadlineStr) => {
    if (!deadlineStr) return null;
    const target = new Date(deadlineStr);
    if (isNaN(target.getTime())) return { text: deadlineStr, isUrgent: false };
    const now = new Date();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isUrgent: true };
    if (diffDays === 0) return { text: 'Due today', isUrgent: true };
    if (diffDays <= 7) return { text: `${diffDays}d remaining`, isUrgent: true };
    return { text: `${diffDays}d left`, isUrgent: false };
  };

  return (
    <div className="view-transition-container">
      {/* View Header */}
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Goals & High-Impact OKRs</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Transform long-term aspirations into measurable, velocity-driven milestones.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => onOpenQuickAction ? onOpenQuickAction('goal') : null}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)' }}
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Telemetry KPI Strip */}
      <div className="mod-kpi-grid animate-fade-in-up stagger-2">
        <div className="mod-kpi-card">
          <div className="mod-kpi-icon purple">
            <Target size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.total}</span>
            <span className="mod-kpi-lbl">Total OKRs</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon cyan">
            <TrendingUp size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.inProgress}</span>
            <span className="mod-kpi-lbl">In Progress</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon emerald">
            <Award size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.completed}</span>
            <span className="mod-kpi-lbl">Achieved</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon amber">
            <Sparkles size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.avgProgress}%</span>
            <span className="mod-kpi-lbl">Milestone Velocity</span>
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
            placeholder="Filter by objective, key result, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mod-pills-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 2 }}>STATUS:</span>
            {['All', 'In Progress', 'Completed'].map(status => (
              <button
                key={status}
                className={`mod-pill-btn ${selectedStatus === status ? 'active' : ''}`}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {categories.length > 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 2 }}>CATEGORY:</span>
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  className={`mod-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goals Cards Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          title={searchQuery || selectedCategory !== 'All' ? "No matching goals found" : "No goals set yet"}
          description={searchQuery ? "Try refining your search terms or category filters." : "High-level ambitions translated into measurable milestones. Set your first goal to track progress."}
          actionLabel="+ Create New Goal"
          onAction={() => onOpenQuickAction ? onOpenQuickAction('goal') : null}
        />
      ) : (
        <div className="goals-grid">
          {filteredGoals.map((g, idx) => {
            const isCompleted = g.progress >= 100 || g.status?.toLowerCase() === 'completed';
            const deadlineInfo = getDeadlineInfo(g.deadline);

            return (
              <div 
                key={g.id || idx} 
                className={`goal-card animate-fade-in-up stagger-${Math.min(idx + 3, 8)}`}
              >
                {/* Left accent bar */}
                <div className={`goal-accent-bar ${isCompleted ? 'completed' : deadlineInfo?.isUrgent ? 'at-risk' : 'on-track'}`} />

                <div>
                  {/* Top row: Category & Status */}
                  <div className="goal-header-row">
                    <span className="goal-category-tag">{g.category || 'General'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`goal-status-badge ${isCompleted ? 'completed' : 'active'}`}>
                        {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {isCompleted ? 'Achieved' : (g.status || 'In Progress')}
                      </span>
                      {user && (
                        <button
                          onClick={(e) => handleDeleteGoal(g.id, e)}
                          title="Delete Goal"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            transition: 'color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Goal Name */}
                  <h3 className="goal-title">{g.name}</h3>

                  {/* Metadata: Deadline & Urgency */}
                  <div className="goal-meta-row">
                    <span className="goal-meta-item">
                      <Calendar size={13} />
                      Target: <strong style={{ color: 'var(--text-primary)', marginLeft: 3 }}>{g.deadline || 'Ongoing'}</strong>
                    </span>
                    {deadlineInfo && (
                      <span 
                        className="goal-meta-item"
                        style={{
                          color: deadlineInfo.isUrgent ? '#ef4444' : 'var(--text-secondary)',
                          fontWeight: deadlineInfo.isUrgent ? 700 : 500
                        }}
                      >
                        {deadlineInfo.isUrgent && <AlertCircle size={12} color="#ef4444" />}
                        {deadlineInfo.text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Quick Step Buttons */}
                <div className="goal-progress-section">
                  <div className="goal-progress-header">
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Milestone Execution</span>
                    <span className="font-mono" style={{ fontWeight: 700, color: isCompleted ? '#10B981' : 'var(--primary-400)' }}>
                      {g.progress || 0}%
                    </span>
                  </div>

                  <div className="goal-progress-track">
                    <div 
                      className={`goal-progress-fill ${isCompleted ? 'done' : ''}`}
                      style={{ width: `${Math.min(100, Math.max(0, g.progress || 0))}%` }}
                    />
                  </div>

                  {/* Quick progress increment buttons */}
                  {!isCompleted && (
                    <div className="goal-card-actions">
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Log progress:</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="mod-pill-btn"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                          disabled={isUpdating === g.id}
                          onClick={() => handleQuickProgress(g, 10)}
                        >
                          +10%
                        </button>
                        <button
                          className="mod-pill-btn"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                          disabled={isUpdating === g.id}
                          onClick={() => handleQuickProgress(g, 25)}
                        >
                          +25%
                        </button>
                        <button
                          className="mod-pill-btn"
                          style={{ 
                            padding: '0.2rem 0.55rem', 
                            fontSize: '0.7rem', 
                            background: 'rgba(16, 185, 129, 0.12)', 
                            color: '#34d399', 
                            borderColor: 'rgba(16, 185, 129, 0.25)' 
                          }}
                          disabled={isUpdating === g.id}
                          onClick={() => handleQuickProgress(g, 100)}
                        >
                          Complete ✓
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
