import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock toast provider
const MockToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="toast-provider">{children}</div>
}

// Mock toast hook
export const mockAddToast = vi.fn()

vi.mock('@/components/toast-provider', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
  ToastProvider: MockToastProvider,
}))

// Mock focus utils
vi.mock('@/lib/focus-utils', () => ({
  safeFocus: vi.fn(),
}))

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <MockToastProvider>{children}</MockToastProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockCourt = (overrides = {}) => ({
  id: 'court-1',
  name: 'Test Court',
  type: 'Tennis',
  pricePerHour: 1000,
  isActive: true,
  status: 'Active' as const,
  bookingsToday: 5,
  isAvailableNow: true,
  description: 'Test court description',
  image: '/test-image.jpg',
  operatingHours: { start: '08:00', end: '20:00' },
  availableDays: ['Monday', 'Tuesday', 'Wednesday'],
  slotDuration: 60,
  maxBookingsPerUserPerDay: 2,
  availability: [
    { dayOfWeek: 1, startTime: '08:00', endTime: '20:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '20:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '20:00' },
  ],
  ...overrides,
})

export const createMockCourtSettings = (overrides = {}) => ({
  advancedBookingLimit: 30,
  unavailabilities: [
    {
      id: 'unavail-1',
      courtId: 'court-1',
      date: '2025-02-15',
      startTime: '10:00',
      endTime: '12:00',
      reason: 'Maintenance',
      isRecurring: false,
    },
  ],
  peakSchedules: [
    {
      id: 'peak-1',
      courtId: 'court-1',
      dayOfWeek: 1,
      startTime: '18:00',
      endTime: '20:00',
      price: 1500,
    },
  ],
  ...overrides,
})

export const createMockUnavailability = (overrides = {}) => ({
  id: 'unavail-1',
  courtId: 'court-1',
  date: '2025-02-15',
  startTime: '10:00',
  endTime: '12:00',
  reason: 'Maintenance',
  isRecurring: false,
  ...overrides,
})

export const createMockPeakSchedule = (overrides = {}) => ({
  id: 'peak-1',
  courtId: 'court-1',
  dayOfWeek: 1,
  startTime: '18:00',
  endTime: '20:00',
  price: 1500,
  ...overrides,
})

// Mock API functions
export const mockApiCalls = {
  getCourtSettings: vi.fn(),
  updateAdvancedBookingLimit: vi.fn(),
  createCourtUnavailability: vi.fn(),
  updateCourtUnavailability: vi.fn(),
  deleteCourtUnavailability: vi.fn(),
  createCourtPeakSchedule: vi.fn(),
  updateCourtPeakSchedule: vi.fn(),
  deleteCourtPeakSchedule: vi.fn(),
}

// Reset all mocks
export const resetAllMocks = () => {
  Object.values(mockApiCalls).forEach(mock => mock.mockReset())
  mockAddToast.mockReset()
}