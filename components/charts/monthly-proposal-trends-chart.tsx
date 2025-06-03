"use client"

import { useState, useEffect } from "react"
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Rectangle
} from "recharts"
import { LineChart } from "lucide-react"

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

// Custom dot component for line chart
const CustomDot = (props: any) => {
  const { cx, cy } = props;
  
  if (isNaN(cx) || isNaN(cy) || cx === null || cy === null) {
    return null;
  }
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill="#10b981"
      stroke="white"
      strokeWidth={2}
    />
  );
};

interface MonthlyTrendsData {
  month: string;
  proposals: number;
  signed: number;
  revenue: number;
  conversionRate: number;
}

export function MonthlyProposalTrendsChart() {
  const [data, setData] = useState<MonthlyTrendsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendsData() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/proposal-trends');
        const result = await response.json();
        
        if (result.success) {
          // Format the data for display
          const formattedData = result.data.map((item: any) => ({
            month: new Date(item.month).toLocaleDateString('en-US', { 
              month: 'short', 
              year: '2-digit' 
            }),
            proposals: item.proposals,
            signed: item.signed,
            revenue: item.revenue,
            conversionRate: item.conversionRate,
          }));
          setData(formattedData);
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching trends data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchTrendsData();
  }, []);

  if (loading) {
    return (
      <div className="h-[200px] md:h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[200px] md:h-[300px] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <LineChart className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-sm font-medium text-red-600 mb-1">Failed to load chart</h3>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] md:h-[300px] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <LineChart className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">No trend data yet</h3>
        <p className="text-xs text-gray-500">Create proposals to see monthly trends.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="proposalsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="signedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
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
          width={40}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          width={40}
        />
        <Tooltip
          formatter={(value: number | string, name: string) => {
            if (name === "conversionRate") return [`${value}%`, "Conversion Rate"];
            if (name === "proposals") return [value.toString(), "Total Proposals"];
            if (name === "signed") return [value.toString(), "Signed Proposals"];
            return [value.toString(), name];
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
              proposals: "Total Proposals",
              signed: "Signed Proposals", 
              conversionRate: "Conversion Rate",
            };
            return <span style={{ color: "#333", fontSize: "12px" }}>{labels[value] || value}</span>;
          }}
        />
        <Bar 
          yAxisId="left" 
          dataKey="proposals" 
          fill="url(#proposalsGradient)" 
          name="proposals"
          shape={<RoundedBar />}
          animationDuration={800}
        />
        <Bar 
          yAxisId="left" 
          dataKey="signed" 
          fill="url(#signedGradient)" 
          name="signed"
          shape={<RoundedBar />}
          animationDuration={1000}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversionRate"
          stroke="#f59e0b"
          strokeWidth={3}
          name="conversionRate"
          dot={<CustomDot />}
          activeDot={{ r: 6, strokeWidth: 2 }}
          animationDuration={1200}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
} 