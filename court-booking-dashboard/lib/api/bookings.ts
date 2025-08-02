// Bookings API functions for managing court bookings

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface User {
  id: string
  name: string
  phoneNumber: string
  email?: string
  cnic?: string
  address?: string
}

export interface Court {
  id: string
  name: string
  type: string
  description?: string
  pricePerHour: number
  imageUrl?: string
}

export interface Booking {
  id: string
  bookingId: string
  userId: string
  courtId: string
  date: string | Date
  startTime: string
  endTime: string
  duration: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  totalPrice: number
  notes?: string
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  createdAt: string
  updatedAt: string
  user?: User
  court?: Court
}

export interface CreateBookingDto {
  bookingId: string
  userId: string
  courtId: string
  date: string // YYYY-MM-DD format
  startTime: string
  endTime: string
  duration: number
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  totalPrice: number
  notes?: string
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED'
}

export interface UpdateBookingDto {
  bookingId?: string
  userId?: string
  courtId?: string
  date?: Date | string
  startTime?: string
  endTime?: string
  duration?: number
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  totalPrice?: number
  notes?: string
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED'
}

export interface BookingsQueryParams {
  userId?: string
  courtId?: string
  startDate?: string
  endDate?: string
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
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  return response
}

// Create a new booking
export const createBooking = async (bookingData: CreateBookingDto): Promise<Booking> => {
  const response = await makeAuthenticatedRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  })
  return response.json()
}

// Get all bookings with optional filters
export const getBookings = async (params?: BookingsQueryParams): Promise<Booking[]> => {
  const queryParams = new URLSearchParams()
  
  if (params?.userId) queryParams.append('userId', params.userId)
  if (params?.courtId) queryParams.append('courtId', params.courtId)
  if (params?.startDate) queryParams.append('startDate', params.startDate)
  if (params?.endDate) queryParams.append('endDate', params.endDate)
  
  const queryString = queryParams.toString()
  const url = queryString ? `/bookings?${queryString}` : '/bookings'
  
  const response = await makeAuthenticatedRequest(url)
  return response.json()
}

// Get today's bookings
export const getTodaysBookings = async (): Promise<Booking[]> => {
  const response = await makeAuthenticatedRequest('/bookings/today')
  return response.json()
}

// Get booking by ID
export const getBooking = async (id: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}`)
  return response.json()
}

// Get booking by booking ID
export const getBookingByBookingId = async (bookingId: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/booking/${bookingId}`)
  return response.json()
}

// Get bookings by user ID
export const getBookingsByUserId = async (userId: string): Promise<Booking[]> => {
  const response = await makeAuthenticatedRequest(`/bookings?userId=${userId}`)
  return response.json()
}

// Get bookings by court ID
export const getBookingsByCourtId = async (courtId: string): Promise<Booking[]> => {
  const response = await makeAuthenticatedRequest(`/bookings?courtId=${courtId}`)
  return response.json()
}

// Get bookings by date range
export const getBookingsByDateRange = async (startDate: string, endDate: string): Promise<Booking[]> => {
  const response = await makeAuthenticatedRequest(`/bookings?startDate=${startDate}&endDate=${endDate}`)
  return response.json()
}

// Update booking
export const updateBooking = async (id: string, bookingData: UpdateBookingDto): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bookingData),
  })
  return response.json()
}

// Update booking status
export const updateBookingStatus = async (
  id: string, 
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return response.json()
}

// Update payment status
export const updatePaymentStatus = async (
  id: string, 
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}/payment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentStatus }),
  })
  return response.json()
}

// Cancel booking
export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
  })
  return response.json()
}

// Confirm booking
export const confirmBooking = async (id: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}/confirm`, {
    method: 'PATCH',
  })
  return response.json()
}

// Complete booking
export const completeBooking = async (id: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}/complete`, {
    method: 'PATCH',
  })
  return response.json()
}

// Mark booking as no-show
export const markBookingNoShow = async (id: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}/no-show`, {
    method: 'PATCH',
  })
  return response.json()
}

// Delete booking
export const deleteBooking = async (id: string): Promise<Booking> => {
  const response = await makeAuthenticatedRequest(`/bookings/${id}`, {
    method: 'DELETE',
  })
  return response.json()
}

// Utility functions for booking status
export const getBookingStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    case 'NO_SHOW':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'PAID':
      return 'bg-green-100 text-green-800'
    case 'REFUNDED':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Helper function to format booking time
export const formatBookingTime = (startTime: string, endTime: string) => {
  return `${startTime} - ${endTime}`
}

// Helper function to format booking date
export const formatBookingDate = (date: string | Date) => {
  const bookingDate = typeof date === 'string' ? new Date(date) : date
  return bookingDate.toLocaleDateString()
}

// Helper function to calculate booking duration in hours
export const getBookingDurationHours = (duration: number) => {
  return Math.round(duration / 60 * 100) / 100 // Convert minutes to hours with 2 decimal places
}

// Helper function to generate unique booking ID
export const generateBookingId = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BK${timestamp.slice(-6)}${random}`
}
