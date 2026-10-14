import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Code2,
  Target,
  Layers,
  Activity
} from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPreview({
  tasks = [],
  goals = [],
  learning = {},
  coding = {},
  stats = {},
  weeklyAnalytics = [],
  onOpenQuickAction,
  onNavigate
}) {
  // Current month index as default active month (e.g., Sep = 8)
  const currentMonthIdx = new Date().getMonth();
  const [activeMonthIdx, setActiveMonthIdx] = useState(currentMonthIdx);

  // ----------------------------------------------------
  // 1. PRODUCTIVITY & EXECUTION METRICS
  // ----------------------------------------------------
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (t.completed || !t.due) return false;
    try {
      const dueDate = new Date(t.due);
      return !isNaN(dueDate.getTime()) && dueDate < now;
    } catch {
      return false;
    }
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const learningHours = stats.learningHours || learning.weeklyHours || 0;
  const codingSolved = stats.codingSolved || coding.solvedTotal || 0;
  const activeGoals = stats.activeGoals || goals.length || 0;

  // ----------------------------------------------------
  // 2. MONTHLY PRODUCTIVITY TREND CALCULATION
  // ----------------------------------------------------
  const monthlyData = useMemo(() => {
    return MONTH_NAMES.map((mName, mIdx) => {
      // Filter tasks by month created/due
      const monthTasks = tasks.filter(t => {
        const dateStr = t.created_at || t.due;
        if (!dateStr) return false;
        try {
          const d = new Date(dateStr);
          return !isNaN(d.getTime()) && d.getMonth() === mIdx;
        } catch {
          return false;
        }
      });

      const mCompleted = monthTasks.filter(t => t.completed).length;
      const mTotal = monthTasks.length;

      // Filter coding solved by month
      const mCoding = (coding.problems || []).filter(c => {
        if (!c.solved) return false;
        if (!c.created_at) return false;
        try {
          const d = new Date(c.created_at);
          return !isNaN(d.getTime()) && d.getMonth() === mIdx;
        } catch {
          return false;
        }
      }).length;

      return {
        month: mName,
        monthIdx: mIdx,
        tasksCompleted: mCompleted,
        tasksTotal: mTotal,
        focusHours: mIdx === currentMonthIdx ? learningHours : 0,
        codingSolved: mCoding > 0 ? mCoding : (mIdx === currentMonthIdx ? codingSolved : 0)
      };
    });
  }, [tasks, coding, learningHours, codingSolved, currentMonthIdx]);

  const activeMonthData = monthlyData[activeMonthIdx] || monthlyData[currentMonthIdx] || {
    month: MONTH_NAMES[currentMonthIdx],
    tasksCompleted: 0,
    tasksTotal: 0,
    focusHours: 0,
    codingSolved: 0
  };

  // SVG Geometry for 12 months
  // width = 540, height = 150
  // X coordinates for 12 points: x = 25 + idx * 44.5
  const getX = (idx) => 25 + idx * 44.5;

  // Build SVG path strings from real data
  const {
    pathTasks,
    pathTasksArea,
    pathFocus,
    pathFocusArea,
    pathCoding,
    activePointTasks,
    activePointFocus,
    activePointCoding
  } = useMemo(() => {
    // Find max value across all months to scale height
    const maxVal = Math.max(
      ...monthlyData.map(d => Math.max(d.tasksCompleted, d.focusHours, d.codingSolved)),
      5 // min ceiling for pleasant curves
    );

    const getY = (val) => {
      if (val === 0) return 140; // baseline
      const normalized = Math.min(1, val / maxVal);
      return 140 - normalized * 110; // between 30 and 140
    };

    const buildSmoothPath = (valKey) => {
      const points = monthlyData.map((d, i) => ({ x: getX(i), y: getY(d[valKey]) }));
      if (points.length === 0) return '';
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) / 2;
        const cy1 = p0.y;
        const cx2 = p0.x + (p1.x - p0.x) / 2;
        const cy2 = p1.y;
        path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
      }
      return path;
    };

    const buildSmoothAreaPath = (valKey) => {
      const points = monthlyData.map((d, i) => ({ x: getX(i), y: getY(d[valKey]) }));
      if (points.length === 0) return '';
      let path = `M ${points[0].x} 140 L ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) / 2;
        const cy1 = p0.y;
        const cx2 = p0.x + (p1.x - p0.x) / 2;
        const cy2 = p1.y;
        path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
      }
      path += ` L ${points[points.length - 1].x} 140 Z`;
      return path;
    };

    return {
      pathTasks: buildSmoothPath('tasksCompleted'),
      pathTasksArea: buildSmoothAreaPath('tasksCompleted'),
      pathFocus: buildSmoothPath('focusHours'),
      pathFocusArea: buildSmoothAreaPath('focusHours'),
      pathCoding: buildSmoothPath('codingSolved'),
      activePointTasks: { x: getX(activeMonthIdx), y: getY(activeMonthData.tasksCompleted) },
      activePointFocus: { x: getX(activeMonthIdx), y: getY(activeMonthData.focusHours) },
      activePointCoding: { x: getX(activeMonthIdx), y: getY(activeMonthData.codingSolved) }
    };
  }, [monthlyData, activeMonthIdx, activeMonthData]);

  // ----------------------------------------------------
  // 3. ACTIVITY DISTRIBUTION & DONUT RING METRICS
  // ----------------------------------------------------
  const distTasks = tasks.length;
  const distLearning = Math.round(learningHours);
  const distCoding = codingSolved;
  const distGoals = activeGoals;

  const totalActivityScore = distTasks + distLearning + distCoding + distGoals;

  const pctTasks = totalActivityScore > 0 ? Math.round((distTasks / totalActivityScore) * 100) : 0;
  const pctLearning = totalActivityScore > 0 ? Math.round((distLearning / totalActivityScore) * 100) : 0;
  const pctCoding = totalActivityScore > 0 ? Math.round((distCoding / totalActivityScore) * 100) : 0;
  const pctGoals = totalActivityScore > 0 ? Math.round((distGoals / totalActivityScore) * 100) : 0;

  // Donut Ring Geometry: r = 60 => circumference = 2 * PI * 60 = 376.99
  const CIRCUMFERENCE = 376.99;

  const segments = useMemo(() => {
    if (totalActivityScore === 0) return [];

    const raw = [
      { id: 'tasks', label: 'Tasks & Execution', val: distTasks, color: '#8B5CF6' },
      { id: 'learning', label: 'Learning & Study', val: distLearning, color: '#3B82F6' },
      { id: 'coding', label: 'Coding & Practice', val: distCoding, color: '#EC4899' },
      { id: 'goals', label: 'Goals & Milestones', val: distGoals, color: '#F59E0B' }
    ].filter(s => s.val > 0);

    let currentOffset = 0;
    return raw.map(s => {
      const strokeLen = (s.val / totalActivityScore) * CIRCUMFERENCE;
      const dashArray = `${strokeLen} ${CIRCUMFERENCE - strokeLen}`;
      const offset = -currentOffset;
      currentOffset += strokeLen;
      return {
        ...s,
        dashArray,
        offset
      };
    });
  }, [totalActivityScore, distTasks, distLearning, distCoding, distGoals]);

  return (
    <div className="analytics-bottom-split-row">
      {/* 1. LEFT CARD: PRODUCTIVITY & EXECUTION */}
      <div className="nexus-card curve-analytics-card motion-card animate-fade-in-up stagger-3">
        {/* Header */}
        <div className="striped-chart-header">
          <div>
            <h3 className="section-title">Productivity & Execution</h3>
            <span className="striped-chart-subtitle">Task completion velocity & focus consistency</span>
          </div>
          <button
            className="btn-icon circle-arrow-btn"
            onClick={() => onNavigate && onNavigate('tasks')}
            title="View All Tasks & Execution"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Content Body: Left Real Metrics + Right Dynamic Multi-line SVG */}
        <div className="curve-analytics-body">
          {/* Left metrics tags */}
          <div className="curve-side-metrics">
            {/* Metric 1: Completion Rate */}
            <div className="curve-metric-item">
              <div className="curve-metric-top">
                <span className="curve-metric-pct">{completionRate}%</span>
                <span
                  className={`kpi-trend-pill ${completionRate >= 50 ? 'positive' : 'negative'}`}
                  style={{ fontSize: '0.65rem' }}
                >
                  {completionRate >= 50 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  <span>{completionRate >= 50 ? 'On Track' : 'In Progress'}</span>
                </span>
              </div>
              <span className="curve-metric-label">
                {totalTasks > 0 ? `${completedTasks} of ${totalTasks} completed` : 'No tasks created yet'}
              </span>
            </div>

            {/* Metric 2: Pending & Overdue */}
            <div className="curve-metric-item">
              <div className="curve-metric-top">
                <span className="curve-metric-pct" style={{ color: overdueTasks > 0 ? '#EF4444' : '#F59E0B' }}>
                  {pendingTasks}
                </span>
                {overdueTasks > 0 ? (
                  <span className="kpi-trend-pill negative" style={{ fontSize: '0.65rem' }}>
                    <AlertCircle size={9} /> {overdueTasks} Overdue
                  </span>
                ) : (
                  <span className="kpi-trend-pill positive" style={{ fontSize: '0.65rem' }}>
                    <CheckCircle2 size={9} /> 0 Overdue
                  </span>
                )}
              </div>
              <span className="curve-metric-label">Pending action items</span>
            </div>

            {/* Metric 3: Focus & Learning */}
            <div className="curve-metric-item">
              <div className="curve-metric-top">
                <span className="curve-metric-pct" style={{ color: '#8B5CF6' }}>
                  {learningHours}h
                </span>
                <span className="kpi-trend-pill positive" style={{ fontSize: '0.65rem' }}>
                  <TrendingUp size={9} /> {codingSolved} Solved
                </span>
              </div>
              <span className="curve-metric-label">Focus & deliberate practice</span>
            </div>
          </div>

          {/* Right: Dynamic Multi-line SVG chart with real user telemetry */}
          <div className="curve-svg-container">
            {/* Interactive Tooltip Pill */}
            <div
              className="curve-chart-tooltip"
              style={{
                left: `clamp(10%, calc(${(activeMonthIdx / 11) * 75}% + 10px), 72%)`,
                top: '10%'
              }}
            >
              <div className="tooltip-header-row">
                <span className="tooltip-indicator-dot" />
                <span className="tooltip-title">{activeMonthData.month} Telemetry</span>
              </div>
              <span className="tooltip-subtext">Productivity Breakdown</span>
              <div className="tooltip-data-row">
                <span className="dot purple" />
                <span className="val">{activeMonthData.tasksCompleted} Tasks</span>
                <span className="trend positive">Done</span>
              </div>
              <div className="tooltip-data-row">
                <span className="dot amber" />
                <span className="val">{activeMonthData.focusHours}h Focus</span>
                <span className="trend positive">Time</span>
              </div>
              <div className="tooltip-data-row">
                <span className="dot pink" />
                <span className="val">{activeMonthData.codingSolved} Coding</span>
                <span className="trend positive">Solved</span>
              </div>
            </div>

            {/* SVG Canvas */}
            <svg viewBox="0 0 540 160" className="multi-curve-svg">
              <defs>
                <linearGradient id="tasksGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="85%" stopColor="#8B5CF6" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="focusGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
                <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="15" y1="30" x2="525" y2="30" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="15" y1="75" x2="525" y2="75" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="15" y1="120" x2="525" y2="120" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

              {/* Glowing Area Fills */}
              <path
                d={pathTasksArea}
                fill="url(#tasksGradientArea)"
              />
              <path
                d={pathFocusArea}
                fill="url(#focusGradientArea)"
              />

              {/* Vertical Dashed Guideline at active month */}
              <line
                x1={activePointTasks.x}
                y1="20"
                x2={activePointTasks.x}
                y2="145"
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Curve 1: Tasks (Purple #8B5CF6) */}
              <path
                d={pathTasks}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.75"
                strokeLinecap="round"
              />

              {/* Curve 2: Focus / Learning (Amber #F59E0B) */}
              <path
                d={pathFocus}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Curve 3: Coding (Pink #EC4899) */}
              <path
                d={pathCoding}
                fill="none"
                stroke="#EC4899"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Active Month Pulse Glow Ring */}
              <circle
                cx={activePointTasks.x}
                cy={activePointTasks.y}
                r="9"
                fill="rgba(139, 92, 246, 0.2)"
              />

              {/* Active Intersection Circles */}
              <circle
                cx={activePointTasks.x}
                cy={activePointTasks.y}
                r="4.5"
                fill="#8B5CF6"
                stroke="#FFFFFF"
                strokeWidth="2"
                filter="url(#activeGlow)"
              />
              <circle
                cx={activePointFocus.x}
                cy={activePointFocus.y}
                r="4.5"
                fill="#F59E0B"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <circle
                cx={activePointCoding.x}
                cy={activePointCoding.y}
                r="4.5"
                fill="#EC4899"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </svg>

            {/* Interactive X-axis Ticks */}
            <div className="curve-x-ticks">
              {MONTH_NAMES.map((m, idx) => (
                <span
                  key={m}
                  className={`curve-tick-btn ${idx === activeMonthIdx ? 'active-tick' : ''}`}
                  onClick={() => setActiveMonthIdx(idx)}
                  style={{ cursor: 'pointer' }}
                  title={`View ${m} productivity telemetry`}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT CARD: ACTIVITY DISTRIBUTION */}
      <div className="nexus-card donut-analytics-card motion-card animate-fade-in-up stagger-4">
        {/* Header */}
        <div className="striped-chart-header">
          <div>
            <h3 className="section-title">Activity Distribution</h3>
            <span className="striped-chart-subtitle">Effort allocation across personal growth & systems</span>
          </div>
          <button
            className="btn-icon circle-arrow-btn"
            onClick={() => onNavigate && onNavigate('analytics')}
            title="View Full Analytics Breakdown"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Content Body: Left Real Stats + Center Real Donut + Right Dynamic Legend */}
        <div className="donut-analytics-body">
          {/* Left Summary List */}
          <div className="donut-left-stats">
            <div className="donut-stat-item">
              <span className="val">{completedTasks}</span>
              <span className="lbl">completed tasks</span>
            </div>
            <div className="donut-stat-item">
              <span className="val">{pendingTasks}</span>
              <span className="lbl">pending items</span>
            </div>
            <div className="donut-stat-item">
              <span className="val">{learningHours}h</span>
              <span className="lbl">learning velocity</span>
            </div>
            <div className="donut-stat-item">
              <span className="val">{codingSolved}</span>
              <span className="lbl">problems solved</span>
            </div>
          </div>

          {/* Center: Dynamic Glowing Multi-Segment Donut Ring */}
          <div className="donut-chart-container">
            <svg viewBox="0 0 160 160" className="donut-ring-svg">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                className="donut-bg-track"
                strokeWidth="18"
              />

              {/* Render dynamic proportional segments */}
              {totalActivityScore > 0 ? (
                segments.map((seg) => (
                  <circle
                    key={seg.id}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                  />
                ))
              ) : (
                /* Empty state stroke */
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  className="donut-empty-track"
                  strokeWidth="18"
                  strokeDasharray="18 10"
                />
              )}
            </svg>

            {/* Center Donut Value */}
            <div className="donut-center-content">
              <span className="donut-center-value">
                {totalActivityScore > 0 ? totalActivityScore : '0'}
              </span>
              <span style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '-2px' }}>
                {totalActivityScore > 0 ? 'Total Items' : 'No Data'}
              </span>
            </div>
          </div>

          {/* Right: Legend Breakdown List */}
          <div className="donut-legend-list">
            <div className="donut-legend-row">
              <div className="donut-legend-bar" style={{ background: '#8B5CF6' }} />
              <div className="donut-legend-info">
                <span className="name">Tasks & Execution</span>
                <span className="amt">
                  {distTasks} {distTasks === 1 ? 'task' : 'tasks'} ({pctTasks}%)
                </span>
              </div>
            </div>

            <div className="donut-legend-row">
              <div className="donut-legend-bar" style={{ background: '#3B82F6' }} />
              <div className="donut-legend-info">
                <span className="name">Learning & Study</span>
                <span className="amt">
                  {distLearning}h logged ({pctLearning}%)
                </span>
              </div>
            </div>

            <div className="donut-legend-row">
              <div className="donut-legend-bar" style={{ background: '#EC4899' }} />
              <div className="donut-legend-info">
                <span className="name">Coding & Practice</span>
                <span className="amt">
                  {distCoding} solved ({pctCoding}%)
                </span>
              </div>
            </div>

            <div className="donut-legend-row">
              <div className="donut-legend-bar" style={{ background: '#F59E0B' }} />
              <div className="donut-legend-info">
                <span className="name">Goals & Milestones</span>
                <span className="amt">
                  {distGoals} {distGoals === 1 ? 'goal' : 'goals'} ({pctGoals}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

