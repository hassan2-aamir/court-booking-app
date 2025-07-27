"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Tennis Courts", value: 45, color: "#3b82f6" },
  { name: "Badminton Courts", value: 30, color: "#10b981" },
  { name: "Basketball Courts", value: 15, color: "#f59e0b" },
  { name: "Squash Courts", value: 10, color: "#ef4444" },
]

export function CourtUtilizationChart() {
  return (
    <ChartContainer
      config={{
        tennis: {
          label: "Tennis Courts",
          color: "#3b82f6",
        },
        badminton: {
          label: "Badminton Courts",
          color: "#10b981",
        },
        basketball: {
          label: "Basketball Courts",
          color: "#f59e0b",
        },
        squash: {
          label: "Squash Courts",
          color: "#ef4444",
        },
      }}
      className="h-[300px]"
    >
      <div className="w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`${value}%`, "Utilization"]} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: "#374151" }}>{value}</span>}
        />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}
