"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { getWeeklyBookingStatsWithCache, WeeklyBookingStats, handleDashboardError } from "@/lib/api/dashboard"

interface ChartData {
  day: string
  bookings: number
  date: string
}

interface BookingsChartProps {
  refreshTrigger?: number // Optional prop to trigger refresh from parent
}

export function BookingsChart({ refreshTrigger }: BookingsChartProps = {}) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekInfo, setWeekInfo] = useState<{ start: string; end: string } | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchWeeklyData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // If force refresh, bypass cache by calling the non-cached version
      const weeklyStats: WeeklyBookingStats = forceRefresh
        ? await (await import("@/lib/api/dashboard")).getWeeklyBookingStats()
        : await getWeeklyBookingStatsWithCache()

      // Transform API data to chart format
      const chartData: ChartData[] = (weeklyStats.weeklyData || []).map(item => ({
        day: item.day,
        bookings: Number(item.bookings) || 0,
        date: item.date
      }))



      setData(chartData)
      setWeekInfo({
        start: weeklyStats.weekStart,
        end: weeklyStats.weekEnd
      })
      setLastRefresh(new Date())
    } catch (err) {
      const errorMessage = handleDashboardError(err)
      setError(errorMessage)
      console.error('Failed to fetch weekly booking stats:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchWeeklyData()
  }, [])

  // Handle refresh trigger from parent component
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchWeeklyData(true)
    }
  }, [refreshTrigger])

  // Auto-refresh when week changes (check every hour)
  useEffect(() => {
    const checkForWeekChange = () => {
      const now = new Date()
      const timeSinceLastRefresh = now.getTime() - lastRefresh.getTime()
      const oneHour = 60 * 60 * 1000

      // If it's been more than an hour and we're in a new week, refresh
      if (timeSinceLastRefresh > oneHour) {
        const currentWeekStart = new Date(now)
        currentWeekStart.setDate(now.getDate() - now.getDay()) // Start of current week

        if (weekInfo) {
          const storedWeekStart = new Date(weekInfo.start)
          if (currentWeekStart.getTime() !== storedWeekStart.getTime()) {
            fetchWeeklyData(true)
          }
        }
      }
    }

    const interval = setInterval(checkForWeekChange, 60 * 60 * 1000) // Check every hour
    return () => clearInterval(interval)
  }, [lastRefresh, weekInfo])

  // Loading skeleton
  if (loading) {
    return (
      <ChartContainer
        config={{
          bookings: {
            label: "Bookings",
            color: "hsl(217, 91%, 60%)",
          },
        }}
        className="h-[300px] aspect-auto"
      >
        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
          <div className="w-full space-y-4">
            <Skeleton className="h-4 w-32 mx-auto" />
            <div className="flex justify-between items-end h-48 px-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className={`w-8 bg-blue-200/50`} style={{ height: `${Math.random() * 120 + 40}px` }} />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ChartContainer>
    )
  }

  // Error state
  if (error) {
    return (
      <ChartContainer
        config={{
          bookings: {
            label: "Bookings",
            color: "hsl(217, 91%, 60%)",
          },
        }}
        className="h-[300px] aspect-auto"
      >
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-center p-4">
          <div className="text-muted-foreground mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchWeeklyData()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </ChartContainer>
    )
  }

  // Chart with real data
  return (
    <ChartContainer
      config={{
        bookings: {
          label: "Bookings",
          color: "hsl(217, 91%, 60%)",
        },
      }}
      className="h-[300px] aspect-auto"
    >
      <div className="w-full h-full min-h-[200px]">
        {/* Header with week info and refresh button */}
        <div className="flex justify-between items-center mb-2">
          {weekInfo ? (
            <div className="text-xs text-muted-foreground">
              Week of {new Date(weekInfo.start).toLocaleDateString()} - {new Date(weekInfo.end).toLocaleDateString()}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Current Week</div>
          )}
          <button
            onClick={() => fetchWeeklyData(true)}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
            title="Refresh chart data"
          >
            <svg
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>



        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>No chart data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                domain={[0, (dataMax: number) => Math.max(dataMax + 1, 5)]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [
                  `${value} `,
                  'Bookings'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    const date = payload[0].payload.date
                    return `${label} (${new Date(date).toLocaleDateString()})`
                  }
                  return label
                }}
              />
              <Bar
                dataKey="bookings"
                fill="var(--color-bookings)"
                radius={[4, 4, 0, 0]}
                minPointSize={5}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartContainer>
  )
}
