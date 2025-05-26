"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { formatCurrency, formatDate, themeGradients } from "@/lib/chart-utils"

// Custom dot component with rounded look
const CustomDot = (props: any) => {
  const { cx, cy, stroke } = props;
  
  // Return null if cx or cy is not a valid number
  if (isNaN(cx) || isNaN(cy)) {
    return null;
  }
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={stroke}
      stroke="white"
      strokeWidth={2}
    />
  );
};

interface RevenueTrendProps {
  data: Array<{
    month: string
    revenue: number
  }>
}

export function RevenueTrendChart({ data }: RevenueTrendProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    month: formatDate(item.month),
    revenue: typeof item.revenue === 'number' && !isNaN(item.revenue) ? item.revenue : 0,
  }))

  // Calculate average revenue
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const averageRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeGradients.success[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.success[1]} stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="averageGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor={themeGradients.primary[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.primary[1]} stopOpacity={0.8}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickMargin={10} />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)} 
          tick={{ fontSize: 12 }} 
          width={80} 
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />
        <ReferenceLine
          y={averageRevenue}
          stroke="url(#averageGradient)"
          strokeWidth={2}
          strokeDasharray="3 3"
          label={{
            value: "Average",
            position: "right",
            fill: themeGradients.primary[0],
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="url(#revenueGradient)"
          strokeWidth={3}
          dot={<CustomDot />}
          activeDot={{ r: 6, strokeWidth: 2 }}
          animationDuration={1000}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
