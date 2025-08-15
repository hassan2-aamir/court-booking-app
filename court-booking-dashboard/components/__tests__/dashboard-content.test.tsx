import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { DashboardContent } from '../dashboard-content'

// Mock the dashboard API
vi.mock('../../lib/api/dashboard', () => ({
  getOverviewMetricsWithCache: vi.fn(),
  getTodaysBookingSummaryWithCache: vi.fn(),
  handleDashboardError: vi.fn((error) => 'Mocked error message'),
}))

// Mock the chart components
vi.mock('../bookings-chart', () => ({
  BookingsChart: () => <div data-testid="bookings-chart">Bookings Chart</div>
}))

vi.mock('../court-utilization-chart', () => ({
  CourtUtilizationChart: () => <div data-testid="court-utilization-chart">Court Utilization Chart</div>
}))

import { getOverviewMetricsWithCache, getTodaysBookingSummaryWithCache } from '../../lib/api/dashboard'

const mockGetOverviewMetrics = vi.mocked(getOverviewMetricsWithCache)
const mockGetTodaysBookingSummary = vi.mocked(getTodaysBookingSummaryWithCache)

describe('DashboardContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeletons initially', () => {
    mockGetOverviewMetrics.mockImplementation(() => new Promise(() => {})) // Never resolves
    mockGetTodaysBookingSummary.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<DashboardContent />)

    // Should show loading skeletons - check for specific skeleton elements
    const skeletonElements = screen.getAllByRole('generic').filter(el => 
      el.className.includes('animate-pulse')
    )
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders overview metrics when data loads successfully', async () => {
    const mockOverviewData = {
      totalBookingsThisMonth: 125,
      activeUsers: 87,
      revenueThisMonth: 1250,
      todaysBookings: 15,
      completedTodaysBookings: 8,
      pendingTodaysBookings: 7
    }

    const mockTodaysData = {
      totalBookings: 15,
      completedBookings: 8,
      pendingBookings: 7,
      confirmedBookings: 12,
      cancelledBookings: 1,
      noShowBookings: 2,
      totalRevenue: 450
    }

    mockGetOverviewMetrics.mockResolvedValue(mockOverviewData)
    mockGetTodaysBookingSummary.mockResolvedValue(mockTodaysData)

    render(<DashboardContent />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('125')).toBeInTheDocument()
      expect(screen.getByText('87')).toBeInTheDocument()
      expect(screen.getByText('$1,250')).toBeInTheDocument()
    })

    // Check today's booking summary
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument() // Total bookings
      expect(screen.getByText('8')).toBeInTheDocument() // Completed
      expect(screen.getByText('7')).toBeInTheDocument() // Pending
      expect(screen.getByText('$450')).toBeInTheDocument() // Today's revenue
    })
  })

  it('renders error messages when API calls fail', async () => {
    mockGetOverviewMetrics.mockRejectedValue(new Error('API Error'))
    mockGetTodaysBookingSummary.mockRejectedValue(new Error('API Error'))

    render(<DashboardContent />)

    // Wait for error states - should have 7 error messages (3 overview + 4 today's)
    await waitFor(() => {
      expect(screen.getAllByText('Mocked error message')).toHaveLength(7)
    })
  })

  it('renders chart components', () => {
    mockGetOverviewMetrics.mockResolvedValue({
      totalBookingsThisMonth: 0,
      activeUsers: 0,
      revenueThisMonth: 0,
      todaysBookings: 0,
      completedTodaysBookings: 0,
      pendingTodaysBookings: 0
    })
    mockGetTodaysBookingSummary.mockResolvedValue({
      totalBookings: 0,
      completedBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      totalRevenue: 0
    })

    render(<DashboardContent />)

    expect(screen.getByTestId('bookings-chart')).toBeInTheDocument()
    expect(screen.getByTestId('court-utilization-chart')).toBeInTheDocument()
  })

  it('displays proper section titles', async () => {
    mockGetOverviewMetrics.mockResolvedValue({
      totalBookingsThisMonth: 0,
      activeUsers: 0,
      revenueThisMonth: 0,
      todaysBookings: 0,
      completedTodaysBookings: 0,
      pendingTodaysBookings: 0
    })
    mockGetTodaysBookingSummary.mockResolvedValue({
      totalBookings: 0,
      completedBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      totalRevenue: 0
    })

    render(<DashboardContent />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    
    // Wait for data to load and titles to appear
    await waitFor(() => {
      expect(screen.getByText('Total Bookings')).toBeInTheDocument()
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Bookings Overview')).toBeInTheDocument()
    expect(screen.getByText('Court Utilization')).toBeInTheDocument()
  })
})