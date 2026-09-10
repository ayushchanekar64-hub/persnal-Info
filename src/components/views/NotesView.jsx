import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, X } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NotesView({ onOpenQuickAction }) {
  const { user, setAuthModalOpen } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Architecture');

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
        date: new Date(n.updated_at || n.created_at).toLocaleDateString(),
        snippet: n.content ? (n.content.length > 120 ? n.content.substring(0, 120) + '...' : n.content) : 'No content'
      })));
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newTitle.trim()) return;

    try {
      await api.notes.create({
        title: newTitle.trim(),
        content: newContent.trim(),
        tags: newTag
      });
      setNewTitle('');
      setNewContent('');
      setShowCreateModal(false);
      fetchNotes();
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.snippet.toLowerCase().includes(search.toLowerCase()) ||
    n.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Personal Knowledge Base</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Fast notes, architectural learnings, and mental models.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!user) setAuthModalOpen(true);
            else setShowCreateModal(true);
          }}
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {notes.length > 0 && (
        <div className="nexus-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: 360 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0 }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Fast notes, architectural learnings, and mental models. Capture your first note to build your personal knowledge base."
          actionLabel="+ New Note"
          onAction={() => {
            if (!user) setAuthModalOpen(true);
            else setShowCreateModal(true);
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((n) => (
            <div key={n.id} className="nexus-card nexus-card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="pill pill-primary">{n.tag}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.date}</span>
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {n.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {n.snippet}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                <span className="pill pill-muted" style={{ fontSize: '0.72rem' }}>Markdown Ready</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Note Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Create New Note</h3>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateNote} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="e.g. Distributed Consensus Patterns"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Tag
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Architecture, Algorithm, Design..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Content
                </label>
                <textarea
                  rows={4}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Draft insights, key takeaways, architectural decisions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
