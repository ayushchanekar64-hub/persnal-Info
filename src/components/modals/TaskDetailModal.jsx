import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Tag,
  Target,
  Trash2,
  Edit3,
  Save,
  Plus,
  AlertCircle,
  CheckSquare,
  Sparkles,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  goals = []
}) {
  const [currentTask, setCurrentTask] = useState(task || null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('Engineering');
  const [editPriority, setEditPriority] = useState('High');
  const [editStatus, setEditStatus] = useState('To Do');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editEstimatedTime, setEditEstimatedTime] = useState('');
  const [editGoalId, setEditGoalId] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Fetch full details whenever modal opens or task changes
  useEffect(() => {
    if (task && isOpen) {
      setCurrentTask(task);
      setEditTitle(task.title || '');
      setEditDescription(task.description || '');
      setEditCategory(task.category || 'Engineering');
      setEditPriority(task.priority || 'High');
      setEditStatus(task.status || (task.completed ? 'Completed' : 'To Do'));
      setEditDueDate(task.due_date || task.due || '');
      setEditDueTime(task.due_time || '');
      setEditEstimatedTime(task.estimated_time || task.estimated_duration || '');
      setEditGoalId(task.goal_id || '');
      setEditNotes(task.notes || '');
      setIsEditing(false);
      setDeleteConfirm(false);

      // Fetch fresh from backend if id is valid
      if (task.id) {
        api.tasks.get(task.id)
          .then((fresh) => {
            if (fresh) {
              setCurrentTask((prev) => ({
                ...prev,
                ...fresh,
                subtasks: fresh.subtasks || prev?.subtasks || []
              }));
              setEditTitle(fresh.title || '');
              setEditDescription(fresh.description || '');
              setEditCategory(fresh.category || 'Engineering');
              setEditPriority(fresh.priority || 'High');
              setEditStatus(fresh.status || (fresh.completed ? 'Completed' : 'To Do'));
              setEditDueDate(fresh.due_date || '');
              setEditDueTime(fresh.due_time || '');
              setEditEstimatedTime(fresh.estimated_time || fresh.estimated_duration || '');
              setEditGoalId(fresh.goal_id || '');
              setEditNotes(fresh.notes || '');
            }
          })
          .catch(() => {
            // Use local task state
          });
      }
    }
  }, [task, isOpen]);

  if (!isOpen || !currentTask) return null;

  // Toggle task completion
  const handleToggle = async () => {
    if (!currentTask) return;
    const willComplete = !currentTask.completed;
    if (willComplete) {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }

    setCurrentTask((prev) => ({
      ...prev,
      completed: willComplete,
      status: willComplete ? 'Completed' : 'In Progress'
    }));

    if (onToggleTask) {
      onToggleTask(currentTask.id);
    }
  };

  // Add new subtask
  const handleAddSubtask = async (e) => {
    e?.preventDefault();
    if (!newSubtaskTitle.trim() || !currentTask?.id) return;

    const tempSubtask = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    setCurrentTask((prev) => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), tempSubtask]
    }));
    setNewSubtaskTitle('');
    setIsAddingSubtask(true);

    try {
      const created = await api.tasks.addSubtask(currentTask.id, tempSubtask.title);
      if (created) {
        setCurrentTask((prev) => ({
          ...prev,
          subtasks: (prev.subtasks || []).map((s) => (s.id === tempSubtask.id ? created : s))
        }));
      }
    } catch (err) {
      console.error('Failed to add subtask to server:', err);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  // Toggle subtask completion
  const handleToggleSubtask = async (subtaskId) => {
    if (!currentTask?.id) return;
    setCurrentTask((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      )
    }));

    try {
      await api.tasks.toggleSubtask(currentTask.id, subtaskId);
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId) => {
    if (!currentTask?.id) return;
    setCurrentTask((prev) => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter((s) => s.id !== subtaskId)
    }));

    try {
      await api.tasks.deleteSubtask(currentTask.id, subtaskId);
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !currentTask?.id) return;
    setLoading(true);

    const updatePayload = {
      title: editTitle.trim(),
      description: editDescription,
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      completed: editStatus === 'Completed',
      due_date: editDueDate || null,
      due_time: editDueTime || null,
      estimated_time: editEstimatedTime || null,
      goal_id: editGoalId || null,
      notes: editNotes || null
    };

    try {
      const updated = await api.tasks.update(currentTask.id, updatePayload);
      setCurrentTask((prev) => ({
        ...prev,
        ...updated,
        subtasks: prev.subtasks || []
      }));
      setIsEditing(false);
      if (onUpdateTask) {
        onUpdateTask(updated || { ...currentTask, ...updatePayload });
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      // Still update locally
      setCurrentTask((prev) => ({
        ...prev,
        ...updatePayload,
        due: editDueDate || prev.due
      }));
      setIsEditing(false);
      if (onUpdateTask) {
        onUpdateTask({ ...currentTask, ...updatePayload });
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async () => {
    if (!currentTask?.id) return;
    try {
      await api.tasks.delete(currentTask.id);
    } catch (err) {
      console.error('Failed to delete task from backend:', err);
    }
    if (onDeleteTask) {
      onDeleteTask(currentTask.id);
    }
    onClose();
  };

  const priorityColor =
    currentTask.priority === 'Critical'
      ? 'var(--danger-500)'
      : currentTask.priority === 'High'
      ? 'var(--warning-500)'
      : currentTask.priority === 'Medium'
      ? 'var(--primary-500)'
      : 'var(--success-500)';

  const priorityClass =
    currentTask.priority === 'Critical' || currentTask.priority === 'High'
      ? 'pill-danger'
      : currentTask.priority === 'Medium'
      ? 'pill-warning'
      : 'pill-success';

  const subtasks = currentTask.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '88vh',
          backgroundColor: 'var(--bg-surface, #1A1B20)',
          border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(124, 58, 237, 0.12)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'var(--bg-surface-elevated, #22242B)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="pill pill-muted" style={{ fontWeight: 600 }}>
              {currentTask.category || 'Engineering'}
            </span>
            <span className={`pill ${priorityClass}`} style={{ fontWeight: 600 }}>
              {currentTask.priority || 'High'} Priority
            </span>
            <span
              className="pill"
              style={{
                backgroundColor: currentTask.completed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: currentTask.completed ? '#4ade80' : '#818cf8',
                fontWeight: 600
              }}
            >
              {currentTask.completed ? 'Completed' : currentTask.status || 'To Do'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {!isEditing && (
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setIsEditing(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                title="Edit Task"
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
            )}
            <button
              type="button"
              className="btn-ghost btn-icon"
              onClick={onClose}
              style={{ color: 'var(--text-secondary)' }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {isEditing ? (
            /* EDIT MODE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title..."
                  style={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Category
                  </label>
                  <select
                    className="form-input"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Study / Prep">Study / Prep</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Priority
                  </label>
                  <select
                    className="form-input"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Status
                  </label>
                  <select
                    className="form-input"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Due Time
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editEstimatedTime}
                    onChange={(e) => setEditEstimatedTime(e.target.value)}
                    placeholder="e.g. 45m, 2h"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Linked Milestone / Goal
                </label>
                <select
                  className="form-input"
                  value={editGoalId}
                  onChange={(e) => setEditGoalId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- No Linked Goal --</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name || g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Description / Specification
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Provide context, acceptance criteria, or execution notes..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Internal Notes / Resources
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Links, command snippets, reference docs..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={loading || !editTitle.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={15} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <>
              {/* Title & Checkbox Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={handleToggle}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginTop: '0.15rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentTask.completed ? 'var(--success-500, #22c55e)' : 'var(--text-tertiary, #64748b)',
                    transition: 'transform 0.15s ease, color 0.15s ease'
                  }}
                  title={currentTask.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {currentTask.completed ? <CheckCircle2 size={24} color="#22c55e" /> : <Circle size={24} />}
                </button>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      color: currentTask.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: currentTask.completed ? 'line-through' : 'none'
                    }}
                  >
                    {currentTask.title}
                  </h3>
                </div>
              </div>

              {/* Quick Meta Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {/* Due Date */}
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.06))',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <Calendar size={13} />
                    <span>Due Date</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentTask.due_date || currentTask.due || 'No deadline'}
                    {currentTask.due_time && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
                        @{currentTask.due_time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estimated Duration */}
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.06))',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <Timer size={13} />
                    <span>Duration</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentTask.estimated_time || currentTask.estimated_duration || 'Not estimated'}
                  </div>
                </div>

                {/* Linked Goal */}
                {currentTask.goal_title || currentTask.goal ? (
                  <div
                    style={{
                      padding: '0.75rem 0.9rem',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#818cf8', marginBottom: '0.25rem' }}>
                      <Target size={13} />
                      <span>Linked Goal</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#a5b4fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentTask.goal_title || currentTask.goal}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Description Section */}
              <div
                style={{
                  padding: '1rem 1.15rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.06))',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Description & Context
                </div>
                {currentTask.description ? (
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {currentTask.description}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    No description added yet.{' '}
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-400, #818cf8)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    >
                      Add details
                    </button>
                  </div>
                )}
              </div>

              {/* Internal Notes if present */}
              {currentTask.notes && (
                <div
                  style={{
                    padding: '1rem 1.15rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.04)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--warning-500, #f59e0b)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Execution Notes
                  </div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {currentTask.notes}
                  </div>
                </div>
              )}

              {/* Subtasks Checklist Section */}
              <div
                style={{
                  padding: '1rem 1.15rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.06))',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckSquare size={16} color="var(--primary-500)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Subtasks & Action Checklist
                    </span>
                    {subtasks.length > 0 && (
                      <span className="pill pill-muted" style={{ fontSize: '0.72rem' }}>
                        {completedSubtasks}/{subtasks.length} ({subtaskProgress}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {subtasks.length > 0 && (
                  <div
                    style={{
                      height: 5,
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 3,
                      marginBottom: '0.9rem',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${subtaskProgress}%`,
                        backgroundColor: subtaskProgress === 100 ? '#22c55e' : 'var(--primary-600, #6366f1)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                )}

                {/* Subtask list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        backgroundColor: st.completed ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1, margin: 0 }}>
                        <input
                          type="checkbox"
                          className="nexus-checkbox"
                          checked={st.completed}
                          onChange={() => handleToggleSubtask(st.id)}
                        />
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: st.completed ? 'line-through' : 'none'
                          }}
                        >
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="btn-ghost btn-icon"
                        onClick={() => handleDeleteSubtask(st.id)}
                        style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                        title="Delete subtask"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <form
                  onSubmit={handleAddSubtask}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add an actionable subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    style={{ flex: 1, fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              {/* Timestamps */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                <span>ID: {currentTask.id?.slice(0, 8)}...</span>
                {currentTask.created_at && (
                  <span>
                    Created {new Date(currentTask.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-secondary, rgba(255, 255, 255, 0.02))'
          }}
        >
          {deleteConfirm ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--danger-500, #ef4444)' }}>
                Delete this task permanently?
              </span>
              <button
                type="button"
                className="btn btn-sm"
                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none' }}
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => setDeleteConfirm(true)}
              style={{ color: 'var(--danger-500, #ef4444)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${currentTask.completed ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggle}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCircle2 size={14} />
              <span>{currentTask.completed ? 'Mark Incomplete' : 'Mark Completed'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
