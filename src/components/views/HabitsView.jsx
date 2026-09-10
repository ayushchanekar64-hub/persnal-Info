import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Flame, Check, X } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HabitsView() {
  const { user, setAuthModalOpen } = useAuth();
  const [habits, setHabits] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const fetchHabits = async () => {
    if (!user) {
      setHabits([]);
      return;
    }
    try {
      const list = await api.habits.list();
      setHabits(list.map(h => ({
        id: h.id,
        name: h.name,
        streak: h.streak || 0,
        days: [false, false, false, false, false, false, (h.streak || 0) > 0]
      })));
    } catch (err) {
      console.error('Failed to load habits:', err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!habitName.trim()) return;

    try {
      await api.habits.create({
        name: habitName.trim(),
        frequency
      });
      setHabitName('');
      setShowNewModal(false);
      fetchHabits();
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  };

  const handleCheckIn = async (habitId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await api.habits.log(habitId, { completed: true });
      fetchHabits();
    } catch (err) {
      console.error('Failed to log habit:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Daily Habits & Systems</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Atomic actions compounded daily for extraordinary trajectory.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!user) setAuthModalOpen(true);
            else setShowNewModal(true);
          }}
        >
          <Plus size={16} />
          <span>New Habit</span>
        </button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          description="Atomic actions compounded daily for extraordinary trajectory. Build daily consistency by establishing your first habit loop."
          actionLabel="+ New Habit"
          onAction={() => {
            if (!user) setAuthModalOpen(true);
            else setShowNewModal(true);
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {habits.map((h) => (
            <div key={h.id} className="nexus-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-500)' }}>
                  <Flame size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{h.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Current Streak: <strong style={{ color: 'var(--warning-500)' }}>{h.streak} Days</strong>
                  </span>
                </div>
              </div>

              {/* Week Heatmap Dots & Checkin */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {h.days.map((done, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{daysOfWeek[idx]}</span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: done ? 'var(--primary-600)' : 'var(--bg-surface-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleCheckIn(h.id)}
                      title="Click to log habit checkin"
                    >
                      {done && <Check size={14} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Habit Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Create New Habit</h3>
              <button className="btn-icon" onClick={() => setShowNewModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateHabit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="e.g. Read 20 pages or 1h Deep Work"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Frequency
                </label>
                <select
                  className="form-input"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
