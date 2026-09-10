import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { api } from '../../services/api';

export default function AIAssistantView({ user, tasks = [], goals = [], stats = {} }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello${user?.name ? ` ${user.name}` : ''}! I am your MYNEXUS Personal Operating Copilot. How can I assist you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (user) {
        const res = await api.ai.askCopilot(userText);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: res.response }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: "Please sign in to unlock personalized AI Copilot insights across your private tasks, goals, habits, and progress."
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `AI Copilot responded: Let's focus on completing your highest priority tasks and aligning with your goals.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 160px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="var(--primary-600)" />
            <span>MYNEXUS AI Copilot</span>
          </h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Context-aware personal intelligence for decisions, planning, and accelerated progress.
          </p>
        </div>
      </div>

      <div className="nexus-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              {m.sender === 'ai' && (
                <div className="stat-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', width: 32, height: 32 }}>
                  <Bot size={16} />
                </div>
              )}
              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  background: m.sender === 'user' ? 'var(--primary-600)' : 'var(--bg-surface-muted)',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  fontSize: '0.865rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                  {user?.avatar ? user.avatar : <User size={14} />}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="stat-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', width: 32, height: 32 }}>
                <Bot size={16} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MYNEXUS AI is synthesizing context...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask MYNEXUS anything about your tasks, goals, habits, or learning..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
