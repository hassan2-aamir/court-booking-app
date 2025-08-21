
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { BookingsChart } from "./bookings-chart"
import { CourtUtilizationChart } from "./court-utilization-chart"
import { 
  getOverviewMetricsWithCache, 
  getTodaysBookingSummaryWithCache,
  handleDashboardError,
  type OverviewMetrics,
  type TodaysBookingSummary
} from "../lib/api/dashboard"

// Loading skeleton component for metric cards
const MetricCardSkeleton: React.FC = () => (
  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
    <CardHeader>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
    </CardContent>
  </Card>
)

// Error display component for metric cards
const MetricCardError: React.FC<{ title: string; error: string }> = ({ title, error }) => (
  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
    </CardContent>
  </Card>
)

const DashboardContent: React.FC = () => {
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null)
  const [todaysBookingSummary, setTodaysBookingSummary] = useState<TodaysBookingSummary | null>(null)
  const [isLoadingOverview, setIsLoadingOverview] = useState(true)
  const [isLoadingTodays, setIsLoadingTodays] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [todaysError, setTodaysError] = useState<string | null>(null)

  // Fetch overview metrics
  useEffect(() => {
    const fetchOverviewMetrics = async () => {
      try {
        setIsLoadingOverview(true)
        setOverviewError(null)
        const data = await getOverviewMetricsWithCache()
        setOverviewMetrics(data)
      } catch (error) {
        const errorMessage = handleDashboardError(error)
        setOverviewError(errorMessage)
        console.error('Failed to fetch overview metrics:', error)
      } finally {
        setIsLoadingOverview(false)
      }
    }

    fetchOverviewMetrics()
  }, [])

  // Fetch today's booking summary
  useEffect(() => {
    const fetchTodaysBookingSummary = async () => {
      try {
        setIsLoadingTodays(true)
        setTodaysError(null)
        const data = await getTodaysBookingSummaryWithCache()
        setTodaysBookingSummary(data)
      } catch (error) {
        const errorMessage = handleDashboardError(error)
        setTodaysError(errorMessage)
        console.error('Failed to fetch today\'s booking summary:', error)
      } finally {
        setIsLoadingTodays(false)
      }
    }

    fetchTodaysBookingSummary()
  }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {/* Add any additional header elements here */}
      </div>

      {/* Overview Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoadingOverview ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : overviewError ? (
          <>
            <MetricCardError title="Total Bookings" error={overviewError} />
            <MetricCardError title="Revenue" error={overviewError} />
          </>
        ) : overviewMetrics ? (
          <>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {overviewMetrics.totalBookingsThisMonth.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
              </CardContent>
            </Card>

            {/* <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {overviewMetrics.activeUsers.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Currently active</p>
              </CardContent>
            </Card> */}

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  PKR {overviewMetrics.revenueThisMonth.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <MetricCardError title="Total Bookings" error="Data unavailable" />
            <MetricCardError title="Revenue" error="Data unavailable" />
          </>
        )}
      </div>

      {/* Today's Booking Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingTodays ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : todaysError ? (
          <>
            <MetricCardError title="Today's Bookings" error={todaysError} />
            <MetricCardError title="Completed" error={todaysError} />
            <MetricCardError title="Pending" error={todaysError} />
            <MetricCardError title="Today's Revenue" error={todaysError} />
          </>
        ) : todaysBookingSummary ? (
          <>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {todaysBookingSummary.totalBookings.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total scheduled</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {todaysBookingSummary.completedBookings.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Finished sessions</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {todaysBookingSummary.pendingBookings.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining today</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  PKR {todaysBookingSummary.totalRevenue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generated today</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <MetricCardError title="Today's Bookings" error="Data unavailable" />
            <MetricCardError title="Completed" error="Data unavailable" />
            <MetricCardError title="Pending" error="Data unavailable" />
            <MetricCardError title="Today's Revenue" error="Data unavailable" />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bookings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsChart />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Court Utilization
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">Last 30 days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CourtUtilizationChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export { DashboardContent };
