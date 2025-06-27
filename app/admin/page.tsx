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
  Settings,
  Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MonthlyProposalTrendsChart } from "@/components/charts/monthly-proposal-trends-chart"

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
        return <CreditCard className="h-4 w-4 text-gray-700" />
      case "approval":
        return <ListChecks className="h-4 w-4 text-gray-700" />
      case "product_add":
        return <Package className="h-4 w-4 text-gray-700" />
      case "proposal":
        return <FileText className="h-4 w-4 text-gray-700" />
      case "settings":
        return <Settings className="h-4 w-4 text-gray-700" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-700" />
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Card */}
      <Card className="shadow-xl rounded-xl overflow-hidden bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div>
              <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight">Admin Dashboard</CardTitle>
              <CardDescription className="text-green-100 text-sm sm:text-base">
                Overview of your home improvement proposal system
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Main Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="h-[142px] animate-pulse w-full border-0 shadow-md">
              <CardContent className="p-6">
                <div className="h-4 w-1/2 bg-emerald-100 rounded mb-4"></div>
                <div className="h-8 w-2/3 bg-emerald-50 rounded mb-2"></div>
                <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.id} className="h-[142px] border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black mb-1">
                  {metric.id === "revenue" ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Compared to last period
                </div>
              </CardContent>
            </Card>
                  ))}
                </div>
      )}

      {/* Main Content Grid - Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chart Section - Reduced width */}
        <div className="lg:col-span-3">
          <Card className="h-full">
              <CardHeader>
              <CardTitle className="text-black text-lg font-semibold">Monthly Proposal Trends</CardTitle>
              <CardDescription className="text-gray-700">Proposals created per month</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="h-[300px] w-full">
                <MonthlyProposalTrendsChart />
              </div>
              </CardContent>
            </Card>
          </div>

        {/* Activity Section - Increased width */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-black text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-gray-700">Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {loading ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-start gap-3 animate-pulse">
                        <div className="bg-gray-200 p-2 rounded-full w-8 h-8 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="bg-gray-100 p-2 rounded-full shadow-sm flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate pr-2">{activity.details}</p>
                        <p className="text-xs text-gray-600 truncate">
                        {activity.user} · {activity.timestamp}
                      </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <FileText className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group h-full">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <Package className="h-5 w-5 text-white" />
              </div>
              Products Management
            </CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100 group-hover:border-emerald-200 transition-all duration-300 w-full">
                <Package className="h-12 w-12 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300 mx-auto" />
                      </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage your products, categories, and pricing in one place.
                </p>
                <Link 
                  href="/admin/products" 
                  className="text-emerald-600 font-medium text-sm inline-block hover:underline group-hover:text-emerald-700 transition-colors duration-300"
                >
                  Manage Products →
                </Link>
                    </div>
                  </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Financing Options
            </CardTitle>
            <CardDescription>Configure financing plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 group-hover:border-blue-200 transition-all duration-300 w-full">
                <CreditCard className="h-12 w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300 mx-auto" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up financing plans, payment factors, and merchant fees.
                </p>
                <Link 
                  href="/admin/financing" 
                  className="text-blue-600 font-medium text-sm inline-block hover:underline group-hover:text-blue-700 transition-colors duration-300"
                >
                  Configure Financing →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
              User Management
            </CardTitle>
            <CardDescription>Manage system users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100 group-hover:border-purple-200 transition-all duration-300 w-full">
                <Users className="h-12 w-12 text-purple-600 group-hover:text-purple-700 transition-colors duration-300 mx-auto" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage user accounts, roles, and access permissions.
                </p>
                <Link 
                  href="/admin/permissions" 
                  className="text-purple-600 font-medium text-sm inline-block hover:underline group-hover:text-purple-700 transition-colors duration-300"
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
