import React from 'react';
import { User, Check } from 'lucide-react';

export default function SettingsView({ user, theme, setTheme }) {
  const isAuth = !!user?.email;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 840 }}>
      <div>
        <h2 className="page-title">System Settings & Profile</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Manage your personal operating system configurations, preferences, and identity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="nexus-card">
        <h3 className="section-title" style={{ marginBottom: '1.15rem' }}>Profile & Identity</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="user-avatar" style={{ width: 56, height: 56, fontSize: '1.35rem' }}>
            {user?.avatar ? user.avatar : <User size={24} />}
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{user?.name || "Guest User"}</h4>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              {user?.email || "No account linked"}
            </span>
            <div style={{ marginTop: '0.25rem' }}>
              <span className="pill pill-muted">
                {isAuth ? (user?.role || "Member") : "Not Authenticated"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Display Name
            </label>
            <input
              type="text"
              className="form-input"
              defaultValue={user?.name || ""}
              placeholder="Enter display name"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email
            </label>
            <input
              type="email"
              className="form-input"
              defaultValue={user?.email || ""}
              placeholder="Enter email address"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="nexus-card">
        <h3 className="section-title" style={{ marginBottom: '1.15rem' }}>Theme & Appearance</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div
            className={`nexus-card ${theme === 'light' ? 'glass-surface' : ''}`}
            style={{
              flex: 1,
              padding: '1rem',
              cursor: 'pointer',
              border: theme === 'light' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={() => setTheme('light')}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Calm Light</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Clean white and soft neutrals</span>
            </div>
            {theme === 'light' && <Check size={18} color="var(--primary-600)" />}
          </div>

          <div
            className={`nexus-card ${theme === 'dark' ? 'glass-surface' : ''}`}
            style={{
              flex: 1,
              padding: '1rem',
              cursor: 'pointer',
              border: theme === 'dark' ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={() => setTheme('dark')}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Pure Black OLED</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>OLED pure black theme with purple accents</span>
            </div>
            {theme === 'dark' && <Check size={18} color="var(--primary-400)" />}
          </div>
        </div>
      </div>
    </div>
  );
}
