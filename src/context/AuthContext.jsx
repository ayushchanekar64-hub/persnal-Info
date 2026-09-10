import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('mynexus_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initialize auth from stored token
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('mynexus_token');
      if (storedToken) {
        try {
          const currentUser = await api.auth.getMe();
          setUser(currentUser);
          localStorage.setItem('mynexus_user', JSON.stringify(currentUser));
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem('mynexus_user');
        }
      } else {
        localStorage.removeItem('mynexus_user');
        setUser(null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('mynexus_user', JSON.stringify(data.user));
    setAuthModalOpen(false);
    return data.user;
  };

  const register = async (email, password, name) => {
    const data = await api.auth.register({ email, password, name });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('mynexus_user', JSON.stringify(data.user));
    setAuthModalOpen(false);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mynexus_user');
  };

  const updateProfile = async (profileData) => {
    const updated = await api.auth.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem('mynexus_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        authModalOpen,
        setAuthModalOpen
      }}
    >
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
