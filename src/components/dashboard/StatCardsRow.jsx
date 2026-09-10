import React from 'react';
import {
  CheckSquare,
  Target,
  BookOpen,
  Code2,
  Clock
} from 'lucide-react';

export default function StatCardsRow({ stats = {}, tasks = [] }) {
  const remainingTasks = tasks.filter(t => !t.completed).length;
  const totalTasks = tasks.length;

  const cardItems = [
    {
      id: 'tasks',
      label: "Today's Tasks",
      value: totalTasks,
      subValue: `${remainingTasks} remaining`,
      icon: CheckSquare,
      iconBg: 'rgba(99, 102, 241, 0.1)',
      iconColor: 'var(--primary-600)',
      indicator: totalTasks > 0 ? `${Math.round(((totalTasks - remainingTasks) / totalTasks) * 100)}% done` : "No tasks",
      indicatorType: 'neutral'
    },
    {
      id: 'goals',
      label: "Active Goals",
      value: stats.activeGoals || 0,
      subValue: `${stats.goalsDueSoon || 0} due soon`,
      icon: Target,
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: 'var(--accent-600)',
      indicator: (stats.activeGoals || 0) > 0 ? "On track" : "No goals",
      indicatorType: (stats.activeGoals || 0) > 0 ? 'positive' : 'neutral'
    },
    {
      id: 'learning',
      label: "Learning",
      value: `${stats.learningHours || 0}h`,
      subValue: "This week",
      icon: BookOpen,
      iconBg: 'rgba(14, 165, 233, 0.1)',
      iconColor: 'var(--info-500)',
      indicator: (stats.learningHours || 0) > 0 ? `${stats.learningHours}h logged` : "No activity",
      indicatorType: (stats.learningHours || 0) > 0 ? 'positive' : 'neutral'
    },
    {
      id: 'coding',
      label: "Coding",
      value: stats.codingSolved || 0,
      subValue: "Problems solved",
      icon: Code2,
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: 'var(--success-600)',
      indicator: stats.codingStreak ? `${stats.codingStreak}d streak` : "No streak",
      indicatorType: stats.codingStreak ? 'positive' : 'neutral'
    },
    {
      id: 'focus',
      label: "Focus Time",
      value: stats.focusTime || "0h",
      subValue: "Deep work sessions",
      icon: Clock,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: 'var(--warning-500)',
      indicator: stats.focusSessions ? `${stats.focusSessions} sessions` : "No sessions",
      indicatorType: stats.focusSessions ? 'positive' : 'neutral'
    }
  ];

  return (
    <div className="stat-cards-grid">
      {cardItems.map((c) => {
        const IconComponent = c.icon;
        return (
          <div key={c.id} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label">{c.label}</span>
              <div
                className="stat-icon-wrapper"
                style={{ background: c.iconBg, color: c.iconColor }}
              >
                <IconComponent size={16} />
              </div>
            </div>

            <div className="stat-card-val-row">
              <span className="stat-card-value">{c.value}</span>
            </div>

            <div className="stat-card-footer">
              <span>{c.subValue}</span>
              <span className={`stat-indicator-badge ${c.indicatorType}`}>
                {c.indicator}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
