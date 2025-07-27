"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "manager" | "admin"
  avatar?: string
  lastLogin: Date
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers = [
  {
    id: "1",
    email: "manager@courtbooking.com",
    password: "manager123",
    name: "Ahmed Khan",
    role: "manager" as const,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    email: "admin@courtbooking.com",
    password: "admin123",
    name: "Sara Ahmed",
    role: "admin" as const,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

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

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (!mockUser) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    const userData: User = {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      avatar: mockUser.avatar,
      lastLogin: new Date(),
    }

    setUser(userData)
    localStorage.setItem("auth-user", JSON.stringify(userData))
    setIsLoading(false)
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
  }

  const resetPassword = async (email: string): Promise<void> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userExists = mockUsers.some((u) => u.email === email)
    if (!userExists) {
      throw new Error("Email not found")
    }

    // In real app, this would send reset email
    console.log(`Password reset link sent to ${email}`)
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
