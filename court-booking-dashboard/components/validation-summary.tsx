"use client"

import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ValidationSummaryProps {
  errors: Record<string, string>
  warnings?: Record<string, string>
  className?: string
}

export function ValidationSummary({ errors, warnings = {}, className = "" }: ValidationSummaryProps) {
  const errorCount = Object.keys(errors).length
  const warningCount = Object.keys(warnings).length
  
  if (errorCount === 0 && warningCount === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {errorCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">
              {errorCount === 1 ? "1 error found:" : `${errorCount} errors found:`}
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {warningCount > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">
              {warningCount === 1 ? "1 warning:" : `${warningCount} warnings:`}
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(warnings).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface FormSuccessMessageProps {
  message: string
  className?: string
}

export function FormSuccessMessage({ message, className = "" }: FormSuccessMessageProps) {
  return (
    <Alert className={`border-green-200 bg-green-50 text-green-800 ${className}`}>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}