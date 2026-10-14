import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Search, Copy, Check, Trash2, Tag, Calendar, Sparkles } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/modules.css';

export default function NotesView({ onOpenQuickAction }) {
  const { user, setAuthModalOpen } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      return;
    }
    try {
      const list = await api.notes.list();
      setNotes(list.map(n => ({
        id: n.id,
        title: n.title,
        tag: n.tags ? n.tags.split(',')[0].trim() : 'General',
        tags: n.tags ? n.tags.split(',').map(t => t.trim()).filter(Boolean) : ['General'],
        date: new Date(n.updated_at || n.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        content: n.content || '',
        snippet: n.content ? (n.content.length > 140 ? n.content.substring(0, 140) + '...' : n.content) : 'No additional content provided.'
      })));
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  // Telemetry KPIs
  const kpis = useMemo(() => {
    const total = notes.length;
    const tagSet = new Set();
    notes.forEach(n => (n.tags || []).forEach(t => tagSet.add(t)));
    const totalWords = notes.reduce((acc, n) => acc + (n.content ? n.content.split(/\s+/).length : 0), 0);

    return { total, uniqueTags: tagSet.size, totalWords };
  }, [notes]);

  // Unique tags for filter pills
  const availableTags = useMemo(() => {
    const tags = new Set(['All']);
    notes.forEach(n => {
      (n.tags || []).forEach(t => tags.add(t));
    });
    return Array.from(tags);
  }, [notes]);

  // Filtered notes
  const filtered = useMemo(() => {
    return notes.filter(n => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tag.toLowerCase().includes(q);

      const matchesTag = selectedTag === 'All' || (n.tags || []).includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [notes, search, selectedTag]);

  const handleOpenCreateNote = (preset) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (onOpenQuickAction) {
      onOpenQuickAction('note', preset);
    }
  };

  const handleCopyNote = (note, e) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.content || note.snippet}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setNotes(prev => prev.filter(n => n.id !== noteId));
    try {
      await api.notes.delete(noteId);
    } catch (err) {
      console.error('Failed to delete note:', err);
      fetchNotes();
    }
  };

  return (
    <div className="view-transition-container">
      {/* View Header */}
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Personal Knowledge Base</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Fast notes, architectural learnings, mental models, and documentation.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenCreateNote()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)' }}
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Telemetry KPI Strip */}
      <div className="mod-kpi-grid animate-fade-in-up stagger-2">
        <div className="mod-kpi-card">
          <div className="mod-kpi-icon purple">
            <FileText size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.total}</span>
            <span className="mod-kpi-lbl">Total Notes</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon cyan">
            <Tag size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.uniqueTags}</span>
            <span className="mod-kpi-lbl">Categories & Tags</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon emerald">
            <Sparkles size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{kpis.totalWords}</span>
            <span className="mod-kpi-lbl">Total Words Logged</span>
          </div>
        </div>

        <div className="mod-kpi-card">
          <div className="mod-kpi-icon amber">
            <Calendar size={22} />
          </div>
          <div className="mod-kpi-content">
            <span className="mod-kpi-val">{notes[0]?.date || 'Today'}</span>
            <span className="mod-kpi-lbl">Last Synced</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Tags */}
      <div className="mod-toolbar animate-fade-in-up stagger-3">
        <div className="mod-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="mod-search-input"
            placeholder="Search titles, tags, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {availableTags.length > 1 && (
          <div className="mod-pills-row">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: 2 }}>TAG:</span>
            {availableTags.slice(0, 6).map(tag => (
              <button
                key={tag}
                className={`mod-pill-btn ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes in your second brain yet"
          description="Capture architectural insights, meeting takeaways, or study summaries to build your personal knowledge base."
          actionLabel="+ Create First Note"
          presets={[
            { label: 'Database Indexing & Query Plans' },
            { label: 'System Design Architecture Cheat Sheet' },
            { label: 'API Security & Rate Limiting Guardrails' }
          ]}
          onAction={handleOpenCreateNote}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching notes found"
          description="Try broadening your search query or switching tag filter."
          actionLabel="Reset Search"
          onAction={() => { setSearch(''); setSelectedTag('All'); }}
        />
      ) : (
        <div className="notes-grid">
          {filtered.map((n, idx) => (
            <div 
              key={n.id || idx} 
              className={`note-item-card animate-fade-in-up stagger-${Math.min(idx + 3, 8)}`}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="goal-category-tag" style={{ fontSize: '0.68rem', padding: '0.18rem 0.55rem' }}>
                    {n.tag}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {n.date}
                  </span>
                </div>

                <h3 className="note-title">{n.title}</h3>
                <p className="note-snippet">{n.snippet}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {n.content ? `${n.content.split(/\s+/).length} words` : 'Snippet'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={(e) => handleCopyNote(n, e)}
                    className="mod-pill-btn"
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem' }}
                    title="Copy Note to Clipboard"
                  >
                    {copiedId === n.id ? (
                      <>
                        <Check size={11} color="#10B981" />
                        <span style={{ color: '#10B981' }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {user && (
                    <button
                      onClick={(e) => handleDeleteNote(n.id, e)}
                      title="Delete Note"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '3px 5px',
                        borderRadius: '4px',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
