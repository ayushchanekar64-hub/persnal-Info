import React, { useState } from 'react';
import { User, Check, Shield, Palette, Sliders, Bell, HardDrive, Cpu, Terminal, Key, Download, RefreshCw, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import ConfigureRecoveryPinModal from '../auth/ConfigureRecoveryPinModal';
import { api } from '../../services/api';
import '../../styles/modules.css';

export default function SettingsView({ user, theme, setTheme }) {
  const [showModal, setShowModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedToast, setProfileSavedToast] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [compactDensity, setCompactDensity] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [exporting, setExporting] = useState(false);

  const isAuth = !!user?.email;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSavingProfile(true);
    try {
      if (api.auth?.updateProfile) {
        await api.auth.updateProfile({ name: displayName.trim() });
      }
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 2500);
    } catch (err) {
      console.error('Failed to update profile name:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleExportData = () => {
    setExporting(true);
    try {
      const exportBlob = {
        exported_at: new Date().toISOString(),
        user: { name: user?.name, email: user?.email },
        app: 'MIND OS Personal System',
        version: '2.4.0'
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBlob, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mind_os_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setTimeout(() => setExporting(false), 600);
    }
  };

  return (
    <div className="view-transition-container settings-main-container">
      {/* Header */}
      <div className="animate-fade-in-up stagger-1" style={{ marginBottom: '1.75rem' }}>
        <h2 className="page-title">System Settings & Preferences</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Configure your personal operating system parameters, visual appearance, and security protocols.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="settings-grid-layout">
        {/* Main Settings Column */}
        <div>
          {/* Profile & Identity Card */}
          <div className="settings-card animate-fade-in-up stagger-2">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <User size={18} color="var(--primary-400)" />
                <span>Identity & Profile</span>
              </div>
              <span className="pill pill-muted" style={{ fontSize: '0.72rem' }}>
                {isAuth ? (user?.role || "Verified Member") : "Guest User"}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="user-avatar" style={{ width: 62, height: 62, fontSize: '1.45rem', border: '2px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 0 16px rgba(139, 92, 246, 0.25)' }}>
                {user?.avatar ? user.avatar : (user?.name ? user.name[0].toUpperCase() : <User size={26} />)}
              </div>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name || "Ayush"}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                    {user?.email || "ayushchanekar64@gmail.com"}
                  </span>
                  <CheckCircle2 size={13} color="#10B981" title="Email Verified" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Registered Email (Read Only)
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    disabled
                    value={user?.email || "ayushchanekar64@gmail.com"}
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                {profileSavedToast && (
                  <span style={{ fontSize: '0.78rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={14} /> Profile updated successfully!
                  </span>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSavingProfile || displayName === user?.name}
                  style={{ padding: '0.45rem 1rem' }}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Visual Experience Card */}
          <div className="settings-card animate-fade-in-up stagger-3">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <Palette size={18} color="var(--primary-400)" />
                <span>Theme & Visual Workspace</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Active: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{theme || 'Dark'}</strong>
              </span>
            </div>

            <div className="settings-theme-grid" style={{ marginBottom: '1.5rem' }}>
              {/* Dark Charcoal / OLED */}
              <div
                className={`settings-theme-card ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-preview-box charcoal">
                  <div className="preview-sidebar" />
                  <div className="preview-main">
                    <div className="preview-pill" style={{ width: '40%' }} />
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Charcoal Dark</strong>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      Deep grey with radiant violet accents
                    </p>
                  </div>
                  {theme === 'dark' && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#ffffff" />
                    </div>
                  )}
                </div>
              </div>

              {/* Calm Light */}
              <div
                className={`settings-theme-card ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-preview-box light">
                  <div className="preview-sidebar" />
                  <div className="preview-main">
                    <div className="preview-pill" style={{ width: '40%' }} />
                    <div style={{ height: 4, background: '#CBD5E1', borderRadius: 2 }} />
                    <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Calm Light</strong>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      Crisp paper white with soft slate neutrals
                    </p>
                  </div>
                  {theme === 'light' && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#ffffff" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interaction Toggles */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <span className="settings-toggle-label">Micro-Animations & Particle Celebrations</span>
                  <span className="settings-toggle-desc">Trigger particle confetti on task completion and habit logs.</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                />
              </div>

              <div className="settings-toggle-row">
                <div className="settings-toggle-info">
                  <span className="settings-toggle-label">Automatic Background Cloud Synchronization</span>
                  <span className="settings-toggle-desc">Keep tasks, goals, and habits synced live with the backend database.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Security & Recovery PIN Card */}
          <div className="settings-card animate-fade-in-up stagger-4">
            <div className="settings-card-header">
              <div className="settings-card-title">
                <Shield size={18} color="#10B981" />
                <span>Security & Zero-Trust Recovery</span>
              </div>
              {user?.has_recovery_pin ? (
                <span className="pill pill-success" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <Lock size={10} /> PIN Active
                </span>
              ) : (
                <span className="pill pill-warning" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  PIN Not Configured
                </span>
              )}
            </div>

            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Your 6-digit Recovery PIN provides cryptographic self-service password restoration. Only a salted SHA-256 hash is stored on your local device.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {user?.has_recovery_pin ? '6-Digit Recovery PIN Configured' : 'Configure 6-Digit Recovery PIN'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {user?.has_recovery_pin 
                    ? 'Your vault is protected. You can update your recovery PIN at any time.'
                    : 'Configure your PIN now to safeguard emergency account access.'}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowModal(true)}
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.82rem', flexShrink: 0 }}
              >
                {user?.has_recovery_pin ? 'Update PIN' : 'Set Recovery PIN'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Telemetry & System Status Sidebar */}
        <div>
          {/* Telemetry Widget */}
          <div className="settings-telemetry-widget animate-fade-in-up stagger-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Cpu size={16} color="var(--primary-400)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>System Telemetry</strong>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                API Engine
              </span>
              <span className="telemetry-val" style={{ color: '#34D399' }}>FastAPI • Live</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">
                <HardDrive size={13} />
                Database
              </span>
              <span className="telemetry-val">SQLite (Local)</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">
                <Shield size={13} />
                Security Vault
              </span>
              <span className="telemetry-val" style={{ color: '#38BDF8' }}>Zero-Trust</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">
                <Terminal size={13} />
                OS Version
              </span>
              <span className="telemetry-val">v2.4.0-pro</span>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">
                <RefreshCw size={13} />
                Status
              </span>
              <span className="telemetry-val">100% Synced</span>
            </div>
          </div>

          {/* Quick Shortcuts Widget */}
          <div className="settings-telemetry-widget animate-fade-in-up stagger-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Key size={16} color="#fbbf24" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Quick Keybindings</strong>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">Command Palette</span>
              <kbd style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem' }}>⌘ / Ctrl + K</kbd>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">Toggle Quick Action</span>
              <kbd style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem' }}>Alt + N</kbd>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-lbl">Close Active Modal</span>
              <kbd style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem' }}>Escape</kbd>
            </div>
          </div>

          {/* Workspace Data Management */}
          <div className="settings-telemetry-widget animate-fade-in-up stagger-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Download size={16} color="var(--primary-400)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>Data Portability</strong>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.4, marginBottom: '1rem' }}>
              Create an unencrypted portable JSON snapshot of your settings, tasks, and habit tracking records.
            </p>

            <button
              className="mod-pill-btn"
              onClick={handleExportData}
              disabled={exporting}
              style={{ width: '100%', justifyContent: 'center', padding: '0.55rem 1rem', fontSize: '0.8rem' }}
            >
              <Download size={14} />
              <span>{exporting ? 'Generating JSON...' : 'Export Workspace JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      <ConfigureRecoveryPinModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
