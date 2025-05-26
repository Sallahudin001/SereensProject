"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { BarChart, FileText, Plus, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

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

export default function DashboardPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const statsSection = useScrollAnimation()
  const proposalsSection = useScrollAnimation()
  const chartsSection = useScrollAnimation()

  const [metrics, setMetrics] = useState({
    totalProposals: 0,
    activeCustomers: 0,
    conversionRate: 0,
  })

  const [recentProposals, setRecentProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        // Mock data for demonstration
        setTimeout(() => {
          setMetrics({
            totalProposals: 124,
            activeCustomers: 38,
            conversionRate: 67,
          })

          setRecentProposals([
            {
              id: "prop-1",
              proposal_number: "P-2023-001",
              customer_name: "John Doe",
              services: ["Roofing", "Insulation", "Windows"],
              created_at: "2023-04-15T10:30:00Z",
              status: "signed",
              total: "12500.00",
            },
            {
              id: "prop-2",
              proposal_number: "P-2023-002",
              customer_name: "Jane Smith",
              services: ["HVAC", "Solar Panels"],
              created_at: "2023-04-18T14:45:00Z",
              status: "sent",
              total: "8750.00",
            },
            {
              id: "prop-3",
              proposal_number: "P-2023-003",
              customer_name: "Robert Johnson",
              services: ["Garage Door", "Exterior Paint"],
              created_at: "2023-04-20T09:15:00Z",
              status: "viewed",
              total: "4200.00",
            },
            {
              id: "prop-4",
              proposal_number: "P-2023-004",
              customer_name: "Sarah Williams",
              services: ["Windows", "Doors"],
              created_at: "2023-04-22T16:30:00Z",
              status: "draft",
              total: "6800.00",
            },
            {
              id: "prop-5",
              proposal_number: "P-2023-005",
              customer_name: "Michael Brown",
              services: ["Roofing", "Gutters", "Siding"],
              created_at: "2023-04-25T11:00:00Z",
              status: "completed",
              total: "15300.00",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format status with appropriate styling
  const getStatusStyle = (status) => {
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
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-3.5 w-3.5" />
      case "sent":
        return <Clock className="h-3.5 w-3.5" />
      case "viewed":
        return <TrendingUp className="h-3.5 w-3.5" />
      case "cancelled":
        return <AlertCircle className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="px-1 sm:px-4 py-6">
        <motion.div
          ref={headerSection.ref}
          initial="hidden"
          animate={headerSection.isInView ? "visible" : "hidden"}
          variants={fadeIn}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your business.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link href="/proposals/new" className="w-full sm:w-auto">
                <Button className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white shadow-md w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> New Proposal
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          ref={statsSection.ref}
          initial="hidden"
          animate={statsSection.isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid gap-4 md:grid-cols-3 mb-8"
        >
          {[
            {
              icon: FileText,
              title: "Total Proposals",
              value: loading ? "..." : metrics.totalProposals.toString(),
              description: "All-time proposals created",
              color: "from-blue-500 to-indigo-600",
            },
            {
              icon: BarChart,
              title: "Conversion Rate",
              value: loading ? "..." : `${metrics.conversionRate}%`,
              description: "Proposals to signed contracts",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: Users,
              title: "Active Customers",
              value: loading ? "..." : metrics.activeCustomers.toString(),
              description: "Customers with active projects",
              color: "from-amber-500 to-orange-600",
            },
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeIn} className="h-full">
              <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-full bg-gradient-to-br ${stat.color} text-white`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="flex flex-col"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={statsSection.isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                  >
                    <span className="text-3xl font-bold">{stat.value}</span>
                    <span className="text-xs text-muted-foreground mt-1">{stat.description}</span>
                    {index === 1 && !loading && <Progress value={metrics.conversionRate} className="h-1.5 mt-3" />}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          ref={proposalsSection.ref}
          initial="hidden"
          animate={proposalsSection.isInView ? "visible" : "hidden"}
          variants={fadeIn}
          className="mb-8"
        >
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Recent Proposals</CardTitle>
                  <CardDescription>View and manage your recent proposals</CardDescription>
                </div>
                <Tabs defaultValue="all" className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="signed">Signed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
                </div>
              ) : recentProposals.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No proposals yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first proposal to start tracking your sales pipeline.
                  </p>
                  <Link href="/proposals/new">
                    <Button className="bg-rose-600 hover:bg-rose-700">
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
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      initial="hidden"
                      animate={proposalsSection.isInView ? "visible" : "hidden"}
                      variants={staggerContainer}
                    >
                      {recentProposals.map((proposal, index) => (
                        <motion.tr
                          key={index}
                          className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          variants={tableRowVariants}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${proposal.customer_name}`} />
                                <AvatarFallback>{proposal.customer_name.charAt(0)}</AvatarFallback>
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
                                  className="bg-slate-50 dark:bg-slate-800 whitespace-nowrap"
                                >
                                  {service}
                                </Badge>
                              ))}
                              {proposal.services.length > 2 && (
                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
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
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/proposals/view/${proposal.id}`}>
                                <Button variant="outline" size="sm" className="h-8 px-3">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

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
              color: "text-blue-500",
            },
            {
              title: "Popular Services",
              description: "Most requested services in your proposals",
              icon: BarChart,
              color: "text-emerald-500",
            },
          ].map((chart, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{chart.title}</CardTitle>
                      <CardDescription>{chart.description}</CardDescription>
                    </div>
                    <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${chart.color}`}>
                      <chart.icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="h-[200px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={chartsSection.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                  >
                    <span className="text-muted-foreground">Chart Placeholder</span>
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
