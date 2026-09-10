import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Target,
  BookOpen,
  Code2,
  FileText,
  Clock,
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function QuickActionModal({
  isOpen,
  type,
  onClose,
  onAddTask,
  onAddGoal,
  onAddLearning,
  onAddCoding,
  onAddActivity,
  goals = []
}) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('Engineering');
  const [taskPriority, setTaskPriority] = useState('High');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('');
  const [taskEstimatedTime, setTaskEstimatedTime] = useState('');
  const [taskLinkedGoalId, setTaskLinkedGoalId] = useState('');
  const [taskTags, setTaskTags] = useState('');

  // 2. Goal State
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('Career');
  const [goalPriority, setGoalPriority] = useState('High');
  const [goalStartDate, setGoalStartDate] = useState(todayStr);
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalStatus, setGoalStatus] = useState('In Progress');

  // 3. Learning State
  const [learningSkill, setLearningSkill] = useState('');
  const [learningTopic, setLearningTopic] = useState('');
  const [learningCourse, setLearningCourse] = useState('');
  const [learningCategory, setLearningCategory] = useState('Technical');
  const [learningDate, setLearningDate] = useState(todayStr);
  const [learningDuration, setLearningDuration] = useState('1h');
  const [learningStatus, setLearningStatus] = useState('Learning');
  const [learningProgress, setLearningProgress] = useState(0);
  const [learningNotes, setLearningNotes] = useState('');

  // 4. Coding State
  const [codingTitle, setCodingTitle] = useState('');
  const [codingPlatform, setCodingPlatform] = useState('LeetCode');
  const [codingUrl, setCodingUrl] = useState('');
  const [codingTopic, setCodingTopic] = useState('');
  const [codingDifficulty, setCodingDifficulty] = useState('Medium');
  const [codingStatus, setCodingStatus] = useState('Solved');
  const [codingLanguage, setCodingLanguage] = useState('Python');
  const [codingTimeTaken, setCodingTimeTaken] = useState('30m');
  const [codingAttempts, setCodingAttempts] = useState(1);
  const [codingSolutionNotes, setCodingSolutionNotes] = useState('');
  const [codingMistakeLearning, setCodingMistakeLearning] = useState('');

  // Note State (fallback)
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Form Validation & Submitting State
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clear validation on type change
  useEffect(() => {
    setValidationError('');
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    try {
      if (type === 'task') {
        if (!taskTitle.trim()) {
          setValidationError('Task Title is required.');
          return;
        }

        setSubmitting(true);
        const linkedGoal = goals.find((g) => g.id === taskLinkedGoalId);
        await onAddTask?.({
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          category: taskCategory,
          priority: taskPriority,
          status: taskStatus,
          due_date: taskDueDate || undefined,
          due: taskDueDate || 'Today',
          due_time: taskDueTime || undefined,
          estimated_time: taskEstimatedTime.trim() || undefined,
          goal_id: taskLinkedGoalId || undefined,
          goal: linkedGoal ? linkedGoal.name : undefined,
          tags: taskTags.trim() || undefined,
          completed: taskStatus === 'Completed'
        });

        onAddActivity?.({
          id: `act-${Date.now()}`,
          type: 'task',
          title: `Created task "${taskTitle.trim()}"`,
          time: 'Just now',
          color: 'var(--primary-600)'
        });
      } else if (type === 'goal') {
        if (!goalName.trim()) {
          setValidationError('Goal Name is required.');
          return;
        }

        const prog = Number(goalProgress);
        if (isNaN(prog) || prog < 0 || prog > 100) {
          setValidationError('Initial Progress must be between 0 and 100%.');
          return;
        }

        if (goalStartDate && goalTargetDate && goalTargetDate < goalStartDate) {
          setValidationError('Target Date cannot be before Start Date.');
          return;
        }

        setSubmitting(true);
        await onAddGoal?.({
          name: goalName.trim(),
          description: goalDescription.trim() || undefined,
          category: goalCategory,
          priority: goalPriority,
          start_date: goalStartDate || undefined,
          target_date: goalTargetDate || undefined,
          deadline: goalTargetDate || 'Ongoing',
          progress: prog,
          status: goalStatus
        });

        onAddActivity?.({
          id: `act-${Date.now()}`,
          type: 'goal',
          title: `Created goal "${goalName.trim()}"`,
          time: 'Just now',
          color: 'var(--accent-600)'
        });
      } else if (type === 'learning') {
        if (!learningSkill.trim()) {
          setValidationError('Subject / Skill is required.');
          return;
        }

        const prog = Number(learningProgress);
        if (isNaN(prog) || prog < 0 || prog > 100) {
          setValidationError('Progress must be between 0 and 100%.');
          return;
        }

        setSubmitting(true);
        await onAddLearning?.({
          skill: learningSkill.trim(),
          topic: learningTopic.trim() || undefined,
          course: learningCourse.trim() || undefined,
          category: learningCategory,
          learning_date: learningDate || todayStr,
          duration: learningDuration.trim() || '1h',
          status: learningStatus,
          progress: prog,
          notes: learningNotes.trim() || undefined
        });

        onAddActivity?.({
          id: `act-${Date.now()}`,
          type: 'learning',
          title: `Logged session on "${learningSkill.trim()}"` + (learningTopic ? ` (${learningTopic.trim()})` : ''),
          time: 'Just now',
          color: 'var(--info-500)'
        });
      } else if (type === 'coding') {
        if (!codingTitle.trim()) {
          setValidationError('Problem Title is required.');
          return;
        }

        const attemptsNum = Math.max(1, parseInt(codingAttempts, 10) || 1);

        setSubmitting(true);
        await onAddCoding?.({
          title: codingTitle.trim(),
          platform: codingPlatform,
          problem_url: codingUrl.trim() || undefined,
          topic: codingTopic.trim() || 'Algorithm',
          difficulty: codingDifficulty,
          status: codingStatus,
          programming_language: codingLanguage,
          time_taken: codingTimeTaken.trim() || '30m',
          attempts: attemptsNum,
          solution_notes: codingSolutionNotes.trim() || undefined,
          mistake_learning: codingMistakeLearning.trim() || undefined
        });

        onAddActivity?.({
          id: `act-${Date.now()}`,
          type: 'coding',
          title: `Logged problem "${codingTitle.trim()}" (${codingDifficulty})`,
          time: 'Just now',
          color: 'var(--success-600)'
        });
      } else {
        // Quick note
        onAddActivity?.({
          id: `act-${Date.now()}`,
          type: 'task',
          title: `Added note "${noteTitle || 'Quick Note'}"`,
          time: 'Just now',
          color: 'var(--warning-600)'
        });
      }

      onClose();
    } catch (err) {
      setValidationError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'task':
        return { title: 'Create New Task', icon: CheckCircle2, color: 'var(--primary-600)' };
      case 'goal':
        return { title: 'Create New Goal', icon: Target, color: 'var(--accent-600)' };
      case 'learning':
        return { title: 'Log Learning Session', icon: BookOpen, color: 'var(--info-500)' };
      case 'coding':
        return { title: 'Log Solved Problem', icon: Code2, color: 'var(--success-600)' };
      default:
        return { title: 'Create Note', icon: FileText, color: 'var(--warning-600)' };
    }
  };

  const header = getHeaderInfo();
  const IconComponent = header.icon;

  const sectionHeaderStyle = {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
    marginBottom: '0.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              className="stat-icon-wrapper"
              style={{ background: 'var(--bg-surface-muted)', color: header.color }}
            >
              <IconComponent size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{header.title}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {type === 'task'
                  ? 'Add action items and link to high-level goals'
                  : type === 'goal'
                  ? 'Define measurable targets and OKRs'
                  : type === 'learning'
                  ? 'Track deliberate practice hours and curriculum'
                  : type === 'coding'
                  ? 'Record DSA problem metrics and mistake insights'
                  : 'Quick entry'}
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto'
          }}
        >
          {validationError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#ef4444',
                fontSize: '0.82rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* ==================================================
              1. TASK FORM
              ================================================== */}
          {type === 'task' && (
            <>
              {/* Basic Information */}
              <div>
                <div style={sectionHeaderStyle}>Basic Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Task Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      className="form-input"
                      placeholder="e.g. Implement refresh token rotation"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Description
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Context, requirements or implementation notes..."
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div>
                <div style={sectionHeaderStyle}>Planning</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Category
                    </label>
                    <select
                      className="form-input"
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Product">Product</option>
                      <option value="Operations">Operations</option>
                      <option value="Personal">Personal</option>
                      <option value="Design">Design</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Priority
                    </label>
                    <select
                      className="form-input"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Status
                    </label>
                    <select
                      className="form-input"
                      value={taskStatus}
                      onChange={(e) => setTaskStatus(e.target.value)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2h or 45m"
                      value={taskEstimatedTime}
                      onChange={(e) => setTaskEstimatedTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Due Time
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      value={taskDueTime}
                      onChange={(e) => setTaskDueTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div>
                <div style={sectionHeaderStyle}>Organization</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Linked Goal (Current Workspace)
                    </label>
                    <select
                      className="form-input"
                      value={taskLinkedGoalId}
                      onChange={(e) => setTaskLinkedGoalId(e.target.value)}
                    >
                      <option value="">None (Standalone Task)</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.category || 'Goal'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Tags
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Comma-separated: auth, backend, security"
                      value={taskTags}
                      onChange={(e) => setTaskTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==================================================
              2. GOAL FORM
              ================================================== */}
          {type === 'goal' && (
            <>
              {/* Basic Information */}
              <div>
                <div style={sectionHeaderStyle}>Basic Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Goal Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      className="form-input"
                      placeholder="e.g. Master Distributed Systems Architecture"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Description
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Objective outcomes, target competencies, or milestones..."
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div>
                <div style={sectionHeaderStyle}>Planning</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Category
                    </label>
                    <select
                      className="form-input"
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value)}
                    >
                      <option value="Career">Career</option>
                      <option value="Technical">Technical</option>
                      <option value="Product">Product</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Priority
                    </label>
                    <select
                      className="form-input"
                      value={goalPriority}
                      onChange={(e) => setGoalPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={goalStartDate}
                      onChange={(e) => setGoalStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Target Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={goalTargetDate}
                      onChange={(e) => setGoalTargetDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={sectionHeaderStyle}>Progress</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Initial Progress ({goalProgress}%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={goalProgress}
                      onChange={(e) => setGoalProgress(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Status
                    </label>
                    <select
                      className="form-input"
                      value={goalStatus}
                      onChange={(e) => setGoalStatus(e.target.value)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==================================================
              3. LEARNING FORM
              ================================================== */}
          {type === 'learning' && (
            <>
              {/* Learning Information */}
              <div>
                <div style={sectionHeaderStyle}>Learning Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Subject / Skill <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        className="form-input"
                        placeholder="e.g. Python, Kubernetes, System Design"
                        value={learningSkill}
                        onChange={(e) => setLearningSkill(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Topic
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Decorators, Raft Consensus"
                        value={learningTopic}
                        onChange={(e) => setLearningTopic(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Course / Resource
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Official Documentation, Coursebook"
                        value={learningCourse}
                        onChange={(e) => setLearningCourse(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Category
                      </label>
                      <select
                        className="form-input"
                        value={learningCategory}
                        onChange={(e) => setLearningCategory(e.target.value)}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session */}
              <div>
                <div style={sectionHeaderStyle}>Session</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Learning Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={learningDate}
                      onChange={(e) => setLearningDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Duration
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 1h 30m or 45m"
                      value={learningDuration}
                      onChange={(e) => setLearningDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Learning Status
                    </label>
                    <select
                      className="form-input"
                      value={learningStatus}
                      onChange={(e) => setLearningStatus(e.target.value)}
                    >
                      <option value="Learning">Learning</option>
                      <option value="Practicing">Practicing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Progress ({learningProgress}%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={learningProgress}
                      onChange={(e) => setLearningProgress(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div style={sectionHeaderStyle}>Notes</div>
                <textarea
                  rows={3}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Short explanation of what was learned and practical insights..."
                  value={learningNotes}
                  onChange={(e) => setLearningNotes(e.target.value)}
                />
              </div>
            </>
          )}

          {/* ==================================================
              4. CODING FORM
              ================================================== */}
          {type === 'coding' && (
            <>
              {/* Problem */}
              <div>
                <div style={sectionHeaderStyle}>Problem</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Problem Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      className="form-input"
                      placeholder="e.g. Longest Substring Without Repeating Characters"
                      value={codingTitle}
                      onChange={(e) => setCodingTitle(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Platform
                      </label>
                      <select
                        className="form-input"
                        value={codingPlatform}
                        onChange={(e) => setCodingPlatform(e.target.value)}
                      >
                        <option value="LeetCode">LeetCode</option>
                        <option value="CodeChef">CodeChef</option>
                        <option value="HackerRank">HackerRank</option>
                        <option value="Codeforces">Codeforces</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Problem URL
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://leetcode.com/problems/..."
                        value={codingUrl}
                        onChange={(e) => setCodingUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Topic
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Sliding Window, Graphs"
                        value={codingTopic}
                        onChange={(e) => setCodingTopic(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Difficulty
                      </label>
                      <select
                        className="form-input"
                        value={codingDifficulty}
                        onChange={(e) => setCodingDifficulty(e.target.value)}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Status
                      </label>
                      <select
                        className="form-input"
                        value={codingStatus}
                        onChange={(e) => setCodingStatus(e.target.value)}
                      >
                        <option value="Attempted">Attempted</option>
                        <option value="Solved">Solved</option>
                        <option value="Revisit">Revisit</option>
                        <option value="Mastered">Mastered</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              <div>
                <div style={sectionHeaderStyle}>Tracking</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Language
                    </label>
                    <select
                      className="form-input"
                      value={codingLanguage}
                      onChange={(e) => setCodingLanguage(e.target.value)}
                    >
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                      <option value="C">C</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Time Taken
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 25m or 1h"
                      value={codingTimeTaken}
                      onChange={(e) => setCodingTimeTaken(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={codingAttempts}
                      onChange={(e) => setCodingAttempts(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                  </div>
                </div>
              </div>

              {/* Learning */}
              <div>
                <div style={sectionHeaderStyle}>Learning</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Solution Notes (Approach & Complexity)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Explain the pattern, algorithm approach, and time/space complexity..."
                      value={codingSolutionNotes}
                      onChange={(e) => setCodingSolutionNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Mistake / Learning (What went wrong, what I learned, what to remember)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                      placeholder="Record: What went wrong? What did I learn? What key edge case should I remember?"
                      value={codingMistakeLearning}
                      onChange={(e) => setCodingMistakeLearning(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Note (Fallback) */}
          {type === 'note' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Note Title
              </label>
              <input
                type="text"
                className="form-input"
                required
                autoFocus
                placeholder="e.g. Distributed consensus notes"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
          )}

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : type === 'task'
                ? 'Create Task'
                : type === 'goal'
                ? 'Create Goal'
                : type === 'learning'
                ? 'Save Session'
                : type === 'coding'
                ? 'Save Problem'
                : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
