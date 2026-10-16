'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import {
  loginCustomer as loginRequest,
  registerCustomer as registerRequest,
  fetchCustomerMe,
} from '@/lib/auth/customerApi';

const CustomerAuthContext = createContext(null);

/** Holds the current customer session for the storefront. */
export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;
        if (token) {
          const me = await fetchCustomerMe();
          if (active) setCustomer(me);
        }
      } catch {
        if (active) setCustomer(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerToken', data.accessToken);
    }
    setCustomer(data);
    return data;
  }, []);

  const register = useCallback(async (data) => {
    const result = await registerRequest(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerToken', result.accessToken);
    }
    setCustomer(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customerToken');
    }
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, isLoading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
