"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAuthSession,
  hydrateAuthSession,
  persistAuthSession,
  type AuthSuccessData,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthSuccessData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = hydrateAuthSession();
    setUser(stored.user);
    setToken(stored.token);
    setIsHydrated(true);
  }, []);

  const setSession = useCallback((session: AuthSuccessData) => {
    persistAuthSession(session);
    setUser(session.user);
    setToken(session.token);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isHydrated,
      isAuthenticated: Boolean(user && token),
      setSession,
      logout,
    }),
    [isHydrated, logout, setSession, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
