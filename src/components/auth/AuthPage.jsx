import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  ChevronDown,
  LayoutDashboard,
  Check,
  Activity,
  Code2,
  Target,
  BookOpen,
  Phone,
  Copy,
  ShieldAlert,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import GoogleAuthModal from './GoogleAuthModal';

const EMAIL_DOMAINS = ['@gmail.com', '@outlook.com', '@icloud.com', '@yahoo.com', '@proton.me'];

// Official SVG Brand Logos
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
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

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 23 23">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

export default function AuthPage({ initialFlow = 'signin', onComplete, onExit }) {
  const { login, verify2FA, register, googleLogin } = useAuth();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [flow, setFlow] = useState(initialFlow);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Real-Time Duplicate & Identifier Verification State
  const [identifierStatus, setIdentifierStatus] = useState(null); // Sign In check: { checking, exists, message, type }
  const [emailStatus, setEmailStatus] = useState(null); // Sign Up email check: { checking, exists, message }
  const [phoneStatus, setPhoneStatus] = useState(null); // Sign Up phone check: { checking, exists, message }

  // 2FA Login Security State
  const [login2FAToken, setLogin2FAToken] = useState('');
  const [login2FAPin, setLogin2FAPin] = useState('');
  const [show2FAPin, setShow2FAPin] = useState(false);

  // Password Generator & Suggestions State
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Anti-Bot Adaptive Security Challenge
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [botMathChallenge, setBotMathChallenge] = useState(() => ({
    num1: Math.floor(Math.random() * 20) + 12,
    num2: Math.floor(Math.random() * 15) + 7,
    answer: ''
  }));

  // Sign Up: Security Passkey & 6-Digit Recovery PIN
  const [accessKey, setAccessKey] = useState('');
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [botTrap, setBotTrap] = useState('');
  const [recoveryPin, setRecoveryPinState] = useState('');
  const [confirmRecoveryPin, setConfirmRecoveryPin] = useState('');
  const [showRecoveryPin, setShowRecoveryPin] = useState(false);
  const [showConfirmRecoveryPin, setShowConfirmRecoveryPin] = useState(false);

  // Forgot Password Flow State
  const [recoveryToken, setRecoveryToken] = useState('');
  const [maskedIdentifier, setMaskedIdentifier] = useState('');
  const [enteredRecoveryPin, setEnteredRecoveryPin] = useState('');
  const [showEnteredRecoveryPin, setShowEnteredRecoveryPin] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryNewPassword, setShowRecoveryNewPassword] = useState(false);
  const [showRecoveryConfirmPassword, setShowRecoveryConfirmPassword] = useState(false);

  // States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setFlow(initialFlow || 'signin');
    setStep(1);
    setError('');
    setSuccessMessage('');
  }, [initialFlow]);

  const goToStep = (nextStep, dir = 'forward') => {
    setError('');
    setDirection(dir);
    setStep(nextStep);
  };

  const switchFlow = (newFlow) => {
    setError('');
    setSuccessMessage('');
    setFlow(newFlow);
    setStep(1);
    setDirection('forward');
    setEmailStatus(null);
    setPhoneStatus(null);
    setIdentifierStatus(null);
    setShowSuggestions(false);
    setCapsLockOn(false);
    // Clear recovery temporary inputs
    setEnteredRecoveryPin('');
    setRecoveryNewPassword('');
    setRecoveryConfirmPassword('');
    setRecoveryToken('');
    setResetToken('');
  };

  const handleCapsCheck = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const pwdStrength = getPasswordStrength(password);
  const recoveryPwdStrength = getPasswordStrength(recoveryNewPassword);

  // Crack Time & Entropy Estimator
  const getCrackTimeEstimate = (pwd) => {
    if (!pwd) return { time: '0s', label: 'None', color: '#64748B' };
    const len = pwd.length;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSpec = /[^A-Za-z0-9]/.test(pwd);
    const varieties = [hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;

    if (len < 8) return { time: '< 1 millisecond', label: 'Instant (Critically Weak)', color: '#EF4444' };
    if (len < 10 && varieties <= 2) return { time: '~45 seconds', label: 'Weak', color: '#EF4444' };
    if (len < 11 && varieties >= 3) return { time: '~3 weeks', label: 'Moderate', color: '#F59E0B' };
    if (len >= 12 && varieties >= 4) {
      if (len >= 16) return { time: '> 1,000,000 centuries', label: 'Quantum-Resistant (Military-Grade)', color: '#8B5CF6' };
      return { time: '~4,500 years', label: 'Ultra Strong', color: '#10B981' };
    }
    if (len >= 8 && varieties >= 3) return { time: '~8 months', label: 'Good', color: '#3B82F6' };
    return { time: '~5 hours', label: 'Fair', color: '#F59E0B' };
  };

  const handleNumericPinChange = (val, setter) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setter(cleaned);
  };

  // Generate 3 Distinct High-Entropy Password Suggestions
  const generateStrongSuggestions = () => {
    const words = ['Falcon', 'Quantum', 'Nebula', 'Vortex', 'Zenith', 'Titan', 'Matrix', 'Cobalt', 'Aurora', 'Apex', 'Phantom', 'Cosmos'];
    const w1 = words[Math.floor(Math.random() * words.length)];
    const w2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 89) + 10;
    const spec = '!@#$%^&*'[Math.floor(Math.random() * 8)];
    const passphrase = `${w1}-${w2}-${num}${spec}`;

    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%^&*()_+~|}{[]';
    const all = uppers + lowers + numbers + specials;

    let crypto16 = '';
    crypto16 += uppers[Math.floor(Math.random() * uppers.length)];
    crypto16 += lowers[Math.floor(Math.random() * lowers.length)];
    crypto16 += numbers[Math.floor(Math.random() * numbers.length)];
    crypto16 += specials[Math.floor(Math.random() * specials.length)];
    const rand16 = new Uint32Array(12);
    window.crypto.getRandomValues(rand16);
    for (let i = 0; i < 12; i++) crypto16 += all[rand16[i] % all.length];
    crypto16 = crypto16.split('').sort(() => 0.5 - Math.random()).join('');

    let quantum20 = '';
    quantum20 += uppers[Math.floor(Math.random() * uppers.length)];
    quantum20 += lowers[Math.floor(Math.random() * lowers.length)];
    quantum20 += numbers[Math.floor(Math.random() * numbers.length)];
    quantum20 += specials[Math.floor(Math.random() * specials.length)];
    const rand20 = new Uint32Array(16);
    window.crypto.getRandomValues(rand20);
    for (let i = 0; i < 16; i++) quantum20 += all[rand20[i] % all.length];
    quantum20 = quantum20.split('').sort(() => 0.5 - Math.random()).join('');

    const suggestions = [
      { id: 'passphrase', title: '🛡️ Memorable Passphrase', value: passphrase, desc: 'High entropy & easy to remember' },
      { id: 'crypto16', title: '⚡ Military-Grade (16 chars)', value: crypto16, desc: 'Crack time: > 500,000 years' },
      { id: 'quantum20', title: '🚀 Quantum-Resistant (20 chars)', value: quantum20, desc: 'Maximum enterprise protection' }
    ];
    setPasswordSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const applyPasswordSuggestion = (pwdVal) => {
    setPassword(pwdVal);
    setConfirmPassword(pwdVal);
    try {
      navigator.clipboard.writeText(pwdVal);
      setToastMessage('✓ Strong password copied to clipboard and applied!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (e) {
      // ignore
    }
  };

  // Real-Time Duplicate & Availability Checks for Sign Up
  const checkEmailAvailability = async (val) => {
    const clean = val.trim();
    if (!clean || !clean.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEmailStatus(null);
      return null;
    }
    setEmailStatus({ checking: true, exists: null, message: '' });
    try {
      const res = await api.auth.checkIdentifier(clean);
      setEmailStatus({ checking: false, exists: res.exists, message: res.message });
      return res;
    } catch (e) {
      setEmailStatus(null);
      return null;
    }
  };

  const checkPhoneAvailability = async (val) => {
    const clean = val.trim();
    const digits = clean.replace(/\D/g, '');
    if (digits.length < 7) {
      setPhoneStatus(null);
      return null;
    }
    setPhoneStatus({ checking: true, exists: null, message: '' });
    try {
      const res = await api.auth.checkIdentifier(clean);
      setPhoneStatus({ checking: false, exists: res.exists, message: res.message });
      return res;
    } catch (e) {
      setPhoneStatus(null);
      return null;
    }
  };

  // Sign In Identifier Availability Check
  const checkIdentifierForSignIn = async (val) => {
    const clean = val.trim();
    if (!clean || !validateEmailOrPhone(clean)) {
      setIdentifierStatus(null);
      return null;
    }
    setIdentifierStatus({ checking: true, exists: null, message: '', type: clean.includes('@') ? 'email' : 'phone' });
    try {
      const res = await api.auth.checkIdentifier(clean);
      setIdentifierStatus({ checking: false, exists: res.exists, message: res.message, type: res.identifier_type });
      return res;
    } catch (e) {
      setIdentifierStatus(null);
      return null;
    }
  };

  // ----------------------------------------------------
  // SUBMIT HANDLERS (Email or Phone Number Support)
  // ----------------------------------------------------

  const validateEmailOrPhone = (val) => {
    const clean = val.trim();
    if (!clean) return false;
    if (clean.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    }
    const phoneDigits = clean.replace(/[\s\-\(\)\.]/g, '');
    return /^\+?[0-9]{7,15}$/.test(phoneDigits);
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    const cleanId = email.trim();
    if (!cleanId) {
      setError('Please enter your email address or phone number.');
      return;
    }
    if (!validateEmailOrPhone(cleanId)) {
      setError('Please enter a valid email address (e.g. name@example.com) or phone number (e.g. +91 98765 43210).');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.auth.checkIdentifier(cleanId);
      if (!res.exists) {
        setError(`No account found with this ${res.identifier_type}. Please check your spelling or register with your Master Security Passkey.`);
        setIdentifierStatus({ checking: false, exists: false, message: 'Account not found', type: res.identifier_type });
        setLoading(false);
        return;
      }
      setIdentifierStatus({ checking: false, exists: true, message: '', type: res.identifier_type });
      goToStep(2, 'forward');
    } catch (err) {
      // If network check fails, continue
      goToStep(2, 'forward');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // Interactive anti-bot challenge check if active
    if (failedLoginCount >= 2) {
      const expected = botMathChallenge.num1 + botMathChallenge.num2;
      if (parseInt(botMathChallenge.answer, 10) !== expected) {
        setError('Security Puzzle Verification failed. Please enter the correct mathematical answer.');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      // Check if 2FA Security PIN is required
      if (res && res.two_factor_required) {
        setLogin2FAToken(res.two_factor_token);
        goToStep(3, 'forward');
        setLoading(false);
        return;
      }

      goToStep(4, 'forward');
      setSuccessMessage('Authentication successful. Loading workspace...');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    } catch (err) {
      setFailedLoginCount((prev) => prev + 1);
      setBotMathChallenge({
        num1: Math.floor(Math.random() * 20) + 11,
        num2: Math.floor(Math.random() * 15) + 6,
        answer: ''
      });
      setError(err.message || 'Invalid credentials. Please check your email/phone and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin2FASubmit = async (e) => {
    e.preventDefault();
    if (login2FAPin.length !== 6) {
      setError('Please enter your complete 6-digit Security PIN.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await verify2FA(login2FAToken, login2FAPin);
      goToStep(4, 'forward');
      setSuccessMessage('2FA Verification Verified. Welcome back to MIND OS!');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Incorrect 6-digit Security PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpDetailsSubmit = async (e) => {
    e.preventDefault();
    if (botTrap) {
      setError('Automated submission rejected.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone) {
      const digits = cleanPhone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        setError('Please enter a valid mobile number with country code (e.g. +91 98765 43210).');
        return;
      }
    }

    if (!accessKey.trim()) {
      setError('Master Security Passkey is required to create an account on this private system.');
      return;
    }

    // Real-time cached duplicate rejection
    if (emailStatus?.exists) {
      setError(`The email ${cleanEmail} is already registered! Duplicate account creation is blocked.`);
      return;
    }
    if (phoneStatus?.exists) {
      setError(`The mobile number ${cleanPhone} is already registered! Duplicate account creation is blocked.`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Verify email uniqueness
      const resEmail = await api.auth.checkIdentifier(cleanEmail);
      if (resEmail.exists) {
        setError(`This email is already registered in AYORA. Please sign in instead.`);
        setEmailStatus({ checking: false, exists: true, message: resEmail.message });
        setLoading(false);
        return;
      }
      setEmailStatus({ checking: false, exists: false, message: 'Available' });

      // 2. Verify mobile number uniqueness if provided
      if (cleanPhone) {
        const resPhone = await api.auth.checkIdentifier(cleanPhone);
        if (resPhone.exists) {
          setError(`This mobile number is already registered in AYORA. Please sign in instead.`);
          setPhoneStatus({ checking: false, exists: true, message: resPhone.message });
          setLoading(false);
          return;
        }
        setPhoneStatus({ checking: false, exists: false, message: 'Available' });
      }

      goToStep(2, 'forward');
    } catch (err) {
      goToStep(2, 'forward');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpPasswordSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number (0-9).');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character (e.g. !@#$%^&*).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // Proceed to Step 3: Create 6-Digit Recovery PIN
    goToStep(3, 'forward');
  };

  const handleSignUpRecoveryPinSubmit = async (e) => {
    e.preventDefault();
    if (botTrap) {
      setError('Automated submission rejected.');
      return;
    }
    if (!accessKey.trim()) {
      setError('Master Security Passkey is required to register an account.');
      return;
    }
    if (recoveryPin.length !== 6) {
      setError('Recovery PIN must be exactly 6 numeric digits.');
      return;
    }
    if (recoveryPin !== confirmRecoveryPin) {
      setError('Recovery PINs do not match. Please re-enter.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(email.trim(), password, name.trim(), recoveryPin, accessKey.trim(), phone.trim() || null);
      goToStep(4, 'forward');
      setSuccessMessage('Account created with Master Security Passkey & Recovery PIN. Welcome to MIND OS!');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1100);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please verify your Master Security Passkey and credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // FORGOT PASSWORD FLOW HANDLERS
  // ----------------------------------------------------

  const handleRecoveryIdentifierSubmit = async (e) => {
    e.preventDefault();
    const cleanId = email.trim();
    if (!cleanId || !validateEmailOrPhone(cleanId)) {
      setError('Please enter a valid registered email address or phone number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const resp = await api.auth.verifyRecoveryIdentifier(cleanId);
      setRecoveryToken(resp.recovery_token);
      setMaskedIdentifier(resp.masked_identifier || cleanId);
      if (!resp.has_pin) {
        setError('No 6-Digit Recovery PIN is configured for this account. Please contact your workspace administrator.');
        setLoading(false);
        return;
      }
      goToStep(2, 'forward');
    } catch (err) {
      setError(err.message || 'Unable to locate account with this email/phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryPinSubmit = async (e) => {
    e.preventDefault();
    if (enteredRecoveryPin.length !== 6) {
      setError('Please enter the full 6-digit Recovery PIN.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const resp = await api.auth.verifyRecoveryPin(recoveryToken, enteredRecoveryPin);
      setResetToken(resp.reset_token);
      goToStep(3, 'forward');
    } catch (err) {
      setError(err.message || 'Incorrect Recovery PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (recoveryNewPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const resp = await api.auth.resetPasswordWithPin(resetToken, recoveryNewPassword);
      setSuccessMessage(resp.message || 'Password updated successfully! Existing sessions revoked.');
      goToStep(4, 'forward');
      setTimeout(() => {
        switchFlow('signin');
      }, 1900);
    } catch (err) {
      setError(err.message || 'Failed to update password. Recovery session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuthClick = () => {
    setError('');
    // Check if real Google GSI Client is configured
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const googleProfile = JSON.parse(jsonPayload);
                const user = await googleLogin({
                  email: googleProfile.email,
                  name: googleProfile.name,
                  avatar: googleProfile.picture || (googleProfile.name ? googleProfile.name[0] : 'G'),
                  google_id: googleProfile.sub
                });
                handleGoogleSuccess(user);
                return;
              } catch (e) {
                console.warn('GSI parse fallback', e);
              }
            }
          }
        });
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('GSI prompt notice', err);
      }
    }
    // Open Google Account Picker dialog
    setGoogleModalOpen(true);
  };

  const handleGoogleSuccess = (loggedInUser) => {
    setSuccessMessage(`Welcome, ${loggedInUser.name || 'User'}! Connecting your workspace...`);
    goToStep(4, 'forward');
    setTimeout(() => {
      if (onComplete) onComplete(loggedInUser);
    }, 900);
  };

  const handleSocialSSO = (provider) => {
    if (provider === 'Google') {
      handleGoogleAuthClick();
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail(`${provider.toLowerCase()}user@mindos.io`);
      goToStep(2, 'forward');
    }, 500);
  };

  return (
    <div className="auth-fullpage-wrapper">
      {/* Background Animated Ambience */}
      <div className="auth-fullpage-bg-mesh" />
      <div className="auth-fullpage-ambient-orb" />

      {/* Top Header Bar */}
      <header className="auth-fullpage-header">
        <div
          className="auth-brand-badge"
          onClick={onExit}
          style={{ cursor: 'pointer' }}
          title="Return to Dashboard"
        >
          <img src="/logo.svg" alt="MIND OS Logo" className="auth-brand-icon" />
          <div className="auth-brand-text">
            <span className="auth-brand-name">MIND OS</span>
            <span className="auth-brand-tagline">Your Personal Operating System.</span>
          </div>
        </div>

        <button
          type="button"
          className="auth-exit-btn"
          onClick={onExit}
          title="Back to Dashboard"
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>
      </header>

      {/* Main Full-Screen Layout */}
      <main className="auth-fullpage-body">
        {/* Left Side / Form Column (No Card/Box — Integrated Directly) */}
        <div className="auth-form-column">
          {/* Cyber Security Assurance Strip */}
          <div className="auth-security-strip">
            <span className="auth-security-badge-item">
              <ShieldCheck size={14} color="#10B981" /> 256-Bit SSL/TLS
            </span>
            <span className="auth-security-badge-item">
              <Lock size={13} color="#8B5CF6" /> Zero-Knowledge Hash
            </span>
            <span className="auth-security-badge-item">
              <KeyRound size={13} color="#38BDF8" /> 2FA PIN Recovery
            </span>
            <span className="auth-security-badge-item">
              <ShieldAlert size={13} color="#F59E0B" /> Anti-Brute Force
            </span>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div style={{
              padding: '0.65rem 0.9rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '8px',
              color: '#34D399',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1rem'
            }}>
              <Check size={15} /> {toastMessage}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className={`auth-alert-box animate-shake ${error.includes('Lockout') ? 'auth-alert-lockout' : ''}`}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>{error}</span>
                {error.includes('Lockout') && (
                  <button
                    type="button"
                    onClick={() => switchFlow('forgot')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E0E7FF',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Unlock immediately with your 6-Digit Recovery PIN →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              1. SIGN IN FLOW (Multi-Step)
             ==================================================== */}
          {flow === 'signin' && (
            <>
              {/* Step 1: Identifier Entry */}
              {step === 1 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-title-section">
                    <h1 className="auth-large-title" style={{ color: '#FFFFFF', fontWeight: 800 }}>Sign in to MIND OS</h1>
                    <p className="auth-description">
                      Welcome back. Enter your verified credentials to access your unified personal workspace.
                    </p>
                  </div>

                  <form onSubmit={handleIdentifierSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="auth-input-label" style={{ marginBottom: 0 }}>Email or Mobile number</label>
                        {identifierStatus?.checking && (
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Verifying workspace identity...</span>
                        )}
                      </div>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          required
                          autoFocus
                          autoComplete="username"
                          className={`auth-input-field ${identifierStatus?.exists === false ? 'auth-field-error' : identifierStatus?.exists === true ? 'auth-field-success' : ''}`}
                          placeholder="name@example.com / +91 98765 43210"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (identifierStatus) setIdentifierStatus(null);
                          }}
                          onBlur={() => checkIdentifierForSignIn(email)}
                        />
                      </div>

                      {/* Email Domain Suggestion Chips */}
                      {(!email.includes('@') || email.endsWith('@')) && email.trim().length >= 2 && (
                        <div className="auth-domain-chips">
                          {EMAIL_DOMAINS.map((domain) => {
                            const base = email.includes('@') ? email.split('@')[0] : email.trim();
                            const suggested = `${base}${domain}`;
                            return (
                              <button
                                key={domain}
                                type="button"
                                className="auth-domain-chip"
                                onClick={() => {
                                  setEmail(suggested);
                                  checkIdentifierForSignIn(suggested);
                                }}
                              >
                                {suggested}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Unregistered Account Warning in Sign In */}
                      {identifierStatus && !identifierStatus.checking && identifierStatus.exists === false && (
                        <div style={{
                          marginTop: '0.6rem',
                          padding: '0.7rem 0.85rem',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span style={{ color: '#F87171', fontSize: '0.8rem', fontWeight: 600 }}>
                            ⚠️ No account found for this {identifierStatus.type}!
                          </span>
                          <button
                            type="button"
                            onClick={() => switchFlow('signup')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#C084FC',
                              fontSize: '0.78rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                              fontWeight: 600
                            }}
                          >
                            Create an account with Master Security Passkey →
                          </button>
                        </div>
                      )}

                      {/* Verified Account Status */}
                      {identifierStatus?.exists === true && (
                        <span style={{ fontSize: '0.74rem', color: '#10B981', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Verified AYORA Account Found
                        </span>
                      )}
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => switchFlow('signup')}
                      >
                        Don't have an account? <span className="auth-link-highlight">Sign up</span>
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loading || !email}
                      >
                        <span>Continue</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Password Entry */}
              {step === 2 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div
                    className="auth-account-chip"
                    onClick={() => goToStep(1, 'backward')}
                    title="Change email or phone"
                  >
                    <div className="auth-avatar-dot">
                      {email.includes('@') ? email.charAt(0).toUpperCase() : <Phone size={12} />}
                    </div>
                    <span className="auth-chip-email">{email}</span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>

                  <div className="auth-title-section">
                    <h1 className="auth-large-title">Enter your password</h1>
                    <p className="auth-description">
                      Enter the security password associated with this account.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">Password</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoFocus
                          className="auth-input-field"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleCapsCheck}
                          onKeyUp={handleCapsCheck}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* CapsLock Warning */}
                      {capsLockOn && (
                        <div className="auth-capslock-badge">
                          <Lock size={13} /> CapsLock is ON (Passwords are case-sensitive)
                        </div>
                      )}

                      {/* Brute-Force Rate Limiting Notice */}
                      <span style={{ fontSize: '0.74rem', color: failedLoginCount > 0 ? '#F87171' : '#64748B', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={12} />
                        {failedLoginCount > 0
                          ? `Security Alert: Failed attempt ${failedLoginCount} of 5 before 15-minute temporary lockout.`
                          : 'Security Notice: 5 consecutive failed attempts trigger an automated 15-minute security lockout.'}
                      </span>
                    </div>

                    {/* Adaptive Anti-Bot Mathematical Challenge (triggers on 2+ failed attempts) */}
                    {failedLoginCount >= 2 && (
                      <div style={{
                        padding: '0.85rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '10px',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                          <ShieldAlert size={15} /> Automated Bot Shield Active
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                          Please solve this mathematical verification before submitting:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                            {botMathChallenge.num1} + {botMathChallenge.num2} =
                          </span>
                          <input
                            type="number"
                            required
                            placeholder="Result"
                            className="auth-input-field"
                            style={{ width: '90px', padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: 700 }}
                            value={botMathChallenge.answer}
                            onChange={(e) => setBotMathChallenge({ ...botMathChallenge, answer: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => switchFlow('forgot')}
                      >
                        Forgot password?
                      </button>

                      <div className="auth-btn-row">
                        <button
                          type="button"
                          className="auth-back-btn"
                          onClick={() => goToStep(1, 'backward')}
                        >
                          Back
                        </button>

                        <button
                          type="submit"
                          className="auth-primary-btn"
                          disabled={loading || !password || (failedLoginCount >= 2 && !botMathChallenge.answer)}
                        >
                          {loading ? 'Authenticating...' : 'Sign In'}
                          {!loading && <ArrowRight size={15} />}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Two-Factor Authentication (2FA PIN Verification) */}
              {step === 3 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-account-chip" onClick={() => goToStep(2, 'backward')}>
                    <div className="auth-avatar-dot">{email.charAt(0).toUpperCase()}</div>
                    <span className="auth-chip-email">{email}</span>
                  </div>

                  <div className="auth-title-section">
                    <span className="recovery-step-indicator-badge">
                      <ShieldCheck size={13} /> Two-Factor Authentication (2FA)
                    </span>
                    <h1 className="auth-large-title">Enter Security PIN</h1>
                    <p className="auth-description">
                      Enter the 6-digit Security PIN configured for this account to complete identity verification.
                    </p>
                  </div>

                  <form onSubmit={handleLogin2FASubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">6-Digit Security PIN</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={show2FAPin ? 'text' : 'password'}
                          required
                          autoFocus
                          maxLength={6}
                          className="auth-input-field"
                          placeholder="••••••"
                          value={login2FAPin}
                          onChange={(e) => handleNumericPinChange(e.target.value, setLogin2FAPin)}
                          style={{
                            letterSpacing: show2FAPin ? '0.25rem' : '0.5rem',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            paddingRight: '2.5rem'
                          }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShow2FAPin(!show2FAPin)}
                          tabIndex={-1}
                          title={show2FAPin ? 'Hide PIN' : 'Show PIN'}
                        >
                          {show2FAPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.35rem', display: 'block' }}>
                        🔒 Two-step zero-trust verification active. Prevents login even if your password was leaked.
                      </span>
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-back-btn"
                        onClick={() => goToStep(2, 'backward')}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loading || login2FAPin.length !== 6}
                      >
                        {loading ? 'Verifying PIN...' : 'Verify & Launch'}
                        {!loading && <ShieldCheck size={15} />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 4: Success State */}
              {step === 4 && (
                <div className="auth-success-state">
                  <div className="auth-loader-ring">
                    <ShieldCheck size={28} color="#8B5CF6" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                      {successMessage || 'Workspace Verified'}
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                      Establishing encrypted workspace session...
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ====================================================
              2. SIGN UP FLOW (Multi-Step)
             ==================================================== */}
          {flow === 'signup' && (
            <>
              {/* Step 1: Details */}
              {step === 1 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-title-section">
                    <h1 className="auth-large-title">Create your account</h1>
                    <p className="auth-description">
                      One unified workspace for your tasks, goals, learning, coding, and career.
                    </p>
                  </div>

                  <form onSubmit={handleSignUpDetailsSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">Full Name</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          required
                          autoFocus
                          className="auth-input-field"
                          placeholder="e.g. Alex Morgan"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email Input with Live Duplicate Verification */}
                    <div className="auth-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="auth-input-label" style={{ marginBottom: 0 }}>Work / Personal Email</label>
                        {emailStatus?.checking && (
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Checking uniqueness...</span>
                        )}
                      </div>
                      <div className="auth-input-wrapper">
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          className={`auth-input-field ${emailStatus?.exists === true ? 'auth-field-error' : emailStatus?.exists === false ? 'auth-field-success' : ''}`}
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailStatus) setEmailStatus(null);
                          }}
                          onBlur={() => checkEmailAvailability(email)}
                        />
                      </div>

                      {/* Email Domain Suggestion Chips */}
                      {(!email.includes('@') || email.endsWith('@')) && email.trim().length >= 2 && (
                        <div className="auth-domain-chips">
                          {EMAIL_DOMAINS.map((domain) => {
                            const base = email.includes('@') ? email.split('@')[0] : email.trim();
                            const suggested = `${base}${domain}`;
                            return (
                              <button
                                key={domain}
                                type="button"
                                className="auth-domain-chip"
                                onClick={() => {
                                  setEmail(suggested);
                                  checkEmailAvailability(suggested);
                                }}
                              >
                                {suggested}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Duplicate Email Detected Notice */}
                      {emailStatus?.exists === true && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.7rem 0.85rem',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span style={{ color: '#F87171', fontSize: '0.8rem', fontWeight: 600 }}>
                            🚫 Already Registered: An account with this email already exists!
                          </span>
                          <span style={{ color: '#CBD5E1', fontSize: '0.74rem' }}>
                            Duplicate registration is blocked for security. Please sign in instead.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              switchFlow('signin');
                              goToStep(2, 'forward');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#C084FC',
                              fontSize: '0.78rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              padding: '2px 0 0',
                              textDecoration: 'underline',
                              fontWeight: 600
                            }}
                          >
                            Click here to sign in with this email →
                          </button>
                        </div>
                      )}

                      {emailStatus && !emailStatus.checking && emailStatus.exists === false && (
                        <span style={{ fontSize: '0.74rem', color: '#10B981', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={12} /> Email is unique and available
                        </span>
                      )}
                    </div>

                    {/* Mobile Phone Input with Live Duplicate Verification */}
                    <div className="auth-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="auth-input-label" style={{ marginBottom: 0 }}>Mobile Phone Number</label>
                        {phoneStatus?.checking && (
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Checking uniqueness...</span>
                        )}
                      </div>
                      <div className="auth-input-wrapper">
                        <input
                          type="tel"
                          autoComplete="tel"
                          className={`auth-input-field ${phoneStatus?.exists === true ? 'auth-field-error' : phoneStatus?.exists === false ? 'auth-field-success' : ''}`}
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (phoneStatus) setPhoneStatus(null);
                          }}
                          onBlur={() => checkPhoneAvailability(phone)}
                        />
                      </div>

                      {/* Duplicate Phone Detected Notice */}
                      {phoneStatus?.exists === true && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.7rem 0.85rem',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <span style={{ color: '#F87171', fontSize: '0.8rem', fontWeight: 600 }}>
                            🚫 Already Registered: An account with this mobile number already exists!
                          </span>
                          <span style={{ color: '#CBD5E1', fontSize: '0.74rem' }}>
                            Duplicate phone number registration is strictly forbidden.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEmail(phone);
                              switchFlow('signin');
                              goToStep(2, 'forward');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#C084FC',
                              fontSize: '0.78rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              padding: '2px 0 0',
                              textDecoration: 'underline',
                              fontWeight: 600
                            }}
                          >
                            Click here to sign in with this mobile number →
                          </button>
                        </div>
                      )}

                      {phoneStatus && !phoneStatus.checking && phoneStatus.exists === false && (
                        <span style={{ fontSize: '0.74rem', color: '#10B981', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={12} /> Mobile number is available
                        </span>
                      )}
                    </div>

                    {/* Master Security Passkey Field (Gatekeeping private registration) */}
                    <div className="auth-input-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <label className="auth-input-label" style={{ marginBottom: 0 }}>
                          Master Security Passkey
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ShieldCheck size={12} /> Invite Only
                        </span>
                      </div>
                      <div className="auth-input-wrapper">
                        <input
                          type={showAccessKey ? 'text' : 'password'}
                          required
                          className="auth-input-field"
                          placeholder="Enter system access passkey"
                          value={accessKey}
                          onChange={(e) => setAccessKey(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowAccessKey(!showAccessKey)}
                          tabIndex={-1}
                          title={showAccessKey ? 'Hide passkey' : 'Show passkey'}
                        >
                          {showAccessKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.3rem', display: 'block' }}>
                        🔒 Private workspace: Only authorized users with a valid passkey can create accounts.
                      </span>
                    </div>

                    {/* Bot Trap Honeypot */}
                    <div style={{ display: 'none', position: 'absolute', opacity: 0 }} aria-hidden="true">
                      <input
                        type="text"
                        name="security_bot_check"
                        tabIndex={-1}
                        value={botTrap}
                        onChange={(e) => setBotTrap(e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => switchFlow('signin')}
                      >
                        Already have an account? <span className="auth-link-highlight">Sign in</span>
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={
                          loading ||
                          !name.trim() ||
                          !email.trim() ||
                          !accessKey.trim() ||
                          emailStatus?.exists === true ||
                          phoneStatus?.exists === true ||
                          emailStatus?.checking ||
                          phoneStatus?.checking
                        }
                      >
                        <span>Next</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Password Setup */}
              {step === 2 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-account-chip" onClick={() => goToStep(1, 'backward')}>
                    <div className="auth-avatar-dot">{name.charAt(0).toUpperCase()}</div>
                    <span className="auth-chip-email">{name} ({email})</span>
                  </div>

                  <div className="auth-title-section">
                    <span className="recovery-step-indicator-badge">
                      <ShieldCheck size={13} /> Step 2 of 3 • Ultra-Strong Password
                    </span>
                    <h1 className="auth-large-title">Set your security password</h1>
                    <p className="auth-description">Protect your personal intelligence workspace with strong cryptography</p>
                  </div>

                  <form onSubmit={handleSignUpPasswordSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="auth-input-label" style={{ marginBottom: 0 }}>Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!showSuggestions) {
                              generateStrongSuggestions();
                            } else {
                              setShowSuggestions(false);
                            }
                          }}
                          title="Generate high-entropy password suggestions"
                          style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(139, 92, 246, 0.4)',
                            color: '#C084FC',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Sparkles size={13} />
                          {showSuggestions ? 'Hide Suggestions' : '🛡️ Suggest Strong Passwords'}
                        </button>
                      </div>

                      <div className="auth-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoFocus
                          className="auth-input-field"
                          placeholder="Enter high-entropy password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleCapsCheck}
                          onKeyUp={handleCapsCheck}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* CapsLock Warning */}
                      {capsLockOn && (
                        <div className="auth-capslock-badge">
                          <Lock size={13} /> CapsLock is ON (Passwords are case-sensitive)
                        </div>
                      )}

                      {/* Interactive Strong Password Suggestions Panel */}
                      {showSuggestions && (
                        <div className="auth-suggestions-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Shield size={13} color="#8B5CF6" /> Cryptographic Suggestions (Click to Apply):
                            </span>
                            <button
                              type="button"
                              onClick={generateStrongSuggestions}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#A78BFA',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'underline'
                              }}
                            >
                              <RefreshCw size={11} /> Regenerate
                            </button>
                          </div>
                          {passwordSuggestions.map((sug) => (
                            <div key={sug.id} className="auth-suggestion-row">
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.76rem', color: '#CBD5E1', fontWeight: 600 }}>{sug.title}</span>
                                <code style={{ fontSize: '0.82rem', color: '#F8FAFC', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                                  {sug.value}
                                </code>
                                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{sug.desc}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => applyPasswordSuggestion(sug.value)}
                                style={{
                                  background: 'rgba(139, 92, 246, 0.2)',
                                  border: '1px solid rgba(139, 92, 246, 0.5)',
                                  color: '#FFFFFF',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0
                                }}
                              >
                                Use This
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Password Strength Meter & Real-Time Crack Time Estimation */}
                      {password && (
                        <div className="auth-pwd-meter">
                          <div className="auth-pwd-bars">
                            <div className={`auth-pwd-bar-seg ${pwdStrength >= 1 ? (pwdStrength === 1 ? 'active-weak' : pwdStrength === 2 ? 'active-fair' : pwdStrength === 3 ? 'active-good' : pwdStrength >= 4 && password.length >= 14 ? 'active-ultra' : 'active-strong') : ''}`} />
                            <div className={`auth-pwd-bar-seg ${pwdStrength >= 2 ? (pwdStrength === 2 ? 'active-fair' : pwdStrength === 3 ? 'active-good' : pwdStrength >= 4 && password.length >= 14 ? 'active-ultra' : 'active-strong') : ''}`} />
                            <div className={`auth-pwd-bar-seg ${pwdStrength >= 3 ? (pwdStrength === 3 ? 'active-good' : pwdStrength >= 4 && password.length >= 14 ? 'active-ultra' : 'active-strong') : ''}`} />
                            <div className={`auth-pwd-bar-seg ${pwdStrength >= 4 ? (password.length >= 14 ? 'active-ultra' : 'active-strong') : ''}`} />
                          </div>

                          {/* Dynamic Entropy & Crack Time Badge */}
                          {(() => {
                            const est = getCrackTimeEstimate(password);
                            return (
                              <div className="auth-crack-time-badge" style={{ background: `${est.color}18`, border: `1px solid ${est.color}40`, color: est.color }}>
                                <Zap size={12} />
                                <span>Estimated Crack Time: <strong>{est.time}</strong> ({est.label})</span>
                              </div>
                            );
                          })()}

                          <div className="auth-pwd-rules" style={{ flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                            <span className={`auth-pwd-rule-item ${password.length >= 8 ? 'valid' : ''}`}>
                              {password.length >= 8 ? '✓' : '•'} 8+ chars
                            </span>
                            <span className={`auth-pwd-rule-item ${/[A-Z]/.test(password) ? 'valid' : ''}`}>
                              {/[A-Z]/.test(password) ? '✓' : '•'} Uppercase (A-Z)
                            </span>
                            <span className={`auth-pwd-rule-item ${/[a-z]/.test(password) ? 'valid' : ''}`}>
                              {/[a-z]/.test(password) ? '✓' : '•'} Lowercase (a-z)
                            </span>
                            <span className={`auth-pwd-rule-item ${/[0-9]/.test(password) ? 'valid' : ''}`}>
                              {/[0-9]/.test(password) ? '✓' : '•'} Number (0-9)
                            </span>
                            <span className={`auth-pwd-rule-item ${/[^A-Za-z0-9]/.test(password) ? 'valid' : ''}`}>
                              {/[^A-Za-z0-9]/.test(password) ? '✓' : '•'} Special (!@#$)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-input-label">Confirm Password</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          className={`auth-input-field ${confirmPassword && password !== confirmPassword ? 'auth-field-error' : confirmPassword && password === confirmPassword ? 'auth-field-success' : ''}`}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyDown={handleCapsCheck}
                          onKeyUp={handleCapsCheck}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <span style={{ fontSize: '0.74rem', color: '#EF4444', marginTop: '0.25rem' }}>
                          ⚠️ Passwords do not match.
                        </span>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <span style={{ fontSize: '0.74rem', color: '#10B981', marginTop: '0.25rem' }}>
                          ✓ Passwords match.
                        </span>
                      )}
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-back-btn"
                        onClick={() => goToStep(1, 'backward')}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={
                          loading ||
                          password.length < 8 ||
                          !/[A-Z]/.test(password) ||
                          !/[a-z]/.test(password) ||
                          !/[0-9]/.test(password) ||
                          !/[^A-Za-z0-9]/.test(password) ||
                          password !== confirmPassword
                        }
                      >
                        <span>Next: Set Recovery PIN</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: 6-Digit Recovery PIN Setup */}
              {step === 3 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-account-chip" onClick={() => goToStep(2, 'backward')}>
                    <div className="auth-avatar-dot">{name.charAt(0).toUpperCase()}</div>
                    <span className="auth-chip-email">{name} ({email})</span>
                  </div>

                  <div className="auth-title-section">
                    <span className="recovery-step-indicator-badge">
                      <KeyRound size={13} /> Step 3 of 3 • Recovery PIN
                    </span>
                    <h1 className="auth-large-title">Create 6-Digit Recovery PIN</h1>
                    <p className="auth-description">
                      Set a private PIN used for self-service password recovery if you ever forget your password.
                    </p>
                  </div>

                  <div className="recovery-info-banner">
                    <ShieldCheck size={18} className="recovery-info-banner-icon" />
                    <div>
                      <strong>Zero-Trust Safeguard:</strong> This 6-digit PIN is stored as a secure one-way hash. It is never exposed in plain text and ensures only you can recover your account.
                    </div>
                  </div>

                  <form onSubmit={handleSignUpRecoveryPinSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">6-Digit Recovery PIN</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showRecoveryPin ? 'text' : 'password'}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="•••••• (6 digits)"
                          className="auth-input-field recovery-pin-input-field"
                          value={recoveryPin}
                          onChange={(e) => handleNumericPinChange(e.target.value, setRecoveryPinState)}
                          style={{ letterSpacing: recoveryPin ? '0.3em' : 'normal', paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowRecoveryPin(!showRecoveryPin)}
                          tabIndex={-1}
                          title={showRecoveryPin ? 'Hide PIN' : 'Show PIN'}
                        >
                          {showRecoveryPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-input-label">Confirm 6-Digit PIN</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showConfirmRecoveryPin ? 'text' : 'password'}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          placeholder="•••••• (Re-enter 6 digits)"
                          className="auth-input-field recovery-pin-input-field"
                          value={confirmRecoveryPin}
                          onChange={(e) => handleNumericPinChange(e.target.value, setConfirmRecoveryPin)}
                          style={{ letterSpacing: confirmRecoveryPin ? '0.3em' : 'normal', paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowConfirmRecoveryPin(!showConfirmRecoveryPin)}
                          tabIndex={-1}
                          title={showConfirmRecoveryPin ? 'Hide PIN' : 'Show PIN'}
                        >
                          {showConfirmRecoveryPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {confirmRecoveryPin && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: (recoveryPin.length === 6 && recoveryPin === confirmRecoveryPin) ? '#10B981' : '#F87171' }}>
                          {recoveryPin.length === 6 && recoveryPin === confirmRecoveryPin ? (
                            <><span>✓</span> 6-Digit PINs match perfectly</>
                          ) : (
                            <><span>⚠</span> PINs do not match</>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-back-btn"
                        onClick={() => goToStep(2, 'backward')}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loading || recoveryPin.length !== 6 || recoveryPin !== confirmRecoveryPin}
                      >
                        {loading ? 'Creating Account...' : 'Complete & Launch'}
                        {!loading && <Sparkles size={15} />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="auth-success-state">
                  <div className="auth-check-icon-circle">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                      Workspace Ready!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                      {successMessage || `Welcome to AYORA, ${name || 'User'}. Redirecting to your workspace...`}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ====================================================
              3. DEDICATED FULL-PAGE FORGOT PASSWORD RECOVERY FLOW
             ==================================================== */}
          {flow === 'forgot' && (
            <>
              {/* Step 1: Identifier Entry */}
              {step === 1 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-title-section">
                    <span className="recovery-step-indicator-badge">
                      <KeyRound size={13} /> Recovery Step 1 of 3
                    </span>
                    <h1 className="auth-large-title">Recover your account</h1>
                    <p className="auth-description">
                      Enter your registered email address or phone number to begin zero-trust self-service recovery.
                    </p>
                  </div>

                  <form onSubmit={handleRecoveryIdentifierSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">Email / Phone number</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          required
                          autoFocus
                          autoComplete="username"
                          className="auth-input-field"
                          placeholder="name@example.com / +91 98765 43210"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => switchFlow('signin')}
                      >
                        ← Back to Sign In
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loading || !email}
                      >
                        {loading ? 'Verifying Account...' : 'Continue'}
                        {!loading && <ArrowRight size={15} />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: 6-Digit Recovery PIN Entry */}
              {step === 2 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-account-chip" onClick={() => goToStep(1, 'backward')}>
                    <div className="auth-avatar-dot">
                      {email.includes('@') ? email.charAt(0).toUpperCase() : <Phone size={12} />}
                    </div>
                    <span className="auth-chip-email">{maskedIdentifier || email}</span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>

                  <div className="auth-title-section">
                    <span className="recovery-step-indicator-badge">
                      <ShieldCheck size={13} /> Recovery Step 2 of 3
                    </span>
                    <h1 className="auth-large-title">Enter Recovery PIN</h1>
                    <p className="auth-description">
                      Enter the 6-digit confidential PIN configured for this account.
                    </p>
                  </div>

                  <div className="recovery-info-banner">
                    <Lock size={18} className="recovery-info-banner-icon" />
                    <div>
                      <strong>Protected Recovery:</strong> To prevent unauthorized password resets, verify your identity with your 6-digit PIN.
                    </div>
                  </div>

                  <form onSubmit={handleRecoveryPinSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">6-Digit Recovery PIN</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showEnteredRecoveryPin ? 'text' : 'password'}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="•••••• (6 digits)"
                          className="auth-input-field recovery-pin-input-field"
                          value={enteredRecoveryPin}
                          onChange={(e) => handleNumericPinChange(e.target.value, setEnteredRecoveryPin)}
                          style={{ letterSpacing: enteredRecoveryPin ? '0.35em' : 'normal', paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowEnteredRecoveryPin(!showEnteredRecoveryPin)}
                          tabIndex={-1}
                          title={showEnteredRecoveryPin ? 'Hide PIN' : 'Show PIN'}
                        >
                          {showEnteredRecoveryPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-back-btn"
                        onClick={() => goToStep(1, 'backward')}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loading || enteredRecoveryPin.length !== 6}
                      >
                        {loading ? 'Verifying PIN...' : 'Verify PIN'}
                        {!loading && <ArrowRight size={15} />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: New Password Setup */}
              {step === 3 && (
                <div className={`auth-step-container ${direction === 'backward' ? 'slide-back' : ''}`}>
                  <div className="auth-title-section">
                    <span className="recovery-step-indicator-badge">
                      <KeyRound size={13} /> Recovery Step 3 of 3
                    </span>
                    <h1 className="auth-large-title">Create New Password</h1>
                    <p className="auth-description">
                      Choose a new strong password to restore access to your MIND OS workspace.
                    </p>
                  </div>

                  <form onSubmit={handleRecoveryResetPasswordSubmit} className="auth-form-body">
                    <div className="auth-input-group">
                      <label className="auth-input-label">New Password</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showRecoveryNewPassword ? 'text' : 'password'}
                          required
                          autoFocus
                          className="auth-input-field"
                          placeholder="At least 8 characters"
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowRecoveryNewPassword(!showRecoveryNewPassword)}
                          tabIndex={-1}
                          title={showRecoveryNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRecoveryNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {recoveryNewPassword && (
                        <div className="auth-pwd-meter">
                          <div className="auth-pwd-bars">
                            <div className={`auth-pwd-bar-seg ${recoveryPwdStrength >= 1 ? (recoveryPwdStrength === 1 ? 'active-weak' : recoveryPwdStrength === 2 ? 'active-fair' : recoveryPwdStrength === 3 ? 'active-good' : 'active-strong') : ''}`} />
                            <div className={`auth-pwd-bar-seg ${recoveryPwdStrength >= 2 ? (recoveryPwdStrength === 2 ? 'active-fair' : recoveryPwdStrength === 3 ? 'active-good' : 'active-strong') : ''}`} />
                            <div className={`auth-pwd-bar-seg ${recoveryPwdStrength >= 3 ? (recoveryPwdStrength === 3 ? 'active-good' : 'active-strong') : ''}`} />
                            <div className={`auth-pwd-bar-seg ${recoveryPwdStrength >= 4 ? 'active-strong' : ''}`} />
                          </div>
                          <div className="auth-pwd-rules">
                            <span className={`auth-pwd-rule-item ${recoveryNewPassword.length >= 8 ? 'valid' : ''}`}>
                              {recoveryNewPassword.length >= 8 ? '✓' : '•'} 8+ chars
                            </span>
                            <span className={`auth-pwd-rule-item ${/[A-Z]/.test(recoveryNewPassword) ? 'valid' : ''}`}>
                              {/[A-Z]/.test(recoveryNewPassword) ? '✓' : '•'} Uppercase
                            </span>
                            <span className={`auth-pwd-rule-item ${/[0-9]/.test(recoveryNewPassword) ? 'valid' : ''}`}>
                              {/[0-9]/.test(recoveryNewPassword) ? '✓' : '•'} Number
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-input-label">Confirm New Password</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showRecoveryConfirmPassword ? 'text' : 'password'}
                          required
                          className="auth-input-field"
                          placeholder="Re-enter new password"
                          value={recoveryConfirmPassword}
                          onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          className="auth-input-icon-right"
                          onClick={() => setShowRecoveryConfirmPassword(!showRecoveryConfirmPassword)}
                          tabIndex={-1}
                          title={showRecoveryConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRecoveryConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="auth-actions-row">
                      <button
                        type="button"
                        className="auth-back-btn"
                        onClick={() => goToStep(2, 'backward')}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loading || recoveryNewPassword.length < 8 || recoveryNewPassword !== recoveryConfirmPassword}
                      >
                        {loading ? 'Updating Password...' : 'Save & Sign In'}
                        {!loading && <Check size={15} />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 4: Recovery Success */}
              {step === 4 && (
                <div className="auth-success-state">
                  <div className="auth-check-icon-circle">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                      Password Reset Successfully!
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                      {successMessage || 'Your password has been updated and previous sessions have been revoked. Redirecting to Sign In...'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side / AYORA Premium Brand Showcase (Desktop) */}
        <div className="auth-visual-column">
          <div className="auth-showcase-container">
            {/* Luminous Brand Pill */}
            <div className="auth-showcase-pill">
              <Sparkles size={14} className="auth-sparkle-glow" />
              <span>Unified Intelligence Platform</span>
            </div>

            <h2 className="auth-showcase-headline">
              MIND OS<br />
              <span className="auth-gradient-text">Your Personal Operating System.</span>
            </h2>

            <p className="auth-showcase-sub">
              Empowering high-velocity builders, engineers, and creators with an all-in-one execution operating system.
            </p>

            {/* Feature Highlights Grid */}
            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-box">
                  <Target size={18} color="#A78BFA" />
                </div>
                <div>
                  <div className="auth-feature-title">Goals & Priority Execution</div>
                  <div className="auth-feature-desc">Dynamic telemetry, milestone tracking, and daily focus velocity.</div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-box">
                  <Code2 size={18} color="#818CF8" />
                </div>
                <div>
                  <div className="auth-feature-title">Coding & Technical Mastery</div>
                  <div className="auth-feature-desc">Integrated problem solutions, algorithm streaks, and topic analytics.</div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon-box">
                  <BookOpen size={18} color="#C084FC" />
                </div>
                <div>
                  <div className="auth-feature-title">Continuous Skill Growth</div>
                  <div className="auth-feature-desc">Time tracking, syllabus progression, and automated daily AI briefs.</div>
                </div>
              </div>
            </div>

            {/* Ambient Graphic Accent */}
            <div className="auth-visual-graphic-lines">
              <div className="auth-glow-line auth-line-1" />
              <div className="auth-glow-line auth-line-2" />
              <div className="auth-glow-line auth-line-3" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-fullpage-footer">
        <div>© 2026 MIND OS. All rights reserved.</div>
        <div className="auth-footer-links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <span style={{ opacity: 0.3 }}>•</span>
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <span style={{ opacity: 0.3 }}>•</span>
          <a href="#status" onClick={(e) => e.preventDefault()}>System Status</a>
          <span style={{ opacity: 0.3 }}>•</span>
          <a href="#security" onClick={(e) => e.preventDefault()}>Security</a>
        </div>
      </footer>

      {/* Google OAuth & Account Chooser Dialog */}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
}
