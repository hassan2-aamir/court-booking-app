// Dashboard API functions for analytics data

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// TypeScript interfaces for dashboard data
export interface OverviewMetrics {
  totalBookingsThisMonth: number
  activeUsers: number
  revenueThisMonth: number
  todaysBookings: number
  completedTodaysBookings: number
  pendingTodaysBookings: number
}

export interface WeeklyBookingStats {
  weeklyData: Array<{
    day: string // Mon, Tue, Wed, etc.
    bookings: number
    date: string // YYYY-MM-DD
  }>
  weekStart: string
  weekEnd: string
}

export interface CourtUtilization {
  utilizationData: Array<{
    name: string // Court type name
    value: number // Utilization percentage
    color: string // Chart color
    totalHours: number // Total available hours
    bookedHours: number // Total booked hours
  }>
  calculationPeriod: string // e.g., "Last 30 days"
}

export interface TodaysBookingSummary {
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  noShowBookings: number
  totalRevenue: number
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.')
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired or invalid
      throw new Error('Authentication failed. Please log in again.')
    }
    if (response.status === 503) {
      throw new Error('Service temporarily unavailable. Please try again later.')
    }
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  return response
}

// Get overview metrics (total bookings, active users, revenue)
export const getOverviewMetrics = async (): Promise<OverviewMetrics> => {
  try {
    const response = await makeAuthenticatedRequest('/dashboard/overview')
    return response.json()
  } catch (error) {
    console.error('Failed to fetch overview metrics:', error)
    throw new Error('Unable to load overview metrics. Please try again.')
  }
}

// Get weekly booking statistics for chart data
export const getWeeklyBookingStats = async (): Promise<WeeklyBookingStats> => {
  try {
    const response = await makeAuthenticatedRequest('/dashboard/weekly-bookings')
    return response.json()
  } catch (error) {
    console.error('Failed to fetch weekly booking stats:', error)
    throw new Error('Unable to load weekly booking statistics. Please try again.')
  }
}

// Get court utilization statistics for pie chart data
export const getCourtUtilizationStats = async (): Promise<CourtUtilization> => {
  try {
    const response = await makeAuthenticatedRequest('/dashboard/court-utilization')
    return response.json()
  } catch (error) {
    console.error('Failed to fetch court utilization stats:', error)
    throw new Error('Unable to load court utilization statistics. Please try again.')
  }
}

// Get today's booking summary for today's metrics
export const getTodaysBookingSummary = async (): Promise<TodaysBookingSummary> => {
  try {
    const response = await makeAuthenticatedRequest('/dashboard/todays-summary')
    return response.json()
  } catch (error) {
    console.error('Failed to fetch today\'s booking summary:', error)
    throw new Error('Unable to load today\'s booking summary. Please try again.')
  }
}

// Utility function to handle API errors gracefully
export const handleDashboardError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Authentication failed')) {
      return 'Please log in to view dashboard data.'
    }
    if (error.message.includes('Service temporarily unavailable')) {
      return 'Dashboard service is temporarily unavailable. Please try again later.'
    }
    if (error.message.includes('Unable to load')) {
      return error.message
    }
    return 'An unexpected error occurred while loading dashboard data.'
  }
  return 'An unknown error occurred.'
}

// Utility function to check if data is stale (for caching purposes)
export const isDataStale = (timestamp: number, maxAgeMinutes: number = 5): boolean => {
  const now = Date.now()
  const maxAge = maxAgeMinutes * 60 * 1000 // Convert to milliseconds
  return (now - timestamp) > maxAge
}

// Utility function to cache dashboard data in localStorage
export const cacheDashboardData = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(`dashboard_${key}`, JSON.stringify(cacheEntry))
  }
}

// Utility function to get cached dashboard data
export const getCachedDashboardData = <T>(key: string): T | null => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`dashboard_${key}`)
    if (cached) {
      try {
        const cacheEntry = JSON.parse(cached)
        if (!isDataStale(cacheEntry.timestamp)) {
          return cacheEntry.data
        }
      } catch (error) {
        console.warn('Failed to parse cached dashboard data:', error)
      }
    }
  }
  return null
}

// Enhanced API functions with caching support
export const getOverviewMetricsWithCache = async (): Promise<OverviewMetrics> => {
  const cached = getCachedDashboardData<OverviewMetrics>('overview')
  if (cached) {
    return cached
  }
  
  const data = await getOverviewMetrics()
  cacheDashboardData('overview', data)
  return data
}

export const getWeeklyBookingStatsWithCache = async (): Promise<WeeklyBookingStats> => {
  const cached = getCachedDashboardData<WeeklyBookingStats>('weekly')
  if (cached) {
    return cached
  }
  
  const data = await getWeeklyBookingStats()
  cacheDashboardData('weekly', data)
  return data
}

export const getCourtUtilizationStatsWithCache = async (): Promise<CourtUtilization> => {
  const cached = getCachedDashboardData<CourtUtilization>('utilization')
  if (cached) {
    return cached
  }
  
  const data = await getCourtUtilizationStats()
  cacheDashboardData('utilization', data)
  return data
}

export const getTodaysBookingSummaryWithCache = async (): Promise<TodaysBookingSummary> => {
  const cached = getCachedDashboardData<TodaysBookingSummary>('todays_summary')
  if (cached) {
    return cached
  }
  
  const data = await getTodaysBookingSummary()
  cacheDashboardData('todays_summary', data)
  return data
}