import React, { useState, useEffect } from 'react';
import { Zap, BarChart3, Brain, Target, ChevronDown } from 'lucide-react';
import LiveWaveCanvas from './LiveWaveCanvas';
import '../../styles/welcome.css';

export default function WelcomeScreen({ user, onTransitionStart, onFinish }) {
  const [dissolving, setDissolving] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    if (dissolving) return;
    setDissolving(true);
    if (onTransitionStart) onTransitionStart();
    setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 650);
  };

  useEffect(() => {
    // 3.6s: Sequences conclude, initiate seamless cinematic dissolve into dashboard
    const autoTimer = setTimeout(() => {
      handleDismiss();
    }, 3600);

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 15) {
        handleDismiss();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [dissolving]);

  if (!visible) return null;

  // Dynamically resolve actual authenticated user's name
  const rawName = user?.name?.trim() || user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : null);
  const displayName = rawName
    ? rawName.split(' ')[0].charAt(0).toUpperCase() + rawName.split(' ')[0].slice(1)
    : 'Ayush';

  return (
    <div
      className={`cinematic-welcome-overlay ${dissolving ? 'dissolving' : ''}`}
      aria-hidden={dissolving}
      role="dialog"
      aria-label="Welcome to MIND OS"
      onClick={handleDismiss}
    >
      {/* 1. SEAMLESS MOVING MATRIX DIGITAL RAIN CANVAS */}
      <LiveWaveCanvas />

      {/* 2. SUBTLE REFINED PURPLE AMBIENT BACKLIGHT */}
      <div className="welcome-hero-ambient-glow" />

      {/* TOP LEFT: MIND OS LOGO & WORDMARK */}
      <header className="welcome-top-left">
        <div className="welcome-logo-badge">
          <span className="logo-letter">M</span>
        </div>
        <div className="welcome-top-brand-text">
          <span className="welcome-brand-name">MIND OS</span>
          <span className="welcome-brand-tagline">Your Personal Operating System.</span>
        </div>
      </header>

      {/* TOP RIGHT: IDEAS -> ACTIONS -> PROGRESS — */}
      <div className="welcome-top-right">
        <div className="workflow-steps">
          <span>IDEAS</span>
          <span className="step-arrow">→</span>
          <span>ACTIONS</span>
          <span className="step-arrow">→</span>
          <span>PROGRESS</span>
          <span className="workflow-dash" />
        </div>
      </div>

      {/* RIGHT SIDE VERTICAL STACK: FOCUS, LEARN, BUILD, GROW */}
      <aside className="welcome-right-vertical">
        <span>FOCUS</span>
        <span>LEARN</span>
        <span>BUILD</span>
        <span>GROW</span>
      </aside>

      {/* MAIN CENTER HERO */}
      <main className="welcome-center-hero">
        {/* OVERLINE: — GOOD TO SEE YOU AGAIN — */}
        <div className="welcome-overline">
          <span className="overline-dash" />
          <span className="overline-text">GOOD TO SEE YOU AGAIN</span>
          <span className="overline-dash" />
        </div>

        {/* HERO TITLE: Hello [User] 👋 GUARANTEED ON ONE SINGLE LINE */}
        <h1 className="welcome-hero-greeting" aria-label={`Hello ${displayName}`}>
          <span className="greeting-word-hello">Hello</span>
          <span className="welcome-name-gradient">{displayName}</span>
          <span className="greeting-wave-emoji" role="img" aria-label="Waving hand">👋</span>
        </h1>

        {/* HERO SUBTITLE: Welcome to your Personal OS */}
        <p className="welcome-hero-subtext">
          Welcome to your <span className="highlight-personal-os">Personal OS</span>
        </p>

        {/* 4 FEATURE HIGHLIGHTS (SUBTLE & SECONDARY) */}
        <div className="welcome-pillars-row">
          {/* Pillar 1: Organize */}
          <div className="welcome-pillar-item">
            <Zap className="pillar-icon" size={17} />
            <div className="pillar-info">
              <span className="pillar-heading">Organize</span>
              <span className="pillar-caption">Your Life</span>
            </div>
          </div>

          <div className="pillar-v-sep" />

          {/* Pillar 2: Track */}
          <div className="welcome-pillar-item">
            <BarChart3 className="pillar-icon" size={17} />
            <div className="pillar-info">
              <span className="pillar-heading">Track</span>
              <span className="pillar-caption">Your Progress</span>
            </div>
          </div>

          <div className="pillar-v-sep" />

          {/* Pillar 3: Learn */}
          <div className="welcome-pillar-item">
            <Brain className="pillar-icon" size={17} />
            <div className="pillar-info">
              <span className="pillar-heading">Learn</span>
              <span className="pillar-caption">Without Limits</span>
            </div>
          </div>

          <div className="pillar-v-sep" />

          {/* Pillar 4: Build */}
          <div className="welcome-pillar-item">
            <Target className="pillar-icon" size={17} />
            <div className="pillar-info">
              <span className="pillar-heading">Build</span>
              <span className="pillar-caption">A Better You</span>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM CENTER: SCROLL TO EXPLORE + MOUSE ICON */}
      <div className="welcome-scroll-explore">
        <span className="scroll-text">SCROLL TO EXPLORE</span>
        <div className="mouse-indicator">
          <div className="mouse-body">
            <span className="mouse-wheel-dot" />
          </div>
          <ChevronDown className="mouse-arrow" size={14} />
        </div>
      </div>

      {/* BOTTOM LEFT: MIND OS / EST. 2024 — */}
      <footer className="welcome-bottom-left">
        <div className="bottom-left-text">
          <span className="bottom-title">MIND OS</span>
          <span className="bottom-subtitle">EST. 2024</span>
        </div>
        <span className="bottom-dash" />
      </footer>

      {/* BOTTOM RIGHT: A Better You. Everyday. — */}
      <aside className="welcome-bottom-right">
        <span className="bottom-tagline">A Better You. Everyday.</span>
        <span className="bottom-dash" />
      </aside>
    </div>
  );
}
