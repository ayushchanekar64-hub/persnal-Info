import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title = "No items found",
  description = "Start by adding your first entry to track steady momentum.",
  actionLabel = "+ Add Item",
  onAction,
  presets = []
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '1.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface-muted)',
        border: '1px dashed var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem'
      }}
    >
      {Icon && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.15rem'
          }}
        >
          <Icon size={18} />
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', maxWidth: 320, lineHeight: 1.45, margin: '0 auto' }}>
          {description}
        </p>
      </div>

      {presets && presets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.35rem', maxWidth: 420 }}>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-chip"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
              onClick={() => onAction && onAction(preset)}
            >
              <Sparkles size={11} color="var(--primary-500)" style={{ marginRight: 3, verticalAlign: 'middle' }} />
              {preset.label || preset}
            </button>
          ))}
        </div>
      )}

      {onAction && actionLabel && (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onAction()}
          style={{ marginTop: '0.4rem', padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
        >
          <Plus size={14} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
