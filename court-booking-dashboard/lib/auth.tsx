"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { login as apiLogin } from "./api/auth"

interface User {
  id: string
  phone: string
  name?: string
  role?: "manager" | "admin"
  avatar?: string
  lastLogin: Date
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (phone: string, password: string) => Promise<void>
  signOut: () => void
  resetPassword: (phone: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("auth-user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem("auth-user")
      }
    }
    setIsLoading(false)
  }, [])

  const signIn = async (phone: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Call backend login API
      const result = await apiLogin({ phone, password });
      // result: { access_token, user: { id, phone } }
      const userData: User = {
        id: result.user.id,
        //name: result.user.phone, // No name in response, use phone as placeholder
        phone: result.user.phone, // No email, use phone
        //role: "manager", // Default/fallback, adjust if backend provides role
        //avatar: "/placeholder.svg?height=40&width=40",
        lastLogin: new Date(),
        // @ts-ignore
        token: result.access_token,
      };
      setUser(userData);
      localStorage.setItem("auth-user", JSON.stringify(userData));
      localStorage.setItem("access_token", result.access_token);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error?.message || "Login failed");
    }
    setIsLoading(false);
  }

  const signOut = async () => {
    // Optionally call backend logout endpoint if available
    try {
      const token = user && (user as any).token;
      await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {
      // Ignore errors, always clear local session
    }
    setUser(null);
    localStorage.removeItem("auth-user");
    localStorage.removeItem("access_token");
  }

  const resetPassword = async (phone: string): Promise<void> => {
    // Replace with real API call if available
    await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    // Optionally handle response or errors
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
