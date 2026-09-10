import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

export default function EmptyState({
  title = "No items found",
  description = "Start by creating your first entry and make steady progress.",
  actionLabel = "+ Create Item",
  onAction
}) {
  return (
    <div
      className="nexus-card"
      style={{
        textAlign: 'center',
        padding: '3.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem'
      }}
    >
      <div
        className="stat-icon-wrapper"
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--primary-50)',
          color: 'var(--primary-600)',
          marginBottom: '0.25rem'
        }}
      >
        <FolderOpen size={24} />
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.835rem', color: 'var(--text-tertiary)', maxWidth: 360, lineHeight: 1.5 }}>
        {description}
      </p>

      {onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          <Plus size={15} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
