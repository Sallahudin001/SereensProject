"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, 
  Gauge, 
  LineChart, 
  ArrowUpRight, 
  Package, 
  Users, 
  FileText,
  CreditCard, 
  ListChecks, 
  Settings
} from "lucide-react"

interface DashboardMetric {
  id: string
  name: string
  value: number
  change: number
  trend: "up" | "down" | "neutral"
}

interface RecentActivity {
  id: number
  type: string
  user: string
  timestamp: string
  details: string
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch metrics data
      try {
        // Fetch real metrics data
        const metricsResponse = await fetch('/api/admin/dashboard')
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          if (metricsData.success && metricsData.metrics) {
            setMetrics(metricsData.metrics)
          } else {
            console.error("Failed to fetch metrics data:", metricsData.error)
            setMetrics([])
          }
        } else {
          console.error("Failed to fetch metrics:", metricsResponse.statusText)
          setMetrics([])
        }
      } catch (metricsError) {
        console.error("Error fetching metrics data:", metricsError instanceof Error ? metricsError.message : String(metricsError))
          setMetrics([])
        }

      // Fetch activity data
      try {
        // Fetch real activity data
        const activityResponse = await fetch('/api/admin/activity?limit=5')
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          
          if (activityData.success && activityData.activities) {
            setRecentActivity(activityData.activities)
          } else {
            console.error("Failed to fetch activity data:", activityData.error)
            setRecentActivity([])
          }
        } else {
          const errorText = await activityResponse.text().catch(() => 'Unknown error')
          console.error(`Failed to fetch activity data: ${activityResponse.status} ${activityResponse.statusText}`, errorText)
          setRecentActivity([])
        }
      } catch (activityError) {
        console.error("Error fetching activity data:", activityError instanceof Error ? activityError.message : String(activityError))
        setRecentActivity([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pricing_update":
        return <CreditCard className="h-4 w-4" />
      case "approval":
        return <ListChecks className="h-4 w-4" />
      case "product_add":
        return <Package className="h-4 w-4" />
      case "proposal":
        return <FileText className="h-4 w-4" />
      case "settings":
        return <Settings className="h-4 w-4" />
      default:
        return <ArrowUpRight className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your home improvement proposal system
          </p>
        </div>
      </div>

      {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="h-[140px] animate-pulse w-full">
              <CardContent className="p-6">
                <div className="h-6 w-1/2 bg-muted rounded mb-4"></div>
                <div className="h-10 w-2/3 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {metrics.map((metric) => (
            <Card key={metric.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.name}
                </CardTitle>
                <div className={`flex items-center gap-1 ${
                  metric.trend === 'up' ? 'text-emerald-500' : 
                  metric.trend === 'down' ? 'text-rose-500' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : metric.trend === 'down' ? (
                    <ArrowUpRight className="h-4 w-4 rotate-180" />
                  ) : null}
                  <span className="text-xs">{metric.change}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.id === "revenue" ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
                  ))}
                </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 w-full">
        <div className="col-span-7 lg:col-span-4 w-full">
          <Card className="h-full w-full">
              <CardHeader>
              <CardTitle>Monthly Proposal Trends</CardTitle>
              <CardDescription>Proposals created per month</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="h-[200px] md:h-[300px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mb-2" />
                  <p className="text-sm">Trend data visualization will appear here</p>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        <div className="col-span-7 lg:col-span-3 w-full">
          <Card className="h-full w-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="bg-muted p-2 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} · {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
            <CardHeader>
            <CardTitle>Products Management</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Package className="h-8 w-8 text-primary" />
                      </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Manage your products, categories, and pricing in one place.
                </p>
                <Link 
                  href="/admin/products" 
                  className="text-primary font-medium text-sm inline-block mt-3 hover:underline"
                >
                  Manage Products →
                </Link>
                    </div>
                  </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financing Options</CardTitle>
            <CardDescription>Configure financing plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Set up financing plans, payment factors, and merchant fees.
                </p>
                <Link 
                  href="/admin/pricing" 
                  className="text-primary font-medium text-sm inline-block mt-3 hover:underline"
                >
                  Manage Financing →
                </Link>
              </div>
            </div>
          </CardContent>
          </Card>

        <Card className="col-span-1">
            <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Add users, assign roles, and configure permissions.
                </p>
                <Link 
                  href="/admin/users" 
                  className="text-primary font-medium text-sm inline-block mt-3 hover:underline"
                >
                  Manage Users →
                </Link>
              </div>
            </div>
          </CardContent>
          </Card>
      </div>
    </div>
  )
}
