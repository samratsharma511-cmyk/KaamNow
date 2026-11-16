import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kaamnow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('kaamnow_token') || null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem('kaamnow_token');
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('kaamnow_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      localStorage.removeItem('kaamnow_token');
      localStorage.removeItem('kaamnow_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('kaamnow_token', data.token);
      localStorage.setItem('kaamnow_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.success) {
      localStorage.setItem('kaamnow_token', data.token);
      localStorage.setItem('kaamnow_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('kaamnow_token');
    localStorage.removeItem('kaamnow_user');
    setToken(null);
    setUser(null);
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('kaamnow_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isCustomer: user?.role === 'CUSTOMER',
        isWorker: user?.role === 'WORKER',
        login,
        register,
        logout,
        refreshUser,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
