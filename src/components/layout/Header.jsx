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
  FileText,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Menu,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Header({
  activeTab = 'dashboard',
  setActiveTab,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  onOpenQuickAction,
  onToggleMobileMenu,
  onOpenHUD,
  onOpenTriage
}) {
  const { user, setAuthModalOpen, openAuth } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'goals', label: 'Goals' },
    { id: 'habits', label: 'Habits' },
    { id: 'learning', label: 'Learning' },
    { id: 'coding', label: 'Coding' },
    { id: 'career', label: 'Career' },
    { id: 'finance', label: 'Finance' },
    { id: 'analytics', label: 'Analytics' }
  ];

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
      {/* Left: Hamburger menu on mobile + Workspace context */}
      <div className="header-left-context">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          title="Open Navigation"
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>
        <span className="workspace-tag">Personal Workspace</span>
      </div>

      {/* Right: Search, Notifs, Theme, User Avatar & AI Assistant Button */}
      <div className="header-right-actions">
        {/* Compact Search Trigger for Mobile */}
        <button
          type="button"
          className="header-action-icon mobile-search-trigger"
          onClick={() => setShowSearchModal(true)}
          title="Search anything"
          aria-label="Search anything"
        >
          <Search size={16} />
        </button>

        {/* Global Search Bar (Desktop) */}
        <div className="search-container desktop-search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button
                className="btn-icon"
                style={{ padding: 2, marginRight: 4 }}
                onClick={() => setSearchQuery('')}
              >
                <X size={13} />
              </button>
            ) : (
              <span className="search-kbd">⌘K</span>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults && searchResults.total > 0 && (
            <div
              className="nexus-card animate-pop-in popover-menu"
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

        {/* Frictionless Inbox Instant Capture HUD Trigger */}
        <button
          type="button"
          className="btn-icon header-action-icon"
          onClick={onOpenHUD}
          title="Frictionless Inbox — Dump Idea (Alt + C)"
          style={{ position: 'relative', color: '#A78BFA' }}
        >
          <Inbox size={17} />
        </button>

        {/* Notifications Icon with Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon header-action-icon"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notif-badge-indicator" />}
          </button>

          {showNotifications && (
            <div
              className="nexus-card animate-pop-in popover-menu"
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

        {/* Theme Toggle */}
        <button
          className="btn-icon header-action-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} />}
        </button>

        {/* User Profile Chip (Reference Style) */}
        {user ? (
          <div
            className="header-user-profile-chip"
            onClick={() => setActiveTab && setActiveTab('profile')}
            title="View & Edit My Profile"
          >
            <div className="header-user-avatar">
              {(() => {
                const isImage = (val) =>
                  typeof val === 'string' &&
                  (val.startsWith('http://') ||
                    val.startsWith('https://') ||
                    val.startsWith('data:image/') ||
                    val.startsWith('blob:') ||
                    val.startsWith('/assets') ||
                    val.includes('.png') ||
                    val.includes('.jpg') ||
                    val.includes('.jpeg') ||
                    val.includes('.webp'));

                const avatarSrc = isImage(user.profile_photo)
                  ? user.profile_photo
                  : isImage(user.avatar)
                  ? user.avatar
                  : null;

                const initial = (user.name || user.email || 'A').trim().charAt(0).toUpperCase();

                if (avatarSrc) {
                  return (
                    <>
                      <img
                        src={avatarSrc}
                        alt={user.name || 'User'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback-initial');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <span className="avatar-fallback-initial" style={{ display: 'none' }}>
                        {initial}
                      </span>
                    </>
                  );
                }

                return <span>{initial}</span>;
              })()}
            </div>
            <div className="header-user-details">
              <span className="header-user-name">{user.name || user.email.split('@')[0]}</span>
              <span className="header-user-role">{user.role || 'Member'}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => (openAuth ? openAuth('signin') : setAuthModalOpen(true))}
              style={{ gap: '0.35rem', fontWeight: 500 }}
              title="Sign In to MIND OS"
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => (openAuth ? openAuth('signup') : setAuthModalOpen(true))}
              style={{
                gap: '0.35rem',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                borderColor: '#8B5CF6',
                color: '#FFFFFF',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
              }}
              title="Create a MIND OS Account"
            >
              <Sparkles size={13} /> Sign Up
            </button>
          </div>
        )}

        {/* Glowing Gradient AI Assistant / Quick Action Button (Reference Match) */}
        <button
          className="btn-ai-assistant-pill"
          onClick={() => {
            if (activeTab === 'ai-assistant') {
              onOpenQuickAction('task');
            } else if (setActiveTab) {
              setActiveTab('ai-assistant');
            }
          }}
        >
          <Sparkles size={14} className="sparkle-icon" />
          <span>AI Assistant</span>
        </button>
      </div>
    </header>
  );
}
