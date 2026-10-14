import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Target,
  BookOpen,
  Code2,
  Repeat,
  FileText,
  Briefcase,
  Wallet,
  Clock,
  Calendar,
  AlertCircle,
  Save,
  X,
  Sparkles,
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import '../../styles/create-screen.css';

export default function CreateScreen({
  type = 'task',
  setType,
  onClose,
  returnTab = 'dashboard',
  onSave,
  goals = [],
  initialData = {}
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Entity types metadata
  const typeConfigs = [
    { id: 'task', label: 'Task', icon: CheckSquareIcon, section: 'Tasks & Priorities', color: 'var(--primary-600)' },
    { id: 'goal', label: 'Goal', icon: Target, section: 'Goals & Milestones', color: 'var(--accent-600)' },
    { id: 'coding', label: 'Coding Problem', icon: Code2, section: 'Coding Mastery', color: 'var(--success-600)' },
    { id: 'coding-session', label: 'Coding Session', icon: Clock, section: 'Coding Mastery', color: 'var(--info-500)' },
    { id: 'coding-mistake', label: 'Log Mistake', icon: AlertCircle, section: 'Coding Mastery', color: 'var(--danger-500)' },
    { id: 'learning', label: 'Learning Session', icon: BookOpen, section: 'Learning Velocity', color: 'var(--info-500)' },
    { id: 'habit', label: 'Habit', icon: Repeat, section: 'Daily Habits', color: 'var(--warning-500)' },
    { id: 'note', label: 'Note', icon: FileText, section: 'Notes & Knowledge', color: 'var(--primary-500)' },
    { id: 'career', label: 'Career Application', icon: Briefcase, section: 'Career Pipeline', color: 'var(--accent-500)' },
    { id: 'finance', label: 'Finance Entry', icon: Wallet, section: 'Finance & Budget', color: 'var(--success-500)' }
  ];

  function CheckSquareIcon(props) {
    return <CheckCircle2 {...props} />;
  }

  const currentConfig = typeConfigs.find(t => t.id === type) || typeConfigs[0];
  const IconComponent = currentConfig.icon;

  // 1. Task State
  const [taskTitle, setTaskTitle] = useState(initialData?.title || '');
  const [taskDescription, setTaskDescription] = useState(initialData?.description || '');
  const [taskCategory, setTaskCategory] = useState(initialData?.category || 'Engineering');
  const [taskPriority, setTaskPriority] = useState(initialData?.priority || 'High');
  const [taskStatus, setTaskStatus] = useState(initialData?.status || 'To Do');
  const [taskDueDate, setTaskDueDate] = useState(initialData?.due_date || todayStr);
  const [taskDueTime, setTaskDueTime] = useState(initialData?.due_time || '17:00');
  const [taskEstimatedTime, setTaskEstimatedTime] = useState(initialData?.estimated_time || '45m');
  const [taskLinkedGoalId, setTaskLinkedGoalId] = useState(initialData?.goal_id || '');
  const [taskTags, setTaskTags] = useState(initialData?.tags || '');

  // 2. Goal State
  const [goalName, setGoalName] = useState(initialData?.name || initialData?.title || '');
  const [goalDescription, setGoalDescription] = useState(initialData?.description || '');
  const [goalCategory, setGoalCategory] = useState(initialData?.category || 'Career');
  const [goalPriority, setGoalPriority] = useState(initialData?.priority || 'High');
  const [goalStartDate, setGoalStartDate] = useState(initialData?.start_date || todayStr);
  const [goalTargetDate, setGoalTargetDate] = useState(initialData?.target_date || '');
  const [goalProgress, setGoalProgress] = useState(initialData?.progress || 0);
  const [goalStatus, setGoalStatus] = useState(initialData?.status || 'In Progress');

  // 3a. Coding State
  const [codingTitle, setCodingTitle] = useState(initialData?.title || '');
  const [codingPlatform, setCodingPlatform] = useState(initialData?.platform || 'LeetCode');
  const [codingUrl, setCodingUrl] = useState(initialData?.problem_url || '');
  const [codingTopic, setCodingTopic] = useState(initialData?.topic || 'Arrays & Strings');
  const [codingDifficulty, setCodingDifficulty] = useState(initialData?.difficulty || 'Medium');
  const [codingStatus, setCodingStatus] = useState(initialData?.status || 'Solved');
  const [codingLanguage, setCodingLanguage] = useState(initialData?.programming_language || 'Python');
  const [codingTimeTaken, setCodingTimeTaken] = useState(initialData?.time_taken || '30m');
  const [codingAttempts, setCodingAttempts] = useState(initialData?.attempts || 1);
  const [codingSolutionNotes, setCodingSolutionNotes] = useState(initialData?.solution_notes || '');
  const [codingMistakeLearning, setCodingMistakeLearning] = useState(initialData?.mistake_learning || '');

  // 3b. Coding Session State
  const [sessionDate, setSessionDate] = useState(initialData?.date || todayStr);
  const [sessionStartTime, setSessionStartTime] = useState(initialData?.start_time || '');
  const [sessionEndTime, setSessionEndTime] = useState(initialData?.end_time || '');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(initialData?.duration_minutes || 60);
  const [sessionProblemsSolved, setSessionProblemsSolved] = useState(initialData?.problems_solved || 2);
  const [sessionTopicsPracticed, setSessionTopicsPracticed] = useState(initialData?.topics_practiced || '');
  const [sessionNotes, setSessionNotes] = useState(initialData?.notes || '');

  // 3c. Coding Mistake State
  const [mistakeProblemTitle, setMistakeProblemTitle] = useState(initialData?.problem_title || '');
  const [mistakeTopic, setMistakeTopic] = useState(initialData?.topic || '');
  const [mistakeWhyFailed, setMistakeWhyFailed] = useState(initialData?.why_failed || '');
  const [mistakeCorrectApproach, setMistakeCorrectApproach] = useState(initialData?.correct_approach || '');
  const [mistakeWhatToRemember, setMistakeWhatToRemember] = useState(initialData?.what_to_remember || '');

  // 4. Learning State
  const [learningSkill, setLearningSkill] = useState(initialData?.skill || initialData?.title || '');
  const [learningTopic, setLearningTopic] = useState(initialData?.topic || '');
  const [learningCourse, setLearningCourse] = useState(initialData?.course || '');
  const [learningCategory, setLearningCategory] = useState(initialData?.category || 'Technical');
  const [learningDate, setLearningDate] = useState(initialData?.learning_date || todayStr);
  const [learningDuration, setLearningDuration] = useState(initialData?.duration || '1.5h');
  const [learningStatus, setLearningStatus] = useState(initialData?.status || 'Learning');
  const [learningProgress, setLearningProgress] = useState(initialData?.progress || 25);
  const [learningNotes, setLearningNotes] = useState(initialData?.notes || '');

  // 5. Habit State
  const [habitName, setHabitName] = useState(initialData?.name || initialData?.title || '');
  const [habitCategory, setHabitCategory] = useState(initialData?.category || 'Productivity');
  const [habitFrequency, setHabitFrequency] = useState(initialData?.frequency || 'Daily');
  const [habitTargetCount, setHabitTargetCount] = useState(initialData?.target_count || 1);
  const [habitReminderTime, setHabitReminderTime] = useState(initialData?.reminder_time || '09:00');
  const [habitDescription, setHabitDescription] = useState(initialData?.description || '');

  // 6. Note State
  const [noteTitle, setNoteTitle] = useState(initialData?.title || '');
  const [noteCategory, setNoteCategory] = useState(initialData?.category || 'Architecture');
  const [noteTags, setNoteTags] = useState(initialData?.tags || '');
  const [noteContent, setNoteContent] = useState(initialData?.content || '');
  const [noteIsPinned, setNoteIsPinned] = useState(initialData?.is_pinned || false);
  const [noteIsFavorite, setNoteIsFavorite] = useState(initialData?.is_favorite || false);

  // 7. Career State
  const [careerCompany, setCareerCompany] = useState(initialData?.company || '');
  const [careerRole, setCareerRole] = useState(initialData?.role || '');
  const [careerStatus, setCareerStatus] = useState(initialData?.status || 'Applied');
  const [careerJobUrl, setCareerJobUrl] = useState(initialData?.job_url || '');
  const [careerLocation, setCareerLocation] = useState(initialData?.location || 'Remote');
  const [careerSalary, setCareerSalary] = useState(initialData?.salary || '');
  const [careerNotes, setCareerNotes] = useState(initialData?.notes || '');

  // 8. Finance State
  const [financeType, setFinanceType] = useState(initialData?.type || 'Expense');
  const [financeAmount, setFinanceAmount] = useState(initialData?.amount || '');
  const [financeCategory, setFinanceCategory] = useState(initialData?.category || 'Tech & Tools');
  const [financeDate, setFinanceDate] = useState(initialData?.date || todayStr);
  const [financePaymentMethod, setFinancePaymentMethod] = useState(initialData?.payment_method || 'Card');
  const [financeDescription, setFinanceDescription] = useState(initialData?.description || '');
  const [financeIsRecurring, setFinanceIsRecurring] = useState(initialData?.is_recurring || false);

  // Validation and Submitting State
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValidationError('');
  }, [type]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    try {
      if (type === 'task') {
        if (!taskTitle.trim()) {
          setValidationError('Task Title is required.');
          return;
        }
        setSubmitting(true);
        await onSave('task', {
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          category: taskCategory,
          priority: taskPriority,
          status: taskStatus,
          due_date: taskDueDate || undefined,
          due_time: taskDueTime || undefined,
          estimated_time: taskEstimatedTime || undefined,
          goal_id: taskLinkedGoalId || undefined,
          tags: taskTags.trim() || undefined
        });
      } else if (type === 'goal') {
        if (!goalName.trim()) {
          setValidationError('Goal Name is required.');
          return;
        }
        setSubmitting(true);
        await onSave('goal', {
          name: goalName.trim(),
          description: goalDescription.trim() || undefined,
          category: goalCategory,
          priority: goalPriority,
          start_date: goalStartDate || undefined,
          target_date: goalTargetDate || undefined,
          progress: Number(goalProgress) || 0,
          status: goalStatus
        });
      } else if (type === 'coding') {
        if (!codingTitle.trim()) {
          setValidationError('Problem Title is required.');
          return;
        }
        setSubmitting(true);
        await onSave('coding', {
          title: codingTitle.trim(),
          platform: codingPlatform,
          problem_url: codingUrl.trim() || undefined,
          topic: codingTopic,
          difficulty: codingDifficulty,
          status: codingStatus,
          programming_language: codingLanguage,
          time_taken: codingTimeTaken || undefined,
          attempts: Number(codingAttempts) || 1,
          solution_notes: codingSolutionNotes.trim() || undefined,
          mistake_learning: codingMistakeLearning.trim() || undefined
        });
      } else if (type === 'coding-session') {
        setSubmitting(true);
        await onSave('coding-session', {
          date: sessionDate,
          start_time: sessionStartTime || undefined,
          end_time: sessionEndTime || undefined,
          duration_minutes: Number(sessionDurationMinutes) || 0,
          problems_solved: Number(sessionProblemsSolved) || 0,
          topics_practiced: sessionTopicsPracticed.trim() || undefined,
          notes: sessionNotes.trim() || undefined
        });
      } else if (type === 'coding-mistake') {
        if (!mistakeProblemTitle.trim()) {
          setValidationError('Problem Title is required.');
          return;
        }
        setSubmitting(true);
        await onSave('coding-mistake', {
          problem_title: mistakeProblemTitle.trim(),
          topic: mistakeTopic.trim() || undefined,
          why_failed: mistakeWhyFailed.trim() || undefined,
          correct_approach: mistakeCorrectApproach.trim() || undefined,
          what_to_remember: mistakeWhatToRemember.trim() || undefined,
          review_status: 'Needs Review'
        });
      } else if (type === 'learning') {
        if (!learningSkill.trim()) {
          setValidationError('Skill or Topic Title is required.');
          return;
        }
        setSubmitting(true);
        await onSave('learning', {
          skill: learningSkill.trim(),
          topic: learningTopic.trim() || undefined,
          course: learningCourse.trim() || undefined,
          category: learningCategory,
          learning_date: learningDate || undefined,
          duration: learningDuration || undefined,
          status: learningStatus,
          progress: Number(learningProgress) || 0,
          notes: learningNotes.trim() || undefined
        });
      } else if (type === 'habit') {
        if (!habitName.trim()) {
          setValidationError('Habit Name is required.');
          return;
        }
        setSubmitting(true);
        await onSave('habit', {
          name: habitName.trim(),
          description: habitDescription.trim() || undefined,
          category: habitCategory,
          frequency: habitFrequency,
          target_count: Number(habitTargetCount) || 1,
          reminder_time: habitReminderTime || undefined
        });
      } else if (type === 'note') {
        if (!noteTitle.trim()) {
          setValidationError('Note Title is required.');
          return;
        }
        setSubmitting(true);
        await onSave('note', {
          title: noteTitle.trim(),
          category: noteCategory,
          tags: noteTags.trim() || undefined,
          content: noteContent.trim() || '',
          is_pinned: noteIsPinned,
          is_favorite: noteIsFavorite
        });
      } else if (type === 'career') {
        if (!careerCompany.trim() || !careerRole.trim()) {
          setValidationError('Company and Role are required.');
          return;
        }
        setSubmitting(true);
        await onSave('career', {
          company: careerCompany.trim(),
          role: careerRole.trim(),
          status: careerStatus,
          job_url: careerJobUrl.trim() || undefined,
          location: careerLocation || 'Remote',
          salary: careerSalary.trim() || undefined,
          notes: careerNotes.trim() || undefined
        });
      } else if (type === 'finance') {
        if (!financeAmount || isNaN(parseFloat(financeAmount))) {
          setValidationError('A valid numeric amount is required.');
          return;
        }
        setSubmitting(true);
        await onSave('finance', {
          type: financeType,
          amount: parseFloat(financeAmount),
          category: financeCategory,
          date: financeDate || todayStr,
          payment_method: financePaymentMethod,
          description: financeDescription.trim() || undefined,
          is_recurring: financeIsRecurring
        });
      }
    } catch (err) {
      setValidationError(err.message || 'Failed to save record. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-screen-container">
      {/* Top Header Bar */}
      <div className="create-screen-header">
        <div className="create-header-left">
          <button
            className="create-breadcrumb-btn"
            onClick={onClose}
            type="button"
          >
            <ArrowLeft size={14} /> Back to {returnTab.charAt(0).toUpperCase() + returnTab.slice(1)}
          </button>
          <h1 className="create-title">
            <span style={{ color: currentConfig.color }}>
              <IconComponent size={22} />
            </span>
            <span>New {currentConfig.label}</span>
          </h1>
          <p className="create-subtitle">
            Create and save a new entry to your private, isolated workspace.
          </p>
        </div>

        <div className="create-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={14} />
            <span>{submitting ? 'Saving...' : `Save ${currentConfig.label}`}</span>
          </button>
        </div>
      </div>


      {/* Validation Error Alert */}
      {validationError && (
        <div className="create-validation-banner">
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="create-form-content">
        {/* ==================== 1. TASK FORM ==================== */}
        {type === 'task' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <CheckCircle2 size={16} color="var(--primary-600)" />
                <h2 className="create-section-title">Task Core Details</h2>
                <span className="create-section-desc">Define the action item and priority</span>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Task Title <span className="form-label-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Implement secure token refresh mechanism"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Deep Work">Deep Work</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="create-section-card">
              <div className="create-section-header">
                <Clock size={16} color="var(--primary-600)" />
                <h2 className="create-section-title">Schedule & Milestone Link</h2>
                <span className="create-section-desc">Set deadlines and link to active goals</span>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Due Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 45m, 2h"
                    value={taskEstimatedTime}
                    onChange={(e) => setTaskEstimatedTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">Linked Goal</label>
                  <select
                    className="form-select"
                    value={taskLinkedGoalId}
                    onChange={(e) => setTaskLinkedGoalId(e.target.value)}
                  >
                    <option value="">None (Independent Task)</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.progress}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., frontend, auth, high-impact"
                    value={taskTags}
                    onChange={(e) => setTaskTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="create-section-card">
              <div className="create-section-header">
                <FileText size={16} color="var(--primary-600)" />
                <h2 className="create-section-title">Notes & Description</h2>
                <span className="create-section-desc">Add context or acceptance criteria</span>
              </div>

              <div className="form-grid-full">
                <textarea
                  className="form-textarea"
                  placeholder="Outline requirements, links, or notes for this task..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 2. GOAL FORM ==================== */}
        {type === 'goal' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <Target size={16} color="var(--accent-600)" />
                <h2 className="create-section-title">Goal Target & Priority</h2>
                <span className="create-section-desc">Define your long-term objective</span>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Goal Name <span className="form-label-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Master System Design & Microservices"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                  >
                    <option value="Career">Career</option>
                    <option value="Technical">Technical</option>
                    <option value="Health">Health</option>
                    <option value="Financial">Financial</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value)}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={goalStatus}
                    onChange={(e) => setGoalStatus(e.target.value)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="On Track">On Track</option>
                    <option value="Needs Focus">Needs Focus</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="create-section-card">
              <div className="create-section-header">
                <Calendar size={16} color="var(--accent-600)" />
                <h2 className="create-section-title">Timeline & Target Progress</h2>
                <span className="create-section-desc">Track completion and milestones</span>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={goalStartDate}
                    onChange={(e) => setGoalStartDate(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Target Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Current Progress ({goalProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goalProgress}
                    onChange={(e) => setGoalProgress(Number(e.target.value))}
                    style={{ marginTop: '0.6rem' }}
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Description & Strategic Milestone Plan</label>
                <textarea
                  className="form-textarea"
                  placeholder="Outline key milestones and definition of done for this goal..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 3. CODING FORM ==================== */}
        {type === 'coding' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <Code2 size={16} color="var(--success-600)" />
                <h2 className="create-section-title">Problem Identification</h2>
                <span className="create-section-desc">DSA & Algorithmic Problem Log</span>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">
                    Problem Title <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 200. Number of Islands"
                    value={codingTitle}
                    onChange={(e) => setCodingTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Problem URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://leetcode.com/problems/number-of-islands/"
                    value={codingUrl}
                    onChange={(e) => setCodingUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Platform</label>
                  <select
                    className="form-select"
                    value={codingPlatform}
                    onChange={(e) => setCodingPlatform(e.target.value)}
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="NeetCode">NeetCode 150</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={codingDifficulty}
                    onChange={(e) => setCodingDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Topic / Data Structure</label>
                  <select
                    className="form-select"
                    value={codingTopic}
                    onChange={(e) => setCodingTopic(e.target.value)}
                  >
                    <option value="Arrays & Strings">Arrays & Strings</option>
                    <option value="Two Pointers">Two Pointers</option>
                    <option value="Sliding Window">Sliding Window</option>
                    <option value="Trees & BST">Trees & BST</option>
                    <option value="Graphs & BFS/DFS">Graphs & BFS/DFS</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Binary Search">Binary Search</option>
                    <option value="Stack & Queue">Stack & Queue</option>
                    <option value="Heap / Priority Queue">Heap / Priority Queue</option>
                    <option value="Backtracking">Backtracking</option>
                    <option value="Bit Manipulation">Bit Manipulation</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={codingStatus}
                    onChange={(e) => setCodingStatus(e.target.value)}
                  >
                    <option value="Solved">Solved</option>
                    <option value="Mastered">Mastered (Optimal)</option>
                    <option value="Need Review">Need Review</option>
                    <option value="Attempted">Attempted</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Language</label>
                  <select
                    className="form-select"
                    value={codingLanguage}
                    onChange={(e) => setCodingLanguage(e.target.value)}
                  >
                    <option value="Python">Python</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Go">Go</option>
                    <option value="Rust">Rust</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Time Taken</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 25m, 45m"
                    value={codingTimeTaken}
                    onChange={(e) => setCodingTimeTaken(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="create-section-card">
              <div className="create-section-header">
                <Sparkles size={16} color="var(--success-600)" />
                <h2 className="create-section-title">Solution Strategy & Takeaways</h2>
                <span className="create-section-desc">Document optimal approach and mistakes</span>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Optimal Solution Notes / Code Snippet</label>
                <textarea
                  className="form-textarea code-font"
                  placeholder="Outline time & space complexity, key algorithm pattern (e.g., O(V+E) BFS with visited set)..."
                  value={codingSolutionNotes}
                  onChange={(e) => setCodingSolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">Mistake & Key Learning / What to Remember</label>
                <textarea
                  className="form-textarea"
                  placeholder="What edge case was tricky? What intuition should be reused next time?"
                  value={codingMistakeLearning}
                  onChange={(e) => setCodingMistakeLearning(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 3B. CODING SESSION FORM ==================== */}
        {type === 'coding-session' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <Clock size={16} color="var(--info-500)" />
                <h2 className="create-section-title">Coding Session Log</h2>
                <span className="create-section-desc">Track your dedicated practice time</span>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Date <span className="form-label-req">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">Duration (minutes) <span className="form-label-req">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={sessionDurationMinutes}
                    onChange={(e) => setSessionDurationMinutes(e.target.value)}
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">Problems Solved</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={sessionProblemsSolved}
                    onChange={(e) => setSessionProblemsSolved(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={sessionStartTime}
                    onChange={(e) => setSessionStartTime(e.target.value)}
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Topics Practiced</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Graphs, DP, System Design"
                  value={sessionTopicsPracticed}
                  onChange={(e) => setSessionTopicsPracticed(e.target.value)}
                />
              </div>
              
              <div className="form-grid-full">
                <label className="form-label">Session Notes & Takeaways</label>
                <textarea
                  className="form-textarea"
                  placeholder="How did it go? What did you struggle with?"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 3C. CODING MISTAKE FORM ==================== */}
        {type === 'coding-mistake' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <AlertCircle size={16} color="var(--danger-500)" />
                <h2 className="create-section-title">Mistake Log & Review</h2>
                <span className="create-section-desc">Document failures to ensure they become learnings</span>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">Problem Title <span className="form-label-req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., LRU Cache"
                    value={mistakeProblemTitle}
                    onChange={(e) => setMistakeProblemTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">Topic / Concept</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Doubly Linked List, Hashing"
                    value={mistakeTopic}
                    onChange={(e) => setMistakeTopic(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Why I Failed (Root Cause)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Did you misread the question? Was it an off-by-one error? Didn't know the pattern?"
                  value={mistakeWhyFailed}
                  onChange={(e) => setMistakeWhyFailed(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">Correct Approach / Intuition</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain the correct logic or pattern needed to solve this..."
                  value={mistakeCorrectApproach}
                  onChange={(e) => setMistakeCorrectApproach(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">What to Remember Next Time</label>
                <textarea
                  className="form-textarea"
                  placeholder="Key takeaway to avoid repeating this mistake..."
                  value={mistakeWhatToRemember}
                  onChange={(e) => setMistakeWhatToRemember(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 4. LEARNING FORM ==================== */}
        {type === 'learning' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <BookOpen size={16} color="var(--info-500)" />
                <h2 className="create-section-title">Curriculum & Skill</h2>
                <span className="create-section-desc">Track study hours and velocity</span>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">
                    Skill or Topic Title <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Distributed Systems & Raft Consensus"
                    value={learningSkill}
                    onChange={(e) => setLearningSkill(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Course / Resource / Platform</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., MIT 6.824, Official Docs, Coursera"
                    value={learningCourse}
                    onChange={(e) => setLearningCourse(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={learningCategory}
                    onChange={(e) => setLearningCategory(e.target.value)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Architecture">Architecture</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Session Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={learningDate}
                    onChange={(e) => setLearningDate(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Duration Tracked</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 1.5h, 2h, 45m"
                    value={learningDuration}
                    onChange={(e) => setLearningDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={learningStatus}
                    onChange={(e) => setLearningStatus(e.target.value)}
                  >
                    <option value="Learning">Learning</option>
                    <option value="Practicing">Practicing</option>
                    <option value="Mastered">Mastered</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Progress ({learningProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={learningProgress}
                    onChange={(e) => setLearningProgress(Number(e.target.value))}
                    style={{ marginTop: '0.6rem' }}
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Study Notes, Key Takeaways & Resources</label>
                <textarea
                  className="form-textarea"
                  placeholder="Record summary concepts, architecture diagrams notes, or reference links..."
                  value={learningNotes}
                  onChange={(e) => setLearningNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 5. HABIT FORM ==================== */}
        {type === 'habit' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <Repeat size={16} color="var(--warning-500)" />
                <h2 className="create-section-title">Habit Routine & Frequency</h2>
                <span className="create-section-desc">Build compounding daily consistency</span>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Habit Name <span className="form-label-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 30 Minutes LeetCode or System Design Practice"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={habitFrequency}
                    onChange={(e) => setHabitFrequency(e.target.value)}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="3x per week">3x per week</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Target Count / Unit</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={habitTargetCount}
                    onChange={(e) => setHabitTargetCount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">Preferred Reminder Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={habitReminderTime}
                    onChange={(e) => setHabitReminderTime(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Why This Habit Matters (Motivation)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Keep technical problem solving sharp for interviews"
                    value={habitDescription}
                    onChange={(e) => setHabitDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== 6. NOTE FORM ==================== */}
        {type === 'note' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <FileText size={16} color="var(--primary-500)" />
                <h2 className="create-section-title">Note & Knowledge Document</h2>
                <span className="create-section-desc">Capture thoughts, architecture, and docs</span>
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Note Title <span className="form-label-req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Database Sharding & Indexing Best Practices"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Category / Tag</label>
                  <select
                    className="form-select"
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Ideas">Ideas</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Learning">Learning</option>
                    <option value="Reference">Reference</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., postgres, caching, redis"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                  />
                </div>

                <div className="form-field-group" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', marginTop: '1.4rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="nexus-checkbox"
                      checked={noteIsPinned}
                      onChange={(e) => setNoteIsPinned(e.target.checked)}
                    />
                    <span>Pin to Top</span>
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="nexus-checkbox"
                      checked={noteIsFavorite}
                      onChange={(e) => setNoteIsFavorite(e.target.checked)}
                    />
                    <span>Favorite</span>
                  </label>
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Content Body (Markdown & Notes)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write full documentation, code examples, or meeting summaries..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={8}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 7. CAREER FORM ==================== */}
        {type === 'career' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <Briefcase size={16} color="var(--accent-500)" />
                <h2 className="create-section-title">Job Application Details</h2>
                <span className="create-section-desc">Track opportunities and pipeline status</span>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="form-label">
                    Company Name <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Stripe, Google, Linear"
                    value={careerCompany}
                    onChange={(e) => setCareerCompany(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">
                    Role / Position <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Senior Full-Stack Engineer"
                    value={careerRole}
                    onChange={(e) => setCareerRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={careerStatus}
                    onChange={(e) => setCareerStatus(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screen">Recruiter Screen</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="System Design">System Design</option>
                    <option value="Final Round">Final Round</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Remote / New York / Hybrid"
                    value={careerLocation}
                    onChange={(e) => setCareerLocation(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Target Compensation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., $150,000 / yr"
                    value={careerSalary}
                    onChange={(e) => setCareerSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Job Posting URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={careerJobUrl}
                  onChange={(e) => setCareerJobUrl(e.target.value)}
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">Interview Notes & Prep Strategy</label>
                <textarea
                  className="form-textarea"
                  placeholder="Recruiter contact, expected tech stack questions, preparation focus..."
                  value={careerNotes}
                  onChange={(e) => setCareerNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== 8. FINANCE FORM ==================== */}
        {type === 'finance' && (
          <>
            <div className="create-section-card">
              <div className="create-section-header">
                <Wallet size={16} color="var(--success-500)" />
                <h2 className="create-section-title">Finance Transaction & Budget Entry</h2>
                <span className="create-section-desc">Log income, expenses, and subscriptions</span>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Transaction Type</label>
                  <select
                    className="form-select"
                    value={financeType}
                    onChange={(e) => setFinanceType(e.target.value)}
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">
                    Amount ($) <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={financeAmount}
                    onChange={(e) => setFinanceAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={financeCategory}
                    onChange={(e) => setFinanceCategory(e.target.value)}
                  >
                    <option value="Tech & Tools">Tech & Tools</option>
                    <option value="Living">Living / Housing</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Investment">Investment</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={financeDate}
                    onChange={(e) => setFinanceDate(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={financePaymentMethod}
                    onChange={(e) => setFinancePaymentMethod(e.target.value)}
                  >
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>

                <div className="form-field-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.4rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="nexus-checkbox"
                      checked={financeIsRecurring}
                      onChange={(e) => setFinanceIsRecurring(e.target.checked)}
                    />
                    <span>Recurring Monthly Subscription / Income</span>
                  </label>
                </div>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Description / Merchant</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., GitHub Copilot subscription, Cloud server hosting"
                  value={financeDescription}
                  onChange={(e) => setFinanceDescription(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Bottom Actions Bar */}
        <div className="create-bottom-bar">
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
            <Save size={15} />
            <span>{submitting ? 'Saving...' : `Save ${currentConfig.label}`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
