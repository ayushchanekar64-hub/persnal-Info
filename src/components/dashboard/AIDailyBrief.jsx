import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Zap,
  TrendingUp,
  Target,
  CheckCircle2
} from 'lucide-react';

export default function AIDailyBrief({ aiBrief = { bullets: [] }, tasks = [], goals = [] }) {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const suggestedPrompts = [
    "What should I focus on today?",
    "Analyze my learning pace",
    "How are my goals progressing?"
  ];

  const handleAsk = (userQuery) => {
    const q = userQuery || query;
    if (!q.trim()) return;

    setIsThinking(true);
    setAiAnswer(null);

    setTimeout(() => {
      setIsThinking(false);
      const pendingTasks = tasks.filter(t => !t.completed);
      if (q.toLowerCase().includes("focus") || q.toLowerCase().includes("today")) {
        setAiAnswer(
          pendingTasks.length > 0
            ? `Priority Focus: You have ${pendingTasks.length} pending task(s). Recommended first action: "${pendingTasks[0].title}".`
            : "All scheduled items are up to date! Consider logging a new milestone or reviewing upcoming goals."
        );
      } else if (q.toLowerCase().includes("goal")) {
        setAiAnswer(
          goals.length > 0
            ? `Active Goals: Tracking ${goals.length} active goal(s). Continue maintaining momentum on key milestones.`
            : "No active goals tracked yet. Define your first target to unlock automated pacing insights."
        );
      } else {
        setAiAnswer(
          "MIND OS AI is active. As you log tasks, goals, and study sessions, your personalized intelligence brief will continuously adapt."
        );
      }
    }, 350);
  };

  const bullets = aiBrief?.bullets || [];

  return (
    <div className="ai-brief-card motion-card animate-fade-in-up stagger-2">
      {/* Header */}
      <div className="ai-brief-header">
        <div className="ai-brief-title-group">
          <div className="ai-brief-title">
            <Sparkles size={18} color="var(--primary-600)" />
            <span>{aiBrief?.title || "MIND OS Intelligence Brief"}</span>
          </div>
          <p className="ai-brief-subtitle">
            {aiBrief?.subtitle || "Real-time automated briefing tailored to your focus & productivity."}
          </p>
        </div>
        <div className="ai-badge">
          <Zap size={12} />
          <span>Core Intelligence</span>
        </div>
      </div>

      {/* Bulleted Insights or High-End Welcome Summary */}
      <div className="ai-brief-bullets">
        {bullets.length === 0 ? (
          <>
            <div className="ai-brief-item">
              <span className="ai-bullet-dot" />
              <span>
                <strong>Day Kickoff:</strong> Ready to build momentum. Add your core 1-3 priorities for today.
              </span>
            </div>
            <div className="ai-brief-item">
              <span className="ai-bullet-dot accent" />
              <span>
                <strong>Goal Alignment:</strong> Set concrete targets in Career or Technical tracks to unlock progress forecasting.
              </span>
            </div>
          </>
        ) : (
          bullets.map((b) => (
            <div key={b.id} className="ai-brief-item">
              <span className={`ai-bullet-dot ${b.type}`} />
              <span>{b.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Ask MIND OS Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(query);
        }}
      >
        <div className="ai-ask-bar">
          <Bot size={18} color="var(--primary-500)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="ai-ask-input"
            placeholder="Ask MIND OS: What should I focus on today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem' }}
          >
            {isThinking ? (
              <span style={{ fontSize: '0.75rem' }}>Thinking...</span>
            ) : (
              <>
                <Send size={13} />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Prompt Suggestion Chips */}
      <div className="ai-prompt-chips">
        <span style={{ fontSize: '0.71rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          Suggested:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="prompt-chip"
            onClick={() => {
              setQuery(prompt);
              handleAsk(prompt);
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Dynamic AI Response Box */}
      {aiAnswer && (
        <div className="ai-response-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--primary-600)', marginBottom: 4 }}>
            <Sparkles size={14} />
            <span>MIND OS Recommendation</span>
          </div>
          <p>{aiAnswer}</p>
        </div>
      )}
    </div>
  );
}
