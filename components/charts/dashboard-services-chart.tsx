"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Rectangle } from "recharts"
import { chartColors, gradientColors, themeGradients } from "@/lib/chart-utils"
import { BarChart3 } from "lucide-react"

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
      radius={[0, radius, radius, 0]}
    />
  );
};

interface ServiceData {
  name: string
  count: number
}

export function DashboardServicesChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ServiceData[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    async function fetchServicesData() {
      try {
        setLoading(true);
        // Fetch from reports API with a 30-day timeframe
        const response = await fetch('/api/reports?timeRange=30');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reportData = await response.json();
        
        // Check if we have actual data (not empty arrays)
        if (reportData.popularServices && reportData.popularServices.length > 0) {
          const chartData = reportData.popularServices
            .map((item: any) => ({
              name: item.service || "Unknown",
              count: item.count || 0,
            }))
            // Filter out invalid data
            .filter((item: any) => !isNaN(item.count) && item.name && item.count > 0)
            .slice(0, 5); // Limit to top 5
          
          if (chartData.length > 0) {
            setData(chartData);
            setHasData(true);
          } else {
            setData([]);
            setHasData(false);
          }
        } else {
          // No data available - this is expected for new users
          setData([]);
          setHasData(false);
        }
      } catch (error) {
        console.error("Error fetching services data:", error);
        setData([]);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchServicesData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Show empty state if no data
  if (!hasData || data.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <BarChart3 className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">No service data yet</h3>
        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[200px]">
          Add services to your proposals to see popular service trends.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 60,
          bottom: 5,
        }}
      >
        <defs>
          {gradientColors.map((color, index) => (
            <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color[0]} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color[1]} stopOpacity={0.8} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
        <XAxis 
          type="number" 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value: number | string) => [`${value} proposals`, "Count"]}
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
          animationDuration={1500}
          shape={<RoundedBar />}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#colorGradient${index % gradientColors.length})`} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
} 