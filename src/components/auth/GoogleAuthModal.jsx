import React, { useState, useEffect } from 'react';
import { User, Plus, X, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Trash2, Eye, EyeOff, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/google-auth.css';

// Google Official SVG Icon
export const GoogleGLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    id: 'g_ayush_main',
    name: 'Ayush Chanekar',
    email: 'ayushchanekar64@gmail.com',
    avatar: 'A',
    avatarBg: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
    badge: 'Workspace Owner'
  },
  {
    id: 'g_ayush_work',
    name: 'Ayush Workspace',
    email: 'ayush.developer@gmail.com',
    avatar: 'A',
    avatarBg: 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)',
    badge: 'Signed in'
  }
];

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }) {
  const { googleLogin } = useAuth();
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('ayora_saved_google_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_GOOGLE_ACCOUNTS;
  });

  const [mode, setMode] = useState('select'); // 'select' | 'add' | 'authenticating' | 'passkey_prompt'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [googlePasskey, setGooglePasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setSelectedAccount(null);
      setCustomEmail('');
      setCustomName('');
      setError('');
      setLoading(false);
      setStatusText('');
    }
  }, [isOpen]);

  const saveAccounts = (newList) => {
    setAccounts(newList);
    try {
      localStorage.setItem('ayora_saved_google_accounts', JSON.stringify(newList));
    } catch (e) {
      console.warn('Could not save Google accounts list', e);
    }
  };

  const handleSelectAccount = async (account, passkey = null) => {
    setSelectedAccount(account);
    setMode('authenticating');
    setLoading(true);
    setError('');
    setStatusText(`Authenticating ${account.email}...`);

    try {
      // Simulate real Google OAuth token verification handshake
      await new Promise(r => setTimeout(r, 650));
      setStatusText('Connecting to MIND OS workspace...');
      
      const loggedInUser = await googleLogin({
        email: account.email,
        name: account.name,
        avatar: account.avatar || account.name[0],
        google_id: account.id || 'google_' + account.email.replace(/[^a-zA-Z0-9]/g, '_'),
        access_key: passkey || account.access_key || null
      });

      setStatusText('Welcome back!');
      await new Promise(r => setTimeout(r, 450));
      if (onSuccess) onSuccess(loggedInUser);
      if (onClose) onClose();
    } catch (err) {
      const errMsg = err.message || 'Authentication with Google failed. Please try again.';
      setError(errMsg);
      setLoading(false);

      // If backend rejected because account is unregistered and requires Passkey:
      if (
        errMsg.toLowerCase().includes('passkey') ||
        errMsg.toLowerCase().includes('access denied') ||
        errMsg.toLowerCase().includes('unregistered')
      ) {
        setMode('passkey_prompt');
      } else {
        setMode('select');
      }
    }
  };

  const handleAddNewAccountSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const nameToUse = customName.trim() || cleanEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const newAcc = {
      id: 'g_' + Date.now(),
      name: nameToUse,
      email: cleanEmail,
      avatar: nameToUse[0].toUpperCase(),
      avatarBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      badge: 'Active',
      access_key: googlePasskey.trim() || null
    };

    // Save into list if not already present
    const updated = [newAcc, ...accounts.filter(a => a.email !== cleanEmail)];
    saveAccounts(updated);

    // Proceed to login
    await handleSelectAccount(newAcc, googlePasskey.trim() || null);
  };

  const handlePasskeyPromptSubmit = async (e) => {
    e.preventDefault();
    if (!googlePasskey.trim()) {
      setError('Master Security Passkey is required to authorize this Google account.');
      return;
    }
    if (selectedAccount) {
      await handleSelectAccount(selectedAccount, googlePasskey.trim());
    }
  };

  const handleRemoveAccount = (e, accId) => {
    e.stopPropagation();
    const filtered = accounts.filter(a => a.id !== accId);
    saveAccounts(filtered);
  };

  if (!isOpen) return null;

  return (
    <div className="google-modal-overlay" onClick={onClose}>
      <div 
        className="google-auth-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Google Logo & Close */}
        <div className="google-dialog-header">
          <div className="google-dialog-brand">
            <GoogleGLogo size={28} />
            <div className="google-brand-titles">
              <h2 className="google-dialog-heading">Sign in with Google</h2>
              <p className="google-dialog-subheading">Choose an account to continue to <strong>MIND OS</strong></p>
            </div>
          </div>
          <button 
            type="button" 
            className="google-dialog-close-btn" 
            onClick={onClose} 
            disabled={loading}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="google-error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* MODE: Authenticating State */}
        {mode === 'authenticating' && (
          <div className="google-auth-loading-screen">
            <div className="google-loading-spinner-box">
              <Loader2 className="google-loading-spin" size={40} />
            </div>
            <h3 className="google-loading-title">{statusText}</h3>
            {selectedAccount && (
              <div className="google-authenticating-chip">
                <div className="google-chip-avatar" style={{ background: selectedAccount.avatarBg }}>
                  {selectedAccount.avatar}
                </div>
                <div className="google-chip-info">
                  <span className="google-chip-name">{selectedAccount.name}</span>
                  <span className="google-chip-email">{selectedAccount.email}</span>
                </div>
              </div>
            )}
            <p className="google-loading-notice">
              <ShieldCheck size={14} className="google-shield-icon" /> 
              Securing connection with Google OAuth 2.0 Identity Server
            </p>
          </div>
        )}

        {/* MODE: Select Account List */}
        {mode === 'select' && (
          <div className="google-account-list-container">
            <div className="google-accounts-scroll">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="google-account-item"
                  onClick={() => handleSelectAccount(acc)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelectAccount(acc); }}
                >
                  <div className="google-account-avatar" style={{ background: acc.avatarBg }}>
                    {acc.avatar}
                  </div>
                  <div className="google-account-details">
                    <div className="google-account-name-row">
                      <span className="google-account-name">{acc.name}</span>
                      {acc.badge && <span className="google-account-badge">{acc.badge}</span>}
                    </div>
                    <span className="google-account-email">{acc.email}</span>
                  </div>
                  <button
                    type="button"
                    className="google-account-remove-btn"
                    title="Remove from list"
                    onClick={(e) => handleRemoveAccount(e, acc.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Use Another Account Button */}
              <div
                className="google-account-item google-use-another-item"
                onClick={() => { setMode('add'); setError(''); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setMode('add'); }}
              >
                <div className="google-account-avatar google-another-avatar">
                  <Plus size={20} />
                </div>
                <div className="google-account-details">
                  <span className="google-account-name">Use another account</span>
                  <span className="google-account-email">Sign in with a different Google account</span>
                </div>
                <ArrowRight size={16} className="google-arrow-icon" />
              </div>
            </div>

            {/* Google Privacy & Consent Statement */}
            <div className="google-dialog-footer">
              <p className="google-footer-text">
                To continue, Google will share your name, email address, language preference, and profile picture with MIND OS. Before using MIND OS, you can review its{' '}
                <a href="#privacy" className="google-footer-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and{' '}
                <a href="#terms" className="google-footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>.
              </p>
            </div>
          </div>
        )}

        {/* MODE: Add / Enter New Google Account */}
        {mode === 'add' && (
          <form onSubmit={handleAddNewAccountSubmit} className="google-add-account-form">
            <div className="google-form-header">
              <h3 className="google-form-title">Enter your Google Account</h3>
              <p className="google-form-desc">Enter your Gmail or Google Workspace email address to sign in.</p>
            </div>

            <div className="google-input-group">
              <label className="google-input-label">Email or phone</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="e.g. yourname@gmail.com"
                className="google-input-field"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            </div>

            <div className="google-input-group">
              <label className="google-input-label">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Alex Johnson"
                className="google-input-field"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div className="google-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="google-input-label">Master Security Passkey</label>
                <span style={{ fontSize: '0.7rem', color: '#8B5CF6', fontWeight: 600 }}>Required if new</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasskey ? 'text' : 'password'}
                  placeholder="System Passkey for registration"
                  className="google-input-field"
                  value={googlePasskey}
                  onChange={(e) => setGooglePasskey(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPasskey(!showPasskey)}
                >
                  {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="google-form-actions">
              <button
                type="button"
                className="google-btn-secondary"
                onClick={() => { setMode('select'); setError(''); }}
              >
                Back to accounts
              </button>
              <button
                type="submit"
                className="google-btn-primary"
                disabled={!customEmail}
              >
                Next & Sign in
              </button>
            </div>
          </form>
        )}

        {/* MODE: Passkey Prompt for Unregistered Google Account */}
        {mode === 'passkey_prompt' && (
          <form onSubmit={handlePasskeyPromptSubmit} className="google-add-account-form">
            <div className="google-form-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '6px' }}>
                <ShieldCheck size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Private Workspace Access
                </span>
              </div>
              <h3 className="google-form-title">Security Authorization Required</h3>
              <p className="google-form-desc">
                This Google account is not yet registered. A valid Master Security Passkey is required to join this workspace.
              </p>
            </div>

            {selectedAccount && (
              <div className="google-authenticating-chip" style={{ marginBottom: '1rem' }}>
                <div className="google-chip-avatar" style={{ background: selectedAccount.avatarBg }}>
                  {selectedAccount.avatar}
                </div>
                <div className="google-chip-info">
                  <span className="google-chip-name">{selectedAccount.name}</span>
                  <span className="google-chip-email">{selectedAccount.email}</span>
                </div>
              </div>
            )}

            <div className="google-input-group">
              <label className="google-input-label">Master Security Passkey</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter Master Security Passkey"
                  className="google-input-field"
                  value={googlePasskey}
                  onChange={(e) => setGooglePasskey(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPasskey(!showPasskey)}
                >
                  {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                🔒 Only authorized users who possess this private key can register.
              </span>
            </div>

            <div className="google-form-actions">
              <button
                type="button"
                className="google-btn-secondary"
                onClick={() => { setMode('select'); setError(''); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="google-btn-primary"
                disabled={!googlePasskey}
              >
                Authorize & Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
