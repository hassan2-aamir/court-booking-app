"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, EyeOff, Mail, Lock, CheckCircle, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignInPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetPhone, setResetPhone] = useState("")
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({})

  const { signIn, resetPassword } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {}

    // Pakistani phone number validation: starts with +923, 11 digits
                if (!phone) {
                  newErrors.phone = "Phone number is required"
                } else if (!/^\+923\d{9}$/.test(phone)) {
                  newErrors.phone = "Enter a valid Pakistani phone number (e.g. +923XXXXXXXXX)"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await signIn(phone, password)
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
        type: "success",
        onClose: () => {},
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Invalid phone number or password. Please try again.",
        type: "error",
        onClose: () => {},
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetPhone || !/^\+923\d{9}$/.test(resetPhone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Pakistani phone number (e.g. +923XXXXXXXXX).",
        type: "error",
        onClose: () => {},
      })
      return
    }

    setIsResetLoading(true)

    try {
      await resetPassword(resetPhone)
      setResetSuccess(true)
      toast({
        title: "Reset link sent!",
        description: "Check your SMS for password reset instructions.",
        type: "success",
        onClose: () => {},
      })
    } catch (error) {
      toast({
        title: "Phone not found",
        description: "No account found with this phone number.",
        type: "error",
        onClose: () => {},
      })
    } finally {
      setIsResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Court Booking Manager</h1>
            <p className="text-xl text-blue-100">Professional Court Management System</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-lg">Automated WhatsApp Booking</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-lg">Real-time Court Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-lg">Revenue Analytics Dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-lg">Customer Management System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Court Booking Manager</h1>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>Manager: manager@courtbooking.com / manager123</div>
              <div>Admin: admin@courtbooking.com / admin123</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                Phone Number
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors({ ...errors, phone: undefined })
                  }}
                  placeholder="+923XXXXXXXXX"
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  pattern="^\+923[0-9]{9}$"
                  maxLength={13}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </Label>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Forgot password?
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">Reset Password</DialogTitle>
                  </DialogHeader>
                  {resetSuccess ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Reset link sent!</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Check your SMS for password reset instructions.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter your Pakistani phone number and we'll send you a link to reset your password.
                      </p>
                      <div>
                        <Label htmlFor="resetPhone" className="text-gray-700 dark:text-gray-300">
                          Phone Number
                        </Label>
                        <Input
                          id="resetPhone"
                          type="tel"
                          value={resetPhone}
                          onChange={(e) => setResetPhone(e.target.value)}
                          placeholder="+923XXXXXXXXX"
                          className="mt-1"
                  pattern="^\+923[0-9]{9}$"
                          maxLength={13}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button type="submit" disabled={isResetLoading} className="flex-1">
                          {isResetLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
