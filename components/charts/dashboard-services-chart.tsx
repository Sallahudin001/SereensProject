"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Rectangle } from "recharts"
import { chartColors, gradientColors, themeGradients } from "@/lib/chart-utils"

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

  useEffect(() => {
    async function fetchServicesData() {
      try {
        setLoading(true);
        // Fetch from reports API with a 30-day timeframe
        const response = await fetch('/api/reports?timeRange=30');
        const reportData = await response.json();
        
        // Format data from popular services for the chart
        if (reportData.popularServices && reportData.popularServices.length > 0) {
          const chartData = reportData.popularServices
            .map((item: any) => ({
              name: item.product_type || "Unknown",
              count: item.count || 0,
            }))
            // Filter out invalid data
            .filter((item: any) => !isNaN(item.count) && item.name)
            .slice(0, 5); // Limit to top 5
          
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
        console.error("Error fetching services data:", error);
        setData(getDemoData());
      } finally {
        setLoading(false);
      }
    }

    fetchServicesData();
  }, []);

  // Provide demo data if API fails or no data is available
  const getDemoData = (): ServiceData[] => {
    return [
      { name: "Roofing", count: 42 },
      { name: "HVAC", count: 38 },
      { name: "Windows", count: 34 },
      { name: "Garage Doors", count: 26 },
      { name: "Paint", count: 18 },
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