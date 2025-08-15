"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getCourtUtilizationStats, handleDashboardError, type CourtUtilization } from "@/lib/api/dashboard"

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

// Error display component
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-center p-4">
      <div className="text-red-500 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

// Custom tooltip component with detailed information
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-blue-600">
          <span className="font-medium">Utilization: {data.value.toFixed(1)}%</span>
        </p>
        <p className="text-sm text-gray-600">
          Booked: {data.bookedHours}h / Available: {data.totalHours}h
        </p>
      </div>
    )
  }
  return null
}

export function CourtUtilizationChart() {
  const [data, setData] = useState<CourtUtilization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const utilizationData = await getCourtUtilizationStats()
      setData(utilizationData)
    } catch (err) {
      const errorMessage = handleDashboardError(err)
      setError(errorMessage)
      console.error('Failed to fetch court utilization data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Generate dynamic chart config based on actual data
  const generateChartConfig = (utilizationData: CourtUtilization['utilizationData']) => {
    const config: Record<string, { label: string; color: string }> = {}
    utilizationData.forEach((item, index) => {
      const key = item.name.toLowerCase().replace(/\s+/g, '_')
      config[key] = {
        label: item.name,
        color: item.color
      }
    })
    return config
  }

  if (loading) {
    return (
      <ChartContainer config={{}} className="h-[300px]">
        <LoadingSkeleton />
      </ChartContainer>
    )
  }

  if (error || !data) {
    return (
      <ChartContainer config={{}} className="h-[300px]">
        <ErrorDisplay
          message={error || "Unable to load court utilization data"}
          onRetry={fetchData}
        />
      </ChartContainer>
    )
  }

  // Handle case where there's no utilization data
  if (!data.utilizationData || data.utilizationData.length === 0) {
    return (
      <ChartContainer config={{}} className="h-[300px]">
        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No utilization data available</p>
            <p className="text-sm">Court utilization data will appear here once bookings are made.</p>
          </div>
        </div>
      </ChartContainer>
    )
  }

  const chartConfig = generateChartConfig(data.utilizationData)

  return (
    <ChartContainer config={chartConfig} className="h-[300px] aspect-auto">
      <div className="w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.utilizationData}
              cx="50%"
              cy="50%"
              innerRadius="0%"
              outerRadius="63%"
              paddingAngle={2}
              dataKey="value"
              labelLine={{
                stroke: '#94a3b8',
                strokeWidth: 1,
                strokeDasharray: '2,2'
              }}
              label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
                const RADIAN = Math.PI / 180;
                // Calculate responsive sizing based on container
                const containerWidth = cx * 2; // Approximate container width
                const containerHeight = cy * 2; // Approximate container height
                const minDimension = Math.min(containerWidth, containerHeight);

                // Adaptive label distance and font sizes
                const labelDistance = Math.max(20, Math.min(40, minDimension * 0.15));
                const radius = outerRadius + labelDistance;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                const isLeft = x < cx;

                // Responsive font sizes based on container size
                const baseFontSize = Math.max(10, Math.min(14, minDimension * 0.04));
                const nameFontSize = baseFontSize;
                const valueFontSize = baseFontSize - 1;

                // Ensure labels stay within bounds
                const maxX = containerWidth - 10;
                const minX = 10;
                const adjustedX = Math.max(minX, Math.min(maxX, x));

                return (
                  <g>
                    <text
                      x={adjustedX}
                      y={y}
                      fill="#374151"
                      textAnchor={isLeft ? 'end' : 'start'}
                      dominantBaseline="central"
                      fontSize={nameFontSize}
                      fontWeight="500"
                    >
                      {name}
                    </text>
                    <text
                      x={adjustedX}
                      y={y + (nameFontSize + 3)}
                      fill="#6b7280"
                      textAnchor={isLeft ? 'end' : 'start'}
                      dominantBaseline="central"
                      fontSize={valueFontSize}
                      fontWeight="400"
                    >
                      {value.toFixed(1)}%
                    </text>
                  </g>
                );
              }}
            >
              {data.utilizationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}
