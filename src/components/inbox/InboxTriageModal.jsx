import React, { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  Trash2,
  Zap,
  BookOpen,
  Target,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/inbox.css';

export default function InboxTriageModal({ isOpen, onClose, onRefreshData }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.inbox.list(false);
      setItems(data || []);
    } catch (err) {
      console.warn('Could not load inbox items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  const handleConvert = async (item, targetType) => {
    setProcessingId(item.id);
    try {
      await api.inbox.convert(item.id, {
        target_type: targetType,
        title: item.title || item.raw_content.slice(0, 80),
        category: item.suggested_type === 'Learning' ? 'Study' : 'Inbox'
      });

      setActionSuccess(`Converted to ${targetType.toUpperCase()}!`);
      setTimeout(() => setActionSuccess(null), 2500);

      // Refresh triage list
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to convert thought:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.inbox.delete(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="inbox-triage-modal" onClick={onClose}>
      <div
        className="inbox-triage-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Frictionless Inbox Triage Queue"
      >
        <div className="hud-ambient-bar" />

        {/* Header */}
        <div className="inbox-triage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: 'rgba(124, 58, 237, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A78BFA'
              }}
            >
              <Inbox size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Inbox Zero Triage ({items.length})
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Process your captured thoughts into actionable systems in seconds.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            title="Close Triage"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Success toast */}
        {actionSuccess && (
          <div
            style={{
              padding: '0.5rem 1.4rem',
              background: 'rgba(16, 185, 129, 0.15)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <CheckCircle2 size={14} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Content list */}
        <div className="inbox-triage-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Retrieving captured thoughts...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Inbox Zero Achieved
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                Your mind is completely uncluttered. Use <kbd style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>Alt + C</kbd> anytime to capture an idea in less than 2 seconds.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              return (
                <div key={item.id} className="inbox-row-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '6px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#C084FC'
                        }}
                      >
                        {item.suggested_type || 'Idea'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={11} /> {dateStr}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {item.raw_content}
                    </p>
                  </div>

                  {/* 1-Click Triage Actions */}
                  <div className="inbox-row-actions">
                    <button
                      type="button"
                      className="inbox-btn-convert"
                      onClick={() => handleConvert(item, 'task')}
                      disabled={processingId === item.id}
                      title="Convert to Task"
                    >
                      <Zap size={12} color="#818CF8" />
                      <span>Task</span>
                    </button>

                    <button
                      type="button"
                      className="inbox-btn-convert"
                      onClick={() => handleConvert(item, 'note')}
                      disabled={processingId === item.id}
                      title="Save as Idea Note"
                    >
                      <FileText size={12} color="#FBBF24" />
                      <span>Note</span>
                    </button>

                    <button
                      type="button"
                      className="inbox-btn-convert"
                      onClick={() => handleConvert(item, 'learning')}
                      disabled={processingId === item.id}
                      title="Add to Reading/Learning List"
                    >
                      <BookOpen size={12} color="#60A5FA" />
                      <span>Learn</span>
                    </button>

                    <button
                      type="button"
                      className="inbox-btn-convert"
                      onClick={() => handleConvert(item, 'goal')}
                      disabled={processingId === item.id}
                      title="Promote to Goal"
                    >
                      <Target size={12} color="#F472B6" />
                      <span>Goal</span>
                    </button>

                    <button
                      type="button"
                      className="btn-icon"
                      style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                      onClick={() => handleDelete(item.id)}
                      title="Dismiss Thought"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
