import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  Target,
  ChevronRight,
  ChevronDown,
  ListTodo,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  List,
  LayoutGrid,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import EmptyState from '../common/EmptyState';
import TaskDetailModal from '../modals/TaskDetailModal';
import '../../styles/tasks.css';

export default function TasksView({
  tasks = [],
  goals = [],
  onToggleTask,
  onOpenQuickAction,
  onRefreshTasks,
  onUpdateTask,
  onDeleteTask
}) {
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'completed'
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);

  // Metrics telemetry
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;
  const activeTasks = tasks.filter((t) => !t.completed);
  const activeCount = activeTasks.length;
  const highPriorityCount = tasks.filter((t) => !t.completed && (t.priority === 'High' || t.priority === 'Critical')).length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filter tasks
  const filtered = tasks.filter((t) => {
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'completed'
        ? t.completed
        : !t.completed;
    const matchesSearch =
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const filteredActive = filtered.filter((t) => !t.completed);
  const filteredCompleted = filtered.filter((t) => t.completed);

  // Keep selectedTask in sync if tasks list updates
  const activeSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  const handleTaskUpdated = (updatedTask) => {
    setSelectedTask(updatedTask);
    if (onUpdateTask) onUpdateTask(updatedTask);
    if (onRefreshTasks) onRefreshTasks();
  };

  const handleTaskDeleted = (deletedId) => {
    setSelectedTask(null);
    if (onDeleteTask) onDeleteTask(deletedId);
    if (onRefreshTasks) onRefreshTasks();
  };

  const handleCheckClick = (e, task) => {
    e.stopPropagation();
    if (!task.completed) {
      try {
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
      } catch (err) {}
    }
    onToggleTask(task.id);
  };

  const handleDeleteClick = (e, taskId) => {
    e.stopPropagation();
    if (window.confirm('Delete this task?')) {
      handleTaskDeleted(taskId);
    }
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="tasks-view-container">
      {/* 1. Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>Tasks & Daily Execution</h2>
          <p className="text-muted" style={{ fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
            Linear-grade execution engine for your high-priority items & systems
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onOpenQuickAction('task')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. Top KPI Metrics Telemetry Bar */}
      <div className="tasks-kpi-grid">
        <div className="tasks-kpi-card">
          <div className="tasks-kpi-icon-pill" style={{ background: 'rgba(99, 102, 241, 0.14)', color: '#818CF8' }}>
            <CheckSquare size={20} />
          </div>
          <div className="tasks-kpi-info">
            <span className="tasks-kpi-label">Total Tasks</span>
            <span className="tasks-kpi-val">{totalTasks}</span>
          </div>
        </div>

        <div className="tasks-kpi-card">
          <div className="tasks-kpi-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#FBBF24' }}>
            <Clock size={20} />
          </div>
          <div className="tasks-kpi-info">
            <span className="tasks-kpi-label">Active Items</span>
            <span className="tasks-kpi-val">{activeCount}</span>
          </div>
        </div>

        <div className="tasks-kpi-card">
          <div className="tasks-kpi-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.14)', color: '#F87171' }}>
            <AlertCircle size={20} />
          </div>
          <div className="tasks-kpi-info">
            <span className="tasks-kpi-label">High Priority</span>
            <span className="tasks-kpi-val">{highPriorityCount}</span>
          </div>
        </div>

        <div className="tasks-kpi-card">
          <div className="tasks-kpi-icon-pill" style={{ background: 'rgba(16, 185, 129, 0.14)', color: '#34D399' }}>
            <TrendingUp size={20} />
          </div>
          <div className="tasks-kpi-info">
            <span className="tasks-kpi-label">Velocity</span>
            <span className="tasks-kpi-val">{completionRate}%</span>
            <div className="tasks-kpi-progress">
              <div className="tasks-kpi-progress-bar" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Control & Filter Bar */}
      <div className="tasks-control-bar">
        {/* Search */}
        <div className="tasks-search-wrap">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            className="tasks-search-input"
            placeholder="Search tasks, categories, or context..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div className="tasks-filter-group">
          <div className="tasks-filter-pills">
            <button
              type="button"
              className={`tasks-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({totalTasks})
            </button>
            <button
              type="button"
              className={`tasks-filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              className={`tasks-filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Done ({completedCount})
            </button>
          </div>

          {/* Priority Filters */}
          <div className="tasks-filter-pills">
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                type="button"
                className={`tasks-filter-btn ${filterPriority === p ? 'active' : ''}`}
                onClick={() => setFilterPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: List vs Board */}
          <div className="tasks-view-toggle">
            <button
              type="button"
              className={`tasks-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`tasks-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Task Content Body */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No matching tasks"
          description="Try clearing your filters or create a new action item to start your workflow."
          actionLabel="+ New Task"
          onAction={() => onOpenQuickAction('task')}
        />
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Tasks Group */}
          {filteredActive.length > 0 && (
            <div className="tasks-group-section">
              <div className="tasks-group-header">
                <span className="tasks-group-title">
                  <span>Action Items</span>
                  <span className="tasks-group-count">{filteredActive.length}</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredActive.map((t) => {
                  const prioLower = (t.priority || 'medium').toLowerCase();
                  return (
                    <div
                      key={t.id}
                      className="task-item-card"
                      onClick={() => setSelectedTask(t)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Left Accent Stripe */}
                      <div className={`task-item-accent-bar priority-${prioLower}`} />

                      {/* Main Left Section */}
                      <div className="task-item-left">
                        <button
                          type="button"
                          className="task-checkbox-btn"
                          onClick={(e) => handleCheckClick(e, t)}
                          title="Mark complete"
                        >
                          <Circle size={20} />
                        </button>

                        <div className="task-item-content">
                          <div className="task-item-title-row">
                            <span className="task-item-title">{t.title}</span>
                          </div>

                          <div className="task-item-meta-row">
                            <span className="task-meta-chip category">
                              {t.category || 'Engineering'}
                            </span>

                            {(t.due_date || t.due) && (
                              <span
                                className={`task-meta-chip ${
                                  isOverdue(t.due_date || t.due)
                                    ? 'due-overdue'
                                    : isToday(t.due_date || t.due)
                                    ? 'due-today'
                                    : ''
                                }`}
                              >
                                <Calendar size={11} />
                                <span>
                                  {isToday(t.due_date || t.due)
                                    ? 'Today'
                                    : isOverdue(t.due_date || t.due)
                                    ? 'Overdue'
                                    : t.due_date || t.due}
                                  {t.due_time && ` @${t.due_time}`}
                                </span>
                              </span>
                            )}

                            {(t.estimated_time || t.estimated_duration) && (
                              <span className="task-meta-chip">
                                <Timer size={11} />
                                <span>{t.estimated_time || t.estimated_duration}</span>
                              </span>
                            )}

                            {(t.goal_title || t.goal) && (
                              <span className="task-meta-chip goal">
                                <Target size={11} />
                                <span>{t.goal_title || t.goal}</span>
                              </span>
                            )}

                            {t.subtasks && t.subtasks.length > 0 && (
                              <span className="task-meta-chip">
                                <ListTodo size={11} />
                                <span>
                                  {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Priority Badge + Actions */}
                      <div className="task-item-right">
                        <span className={`task-priority-pill ${prioLower}`}>
                          {t.priority || 'Medium'}
                        </span>

                        <div className="task-item-actions">
                          <button
                            type="button"
                            className="task-quick-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            title="Edit task"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="task-quick-action-btn delete"
                            onClick={(e) => handleDeleteClick(e, t.id)}
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={16} color="var(--text-tertiary)" style={{ opacity: 0.6 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Tasks Group */}
          {filteredCompleted.length > 0 && (
            <div className="tasks-group-section" style={{ marginTop: '0.5rem' }}>
              <div
                className="tasks-group-header"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowCompleted(!showCompleted)}
              >
                <span className="tasks-group-title">
                  <CheckCircle2 size={14} color="#10B981" />
                  <span>Completed Tasks</span>
                  <span className="tasks-group-count">{filteredCompleted.length}</span>
                </span>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <span>{showCompleted ? 'Hide' : 'Show'}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: showCompleted ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
              </div>

              {showCompleted && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {filteredCompleted.map((t) => (
                    <div
                      key={t.id}
                      className="task-item-card completed"
                      onClick={() => setSelectedTask(t)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="task-item-left">
                        <button
                          type="button"
                          className="task-checkbox-btn checked"
                          onClick={(e) => handleCheckClick(e, t)}
                          title="Mark incomplete"
                        >
                          <CheckCircle2 size={20} />
                        </button>

                        <div className="task-item-content">
                          <div className="task-item-title-row">
                            <span className="task-item-title">{t.title}</span>
                          </div>
                          <div className="task-item-meta-row">
                            <span className="task-meta-chip category">
                              {t.category || 'General'}
                            </span>
                            {(t.due_date || t.due) && (
                              <span className="task-meta-chip">
                                <Calendar size={11} />
                                <span>{t.due_date || t.due}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="task-item-right">
                        <span className="task-priority-pill low">Done</span>
                        <div className="task-item-actions">
                          <button
                            type="button"
                            className="task-quick-action-btn delete"
                            onClick={(e) => handleDeleteClick(e, t.id)}
                            title="Delete task"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={16} color="var(--text-tertiary)" style={{ opacity: 0.6 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="tasks-board-grid">
          {/* Column 1: To Do */}
          <div className="tasks-board-column">
            <div className="tasks-board-col-header">
              <span className="tasks-board-col-title">
                <span className="tasks-board-dot todo" />
                <span>To Do</span>
              </span>
              <span className="tasks-group-count">
                {filtered.filter((t) => !t.completed && (t.status === 'To Do' || !t.status)).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered
                .filter((t) => !t.completed && (t.status === 'To Do' || !t.status))
                .map((t) => (
                  <div
                    key={t.id}
                    className="tasks-board-card"
                    onClick={() => setSelectedTask(t)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                        {t.title}
                      </span>
                      <span className={`task-priority-pill ${(t.priority || 'medium').toLowerCase()}`}>
                        {t.priority || 'Medium'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span className="task-meta-chip category">{t.category || 'General'}</span>
                      {(t.due_date || t.due) && (
                        <span className="task-meta-chip">
                          <Calendar size={11} /> {t.due_date || t.due}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="tasks-board-column">
            <div className="tasks-board-col-header">
              <span className="tasks-board-col-title">
                <span className="tasks-board-dot in-progress" />
                <span>In Progress</span>
              </span>
              <span className="tasks-group-count">
                {filtered.filter((t) => !t.completed && t.status === 'In Progress').length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered
                .filter((t) => !t.completed && t.status === 'In Progress')
                .map((t) => (
                  <div
                    key={t.id}
                    className="tasks-board-card"
                    onClick={() => setSelectedTask(t)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                        {t.title}
                      </span>
                      <span className={`task-priority-pill ${(t.priority || 'medium').toLowerCase()}`}>
                        {t.priority || 'Medium'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span className="task-meta-chip category">{t.category || 'General'}</span>
                      {t.subtasks && t.subtasks.length > 0 && (
                        <span className="task-meta-chip">
                          <ListTodo size={11} /> {t.subtasks.filter(s => s.completed).length}/{t.subtasks.length}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="tasks-board-column">
            <div className="tasks-board-col-header">
              <span className="tasks-board-col-title">
                <span className="tasks-board-dot completed" />
                <span>Done</span>
              </span>
              <span className="tasks-group-count">
                {filtered.filter((t) => t.completed || t.status === 'Completed').length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered
                .filter((t) => t.completed || t.status === 'Completed')
                .map((t) => (
                  <div
                    key={t.id}
                    className="tasks-board-card"
                    style={{ opacity: 0.7 }}
                    onClick={() => setSelectedTask(t)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {t.title}
                      </span>
                      <span className="task-priority-pill low">Done</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span className="task-meta-chip category">{t.category || 'General'}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {activeSelectedTask && (
        <TaskDetailModal
          task={activeSelectedTask}
          isOpen={Boolean(activeSelectedTask)}
          onClose={() => setSelectedTask(null)}
          onToggleTask={onToggleTask}
          onUpdateTask={handleTaskUpdated}
          onDeleteTask={handleTaskDeleted}
          goals={goals}
        />
      )}
    </div>
  );
}
