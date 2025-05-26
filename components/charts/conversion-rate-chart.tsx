"use client"

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar, Rectangle } from "recharts"
import { formatDate, formatPercentage, themeGradients } from "@/lib/chart-utils"

// Custom rounded bar shape
const RoundedBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  const radius = 4;
  
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      radius={[radius, radius, 0, 0]}
    />
  );
};

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
      stroke={stroke}
      strokeWidth={2}
      strokeOpacity={0.8}
      fillOpacity={0.8}
    />
  );
};

interface ConversionRateProps {
  data: Array<{
    week: string
    total: number
    signed: number
    rate: number
  }>
}

export function ConversionRateChart({ data }: ConversionRateProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    week: formatDate(item.week, "short"),
    total: item.total,
    signed: item.signed,
    rate: item.rate,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <defs>
          <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeGradients.info[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.info[1]} stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="signedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeGradients.secondary[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.secondary[1]} stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeGradients.primary[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.primary[1]} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} tickMargin={10} />
        <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} width={40} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          width={40}
        />
        <Tooltip
          formatter={(value: number | string, name: string) => {
            if (name === "rate") return [formatPercentage(value), "Conversion Rate"]
            return [value.toString(), name === "total" ? "Total Proposals" : "Signed Proposals"]
          }}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: "12px",
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => {
            const labels: Record<string, string> = {
              total: "Total Proposals",
              signed: "Signed Proposals",
              rate: "Conversion Rate",
            }
            return <span style={{ color: "#333", fontSize: "12px" }}>{labels[value] || value}</span>
          }}
        />
        <Bar 
          yAxisId="left" 
          dataKey="total" 
          fill="url(#totalGradient)" 
          barSize={20} 
          fillOpacity={0.8} 
          animationDuration={800}
          shape={<RoundedBar />}
        />
        <Bar 
          yAxisId="left" 
          dataKey="signed" 
          fill="url(#signedGradient)" 
          barSize={20} 
          animationDuration={1000}
          shape={<RoundedBar />}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="rate"
          stroke="url(#rateGradient)"
          strokeWidth={3}
          dot={<CustomDot />}
          activeDot={{ r: 6, strokeWidth: 2 }}
          animationDuration={1200}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
