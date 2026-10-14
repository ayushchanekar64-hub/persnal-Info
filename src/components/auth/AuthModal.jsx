import React from 'react';
import AuthPage from './AuthPage';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return <AuthPage onComplete={onClose} onExit={onClose} />;
}
