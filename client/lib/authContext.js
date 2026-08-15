'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetchApi('/auth/me');
          if (res.success) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, role = null) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (name, email, password) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
