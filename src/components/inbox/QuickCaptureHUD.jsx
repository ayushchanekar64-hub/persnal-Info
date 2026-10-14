import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  ArrowRight,
  X,
  CheckCircle2,
  Zap,
  BookOpen,
  Target,
  Repeat,
  FileText,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/inbox.css';

const PILL_OPTIONS = [
  { id: 'Idea', label: '💡 Idea', icon: Sparkles },
  { id: 'Task', label: '⚡ Task', icon: Zap },
  { id: 'Learning', label: '📖 Read / Learn', icon: BookOpen },
  { id: 'Goal', label: '🎯 Goal', icon: Target },
  { id: 'Habit', label: '🔄 Habit', icon: Repeat },
  { id: 'Note', label: '📝 Note', icon: FileText }
];

export default function QuickCaptureHUD({ isOpen, onClose, onThoughtCaptured, onOpenTriage }) {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState('Idea');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-focus textarea upon opening
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSelectedType('Idea');
      setIsSubmitting(false);
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Voice dictation using Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported by your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleCapture = async (e) => {
    if (e) e.preventDefault();
    const clean = content.trim();
    if (!clean || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const saved = await api.inbox.capture({
        raw_content: clean,
        suggested_type: selectedType,
        source: 'desktop_hud'
      });

      if (onThoughtCaptured) {
        onThoughtCaptured(saved);
      }

      onClose();
    } catch (err) {
      console.error('Failed to capture thought:', err);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCapture();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="frictionless-hud-backdrop" onClick={onClose}>
      <div
        className="frictionless-hud-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Quick-Capture Frictionless Inbox"
      >
        <div className="hud-ambient-bar" />

        {/* Header strip */}
        <div className="hud-header">
          <div className="hud-title-badge">
            <span className="hud-pulse-dot" />
            <Sparkles size={13} />
            <span>Frictionless Inbox</span>
          </div>

          <div className="hud-shortcuts-hint">
            <span>Press</span> <kbd className="hud-kbd">↵ Enter</kbd> <span>to dump</span>
            <span style={{ margin: '0 4px', opacity: 0.4 }}>•</span>
            <kbd className="hud-kbd">Esc</kbd> <span>close</span>
          </div>
        </div>

        {/* Textarea Dump Zone */}
        <div className="hud-body">
          <textarea
            ref={textareaRef}
            className="hud-textarea"
            placeholder="Dump a sudden thought, book recommendation, or task... don't organize it now."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />

          {/* Quick classification pill tags */}
          <div className="hud-smart-pills">
            {PILL_OPTIONS.map((pill) => {
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  type="button"
                  className={`hud-pill-tag ${selectedType === pill.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(pill.id)}
                >
                  <Icon size={12} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="hud-footer">
          <div className="hud-footer-left">
            <button
              type="button"
              className={`hud-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleVoice}
              title={isListening ? 'Listening...' : 'Voice Dictate Thought'}
            >
              {isListening ? <Mic size={15} /> : <Mic size={15} />}
            </button>

            {onOpenTriage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTriage();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  padding: '0.2rem 0.5rem'
                }}
              >
                <Inbox size={13} />
                <span>Open Triage Queue</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className="hud-save-btn"
            onClick={handleCapture}
            disabled={!content.trim() || isSubmitting}
          >
            <span>{isSubmitting ? 'Securing...' : 'Capture Thought'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
