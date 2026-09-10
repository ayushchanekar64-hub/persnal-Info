import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (userEmail, userPassword, userName) => {
    setError('');
    setLoading(true);
    try {
      try {
        await login(userEmail, userPassword);
        onClose();
      } catch (loginErr) {
        // If account doesn't exist yet, automatically register it
        await register(userEmail, userPassword, userName);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              className="stat-icon-wrapper"
              style={{ background: 'var(--bg-surface-muted)', color: 'var(--primary-600)' }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                {mode === 'signin' ? 'Sign in to MYNEXUS' : 'Create Workspace'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                One Place. Everything You.
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-surface-muted)'
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: mode === 'signin' ? 600 : 400,
              background: mode === 'signin' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'signin' ? 'var(--primary-600)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: mode === 'signin' ? '2px solid var(--primary-600)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => {
              setMode('signin');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: mode === 'register' ? 600 : 400,
              background: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'register' ? 'var(--primary-600)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--primary-600)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            New Account
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
        >
          {error && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#ef4444',
                fontSize: '0.82rem'
              }}
            >
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.35rem'
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.3rem' }}
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem'
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.3rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.3rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? (
              'Authenticating...'
            ) : mode === 'signin' ? (
              <>
                Sign In <ArrowRight size={16} />
              </>
            ) : (
              <>
                Create Account <Sparkles size={16} />
              </>
            )}
          </button>

          {/* Quick Multi-User Test Accounts */}
          <div
            style={{
              marginTop: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              Quick Test Workspaces (Multi-User Isolation)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem' }}
                onClick={() =>
                  handleQuickDemo('alice@mynexus.io', 'SecurePassword123!', 'Alice Developer')
                }
              >
                👤 User A (Alice)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.76rem', padding: '0.45rem 0.5rem' }}
                onClick={() =>
                  handleQuickDemo('bob@mynexus.io', 'SecurePassword123!', 'Bob Analyst')
                }
              >
                👤 User B (Bob)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
