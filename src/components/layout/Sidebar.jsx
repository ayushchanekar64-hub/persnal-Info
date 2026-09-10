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
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  taskCount
}) {
  const { user, logout, setAuthModalOpen } = useAuth();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'PERSONAL',
      items: [
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

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <img src="/logo.svg" alt="MYNEXUS Logo" className="brand-logo-icon" />
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-title">MYNEXUS</span>
              <span className="brand-tagline">One Place. Everything You.</span>
            </div>
          )}
        </div>
        <button
          className="btn-icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        {navSections.map((sec, idx) => (
          <div key={idx} className="nav-section">
            {!isCollapsed && <div className="nav-section-title">{sec.title}</div>}
            <ul className="nav-list">
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <IconComponent className="nav-icon" />
                      {!isCollapsed && (
                        <>
                          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
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
              setAuthModalOpen(true);
            } else {
              setActiveTab('settings');
            }
          }}
          title={user ? "User Profile & Settings" : "Click to Sign In"}
        >
          <div className="user-avatar">
            {user?.avatar ? user.avatar : <User size={16} />}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">{user?.name || "Sign In / Register"}</span>
              <span className="user-email">{user?.email || "Click to connect"}</span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="sidebar-footer-actions">
            {user ? (
              <>
                <button
                  className="btn-icon"
                  onClick={() => setActiveTab('settings')}
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
                onClick={() => setAuthModalOpen(true)}
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

