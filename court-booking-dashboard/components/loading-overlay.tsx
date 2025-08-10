"use client"

import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  message = "Loading...", 
  className = "" 
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={`absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

interface InlineLoadingProps {
  isLoading: boolean
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function InlineLoading({ 
  isLoading, 
  message = "Loading...", 
  size = "md",
  className = "" 
}: InlineLoadingProps) {
  if (!isLoading) return null

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
      <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  )
}