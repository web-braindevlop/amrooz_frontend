'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { fetchMe, login as loginRequest, logout as logoutRequest } from '@/lib/admin/api';

const AuthContext = createContext(null);

/** Holds the current admin session for everything under /admin. */
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (active) setAdmin(me);
      } catch {
        if (active) setAdmin(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const me = await loginRequest(email, password);
    setAdmin(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
