import React, { useState, useEffect, useMemo } from 'react';
import { Repeat, Plus, Flame, Check, Sparkles, Trophy, Calendar, Search, Trash2, Zap, CheckCircle2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import '../../styles/modules.css';

export default function HabitsView({ onOpenQuickAction }) {
  const { user, setAuthModalOpen } = useAuth();
  const [habits, setHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loadingId, setLoadingId] = useState(null);

  // Generate 7-day rolling window or current week days
  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    // 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;
      days.push({ dayName, dateStr, isToday });
    }
    return days;
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchHabits = async () => {
    if (!user) {
      setHabits([]);
      return;
    }
    try {
      const list = await api.habits.list();
      setHabits(list.map(h => {
        const streak = h.current_streak ?? h.streak ?? 0;
        const bestStreak = h.best_streak ?? streak;
        const logs = h.logs || [];
        const loggedDateSet = new Set(logs.filter(l => l.completed).map(l => l.date));
        
        // Also if streak > 0 and no logs, assume today or yesterday logged
        const isDoneToday = loggedDateSet.has(todayStr);

        return {
          id: h.id,
          name: h.name,
          category: h.category || 'Daily Routine',
          frequency: h.frequency || 'Daily',
          streak,
          bestStreak,
          isDoneToday,
          loggedDateSet,
          logs
        };
      }));
    } catch (err) {
      console.error('Failed to load habits:', err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  // Telemetry KPIs
  const kpis = useMemo(() => {
    const total = habits.length;
    const doneToday = habits.filter(h => h.isDoneToday).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || h.streak || 0), 0);
    const completionRate = total > 0 ? Math.round((doneToday / total) * 100) : 0;

    return { total, doneToday, bestStreak, completionRate };
  }, [habits]);

  // Filter habits
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      const matchesSearch = !searchQuery || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        selectedFilter === 'All' ? true :
        selectedFilter === 'Done Today' ? h.isDoneToday :
        selectedFilter === 'Pending' ? !h.isDoneToday : true;

      return matchesSearch && matchesStatus;
    });
  }, [habits, searchQuery, selectedFilter]);

  const handleCheckIn = async (habitId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Optimistic toggle
    const alreadyDone = habit.isDoneToday;
    const newStreak = alreadyDone ? Math.max(0, habit.streak - 1) : habit.streak + 1;

    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const newSet = new Set(h.loggedDateSet);
        if (alreadyDone) {
          newSet.delete(todayStr);
        } else {
          newSet.add(todayStr);
        }
        return {
          ...h,
          isDoneToday: !alreadyDone,
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
          loggedDateSet: newSet
        };
      }
      return h;
    }));

    if (!alreadyDone) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.65 }
        });
      } catch (e) {
        // safe fallback
      }
    }

    try {
      setLoadingId(habitId);
      await api.habits.log(habitId, { completed: !alreadyDone, date: todayStr });
      // Refresh to sync streak calculations
      fetchHabits();
    } catch (err) {
      console.error('Failed to log habit:', err);
      fetchHabits(); // revert
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteHabit = async (habitId, e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    setHabits(prev => prev.filter(h => h.id !== habitId));
    try {
      await api.habits.delete(habitId);
    } catch (err) {
      console.error('Failed to delete habit:', err);
      fetchHabits();
    }
  };

  const handleOpenCreateHabit = (preset) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (onOpenQuickAction) {
      onOpenQuickAction('habit', preset);
    }
  };

  return (
    <div className="view-transition-container">
      {/* View Header */}
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Daily Habits & Systems</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Atomic actions compounded daily for extraordinary trajectory and discipline.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenCreateHabit()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)' }}
        >
          <Plus size={16} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Telemetry KPI Strip */}
      <div className="mod-kpi-grid animate-fade-in-up stagger-2">
        <div className="mod-kpi-card">
          <div className="mod-kpi-icon purple">
            <Repeat size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.total}</span>
            <span className="mod-kpi-lbl">Active Systems</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon amber">
            <Flame size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.bestStreak}d</span>
            <span className="mod-kpi-lbl">Longest Streak</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.doneToday}/{kpis.total}</span>
            <span className="mod-kpi-lbl">Completed Today</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon cyan">
            <Zap size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.completionRate}%</span>
            <span className="mod-kpi-lbl">Daily Consistency</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Pills */}
      <div className="mod-toolbar animate-fade-in-up stagger-3">
        <div className="mod-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="mod-search-input"
            placeholder="Search habits and routines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mod-pills-row">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 4 }}>STATUS:</span>
          {['All', 'Pending', 'Done Today'].map(f => (
            <button
              key={f}
              className={`mod-pill-btn ${selectedFilter === f ? 'active' : ''}`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No habits established yet"
          description="Atomic actions compounded daily create exponential results. Build momentum by starting with one key habit today."
          actionLabel="+ New Habit"
          presets={[
            { label: '30m Daily LeetCode & DSA' },
            { label: 'Morning Deep Work Block' },
            { label: 'System Design Reading' }
          ]}
          onAction={handleOpenCreateHabit}
        />
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          title="No matching habits found"
          description="Try adjusting your search query or filter."
          actionLabel="Clear Filters"
          onAction={() => { setSearchQuery(''); setSelectedFilter('All'); }}
        />
      ) : (
        <div className="habits-grid">
          {filteredHabits.map((h, idx) => {
            const hasStreak = (h.streak || 0) > 0;

            return (
              <div 
                key={h.id} 
                className={`habit-card animate-fade-in-up stagger-${Math.min(idx + 3, 8)}`}
              >
                {/* Top Row: Habit Name & Streak */}
                <div className="habit-top-row">
                  <div className="habit-title-area">
                    <div className="habit-icon-wrap">
                      <Repeat size={18} />
                    </div>
                    <div>
                      <h4 className="habit-name">{h.name}</h4>
                      <div className="habit-freq">
                        {h.category} • {h.frequency}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`habit-streak-pill ${hasStreak ? 'fire' : ''}`}>
                      <Flame size={13} />
                      <span>{h.streak}d</span>
                    </span>

                    {user && (
                      <button
                        onClick={(e) => handleDeleteHabit(h.id, e)}
                        title="Delete Habit"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '3px',
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

                {/* 7-Day History Bubbles */}
                <div className="habit-tracker-strip">
                  {weekDays.map((day, dIdx) => {
                    const isDone = h.loggedDateSet ? h.loggedDateSet.has(day.dateStr) : false;
                    const isToday = day.isToday;

                    return (
                      <div key={dIdx} className="habit-day-col">
                        <span 
                          className="habit-day-name"
                          style={{
                            color: isToday ? 'var(--primary-400)' : 'var(--text-tertiary)',
                            fontWeight: isToday ? 700 : 600
                          }}
                        >
                          {day.dayName}
                        </span>
                        <div 
                          className={`habit-day-dot ${isDone ? 'completed' : isToday ? 'today-pending' : ''}`}
                          title={`${day.dateStr} - ${isDone ? 'Completed' : 'Missed'}`}
                        >
                          {isDone && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button: Log Today */}
                <button
                  className={`habit-cta-btn ${h.isDoneToday ? 'logged' : ''}`}
                  onClick={(e) => handleCheckIn(h.id, e)}
                  disabled={loadingId === h.id}
                >
                  {h.isDoneToday ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Completed Today (Click to Undo)</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Mark Today Done</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
