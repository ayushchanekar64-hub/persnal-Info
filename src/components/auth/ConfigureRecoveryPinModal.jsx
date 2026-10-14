import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, X, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConfigureRecoveryPinModal({ isOpen, onClose }) {
  const { setRecoveryPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePinInput = (val, setter) => {
    // Only allow numeric digits up to 6
    const numeric = val.replace(/\D/g, '').slice(0, 6);
    setter(numeric);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError('Recovery PIN must be exactly 6 numeric digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('Recovery PINs do not match. Please re-check.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await setRecoveryPin(pin);
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to save Recovery PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-pin-modal-overlay" onClick={onClose}>
      <div 
        className="recovery-pin-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="recovery-dialog-header">
          <div className="recovery-dialog-badge-icon">
            <ShieldCheck size={24} color="#818CF8" />
          </div>
          <button 
            type="button" 
            className="recovery-dialog-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="recovery-dialog-body">
          <h2 className="recovery-dialog-title">Set up your 6-Digit Recovery PIN</h2>
          <p className="recovery-dialog-desc">
            To ensure zero-trust self-service password recovery, configure a private 6-digit PIN. 
            MIND OS never stores this PIN in plain text — only a secure one-way hash is kept.
          </p>

          {error && (
            <div className="recovery-dialog-error">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="recovery-dialog-success">
              <CheckCircle2 size={24} color="#34D399" />
              <div>
                <strong>Recovery PIN Activated!</strong>
                <p>Your account is now protected with self-service PIN recovery.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="recovery-dialog-form">
              <div className="auth-input-group">
                <label className="auth-input-label">6-Digit Recovery PIN</label>
                <div className="auth-input-wrapper">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="•••••• (6 numeric digits)"
                    className="auth-input-field recovery-pin-input-field"
                    value={pin}
                    onChange={(e) => handlePinInput(e.target.value, setPin)}
                    style={{ letterSpacing: pin ? '0.3em' : 'normal', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="auth-input-icon-right"
                    onClick={() => setShowPin(!showPin)}
                    tabIndex={-1}
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label">Confirm 6-Digit PIN</label>
                <div className="auth-input-wrapper">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    placeholder="•••••• (Re-enter 6 digits)"
                    className="auth-input-field recovery-pin-input-field"
                    value={confirmPin}
                    onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
                    style={{ letterSpacing: confirmPin ? '0.3em' : 'normal', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="auth-input-icon-right"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    tabIndex={-1}
                    title={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showConfirmPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="recovery-dialog-footer">
                <button
                  type="button"
                  className="recovery-skip-btn"
                  onClick={onClose}
                  disabled={loading}
                >
                  Remind me later
                </button>
                <button
                  type="submit"
                  className="auth-primary-btn"
                  disabled={loading || pin.length !== 6 || pin !== confirmPin}
                >
                  {loading ? 'Securing Account...' : 'Save Recovery PIN'}
                  {!loading && <Sparkles size={15} />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
