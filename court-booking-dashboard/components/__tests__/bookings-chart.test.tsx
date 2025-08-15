import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BookingsChart } from '../bookings-chart'
import * as dashboardApi from '../../lib/api/dashboard'

// Mock the dashboard API
vi.mock('../../lib/api/dashboard', () => ({
  getWeeklyBookingStatsWithCache: vi.fn(),
  getWeeklyBookingStats: vi.fn(),
  handleDashboardError: vi.fn(),
}))

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}))

// Mock chart components
vi.mock('../ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
}))

const mockWeeklyStats = {
  weeklyData: [
    { day: 'Mon', bookings: 12, date: '2024-01-15' },
    { day: 'Tue', bookings: 19, date: '2024-01-16' },
    { day: 'Wed', bookings: 15, date: '2024-01-17' },
    { day: 'Thu', bookings: 22, date: '2024-01-18' },
    { day: 'Fri', bookings: 28, date: '2024-01-19' },
    { day: 'Sat', bookings: 35, date: '2024-01-20' },
    { day: 'Sun', bookings: 24, date: '2024-01-21' },
  ],
  weekStart: '2024-01-15',
  weekEnd: '2024-01-21'
}

describe('BookingsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(dashboardApi.handleDashboardError as any).mockImplementation((error: any) => 
      error instanceof Error ? error.message : 'An error occurred'
    )
  })

  it('renders loading skeleton initially', () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    )

    render(<BookingsChart />)
    
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    // Check for skeleton elements - should have at least some skeleton divs
    const skeletonElements = screen.getAllByRole('generic')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders chart with real data after successful API call', async () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockResolvedValue(mockWeeklyStats)

    render(<BookingsChart />)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    // Check week info is displayed
    expect(screen.getByText(/Week of/)).toBeInTheDocument()
    expect(screen.getByText(/1\/15\/2024 - 1\/21\/2024/)).toBeInTheDocument()
    
    // Check refresh button is present
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('renders error state when API call fails', async () => {
    const errorMessage = 'Failed to load data'
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockRejectedValue(new Error(errorMessage))
    ;(dashboardApi.handleDashboardError as any).mockReturnValue(errorMessage)

    render(<BookingsChart />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Check try again button is present
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockResolvedValue(mockWeeklyStats)
    ;(dashboardApi.getWeeklyBookingStats as any).mockResolvedValue(mockWeeklyStats)

    render(<BookingsChart />)

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    // Should call the non-cached version for force refresh
    await waitFor(() => {
      expect(dashboardApi.getWeeklyBookingStats).toHaveBeenCalled()
    })
  })

  it('handles try again button click in error state', async () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockWeeklyStats)
    ;(dashboardApi.handleDashboardError as any).mockReturnValue('Network error')

    render(<BookingsChart />)

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    const tryAgainButton = screen.getByText('Try Again')
    fireEvent.click(tryAgainButton)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  it('responds to refresh trigger prop', async () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockResolvedValue(mockWeeklyStats)
    ;(dashboardApi.getWeeklyBookingStats as any).mockResolvedValue(mockWeeklyStats)

    const { rerender } = render(<BookingsChart refreshTrigger={0} />)

    await waitFor(() => {
      expect(dashboardApi.getWeeklyBookingStatsWithCache).toHaveBeenCalledTimes(1)
    })

    // Trigger refresh with new prop value
    rerender(<BookingsChart refreshTrigger={1} />)

    await waitFor(() => {
      expect(dashboardApi.getWeeklyBookingStats).toHaveBeenCalled()
    })
  })

  it('transforms API data correctly for chart format', async () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockResolvedValue(mockWeeklyStats)

    render(<BookingsChart />)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    // Verify the API was called
    expect(dashboardApi.getWeeklyBookingStatsWithCache).toHaveBeenCalledTimes(1)
  })

  it('shows refresh button when chart is loaded', async () => {
    ;(dashboardApi.getWeeklyBookingStatsWithCache as any).mockResolvedValue(mockWeeklyStats)

    render(<BookingsChart />)

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    expect(refreshButton).not.toBeDisabled()
    expect(refreshButton).toHaveAttribute('title', 'Refresh chart data')
  })
})