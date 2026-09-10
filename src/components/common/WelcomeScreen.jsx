import React, { useState, useEffect } from 'react';
import LiveWaveCanvas from './LiveWaveCanvas';
import '../../styles/welcome.css';

export default function WelcomeScreen({ user, onTransitionStart, onFinish }) {
  const [dissolving, setDissolving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 3.0s: Sequence holds, then initiates smooth exit transition into dashboard
    const dissolveTimer = setTimeout(() => {
      setDissolving(true);
      if (onTransitionStart) onTransitionStart();
    }, 3200);

    // 3.8s: Transition complete, unmount overlay completely
    const finishTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 3800);

    return () => {
      clearTimeout(dissolveTimer);
      clearTimeout(finishTimer);
    };
  }, [onTransitionStart, onFinish]);

  if (!visible) return null;

  // Dynamically resolve actual authenticated user's name, fallback to Ayush
  const rawName = user?.name?.trim() || (user?.email ? user.email.split('@')[0] : null);
  const displayName = rawName || 'Ayush';

  return (
    <div
      className={`cinematic-welcome-overlay ${dissolving ? 'dissolving' : ''}`}
      aria-hidden={dissolving}
      role="dialog"
      aria-label="Welcome to MYNEXUS"
    >
      {/* Real-Time Live Moving Waves & Light Streams Canvas */}
      <LiveWaveCanvas />

      {/* Atmospheric Stardust & Ambient Glow behind Center */}
      <div className="welcome-bg-canvas">
        <div className="welcome-stardust" />
        <div className="welcome-ambient-aura" />
      </div>

      {/* TOP LEFT METADATA */}
      <div className="corner-metadata top-left-meta">
        <div className="accent-dash" />
        <div>YOUR</div>
        <div>PERSONAL</div>
        <div>OPERATING</div>
        <div>SYSTEM</div>
      </div>

      {/* TOP RIGHT METADATA: IDEAS -> ACTIONS -> PROGRESS */}
      <div className="corner-metadata top-right-meta">
        <span>IDEAS</span>
        <span className="meta-arrow">→</span>
        <span>ACTIONS</span>
        <span className="meta-arrow">→</span>
        <span>PROGRESS</span>
        <div className="accent-dash" />
      </div>

      {/* BOTTOM LEFT METADATA: MYNEXUS / EST. 2024 */}
      <div className="corner-metadata bottom-left-meta">
        <div>
          <div style={{ fontWeight: 700, color: '#94A3B8' }}>MYNEXUS</div>
          <div>EST. 2024</div>
        </div>
        <div className="accent-dash" />
      </div>

      {/* BOTTOM RIGHT METADATA: A Better You. Everyday. */}
      <div className="corner-metadata bottom-right-meta">
        <div>A Better You. Everyday.</div>
        <div className="accent-dash" />
      </div>

      {/* MAIN CENTER HERO */}
      <div className="cinematic-stage">
        {/* Glowing Logo in Visual Center */}
        <div className="cinematic-logo-anchor">
          <div className="logo-ambient-bloom" />
          <img
            src="/logo.svg"
            alt="MYNEXUS Logo"
            className="cinematic-logo"
          />
        </div>

        {/* MYNEXUS Title */}
        <h1 className="cinematic-wordmark">MYNEXUS</h1>

        {/* Tagline */}
        <p className="cinematic-tagline">One Place. Everything You.</p>

        {/* Welcome Message: Welcome, Ayush */}
        <div className="cinematic-welcome-msg">
          <span>
            Welcome, <span className="user-name-highlight">{displayName}</span>
          </span>
        </div>

        {/* FOCUS • LEARN • BUILD • GROW */}
        <div className="cinematic-focus-tracker">
          <span>FOCUS</span>
          <span className="bullet-dot">•</span>
          <span>LEARN</span>
          <span className="bullet-dot">•</span>
          <span>BUILD</span>
          <span className="bullet-dot">•</span>
          <span>GROW</span>
        </div>
      </div>
    </div>
  );
}
