import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  X,
  LogIn,
  CheckCircle2,
  Target,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Header({
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  onOpenQuickAction
}) {
  const { user, setAuthModalOpen } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch real notifications when authenticated
  useEffect(() => {
    if (user) {
      api.notifications.list()
        .then(setNotifications)
        .catch(() => setNotifications([]));
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Live global search debounce
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim() || !user) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.search.query(searchQuery.trim());
        setSearchResults(results);
      } catch (err) {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="top-header">
      {/* Dynamic Header Left */}
      <div className="header-left">
        <div className="header-greeting">
          <h1 className="header-greeting-title">
            {user?.name ? (
              <>Good morning, {user.name} <span>👋</span></>
            ) : (
              <>Welcome to MYNEXUS <span>✨</span></>
            )}
          </h1>
          <span className="header-greeting-subtitle">
            {user
              ? "Here's what's happening with your life and goals today."
              : "Sign in to access your private, isolated personal productivity workspace."}
          </span>
        </div>
      </div>

      {/* Header Right */}
      <div className="header-right">
        {/* Global Search Bar */}
        <div className="search-container" style={{ position: 'relative' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks, goals, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button
                className="btn-icon"
                style={{ padding: 2, marginRight: 4 }}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            ) : (
              <span className="search-kbd">⌘K</span>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults && searchResults.total > 0 && (
            <div
              className="nexus-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                maxHeight: '360px',
                overflowY: 'auto',
                zIndex: 150,
                padding: '0.75rem',
                boxShadow: 'var(--shadow-modal)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Found {searchResults.total} item{searchResults.total > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {searchResults.tasks.map(t => (
                  <div key={`st-${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-muted)', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={14} color="var(--primary-600)" />
                    <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span className="pill pill-primary" style={{ fontSize: '0.65rem' }}>Task</span>
                  </div>
                ))}
                {searchResults.goals.map(g => (
                  <div key={`sg-${g.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-muted)', fontSize: '0.8rem' }}>
                    <Target size={14} color="var(--accent-600)" />
                    <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{g.name}</span>
                    <span className="pill pill-accent" style={{ fontSize: '0.65rem' }}>Goal</span>
                  </div>
                ))}
                {searchResults.notes.map(n => (
                  <div key={`sn-${n.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-muted)', fontSize: '0.8rem' }}>
                    <FileText size={14} color="var(--warning-600)" />
                    <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{n.title}</span>
                    <span className="pill pill-warning" style={{ fontSize: '0.65rem' }}>Note</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          className="btn-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon with Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge-indicator" />}
          </button>

          {showNotifications && (
            <div
              className="nexus-card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: 320,
                zIndex: 100,
                padding: '1rem',
                boxShadow: 'var(--shadow-modal)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</span>
                <button
                  className="btn-icon"
                  style={{ padding: 2 }}
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={14} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '1.25rem 0.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.825rem' }}>
                  No notifications yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: n.is_read ? 'transparent' : 'var(--bg-surface-muted)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      <span style={{ fontWeight: n.is_read ? 400 : 600, color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      {n.body && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {n.body}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Auth or Quick Action */}
        {!user ? (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setAuthModalOpen(true)}
            style={{ gap: '0.35rem' }}
          >
            <LogIn size={15} /> Sign In
          </button>
        ) : null}

        {/* Quick Add Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!user) {
              setAuthModalOpen(true);
            } else {
              onOpenQuickAction('task');
            }
          }}
          style={{ gap: '0.35rem' }}
        >
          <span>+</span> Quick Action
        </button>
      </div>
    </header>
  );
}

