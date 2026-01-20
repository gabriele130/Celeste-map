import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { SessionInfo, UserMe, CustomerMe } from "@shared/schema";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserMe | null;
  customer: CustomerMe | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserMe | null>(null);
  const [customer, setCustomer] = useState<CustomerMe | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.ok) {
        const data: SessionInfo = await res.json();
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user || null);
        setCustomer(data.customer || null);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCustomer(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async () => {
    await refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setCustomer(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, customer, login, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
