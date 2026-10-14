import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Repeat,
  FileText,
  BookOpen,
  Code2,
  Briefcase,
  Wallet,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  X,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  taskCount,
  isMobileOpen = false,
  onCloseMobile,
  onOpenTriage,
  onOpenHUD
}) {
  const { user, logout, setAuthModalOpen, openAuth } = useAuth();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inbox', label: 'Inbox', icon: Inbox, isTriage: true }
      ]
    },
    {
      title: 'PERSONAL',
      items: [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'family', label: 'Family Members', icon: Users },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: taskCount > 0 ? taskCount : undefined },
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'habits', label: 'Habits', icon: Repeat },
        { id: 'notes', label: 'Notes', icon: FileText }
      ]
    },
    {
      title: 'GROWTH',
      items: [
        { id: 'learning', label: 'Learning', icon: BookOpen },
        { id: 'coding', label: 'Coding', icon: Code2 },
        { id: 'career', label: 'Career', icon: Briefcase }
      ]
    },
    {
      title: 'MONEY',
      items: [
        { id: 'finance', label: 'Finance', icon: Wallet }
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const showExpanded = !isCollapsed || isMobileOpen;

  return (
    <aside className={`sidebar ${isCollapsed && !isMobileOpen ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div
          className="sidebar-brand"
          onClick={() => {
            setActiveTab('dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          style={{ cursor: 'pointer' }}
          title="MIND OS — Go to Dashboard"
        >
          <img src="/logo.svg" alt="MIND OS Logo" className="brand-logo-icon" />
          {showExpanded && (
            <div className="brand-text">
              <span className="brand-title">MIND OS</span>
              <span className="brand-tagline">Your Personal Operating System.</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn-icon sidebar-collapse-toggle desktop-only-control"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="btn-icon mobile-sidebar-close-btn"
          onClick={onCloseMobile}
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        {navSections.map((sec, idx) => (
          <div key={idx} className="nav-section">
            {showExpanded && <div className="nav-section-title">{sec.title}</div>}
            <ul className="nav-list">
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (item.isTriage) {
                          if (onOpenTriage) onOpenTriage();
                          if (onCloseMobile) onCloseMobile();
                          return;
                        }
                        setActiveTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    >
                      <IconComponent className="nav-icon" />
                      {showExpanded && (
                        <>
                          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                          {item.isTriage && (
                            <span className="pill" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem', background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', fontWeight: 600 }}>
                              Alt+C
                            </span>
                          )}
                          {item.badge !== undefined && (
                            <span className="nav-item-badge">{item.badge}</span>
                          )}
                          {item.highlight && !item.badge && (
                            <span className="pill pill-accent" style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>
                              AI
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user-card"
          onClick={() => {
            if (!user) {
              if (openAuth) openAuth('signin');
              else setAuthModalOpen(true);
            } else {
              setActiveTab('profile');
            }
            if (onCloseMobile) onCloseMobile();
          }}
          title={user ? "My Profile & Personal Database" : "Click to Sign In"}
        >
          <div className="user-avatar">
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

              const avatarSrc = isImage(user?.profile_photo)
                ? user.profile_photo
                : isImage(user?.avatar)
                ? user.avatar
                : null;

              const initial = (user?.name || user?.email || 'A').trim().charAt(0).toUpperCase();

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

              return user ? <span>{initial}</span> : <User size={16} />;
            })()}
          </div>
          {showExpanded && (
            <div className="user-info">
              <span className="user-name">{user?.name || "Sign In / Register"}</span>
              <span className="user-email">{user?.email || "Click to connect"}</span>
            </div>
          )}
        </div>

        {showExpanded && (
          <div className="sidebar-footer-actions">
            {user ? (
              <>
                <button
                  className="btn-icon"
                  onClick={() => {
                    setActiveTab('settings');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Settings"
                >
                  <Settings size={15} />
                </button>
                <button
                  className="btn-icon"
                  onClick={logout}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <button
                className="btn-icon"
                onClick={() => (openAuth ? openAuth('signin') : setAuthModalOpen(true))}
                title="Sign In"
                style={{ color: 'var(--primary-600)' }}
              >
                <LogIn size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

