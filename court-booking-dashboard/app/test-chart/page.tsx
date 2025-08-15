"use client"

import { BookingsChart } from "@/components/bookings-chart"

export default function TestChartPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chart Test Page</h1>
      <div className="border border-gray-300 p-4">
        <h2 className="text-lg font-semibold mb-2">BookingsChart Component</h2>
        <BookingsChart />
      </div>
    </div>
  )
}