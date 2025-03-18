"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  agentId?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => false,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    checkAuth().catch(console.error);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/agent/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      setUser(data.agent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      await fetch("/api/agent/logout", {
        method: "POST",
      });

      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check auth status
  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch("/api/agent/me");

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          setUser(null);
          return false;
        }
        throw new Error("Failed to check authentication");
      }

      const data = await response.json();

      // Check if data.user exists (it should if using the me endpoint)
      if (data.authenticated && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name || data.user.email,
          email: data.user.email,
          role: data.user.role,
          agentId: data.user.agentId,
        });
        return true;
      } else if (data.agent) {
        // Fallback for backward compatibility
        setUser(data.agent);
        return true;
      }

      // Not authenticated
      setUser(null);
      return false;
    } catch (err) {
      console.error("Auth check error:", err);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
