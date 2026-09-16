"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiBaseUrl, apiRequest, setCsrfToken, setAccessToken } from "@/lib/apiClient";
export type UserRole = "customer" | "vendor" | "mechanic" | "admin" | null;

export class AuthError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  verificationLevel: "basic" | "individual" | "business";
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: Exclude<UserRole, null>;
    companyName?: string;
    garageName?: string;
  }) => Promise<void>;
  adminRegister: (input: {
    name: string;
    email: string;
    password: string;
    activationCode: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleAuthUrl: (params?: { role?: Exclude<UserRole, null>; returnTo?: string }) => string;
  setupMfa: () => Promise<{ secret: string; qrCodeUrl: string }>;
  verifyMfa: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiRequest<{ user: User; csrfToken?: string; accessToken?: string }>("/api/v1/auth/me", {
        method: "GET",
      });
      if (cancelled) return;
      if (res.success) {
        if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
        if (res.data.accessToken) setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      } else {
        setAccessToken(undefined);
        setUser(null);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ user: User; csrfToken: string; accessToken: string }>(
      "/api/v1/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      { retryOn401: false },
    );
    if (!res.success) {
      throw new AuthError(res.error.code, res.error.message);
    }
    if (res.data.csrfToken) setCsrfToken(res.data.csrfToken);
    if (res.data.accessToken) setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (input: {
    name: string;
    email: string;
    password: string;
    role: Exclude<UserRole, null>;
  }) => {
    const res = await apiRequest<{ user: User }>(
      "/api/v1/auth/register",
      { method: "POST", body: JSON.stringify(input) },
      { retryOn401: false },
    );
    if (!res.success) {
      throw new AuthError(res.error.code, res.error.message);
    }
  };

  const adminRegister = async (input: {
    name: string;
    email: string;
    password: string;
    activationCode: string;
  }) => {
    const res = await apiRequest<{ user: User }>(
      "/api/v1/auth/admin-register",
      { method: "POST", body: JSON.stringify(input) },
      { retryOn401: false },
    );
    if (!res.success) {
      throw new AuthError(res.error.code, res.error.message);
    }
  };

  const logout = async () => {
    await apiRequest<{ ok: boolean }>("/api/v1/auth/logout", {
      method: "POST",
    });
    setAccessToken(undefined);
    setUser(null);
  };

  const resendVerification = async (email: string) => {
    const res = await apiRequest<{ ok: boolean }>(
      "/api/v1/auth/email/resend",
      { method: "POST", body: JSON.stringify({ email }) },
      { retryOn401: false },
    );
    if (!res.success) throw new AuthError(res.error.code, res.error.message);
  };

  const forgotPassword = async (email: string) => {
    const res = await apiRequest<{ ok: boolean }>(
      "/api/v1/auth/password/forgot",
      { method: "POST", body: JSON.stringify({ email }) },
      { retryOn401: false },
    );
    if (!res.success) throw new AuthError(res.error.code, res.error.message);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await apiRequest<{ ok: boolean }>(
      "/api/v1/auth/password/reset",
      { method: "POST", body: JSON.stringify({ token, newPassword }) },
      { retryOn401: false },
    );
    if (!res.success) throw new AuthError(res.error.code, res.error.message);
  };

  const googleAuthUrl = useMemo(() => {
    return (params?: { role?: Exclude<UserRole, null>; returnTo?: string }) => {
      const url = new URL(`${apiBaseUrl()}/api/v1/auth/google`);
      if (params?.role) url.searchParams.set("role", params.role);
      if (params?.returnTo) url.searchParams.set("returnTo", params.returnTo);
      return url.toString();
    };
  }, []);

  const setupMfa = async () => {
    const res = await apiRequest<{ secret: string; qrCodeUrl: string }>("/api/v1/auth/mfa/setup", {
      method: "POST",
    });
    if (!res.success) throw new AuthError(res.error.code, res.error.message);
    return res.data;
  };

  const verifyMfa = async (token: string) => {
    const res = await apiRequest<{ ok: boolean }>("/api/v1/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (!res.success) throw new AuthError(res.error.code, res.error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        adminRegister,
        logout,
        resendVerification,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
        isLoading,
        googleAuthUrl,
        setupMfa,
        verifyMfa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
