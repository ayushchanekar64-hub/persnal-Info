import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot
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
      // Only generate insight if real user tasks or goals exist; otherwise show empty state message
      if (tasks.length === 0 && goals.length === 0) {
        setAiAnswer(
          "Your AI insights will appear here once MYNEXUS has enough activity to analyze."
        );
      } else {
        const pendingTasks = tasks.filter(t => !t.completed);
        if (q.toLowerCase().includes("focus") || q.toLowerCase().includes("today")) {
          setAiAnswer(
            pendingTasks.length > 0
              ? `Priority Focus Recommendation: You have ${pendingTasks.length} pending task(s). Consider starting with "${pendingTasks[0].title}".`
              : "All tasks for today are completed. Consider reviewing long-term goals or planning upcoming work."
          );
        } else if (q.toLowerCase().includes("goal")) {
          setAiAnswer(
            goals.length > 0
              ? `You currently have ${goals.length} active goal(s) tracked. Continue making progress on your milestones.`
              : "No active goals found. Define goals to enable goal progress insights."
          );
        } else {
          setAiAnswer(
            "Your AI insights will appear here once MYNEXUS has enough activity to analyze."
          );
        }
      }
    }, 400);
  };

  const bullets = aiBrief?.bullets || [];

  return (
    <div className="ai-brief-card">
      {/* Header */}
      <div className="ai-brief-header">
        <div className="ai-brief-title-group">
          <div className="ai-brief-title">
            <Sparkles size={18} color="var(--primary-600)" />
            <span>{aiBrief?.title || "AI Daily Brief"}</span>
          </div>
          <p className="ai-brief-subtitle">
            {aiBrief?.subtitle || "Here's what deserves your attention today."}
          </p>
        </div>
        <div className="ai-badge">
          <Sparkles size={12} />
          <span>Core Intelligence</span>
        </div>
      </div>

      {/* Bulleted Insights or Empty State Notice */}
      <div className="ai-brief-bullets">
        {bullets.length === 0 ? (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-muted)',
              fontSize: '0.835rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            Your AI insights will appear here once MYNEXUS has enough activity to analyze.
          </div>
        ) : (
          bullets.map((b) => (
            <div key={b.id} className="ai-brief-item">
              <span className={`ai-bullet-dot ${b.type}`} />
              <span>{b.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Ask MYNEXUS Input Bar */}
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
            placeholder="Ask MYNEXUS: What should I focus on today?"
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
            <span>MYNEXUS Recommendation</span>
          </div>
          <p>{aiAnswer}</p>
        </div>
      )}
    </div>
  );
}
