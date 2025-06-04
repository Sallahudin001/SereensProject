"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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

// Dashboard Footer Component
const AdminFooter = () => (
  <div className="w-full bg-gray-800 text-gray-300 p-6 sm:p-8 text-center sm:text-left mt-8">
    <div className="container mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
      <div className="sm:col-span-1">
        <Image src="/newlogo.png" alt="Evergreen Logo" width={80} height={80} className="rounded-md opacity-80 mx-auto sm:mx-0"/>
      </div>
      <div className="sm:col-span-2 text-sm">
        <p className="font-semibold text-lg text-white mb-1">Evergreen Energy Upgrades</p>
        <p>C: (408) 826-7377 | O: (408)333-9831</p>
        <p>sereen@evergreenenergy.io | info@evergreenenergy.io</p>
        <p>www.evergreenenergy.io</p>
        <p className="mt-3 text-xs text-gray-400">&copy; {new Date().getFullYear()} Evergreen Energy Upgrades. All Rights Reserved.</p>
      </div>
    </div>
  </div>
)

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
    <div className="flex flex-col gap-6 w-full">
      <Card className="shadow-lg rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight">Admin Dashboard</CardTitle>
              <CardDescription className="text-green-100">
                Overview of your home improvement proposal system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200">
                  <Home className="mr-2 h-4 w-4" />
                  Main Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="h-[140px] animate-pulse w-full">
              <CardContent className="p-6">
                <div className="h-6 w-1/2 bg-emerald-100 rounded mb-4"></div>
                <div className="h-10 w-2/3 bg-emerald-50 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {metrics.map((metric) => (
            <Card key={metric.id} className="w-full border-emerald-100 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {metric.id === "revenue" ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
                  ))}
                </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 w-full">
        <div className="col-span-7 lg:col-span-4 w-full">
          <Card className="h-full w-full border-transparent shadow-md">
              <CardHeader>
              <CardTitle className="text-black text-lg font-semibold">Monthly Proposal Trends</CardTitle>
              <CardDescription className="text-gray-700">Proposals created per month</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="h-[200px] md:h-[300px]">
                <MonthlyProposalTrendsChart />
              </div>
              </CardContent>
            </Card>
          </div>
        <div className="col-span-7 lg:col-span-3 w-full">
          <Card className="h-full w-full border-emerald-100 shadow-md">
            <CardHeader>
              <CardTitle className="text-black text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-gray-700">Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-full shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{activity.details}</p>
                      <p className="text-xs text-gray-600">
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
        <Card className="col-span-1 border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 group">
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
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100 group-hover:border-emerald-200 transition-all duration-300">
                <Package className="h-12 w-12 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                      </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Manage your products, categories, and pricing in one place.
                </p>
                <Link 
                  href="/admin/products" 
                  className="text-emerald-600 font-medium text-sm inline-block mt-3 hover:underline group-hover:text-emerald-700 transition-colors duration-300"
                >
                  Manage Products →
                </Link>
                    </div>
                  </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 group">
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 group-hover:border-blue-200 transition-all duration-300">
                <CreditCard className="h-12 w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Set up financing plans, payment factors, and merchant fees.
                </p>
                <Link 
                  href="/admin/financing" 
                  className="text-blue-600 font-medium text-sm inline-block mt-3 hover:underline group-hover:text-blue-700 transition-colors duration-300"
                >
                  Configure Financing →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 group">
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
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100 group-hover:border-purple-200 transition-all duration-300">
                <Users className="h-12 w-12 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts, roles, and access permissions.
                </p>
                <Link 
                  href="/admin/permissions" 
                  className="text-purple-600 font-medium text-sm inline-block mt-3 hover:underline group-hover:text-purple-700 transition-colors duration-300"
                >
                  Manage Users →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Admin Footer - positioned consistently with dashboard */}
      <AdminFooter />
    </div>
  )
}
