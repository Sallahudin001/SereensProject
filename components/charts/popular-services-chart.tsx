"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { getProductTypeName, themeGradients } from "@/lib/chart-utils"

interface PopularServicesProps {
  data: Array<{
    product_type: string
    count: number
  }>
}

export function PopularServicesChart({ data }: PopularServicesProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: getProductTypeName(item.product_type),
    count: item.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 10,
        }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={themeGradients.info[0]} stopOpacity={0.8} />
            <stop offset="100%" stopColor={themeGradients.info[1]} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
        <XAxis type="number" tick={{ fontSize: 12 }} tickMargin={10} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
        <Tooltip
          formatter={(value: number | string) => [`${value} Proposals`, "Count"]}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />
        <Bar 
          dataKey="count" 
          fill="url(#barGradient)" 
          animationDuration={1000} 
          radius={[0, 4, 4, 0]}
        >
          <LabelList dataKey="count" position="right" fill="#333" fontSize={12} fontWeight="medium" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
} 