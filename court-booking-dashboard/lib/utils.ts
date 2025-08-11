import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  // Format Pakistani phone numbers
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+92 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

export function validatePakistaniPhone(phone: string): boolean {
  const phoneRegex = /^(\+92|0)?3[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function validateCNIC(cnic: string): boolean {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/
  return cnicRegex.test(cnic)
}

/**
 * Format a Date object as YYYY-MM-DD string without timezone issues
 * This function uses local date components to avoid timezone conversion problems
 * that can occur with toISOString().split('T')[0]
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
