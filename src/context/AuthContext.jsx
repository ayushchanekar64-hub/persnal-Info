import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('mindos_user') || localStorage.getItem('ayora_user') || localStorage.getItem('mynexus_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState(null); // 'signin' | 'signup' | 'forgot' | null

  // Initialize auth from stored token
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('mindos_token') || localStorage.getItem('ayora_token') || localStorage.getItem('mynexus_token');
      if (storedToken) {
        try {
          const currentUser = await api.auth.getMe();
          const currentSerialized = JSON.stringify(currentUser);
          setUser((prev) => {
            if (prev) {
              const { _loginTs, ...rest } = prev;
              if (JSON.stringify(rest) === currentSerialized) {
                return prev;
              }
            }
            return currentUser;
          });
          localStorage.setItem('mindos_user', currentSerialized);
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem('mindos_user');
          localStorage.removeItem('ayora_user');
          localStorage.removeItem('mynexus_user');
        }
      } else {
        localStorage.removeItem('mindos_user');
        localStorage.removeItem('ayora_user');
        localStorage.removeItem('mynexus_user');
        setUser(null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.auth.login({ email, password });
    if (data.two_factor_required) {
      return { two_factor_required: true, two_factor_token: data.two_factor_token, user: data.user };
    }
    setToken(data.access_token);
    const updatedUser = { ...data.user, _loginTs: Date.now() };
    setUser(updatedUser);
    localStorage.setItem('mindos_user', JSON.stringify(data.user));
    setAuthScreen(null);
    window.dispatchEvent(new CustomEvent('mindos:auth-change', { detail: { user: updatedUser, token: data.access_token } }));
    return updatedUser;
  }, []);

  const verify2FA = useCallback(async (twoFactorToken, securityPin) => {
    const data = await api.auth.login2FA(twoFactorToken, securityPin);
    setToken(data.access_token);
    const updatedUser = { ...data.user, _loginTs: Date.now() };
    setUser(updatedUser);
    localStorage.setItem('mindos_user', JSON.stringify(data.user));
    setAuthScreen(null);
    window.dispatchEvent(new CustomEvent('mindos:auth-change', { detail: { user: updatedUser, token: data.access_token } }));
    return updatedUser;
  }, []);

  const register = useCallback(async (email, password, name, recoveryPin, accessKey, phone = null) => {
    const payload = {
      email,
      password,
      name,
      recovery_pin: recoveryPin,
      access_key: accessKey
    };
    if (phone) payload.phone = phone;
    const data = await api.auth.register(payload);
    setToken(data.access_token);
    const updatedUser = { ...data.user, _loginTs: Date.now() };
    setUser(updatedUser);
    localStorage.setItem('mindos_user', JSON.stringify(data.user));
    setAuthScreen(null);
    window.dispatchEvent(new CustomEvent('mindos:auth-change', { detail: { user: updatedUser, token: data.access_token } }));
    return updatedUser;
  }, []);

  const setRecoveryPin = useCallback(async (recoveryPin) => {
    const updatedUser = await api.auth.setRecoveryPin(recoveryPin);
    setUser(updatedUser);
    localStorage.setItem('mindos_user', JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  const googleLogin = useCallback(async (googleData) => {
    const data = await api.auth.googleLogin({
      email: googleData.email,
      name: googleData.name,
      avatar: googleData.avatar || googleData.picture,
      google_id: googleData.google_id || googleData.sub,
      access_key: googleData.access_key
    });
    setToken(data.access_token);
    const updatedUser = { ...data.user, _loginTs: Date.now() };
    setUser(updatedUser);
    localStorage.setItem('mindos_user', JSON.stringify(data.user));
    setAuthScreen(null);
    window.dispatchEvent(new CustomEvent('mindos:auth-change', { detail: { user: updatedUser, token: data.access_token } }));
    return updatedUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mindos_user');
    localStorage.removeItem('ayora_user');
    localStorage.removeItem('mynexus_user');
    window.dispatchEvent(new CustomEvent('mindos:auth-change', { detail: { user: null, token: null } }));
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const updated = await api.auth.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem('mindos_user', JSON.stringify(updated));
    return updated;
  }, []);

  const openAuth = useCallback((flow = 'signin') => {
    setAuthScreen(flow);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthScreen(null);
  }, []);

  const setAuthModalOpen = useCallback((val) => {
    setAuthScreen(val ? 'signin' : null);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    hasRecoveryPin: !!user?.has_recovery_pin,
    login,
    verify2FA,
    register,
    setRecoveryPin,
    googleLogin,
    logout,
    updateProfile,
    authScreen,
    setAuthScreen,
    openAuth,
    closeAuth,
    // Backward-compatible aliases:
    authModalOpen: !!authScreen,
    setAuthModalOpen
  }), [
    user,
    loading,
    login,
    verify2FA,
    register,
    setRecoveryPin,
    googleLogin,
    logout,
    updateProfile,
    authScreen,
    openAuth,
    closeAuth,
    setAuthModalOpen
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
