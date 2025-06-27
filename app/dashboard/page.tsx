"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import Image from "next/image"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const tableRowVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
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
    <div className="min-h-screen bg-background">
      <DashboardLayout>
        <div className="h-full p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-full flex flex-col"
          >
            <Card className="shadow-md rounded-xl overflow-hidden bg-card mb-6">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 md:p-6">
                <motion.div
                  ref={headerSection.ref}
                  initial="hidden"
                  animate={headerSection.isInView ? "visible" : "hidden"}
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Main Dashboard</CardTitle>
                    <CardDescription className="text-green-100 text-sm">Comprehensive overview of your business performance</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                      <Link href="/proposals/new" className="w-full sm:w-auto">
                        <Button className="bg-white text-emerald-700 hover:bg-green-50 w-full sm:w-auto border-none shadow-sm">
                          <Plus className="mr-2 h-4 w-4" /> New Proposal
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="p-5 md:p-6 flex-1">
                <motion.div
                  ref={statsSection.ref}
                  initial="hidden"
                  animate={statsSection.isInView ? "visible" : "hidden"}
                  variants={staggerContainer}
                  className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6"
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
                      icon: Users,
                      title: "Active Customers",
                      value: loading ? "..." : metrics.activeCustomers.toString(),
                      description: "Current customer base",
                      color: "from-blue-500 to-indigo-600",
                    },
                    {
                      icon: BarChart,
                      title: "Conversion Rate",
                      value: loading ? "..." : `${metrics.conversionRate}%`,
                      description: "Average proposal conversion",
                      color: "from-amber-500 to-orange-600",
                    }
                  ].map((stat, index) => (
                    <motion.div key={index} variants={fadeIn} className="relative overflow-hidden">
                      <Card className="h-full">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center p-3 rounded-full bg-gradient-to-br ${stat.color} text-white`}>
                              <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                              <h3 className="text-2xl font-bold">{stat.value}</h3>
                              <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                  <motion.div 
                    ref={chartsSection.ref}
                    initial="hidden"
                    animate={chartsSection.isInView ? "visible" : "hidden"}
                    variants={fadeIn}
                    className="lg:col-span-2"
                  >
                    <Card className="h-full">
                      <CardHeader className="px-5 py-4 border-b">
                        <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
                        <CardDescription>Conversions and proposal trends over time</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <DashboardPerformanceChart />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div 
                    variants={fadeIn} 
                    className="lg:col-span-1"
                  >
                    <PendingApprovals />
                  </motion.div>
                </div>

                <motion.div
                  ref={proposalsSection.ref}
                  initial="hidden"
                  animate={proposalsSection.isInView ? "visible" : "hidden"}
                  variants={fadeIn}
                  className="mt-6"
                >
                  <Card>
                    <CardHeader className="px-5 py-4 border-b">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg font-semibold">Recent Proposals</CardTitle>
                          <CardDescription>Latest proposal activity</CardDescription>
                        </div>
                        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-full sm:w-auto">
                          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-row">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="signed" className="text-xs">Signed</TabsTrigger>
                            <TabsTrigger value="sent" className="text-xs">Sent</TabsTrigger>
                            <TabsTrigger value="draft" className="text-xs">Draft</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {loading ? (
                        <div className="flex items-center justify-center h-60">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                      ) : filteredProposals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center px-4">
                          <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No proposals found</h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                            You haven't created any {activeFilter !== 'all' ? activeFilter : ''} proposals yet.
                          </p>
                          <Link href="/proposals/new">
                            <Button size="sm">
                              <Plus className="mr-1 h-4 w-4" /> Create New Proposal
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Services</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={staggerContainer}
                                className="contents"
                              >
                                {filteredProposals.map((proposal, index) => (
                                  <motion.tr
                                    key={proposal.id}
                                    variants={tableRowVariants}
                                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                    whileHover={{ backgroundColor: "rgba(236, 253, 245, 0.4)" }}
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-emerald-100 text-emerald-800">
                                            {proposal.customer_name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <Link 
                                            href={`/proposals/view/${proposal.id}`}
                                            className="font-medium hover:text-emerald-600 transition-colors"
                                          >
                                            {proposal.proposal_number}
                                          </Link>
                                          <p className="text-xs text-muted-foreground">{proposal.customer_name}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 hidden sm:table-cell">
                                      <div className="flex flex-wrap gap-1">
                                        {(proposal.services || []).slice(0, 2).map((service, i) => (
                                          <Badge key={i} variant="outline" className="text-xs font-normal">
                                            {service}
                                          </Badge>
                                        ))}
                                        {(proposal.services || []).length > 2 && (
                                          <Badge variant="outline" className="text-xs font-normal">
                                            +{proposal.services.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                                      {formatDate(proposal.created_at)}
                                    </td>
                                    <td className="py-3 px-4">
                                      <Badge className={`inline-flex items-center gap-1 ${getStatusStyle(proposal.status)}`}>
                                        {getStatusIcon(proposal.status)}
                                        <span className="capitalize">{proposal.status}</span>
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium">
                                      {proposal.total}
                                    </td>
                                  </motion.tr>
                                ))}
                              </motion.div>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center px-5 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{filteredProposals.length}</span> proposals
                      </div>
                      <Link href="/proposals">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </div>
  )
}
