import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CourtUtilizationChart } from '../court-utilization-chart'
import * as dashboardApi from '../../lib/api/dashboard'

// Mock the dashboard API
vi.mock('../../lib/api/dashboard', () => ({
  getCourtUtilizationStats: vi.fn(),
  handleDashboardError: vi.fn((error) => error.message || 'An error occurred'),
}))

const mockUtilizationData = {
  utilizationData: [
    {
      name: 'Tennis Courts',
      value: 75.5,
      color: '#3b82f6',
      totalHours: 240,
      bookedHours: 181
    },
    {
      name: 'Badminton Courts',
      value: 60.2,
      color: '#10b981',
      totalHours: 160,
      bookedHours: 96
    },
    {
      name: 'Basketball Courts',
      value: 45.8,
      color: '#f59e0b',
      totalHours: 120,
      bookedHours: 55
    }
  ],
  calculationPeriod: 'Last 30 days'
}

describe('CourtUtilizationChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(dashboardApi.getCourtUtilizationStats).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<CourtUtilizationChart />)
    
    // Check for loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders chart with real data successfully', async () => {
    vi.mocked(dashboardApi.getCourtUtilizationStats).mockResolvedValue(mockUtilizationData)

    render(<CourtUtilizationChart />)

    await waitFor(() => {
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    })

    // Verify the API was called
    expect(dashboardApi.getCourtUtilizationStats).toHaveBeenCalledTimes(1)
  })

  it('renders error state when API fails', async () => {
    const errorMessage = 'Failed to fetch data'
    vi.mocked(dashboardApi.getCourtUtilizationStats).mockRejectedValue(new Error(errorMessage))

    render(<CourtUtilizationChart />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    })

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('renders empty state when no data is available', async () => {
    vi.mocked(dashboardApi.getCourtUtilizationStats).mockResolvedValue({
      utilizationData: [],
      calculationPeriod: 'Last 30 days'
    })

    render(<CourtUtilizationChart />)

    await waitFor(() => {
      expect(screen.getByText('No utilization data available')).toBeInTheDocument()
    })

    expect(screen.getByText('Court utilization data will appear here once bookings are made.')).toBeInTheDocument()
  })

  it('handles retry functionality', async () => {
    vi.mocked(dashboardApi.getCourtUtilizationStats)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockUtilizationData)

    render(<CourtUtilizationChart />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Click retry button
    const retryButton = screen.getByText('Try Again')
    retryButton.click()

    // Wait for successful data load
    await waitFor(() => {
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    })

    expect(dashboardApi.getCourtUtilizationStats).toHaveBeenCalledTimes(2)
  })
})