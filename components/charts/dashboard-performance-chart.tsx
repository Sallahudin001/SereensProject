"use client"

import { useState, useEffect } from "react"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Dot } from "recharts"
import { formatDate, formatPercentage, themeGradients } from "@/lib/chart-utils"

// Custom dot component with rounded look
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  
  // Skip rendering if coordinates are invalid
  if (isNaN(cx) || isNaN(cy) || cx === null || cy === null) {
    return null;
  }
  
  // Different styling based on data type
  const fill = dataKey === "proposals" ? themeGradients.secondary[0] : themeGradients.warning[0];
  const stroke = dataKey === "proposals" ? themeGradients.secondary[1] : themeGradients.warning[1];
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
    />
  );
};

interface PerformanceData {
  date: string
  proposals: number
  conversion: number
}

export function DashboardPerformanceChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    async function fetchPerformanceData() {
      try {
        setLoading(true);
        // Fetch from reports API with a 30-day timeframe
        const response = await fetch('/api/reports?timeRange=30');
        const reportData = await response.json();
        
        // Format data from conversion rate for the chart
        if (reportData.conversionRate && reportData.conversionRate.length > 0) {
          const chartData = reportData.conversionRate
            .map((item: any) => ({
              date: formatDate(item.week, "short"),
              proposals: item.total || 0,
              conversion: item.rate || 0,
            }))
            // Filter out any invalid data points
            .filter((item: any) => 
              !isNaN(item.proposals) && 
              !isNaN(item.conversion) && 
              item.date
            );
          
          if (chartData.length > 0) {
            setData(chartData);
          } else {
            // If no valid data after filtering, use demo data
            setData(getDemoData());
          }
        } else {
          // Fallback to demo data if no data available
          setData(getDemoData());
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
        setData(getDemoData());
      } finally {
        setLoading(false);
      }
    }

    fetchPerformanceData();
  }, []);

  // Provide demo data if API fails or no data is available
  const getDemoData = (): PerformanceData[] => {
    return [
      { date: "Jan", proposals: 28, conversion: 55.2 },
      { date: "Feb", proposals: 32, conversion: 60.5 },
      { date: "Mar", proposals: 37, conversion: 62.8 },
      { date: "Apr", proposals: 42, conversion: 68.3 },
      { date: "May", proposals: 48, conversion: 71.2 },
    ];
  };

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="proposalsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeGradients.secondary[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.secondary[1]} stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={themeGradients.warning[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={themeGradients.warning[1]} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          width={30}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          width={40}
        />
        <Tooltip
          formatter={(value: number | string, name: string) => {
            if (name === "conversion") return [formatPercentage(value), "Conversion Rate"];
            return [value.toString(), "Proposals"];
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
          iconType="circle" 
          iconSize={8}
          formatter={(value) => {
            const labels: Record<string, string> = {
              proposals: "Proposals",
              conversion: "Conversion Rate"
            };
            return <span style={{ fontSize: "12px", color: "#6B7280" }}>{labels[value] || value}</span>;
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="proposals"
          stroke={themeGradients.secondary[0]}
          strokeWidth={3}
          dot={<CustomDot dataKey="proposals" />}
          activeDot={{ r: 6, strokeWidth: 2 }}
          connectNulls
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversion"
          stroke={themeGradients.warning[0]}
          strokeWidth={3}
          dot={<CustomDot dataKey="conversion" />}
          activeDot={{ r: 6, strokeWidth: 2 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 