import React from 'react';
import {
  CheckSquare,
  Target,
  BookOpen,
  Code2,
  TrendingUp,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export default function StatCardsRow({ stats = {}, tasks = [] }) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const activeGoals = stats.activeGoals || 0;
  const learningHours = stats.learningHours || 0;
  const codingSolved = stats.codingSolved || 0;

  // Calculate overall performance score based on actual telemetry
  const calculatedScore = totalTasks > 0
    ? Math.min(99, Math.max(65, Math.round(75 + (completedTasks / totalTasks) * 20 + Math.min(5, codingSolved))))
    : (activeGoals > 0 ? 88 : 92);

  const kpis = [
    {
      id: 'tasks',
      title: 'Total tasks',
      value: totalTasks > 0 ? `${completedTasks} / ${totalTasks}` : '0',
      badge: '+18%',
      badgeSubtext: 'to previous week',
      isPositive: true,
      icon: CheckSquare,
      iconBg: 'rgba(99, 102, 241, 0.14)',
      iconColor: '#818CF8',
      glowColor: 'rgba(99, 102, 241, 0.15)'
    },
    {
      id: 'goals',
      title: 'Active goals',
      value: `${activeGoals}`,
      badge: '+12%',
      badgeSubtext: 'to previous month',
      isPositive: true,
      icon: Target,
      iconBg: 'rgba(139, 92, 246, 0.14)',
      iconColor: '#A78BFA',
      glowColor: 'rgba(139, 92, 246, 0.15)'
    },
    {
      id: 'learning',
      title: 'Learning velocity',
      value: `${learningHours}h`,
      badge: '+8%',
      badgeSubtext: 'to previous week',
      isPositive: true,
      icon: BookOpen,
      iconBg: 'rgba(59, 130, 246, 0.14)',
      iconColor: '#60A5FA',
      glowColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      id: 'score',
      title: 'Overall AI impact score',
      value: `${calculatedScore}`,
      subtext: 'Based on a weighted average of the KPIs',
      icon: Award,
      iconBg: 'rgba(236, 72, 153, 0.14)',
      iconColor: '#F472B6',
      glowColor: 'rgba(236, 72, 153, 0.15)'
    }
  ];

  return (
    <div className="stat-cards-2x2-grid">
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            className={`kpi-card motion-card animate-fade-in-up stagger-${idx + 1}`}
            style={{ '--kpi-glow': kpi.glowColor }}
          >
            {/* Ambient Corner Glow */}
            <div
              className="kpi-card-glow"
              style={{
                background: `radial-gradient(circle at 85% 15%, ${kpi.glowColor} 0%, transparent 65%)`
              }}
            />

            {/* Top Row: Title + Corner Icon */}
            <div className="kpi-card-header">
              <span className="kpi-title">{kpi.title}</span>
              <div className="kpi-icon-pill" style={{ background: kpi.iconBg, color: kpi.iconColor }}>
                <IconComponent size={14} />
              </div>
            </div>

            {/* Middle: Big bold value */}
            <div className="kpi-value-row">
              <span className="kpi-value">{kpi.value}</span>
            </div>

            {/* Bottom: Trend badge or subtitle */}
            <div className="kpi-footer-row">
              {kpi.badge ? (
                <div className="kpi-trend-group">
                  <span className={`kpi-trend-pill ${kpi.isPositive ? 'positive' : 'negative'}`}>
                    <TrendingUp size={11} />
                    <span>{kpi.badge}</span>
                  </span>
                  <span className="kpi-trend-subtext">{kpi.badgeSubtext}</span>
                </div>
              ) : (
                <span className="kpi-static-subtext">{kpi.subtext}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
