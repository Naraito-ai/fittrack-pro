import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('fittrack_token');
      if (!token) { setLoading(false); setInitialized(true); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('fittrack_token');
      } finally {
        setLoading(false); setInitialized(true);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('fittrack_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('fittrack_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fittrack_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((u) => setUser(p => ({ ...p, ...u })), []);

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
