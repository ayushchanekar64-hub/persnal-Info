import React from 'react';
import AnalyticsPreview from '../dashboard/AnalyticsPreview';

export default function AnalyticsView({ weeklyData }) {
  return (
    <div className="view-transition-container">
      <div className="animate-fade-in-up stagger-1">
        <h2 className="page-title">Personal Analytics & Telemetry</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Deep-dive patterns across focus blocks, learning retention, and task output.
        </p>
      </div>

      <AnalyticsPreview weeklyData={weeklyData} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="nexus-card motion-card animate-fade-in-up stagger-3">
          <h3 className="section-title" style={{ marginBottom: '0.85rem' }}>Daily Consistency Heatmap</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Daily consistency will be visualized here as focus blocks and task completion telemetry are logged.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: 'var(--bg-surface-muted)',
                  transition: 'transform var(--dur-fast) var(--ease-spring)'
                }}
                title={`Day ${i + 1}: No activity logged`}
              />
            ))}
          </div>
        </div>

        <div className="nexus-card motion-card animate-fade-in-up stagger-4">
          <h3 className="section-title" style={{ marginBottom: '0.85rem' }}>Output Metrics Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Task Completion Ratio</span>
              <strong className="font-mono">0.0%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Average Daily Focus</span>
              <strong className="font-mono">0.0 hrs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Problem Solving Velocity</span>
              <strong className="font-mono">0 / mo</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
