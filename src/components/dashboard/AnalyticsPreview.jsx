import React, { useState } from 'react';
import {
  BarChart3
} from 'lucide-react';

export default function AnalyticsPreview({ weeklyData = [] }) {
  const [activeMetric, setActiveMetric] = useState('tasks');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const defaultDays = [
    { day: "Mon", tasks: 0, hours: 0, coding: 0 },
    { day: "Tue", tasks: 0, hours: 0, coding: 0 },
    { day: "Wed", tasks: 0, hours: 0, coding: 0 },
    { day: "Thu", tasks: 0, hours: 0, coding: 0 },
    { day: "Fri", tasks: 0, hours: 0, coding: 0 },
    { day: "Sat", tasks: 0, hours: 0, coding: 0 },
    { day: "Sun", tasks: 0, hours: 0, coding: 0 }
  ];

  const dataToUse = weeklyData && weeklyData.length > 0 ? weeklyData : defaultDays;

  const metrics = [
    { id: 'tasks', label: 'Tasks Done', color: '#6366F1', unit: 'tasks' },
    { id: 'hours', label: 'Learning Hours', color: '#0EA5E9', unit: 'hrs' },
    { id: 'coding', label: 'DSA Solved', color: '#10B981', unit: 'problems' }
  ];

  const currentMetric = metrics.find(m => m.id === activeMetric);
  const values = dataToUse.map(d => d[activeMetric] || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...values, 1);

  return (
    <div className="nexus-card">
      <div className="nexus-card-header">
        <div className="nexus-card-title-group">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)' }}>
            <BarChart3 size={16} />
          </div>
          <div>
            <h2 className="card-title">Weekly Momentum</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              7-day performance across core dimensions
            </span>
          </div>
        </div>

        {/* Metric Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
          {metrics.map((m) => (
            <button
              key={m.id}
              className={`btn-ghost btn-sm ${activeMetric === m.id ? 'pill-primary' : ''}`}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}
              onClick={() => setActiveMetric(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {total} {currentMetric.unit}
          </span>
          <span style={{ fontSize: '0.75rem', color: total > 0 ? 'var(--success-600)' : 'var(--text-tertiary)', fontWeight: 500 }}>
            {total > 0 ? "Active momentum" : "No activity recorded this week"}
          </span>
        </div>
        <span style={{ fontSize: '0.735rem', color: 'var(--text-tertiary)' }}>
          Mon – Sun
        </span>
      </div>

      {/* Clean Custom SVG Bar Chart */}
      <div style={{ position: 'relative', width: '100%', height: '140px', marginTop: '0.5rem' }}>
        <svg viewBox="0 0 700 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Subtle Grid Lines */}
          <line x1="0" y1="20" x2="700" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <line x1="0" y1="65" x2="700" y2="65" stroke="var(--border-subtle)" strokeDasharray="3 3" />
          <line x1="0" y1="110" x2="700" y2="110" stroke="var(--border-subtle)" strokeDasharray="3 3" />

          {dataToUse.map((d, i) => {
            const barWidth = 44;
            const x = 50 + i * 95;
            const val = d[activeMetric] || 0;
            const barHeight = val > 0 ? Math.max((val / maxValue) * 90, 8) : 4;
            const y = 110 - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={val > 0 ? (isHovered ? currentMetric.color : 'var(--primary-200)') : 'var(--border-subtle)'}
                  opacity={isHovered ? 1 : 0.7}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Day Label */}
                <text
                  x={x + barWidth / 2}
                  y="128"
                  textAnchor="middle"
                  fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontSize="12"
                  fontWeight={isHovered ? '600' : '400'}
                  fontFamily="inherit"
                >
                  {d.day}
                </text>

                {/* Value on Hover or top */}
                {isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill={currentMetric.color}
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="JetBrains Mono"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
