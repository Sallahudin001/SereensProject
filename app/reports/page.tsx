"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { StatusDistributionChart } from "@/components/charts/status-distribution-chart"
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart"
import { PopularServicesChart } from "@/components/charts/popular-services-chart"
import { ConversionRateChart } from "@/components/charts/conversion-rate-chart"
import { ChartLoading } from "@/components/charts/chart-loading"
import { ChartError } from "@/components/charts/chart-error"
import { useToast } from "@/hooks/use-toast"


// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function ReportsPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const chartsSection = useScrollAnimation()
  const { toast } = useToast()

  const [timeRange, setTimeRange] = useState("30")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<{
    statusDistribution: any[]
    revenueTrend: any[]
    popularServices: any[]
    conversionRate: any[]
  }>({
    statusDistribution: [],
    revenueTrend: [],
    popularServices: [],
    conversionRate: [],
  })

  useEffect(() => {
    async function fetchReportData() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/reports?timeRange=${timeRange}`)

        if (!response.ok) {
          throw new Error("Failed to fetch report data")
        }

        const data = await response.json()
        setReportData(data)
      } catch (err) {
        console.error("Error fetching report data:", err)
        setError("Failed to load report data. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [timeRange, toast])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  return (
    <DashboardLayout>
      <motion.div
        ref={headerSection.ref}
        initial="hidden"
        animate={headerSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-gray-500">View performance metrics and analytics for your proposals</p>
      </motion.div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Time Range</div>
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <motion.div
        ref={chartsSection.ref}
        initial="hidden"
        animate={chartsSection.isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proposal Status</CardTitle>
                  <CardDescription>Distribution of proposal statuses</CardDescription>
                </div>
                <PieChart className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartLoading />
              ) : error ? (
                <ChartError message={error} />
              ) : reportData.statusDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
                  <span className="text-gray-400">No data available</span>
                </div>
              ) : (
                <StatusDistributionChart data={reportData.statusDistribution} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue from proposals</CardDescription>
                </div>
                <LineChart className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartLoading />
              ) : error ? (
                <ChartError message={error} />
              ) : reportData.revenueTrend.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
                  <span className="text-gray-400">No data available</span>
                </div>
              ) : (
                <RevenueTrendChart data={reportData.revenueTrend} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Popular Services</CardTitle>
                  <CardDescription>Most requested services in proposals</CardDescription>
                </div>
                <BarChart className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartLoading />
              ) : error ? (
                <ChartError message={error} />
              ) : reportData.popularServices.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
                  <span className="text-gray-400">No data available</span>
                </div>
              ) : (
                <PopularServicesChart data={reportData.popularServices} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conversion Rate</CardTitle>
                  <CardDescription>Proposal to signed conversion rate</CardDescription>
                </div>
                <LineChart className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartLoading />
              ) : error ? (
                <ChartError message={error} />
              ) : reportData.conversionRate.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
                  <span className="text-gray-400">No data available</span>
                </div>
              ) : (
                <ConversionRateChart data={reportData.conversionRate} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
