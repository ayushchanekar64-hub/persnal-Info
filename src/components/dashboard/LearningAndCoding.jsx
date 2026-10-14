import React, { useState } from 'react';
import {
  BarChart2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Code2,
  Plus
} from 'lucide-react';

export default function LearningAndCoding({
  learning = { skills: [], weeklyHours: 0 },
  coding = { solvedTotal: 0, thisWeek: 0, streakDays: 0, topics: [] },
  onOpenQuickAction
}) {
  const [activeMonthIndex, setActiveMonthIndex] = useState(5); // June highlighted by default

  const months = [
    { label: 'Jan', val: 35, hours: '14h', labelSub: 'Jan 24' },
    { label: 'Feb', val: 42, hours: '18h', labelSub: 'Feb 24' },
    { label: 'Mar', val: 55, hours: '22h', labelSub: 'Mar 24' },
    { label: 'Apr', val: 48, hours: '19h', labelSub: 'Apr 24' },
    { label: 'May', val: 62, hours: '26h', labelSub: 'May 24' },
    { label: 'Jun', val: 92, hours: '38.5h', labelSub: 'Jun 24 (Sprint)' },
    { label: 'Jul', val: 78, hours: '31h', labelSub: 'Jul 24' },
    { label: 'Aug', val: 70, hours: '28h', labelSub: 'Aug 24' },
    { label: 'Sept', val: 84, hours: '34h', labelSub: 'Sept 24' },
    { label: 'Oct', val: 65, hours: '25h', labelSub: 'Oct 24' },
    { label: 'Nov', val: 58, hours: '23h', labelSub: 'Nov 24' },
    { label: 'Dec', val: 72, hours: '29h', labelSub: 'Dec 24' }
  ];

  const activeData = months[activeMonthIndex];

  return (
    <div className="nexus-card striped-barchart-card motion-card animate-fade-in-up stagger-2">
      {/* Header Row */}
      <div className="striped-chart-header">
        <div className="striped-chart-title-group">
          <h3 className="section-title">Focus & Learning Analytics</h3>
          <span className="striped-chart-subtitle">Monthly learning velocity & deliberate practice telemetry</span>
        </div>

        <div className="striped-chart-header-actions">
          <button
            className="btn-icon circle-arrow-btn"
            onClick={() => onOpenQuickAction && onOpenQuickAction('learning')}
            title="Log Learning Session"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Chart Body with Vertical Striped Bars */}
      <div className="striped-chart-body">
        {/* Y-Axis scale marks */}
        <div className="striped-y-axis">
          <span>200k</span>
          <span>150k</span>
          <span>100k</span>
          <span>50k</span>
          <span>0</span>
        </div>

        {/* Bars Container */}
        <div className="striped-bars-area">
          {/* Floating Tooltip Bubble over active bar */}
          <div
            className="striped-chart-tooltip"
            style={{
              left: `calc(${(activeMonthIndex / (months.length - 1)) * 82}% + 15px)`
            }}
          >
            <div className="tooltip-indicator-dot" />
            <div className="tooltip-header-text">Study & Practice</div>
            <div className="tooltip-sub-date">{activeData.labelSub}</div>
            <div className="tooltip-val-row">
              <span className="tooltip-val">{activeData.hours} focus</span>
              <span className="tooltip-trend-pill">
                <TrendingUp size={10} /> +25%
              </span>
            </div>
          </div>

          {/* Render 12 Vertical Bars */}
          <div className="striped-bars-row">
            {months.map((m, idx) => {
              const isHighlight = idx === activeMonthIndex;
              return (
                <div
                  key={m.label}
                  className={`striped-bar-column ${isHighlight ? 'active-highlight' : ''}`}
                  onClick={() => setActiveMonthIndex(idx)}
                >
                  <div className="striped-bar-track">
                    <div
                      className="striped-bar-fill"
                      style={{ height: `${m.val}%` }}
                    />
                  </div>
                  <span className="striped-bar-label">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
