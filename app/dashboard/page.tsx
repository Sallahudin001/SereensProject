"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { BarChart, FileText, Plus, Users, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, Send } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DashboardPerformanceChart } from "@/components/charts/dashboard-performance-chart"
import { DashboardServicesChart } from "@/components/charts/dashboard-services-chart"
import PendingApprovals from "@/components/dashboard/pending-approvals"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

interface Proposal {
  id: string
  proposal_number: string
  customer_name: string
  services: string[]
  created_at: string
  status: string
  total: string
}

interface Metrics {
  totalProposals: number
  activeCustomers: number
  conversionRate: number
}

export default function DashboardPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const statsSection = useScrollAnimation()
  const proposalsSection = useScrollAnimation()
  const chartsSection = useScrollAnimation()

  const [metrics, setMetrics] = useState<Metrics>({
    totalProposals: 0,
    activeCustomers: 0,
    conversionRate: 0,
  })

  const [recentProposals, setRecentProposals] = useState<Proposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // Fetch metrics
        const metricsResponse = await fetch('/api/dashboard')
        const metricsData = await metricsResponse.json()
        
        if (metricsData.success) {
          setMetrics(metricsData.metrics)
        }
        
        // Fetch proposals
        const proposalsResponse = await fetch('/api/proposals?recent=true&limit=10')
        const proposalsData = await proposalsResponse.json()
        
        if (proposalsData.success) {
          setRecentProposals(proposalsData.proposals)
          setFilteredProposals(proposalsData.proposals)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    async function fetchFilteredProposals() {
      if (activeFilter === 'all') {
        setFilteredProposals(recentProposals)
        return
      }
      
      setLoading(true)
      try {
        let url = `/api/proposals/status?status=${activeFilter}`
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.success) {
          setFilteredProposals(data.proposals)
        } else {
          // If there's an error, fallback to client-side filtering
          setFilteredProposals(recentProposals.filter(proposal => 
            proposal.status === activeFilter
          ))
        }
      } catch (error) {
        console.error(`Error fetching ${activeFilter} proposals:`, error)
        // Fallback to client-side filtering on error
        setFilteredProposals(recentProposals.filter(proposal => 
          proposal.status === activeFilter
        ))
      } finally {
        setLoading(false)
      }
    }
    
    fetchFilteredProposals()
  }, [activeFilter, recentProposals])

  // Format date function
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format status with appropriate styling
  const getStatusStyle = (status: string): string => {
    switch (status) {
      case "signed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "viewed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "draft":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
      case "completed":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "cancelled":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-3.5 w-3.5" />
      case "sent":
        return <Send className="h-3.5 w-3.5" />
      case "viewed":
        return <TrendingUp className="h-3.5 w-3.5" />
      case "rejected":
        return <XCircle className="h-3.5 w-3.5" />
      case "draft":
        return <FileText className="h-3.5 w-3.5" />
      case "completed":
        return <CheckCircle className="h-3.5 w-3.5" />
      case "cancelled":
        return <AlertCircle className="h-3.5 w-3.5" />
      default:
        return <Clock className="h-3.5 w-3.5" />
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header Section with Green Gradient */}
        <motion.div 
          ref={headerSection.ref}
          initial="hidden"
          animate={headerSection.isInView ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <Card className="shadow-xl rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl sm:text-4xl font-bold">Main Dashboard</CardTitle>
                  <CardDescription className="text-green-100 text-sm sm:text-base">
                    Comprehensive overview of your business performance
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link href="/proposals/new" className="w-full sm:w-auto">
                      <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md w-full sm:w-auto border-none">
                        <Plus className="mr-2 h-4 w-4" /> New Proposal
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsSection.ref}
          initial="hidden"
          animate={statsSection.isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            {
              icon: FileText,
              title: "Total Proposals",
              value: loading ? "..." : metrics.totalProposals.toString(),
              description: "All-time proposals created",
              color: "from-emerald-500 to-green-600",
            },
            {
              icon: BarChart,
              title: "Conversion Rate",
              value: loading ? "..." : `${metrics.conversionRate}%`,
              description: "Proposals to signed contracts",
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: Users,
              title: "Active Customers",
              value: loading ? "..." : metrics.activeCustomers.toString(),
              description: "Customers with active projects",
              color: "from-teal-500 to-emerald-600",
            },
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color} text-white`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="flex flex-col"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={statsSection.isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                  >
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    {index === 1 && !loading && (
                      <Progress value={metrics.conversionRate} className="mt-3 h-2 [&>div]:bg-emerald-600" />
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Pending Approvals Section */}
        <motion.div
          initial="hidden"
          animate={statsSection.isInView ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <PendingApprovals />
        </motion.div>

        {/* Recent Proposals Section */}
        <motion.div
          ref={proposalsSection.ref}
          initial="hidden"
          animate={proposalsSection.isInView ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                    Recent Proposals
                  </CardTitle>
                  <CardDescription>Your 10 most recent proposals</CardDescription>
                </div>
                <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                    <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">All</TabsTrigger>
                    <TabsTrigger value="signed" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Signed</TabsTrigger>
                    <TabsTrigger value="sent" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Sent</TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No proposals found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {activeFilter === 'all' ? 
                      "Create your first proposal to start tracking your sales pipeline." : 
                      `No ${activeFilter} proposals found. Change filter or create a new proposal.`}
                  </p>
                  <Link href="/proposals/new">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="mr-2 h-4 w-4" /> Create Proposal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Services</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      initial="hidden"
                      animate={proposalsSection.isInView ? "visible" : "hidden"}
                      variants={staggerContainer}
                    >
                      {filteredProposals.map((proposal, index) => (
                        <motion.tr
                          key={proposal.id || `proposal-${index}`}
                          className="border-b hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          variants={tableRowVariants}
                          onClick={() => window.location.href = `/proposals/view/${proposal.id}?mode=admin`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-emerald-50 shadow-sm">
                                <AvatarImage src={`https://avatar.vercel.sh/${proposal.customer_name}`} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                                  {proposal.customer_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{proposal.customer_name}</div>
                                <div className="text-xs text-muted-foreground">#{proposal.proposal_number}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {proposal.services.slice(0, 2).map((service, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-slate-800 whitespace-nowrap"
                                >
                                  {service}
                                </Badge>
                              ))}
                              {proposal.services.length > 2 && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-slate-800">
                                  +{proposal.services.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{formatDate(proposal.created_at)}</td>
                          <td className="py-3 px-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(proposal.status)}`}
                            >
                              {getStatusIcon(proposal.status)}
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">${Number.parseFloat(proposal.total).toFixed(2)}</td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          ref={chartsSection.ref}
          initial="hidden"
          animate={chartsSection.isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2"
        >
          {[
            {
              title: "Performance Overview",
              description: "Your proposal performance for the last 30 days",
              icon: TrendingUp,
              color: "text-emerald-500",
              chart: <DashboardPerformanceChart />
            },
            {
              title: "Popular Services",
              description: "Most requested services in your proposals",
              icon: BarChart,
              color: "text-green-500",
              chart: <DashboardServicesChart />
            },
          ].map((chart, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <chart.icon className={`w-5 h-5 mr-2 ${chart.color}`} />
                    {chart.title}
                  </CardTitle>
                  <CardDescription>{chart.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={chartsSection.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                  >
                    {chart.chart}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
