// Users/Customers API functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface User {
  id: string
  name: string
  phoneNumber: string
  email?: string
  cnic?: string
  address?: string
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  phoneNumber: string
  email?: string
  cnic?: string
  address?: string
  password?: string
  role?: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
}

export interface UpdateUserDto {
  name?: string
  phoneNumber?: string
  email?: string
  cnic?: string
  address?: string
  isActive?: boolean
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

// Create a new user/customer
export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await makeAuthenticatedRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
  return response.json()
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await makeAuthenticatedRequest('/users')
  return response.json()
}

// Get user by ID
export const getUser = async (id: string): Promise<User> => {
  const response = await makeAuthenticatedRequest(`/users/${id}`)
  return response.json()
}

// Search users by name or phone
export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await makeAuthenticatedRequest(`/users/search?q=${encodeURIComponent(query)}`)
  return response.json()
}

// Get user by phone number
export const getUserByPhone = async (phoneNumber: string): Promise<User | null> => {
  try {
    const response = await makeAuthenticatedRequest(`/users/phone/${encodeURIComponent(phoneNumber)}`)
    return response.json()
  } catch (error) {
    // If user not found, return null instead of throwing
    if (error instanceof Error && error.message.includes('404')) {
      return null
    }
    throw error
  }
}

// Update user
export const updateUser = async (id: string, userData: UpdateUserDto): Promise<User> => {
  const response = await makeAuthenticatedRequest(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  })
  return response.json()
}

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  await makeAuthenticatedRequest(`/users/${id}`, {
    method: 'DELETE',
  })
}

// Get customers only (users with CUSTOMER role)
export const getCustomers = async (): Promise<User[]> => {
  const response = await makeAuthenticatedRequest('/users?role=CUSTOMER')
  return response.json()
}

// Search customers
export const searchCustomers = async (query: string): Promise<User[]> => {
  const response = await makeAuthenticatedRequest(`/users/search?q=${encodeURIComponent(query)}&role=CUSTOMER`)
  return response.json()
}

// Get customer by phone
export const getCustomerByPhone = async (phoneNumber: string): Promise<User | null> => {
  return getUserByPhone(phoneNumber)
}
