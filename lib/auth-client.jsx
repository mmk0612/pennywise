"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  clearAllAuthTokens,
  getAccessToken,
  getRefreshTokenCookie,
  setAccessToken,
  setRefreshTokenCookie,
} from "@/lib/token-store";

const AuthContext = createContext(null);

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
}

function mapBackendUser(profile) {
  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.name,
    primaryEmailAddress: {
      emailAddress: profile.email,
    },
    raw: profile,
  };
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

async function request(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, options);
  return parseApiResponse(response);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSessionTokens = (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshTokenCookie(refreshToken);
  };

  const clearSession = () => {
    clearAllAuthTokens();
    setUser(null);
  };

  const fetchMe = async (accessToken) => {
    const profile = await request("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setUser(mapBackendUser(profile));
    return profile;
  };

  const refreshAccessToken = async (refreshToken) => {
    const refreshTokenValue = refreshToken || getRefreshTokenCookie();
    if (!refreshTokenValue) {
      throw new Error("Session expired. Please sign in again.");
    }

    const refreshed = await request("/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    setSessionTokens(refreshed.accessToken, refreshed.refreshToken);
    return refreshed.accessToken;
  };

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshTokenCookie();

      if (!accessToken && !refreshToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        if (accessToken) {
          await fetchMe(accessToken);
        } else {
          const newAccessToken = await refreshAccessToken(refreshToken);
          await fetchMe(newAccessToken);
        }
      } catch {
        if (!refreshToken) {
          clearSession();
          if (!cancelled) setIsLoading(false);
          return;
        }

        try {
          const newAccessToken = await refreshAccessToken(refreshToken);
          await fetchMe(newAccessToken);
        } catch {
          clearSession();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async ({ email, password }) => {
    const authData = await request("/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    setSessionTokens(authData.accessToken, authData.refreshToken);
    setUser(mapBackendUser(authData));
    return authData;
  };

  const signUp = async ({ name, email, password }) => {
    const authData = await request("/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    setSessionTokens(authData.accessToken, authData.refreshToken);
    setUser(mapBackendUser(authData));
    return authData;
  };

  const signOut = () => {
    clearSession();
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isSignedIn: Boolean(user),
      signIn,
      signUp,
      signOut,
      accessToken: getAccessToken(),
    }),
    [user, isLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function useUser() {
  const { user, isSignedIn, isLoading } = useAuth();

  return {
    user,
    isSignedIn,
    isLoaded: !isLoading,
  };
}

export function UserButton() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const initials = user.fullName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-white text-blue-700 font-semibold text-xs flex items-center justify-center">
        {initials || "U"}
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Logout
      </Button>
    </div>
  );
}

export function ClerkProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export function SignedIn({ children }) {
  const { isSignedIn, isLoading } = useAuth();
  if (isLoading || !isSignedIn) return null;
  return <>{children}</>;
}

export function SignedOut({ children }) {
  const { isSignedIn, isLoading } = useAuth();
  if (isLoading || isSignedIn) return null;
  return <>{children}</>;
}

export function SignInButton({ children }) {
  return <Link href="/sign-in">{children || "Sign In"}</Link>;
}
