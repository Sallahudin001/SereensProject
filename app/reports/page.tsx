"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { BarChart, LineChart, PieChart, TrendingUp } from "lucide-react"
import { StatusDistributionChart } from "@/components/charts/status-distribution-chart"
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart"
import { PopularServicesChart } from "@/components/charts/popular-services-chart"
import { ConversionRateChart } from "@/components/charts/conversion-rate-chart"
import { ChartLoading } from "@/components/charts/chart-loading"
import { ChartError } from "@/components/charts/chart-error"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"


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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200">
      <DashboardLayout>
        <div className="h-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-full flex flex-col"
          >
            <Card className="shadow-2xl rounded-xl overflow-hidden bg-white mb-8 mx-4 xl:mx-8 flex-1">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
                <motion.div
                  ref={headerSection.ref}
                  initial="hidden"
                  animate={headerSection.isInView ? "visible" : "hidden"}
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-3xl sm:text-4xl font-bold flex items-center">
                        <TrendingUp className="w-8 h-8 mr-3" />
                        Reports & Analytics
                      </CardTitle>
                      <CardDescription className="text-green-100 text-sm sm:text-base">
                        View performance metrics and analytics for your proposals
                      </CardDescription>
                    </div>
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
                <Card className="mb-6 border-none shadow-md">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                    <CardTitle className="flex items-center text-gray-800">
                      <BarChart className="w-6 h-6 mr-3 text-emerald-600" /> Time Range Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-700">Select reporting period</div>
                      <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                        <SelectTrigger className="w-[180px] border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
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

                <motion.div
                  ref={chartsSection.ref}
                  initial="hidden"
                  animate={chartsSection.isInView ? "visible" : "hidden"}
                  variants={staggerContainer}
                  className="grid gap-6 md:grid-cols-2 flex-1"
                >
                  <motion.div variants={fadeIn}>
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <PieChart className="h-5 w-5 mr-3 text-emerald-500" />
                              Proposal Status
                            </CardTitle>
                            <CardDescription>Distribution of proposal statuses</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <ChartLoading />
                        ) : error ? (
                          <ChartError message={error} />
                        ) : reportData.statusDistribution.length === 0 ? (
                          <div className="flex items-center justify-center h-[300px] bg-emerald-50 rounded-md">
                            <span className="text-emerald-500">No data available</span>
                          </div>
                        ) : (
                          <StatusDistributionChart data={reportData.statusDistribution} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <LineChart className="h-5 w-5 mr-3 text-green-500" />
                              Revenue Trend
                            </CardTitle>
                            <CardDescription>Monthly revenue from proposals</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <ChartLoading />
                        ) : error ? (
                          <ChartError message={error} />
                        ) : reportData.revenueTrend.length === 0 ? (
                          <div className="flex items-center justify-center h-[300px] bg-emerald-50 rounded-md">
                            <span className="text-emerald-500">No data available</span>
                          </div>
                        ) : (
                          <RevenueTrendChart data={reportData.revenueTrend} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <BarChart className="h-5 w-5 mr-3 text-teal-500" />
                              Popular Services
                            </CardTitle>
                            <CardDescription>Most requested services in proposals</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <ChartLoading />
                        ) : error ? (
                          <ChartError message={error} />
                        ) : reportData.popularServices.length === 0 ? (
                          <div className="flex items-center justify-center h-[300px] bg-emerald-50 rounded-md">
                            <span className="text-emerald-500">No data available</span>
                          </div>
                        ) : (
                          <PopularServicesChart data={reportData.popularServices} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-3 text-emerald-500" />
                              Conversion Rate
                            </CardTitle>
                            <CardDescription>Proposal to signed conversion rate</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <ChartLoading />
                        ) : error ? (
                          <ChartError message={error} />
                        ) : reportData.conversionRate.length === 0 ? (
                          <div className="flex items-center justify-center h-[300px] bg-emerald-50 rounded-md">
                            <span className="text-emerald-500">No data available</span>
                          </div>
                        ) : (
                          <ConversionRateChart data={reportData.conversionRate} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </div>
  )
}
