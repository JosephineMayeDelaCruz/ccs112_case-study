import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("wb:session-expired", expired);
    return () => window.removeEventListener("wb:session-expired", expired);
  }, []);

  // On first load, if a token is already saved (from a previous login),
  // ask the backend who that token belongs to instead of forcing a re-login.
  useEffect(() => {
    const token = localStorage.getItem("wb_token");
    if (!token) {
      setCheckingSession(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem("wb_token"))
      .finally(() => setCheckingSession(false));
  }, []);

  const login = useCallback(async (role, email, password) => {
    const loggedInUser = await api.login(role, email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } finally { setUser(null); }
  }, []);

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, login, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
