import React from 'react';
import { LayoutDashboard, CheckSquare, Target, Repeat, Menu } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  taskCount = 0,
  onOpenMenu
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: taskCount > 0 ? taskCount : undefined },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Habits', icon: Repeat },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={19} />
              {tab.badge !== undefined && (
                <span className="mobile-nav-badge">{tab.badge}</span>
              )}
            </div>
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        );
      })}

      {/* 5th Tab: Menu Drawer Toggle */}
      <button
        type="button"
        className="mobile-bottom-nav-item"
        onClick={onOpenMenu}
        aria-label="Open More Navigation"
      >
        <div className="mobile-nav-icon-wrap">
          <Menu size={19} />
        </div>
        <span className="mobile-nav-label">More</span>
      </button>
    </nav>
  );
}
