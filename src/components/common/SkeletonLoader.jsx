import React from 'react';

export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'stat-card') {
    return (
      <div className="nexus-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="skeleton" style={{ width: '40%', height: '14px' }} />
          <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div className="skeleton" style={{ width: '60%', height: '28px', marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ width: '80%', height: '12px' }} />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="nexus-card" style={{ padding: '1.5rem' }}>
      <div className="skeleton" style={{ width: '30%', height: '20px', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ width: '100%', height: '80px', marginBottom: '1rem', borderRadius: 'var(--radius-md)' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="skeleton" style={{ width: '20%', height: '14px' }} />
        <div className="skeleton" style={{ width: '30%', height: '14px' }} />
      </div>
    </div>
  );
}
