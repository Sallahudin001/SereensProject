"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import DashboardLayout from "@/components/dashboard-layout"
import {
  BarChart3,
  Users,
  DollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Timer,
  CreditCard,
  ClipboardList,
  FileSpreadsheet,
  Bell,
  Briefcase
} from "lucide-react"

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
      staggerChildren: 0.1,
    },
  },
}

// Type definitions for dashboard data
interface DashboardMetrics {
  totalProposals: number;
  activeCustomers: number;
  conversionRate: number;
}

interface ReportData {
  statusDistribution: Array<{status: string; count: number}>;
  revenueTrend: Array<{month: string; revenue: number}>;
  popularServices: Array<{product_type: string; count: number}>;
  conversionRate: Array<{week: string; total: number; signed: number; rate: number}>;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  proposal_count: number;
}

// New interfaces for additional features
interface TimeSensitiveOffer {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
  category: string;
}

interface FinancingOption {
  id: string;
  name: string;
  provider: string;
  interestRate: number;
  term: number;
  paymentFactor: number;
  dealerFee: number;
  isActive: boolean;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  fileUrl: string;
  version: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// Types
interface SalesRep {
  id: string;
  name: string;
  email: string;
  territory: string;
  proposals: number;
  closed: number;
  conversion: string;
  status: string;
}

// Types
interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  isDefault: boolean;
  status: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalProposals: 0,
    activeCustomers: 0,
    conversionRate: 0
  })
  const [reportData, setReportData] = useState<ReportData>({
    statusDistribution: [],
    revenueTrend: [],
    popularServices: [],
    conversionRate: []
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [proposalTemplates, setProposalTemplates] = useState<ProposalTemplate[]>([]);
  
  // New state variables for additional features
  const [timeSensitiveOffers, setTimeSensitiveOffers] = useState<TimeSensitiveOffer[]>([
    {
      id: "1",
      name: "Free Gutters & Downspouts",
      description: "Book your roof this week and we'll include free gutters & downspouts",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isActive: true,
      usageCount: 24,
      category: "Roofing"
    },
    {
      id: "2",
      name: "10% Off Roofing",
      description: "Sign within 72 hours and receive 10% off your entire roofing project",
      discountPercent: 10,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      isActive: true,
      usageCount: 18,
      category: "Roofing"
    },
    {
      id: "3",
      name: "Free Attic Insulation Labor",
      description: "Add attic insulation today with your roof project and we'll waive the labor cost",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      isActive: true,
      usageCount: 12,
      category: "Roofing"
    },
    {
      id: "4",
      name: "$500 Off Window Package",
      description: "Add a patio door today and we'll discount $500 off your window package",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isActive: true,
      usageCount: 15,
      category: "Windows"
    },
    {
      id: "5",
      name: "Free Entry Door",
      description: "Confirm today and we'll include one free interior entry door from the provided options",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isActive: true,
      usageCount: 9,
      category: "Windows"
    },
    {
      id: "6",
      name: "Free Smart Thermostat",
      description: "Book your HVAC install by Friday and receive a free smart thermostat upgrade",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      isActive: true,
      usageCount: 22,
      category: "HVAC"
    },
    {
      id: "7",
      name: "Free Two-Tone Paint",
      description: "Add exterior painting to your project and we'll include another free color (2 tones)",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      isActive: true,
      usageCount: 8,
      category: "Paint"
    },
    {
      id: "8",
      name: "$200 Garage Door Rebate",
      description: "Sign this week — get a $200 rebate on any garage door model",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isActive: true,
      usageCount: 5,
      category: "Garage Doors"
    },
    {
      id: "9",
      name: "$1000 Off Bundle Discount",
      description: "Add a second service today (like paint or windows), and we'll take $1000 off your total project",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      isActive: true,
      usageCount: 28,
      category: "Bundle"
    },
    {
      id: "10",
      name: "3 Monthly Payments Covered",
      description: "Bundle 2 services today and we'll cover your first 3 monthly payments — delivered as a rebate check",
      discountPercent: 0,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isActive: true,
      usageCount: 17,
      category: "Bundle"
    }
  ])
  
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([
    {
      id: "1",
      name: "4.99% / 84 Months",
      provider: "Greensky",
      interestRate: 4.99,
      term: 84,
      paymentFactor: 0.0142,
      dealerFee: 2.99,
      isActive: true
    },
    {
      id: "2",
      name: "5.99% / 120 Months",
      provider: "Greensky",
      interestRate: 5.99,
      term: 120,
      paymentFactor: 0.0111,
      dealerFee: 5.99,
      isActive: true
    },
    {
      id: "3",
      name: "6.99% / 180 Months",
      provider: "Greensky",
      interestRate: 6.99,
      term: 180,
      paymentFactor: 0.0089,
      dealerFee: 7.99,
      isActive: true
    },
    {
      id: "4",
      name: "9.99% / 20 Years",
      provider: "Homerun PACE",
      interestRate: 9.99,
      term: 240,
      paymentFactor: 0.0088,
      dealerFee: 15.0,
      isActive: true
    },
    {
      id: "5",
      name: "9.99% / 25 Years",
      provider: "Homerun PACE",
      interestRate: 9.99,
      term: 300,
      paymentFactor: 0.0081,
      dealerFee: 18.0,
      isActive: true
    },
    {
      id: "6",
      name: "9.99% / 30 Years",
      provider: "Homerun PACE",
      interestRate: 9.99,
      term: 360,
      paymentFactor: 0.0076,
      dealerFee: 20.0,
      isActive: true
    }
  ])
  
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([
    {
      id: "1",
      name: "Standard Service Agreement",
      description: "Default contract for standard services",
      lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      fileUrl: "/contracts/standard.pdf",
      version: "1.2"
    },
    {
      id: "2",
      name: "HVAC Installation Agreement",
      description: "Specific terms for HVAC installations",
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      fileUrl: "/contracts/hvac.pdf",
      version: "2.0"
    }
  ])
  
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Follow up with Johnson family",
      description: "Call about solar panel installation quote",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      assignedTo: "John Smith",
      status: 'pending',
      priority: 'high'
    },
    {
      id: "2",
      title: "Review Wilson proposal",
      description: "Check pricing on roofing materials",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      assignedTo: "Sarah Johnson",
      status: 'pending',
      priority: 'medium'
    }
  ])

  // Function to fetch dashboard metrics
  const fetchDashboardMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardMetrics(data.metrics);
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    }
  };

  // Function to fetch report data
  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/reports?timeRange=30');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  // Function to fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Function to fetch recent activity (proposals)
  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/proposals');
      const data = await response.json();
      if (data.success) {
        setRecentActivity(data.proposals.slice(0, 4).map((proposal: any) => {
          // Transform proposal data into activity format
          let icon = FileText;
          let color = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
          
          if (proposal.status === 'signed') {
            icon = CheckCircle;
            color = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
          } else if (proposal.status === 'sent') {
            icon = DollarSign;
            color = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
          }
          
          // Format date
          const date = new Date(proposal.created_at);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let timeText = 'Just now';
          if (diffDays > 1) {
            timeText = `${diffDays} days ago`;
          } else if (diffDays === 1) {
            timeText = 'Yesterday';
          } else if (diffTime > 1000 * 60 * 60) {
            timeText = `${Math.floor(diffTime / (1000 * 60 * 60))} hours ago`;
          } else if (diffTime > 1000 * 60) {
            timeText = `${Math.floor(diffTime / (1000 * 60))} minutes ago`;
          }
          
          return {
            title: `Proposal ${proposal.proposal_number}`,
            description: `For ${proposal.customer_name} - Status: ${proposal.status}`,
            time: timeText,
            icon,
            color
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  // Function to fetch sales reps
  const fetchSalesReps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/salesreps');
      const data = await response.json();
      if (data.success) {
        setSalesReps(data.salesReps);
      } else {
        // Fallback to empty array if API fails
        setSalesReps([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching sales reps:", error);
      setSalesReps([]);
      setIsLoading(false);
    }
  };

  // Function to fetch proposal templates
  const fetchProposalTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/proposals/templates');
      const data = await response.json();
      if (data.success) {
        setProposalTemplates(data.templates);
      } else {
        // Fallback to empty array if API fails
        setProposalTemplates([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching proposal templates:", error);
      setProposalTemplates([]);
      setIsLoading(false);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardMetrics(),
        fetchReportData(),
        fetchCustomers(),
        fetchRecentActivity(),
        fetchSalesReps(),
        fetchProposalTemplates() // Add this line
      ]);
      setIsLoading(false);
    };
    
    fetchAllData();
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchDashboardMetrics(),
      fetchReportData(),
      fetchCustomers(),
      fetchRecentActivity(),
      fetchSalesReps(),
      fetchProposalTemplates() // Add this line
    ]);
    setIsLoading(false);
  };

  // Calculate total revenue from proposals data
  const calculateTotalRevenue = () => {
    if (!reportData.revenueTrend || reportData.revenueTrend.length === 0) return "$0";
    
    const totalRevenue = reportData.revenueTrend.reduce((sum, item) => sum + Number(item.revenue), 0);
    return `$${totalRevenue.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="px-1 sm:px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Admin. Here's what's happening with your system today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 sm:flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sales">Sales Reps</TabsTrigger>
            <TabsTrigger value="offers">Time Offers</TabsTrigger>
            <TabsTrigger value="financing">Financing</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  title: "Total Users",
                  value: customers.length.toString(),
                  change: "+12%",
                  changeType: "positive",
                  icon: Users,
                  color: "bg-blue-500",
                },
                {
                  title: "Active Proposals",
                  value: dashboardMetrics.totalProposals.toString(),
                  change: "+24%",
                  changeType: "positive",
                  icon: FileText,
                  color: "bg-green-500",
                },
                {
                  title: "Revenue",
                  value: calculateTotalRevenue(),
                  change: "+8%",
                  changeType: "positive",
                  icon: DollarSign,
                  color: "bg-amber-500",
                },
                {
                  title: "Conversion Rate",
                  value: `${dashboardMetrics.conversionRate}%`,
                  change: "-3%",
                  changeType: "negative",
                  icon: BarChart3,
                  color: "bg-purple-500",
                },
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-full ${stat.color} text-white`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            stat.changeType === "positive"
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {stat.changeType === "positive" ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                          )}
                          {stat.change} from last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Key Metrics</CardTitle>
                    <CardDescription>Performance indicators and system status</CardDescription>
                  </div>
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Active time-sensitive offers metrics */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Time-Sensitive Offers</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="rounded-md border p-3">
                          <div className="text-xl font-bold">{timeSensitiveOffers.filter(o => o.isActive).length}</div>
                          <div className="text-xs text-muted-foreground">Active Offers</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xl font-bold">
                            {timeSensitiveOffers.reduce((sum, offer) => sum + offer.usageCount, 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Uses</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xl font-bold">
                            {Math.max(...timeSensitiveOffers.map(o => o.discountPercent))}%
                          </div>
                          <div className="text-xs text-muted-foreground">Highest Discount</div>
                        </div>
                      </div>
                    </div>

                    {/* Financing options metrics */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Financing Options</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-md border p-3">
                          <div className="text-xl font-bold">{financingOptions.length}</div>
                          <div className="text-xs text-muted-foreground">Available Plans</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xl font-bold">
                            {Math.min(...financingOptions.map(o => o.interestRate))}%
                          </div>
                          <div className="text-xs text-muted-foreground">Lowest Rate</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="text-xl font-bold">
                            {Math.max(...financingOptions.map(o => o.term))} mo
                          </div>
                          <div className="text-xs text-muted-foreground">Longest Term</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions taken in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground" />
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`p-2 rounded-full ${activity.color} mr-3`}>
                            <activity.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">No recent activity found</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Upcoming Reminders</CardTitle>
                  <CardDescription>Follow-ups scheduled in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <RefreshCw className="animate-spin h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : reminders.length > 0 ? (
                      reminders.map((reminder, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`p-1.5 rounded-full mr-3 ${
                            reminder.priority === 'high' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : reminder.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            <Bell className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{reminder.title}</p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                              <p className="text-xs text-muted-foreground">
                                {new Date(reminder.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">No upcoming reminders</div>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Pricing and product catalog</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Total Products</div>
                      <div className="text-sm">{reportData.popularServices.length}</div>
                    </div>
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-24">
                          <RefreshCw className="animate-spin h-5 w-5 text-muted-foreground" />
                        </div>
                      ) : reportData.popularServices.length > 0 ? (
                        reportData.popularServices.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="text-sm">{item.product_type}</div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            >
                              Updated
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">No product data available</div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        window.open("https://docs.google.com/spreadsheets/d/1qcbcLS8bKVOA_tzvHCewjJtSvpWWqrkxMkQKzl1aSsU/edit", "_blank");
                      }}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Google Sheet
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          const response = await fetch('/api/products/export', {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'product-pricing.xlsx';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                          } else {
                            console.error('Failed to export products');
                          }
                        } catch (error) {
                          console.error('Error exporting products:', error);
                        }
                      }}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Pricing
                      </Button>
                      <Button size="sm" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.xlsx,.csv';
                        fileInput.onchange = async (e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            try {
                              const response = await fetch('/api/products/import', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                alert('Products imported successfully!');
                                // Refresh the data
                                window.location.reload();
                              } else {
                                alert('Failed to import products. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error importing products:', error);
                              alert('An error occurred during import.');
                            }
                          }
                        };
                        fileInput.click();
                      }}>
                        <span className="mr-2">+</span> Add Product
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Access common admin functions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      User Management
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Reports
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Contracts
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Financing Options
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Timer className="mr-2 h-4 w-4" />
                      Time-Sensitive Offers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product & Pricing Management</CardTitle>
                <CardDescription>Update product details, pricing, and manage your catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Product Catalog</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        window.open("https://docs.google.com/spreadsheets/d/1qcbcLS8bKVOA_tzvHCewjJtSvpWWqrkxMkQKzl1aSsU/edit", "_blank");
                      }}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Google Sheet
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          const response = await fetch('/api/products/export', {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'product-pricing.xlsx';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                          } else {
                            console.error('Failed to export products');
                          }
                        } catch (error) {
                          console.error('Error exporting products:', error);
                        }
                      }}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Pricing
                      </Button>
                      <Button size="sm" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.xlsx,.csv';
                        fileInput.onchange = async (e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            try {
                              const response = await fetch('/api/products/import', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                alert('Products imported successfully!');
                                // Refresh the data
                                window.location.reload();
                              } else {
                                alert('Failed to import products. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error importing products:', error);
                              alert('An error occurred during import.');
                            }
                          }
                        };
                        fileInput.click();
                      }}>
                        <span className="mr-2">+</span> Add Product
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-3">Product Name</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-1 text-center">Category</div>
                        <div className="col-span-1 text-center">Base Cost</div>
                        <div className="col-span-1 text-center">Retail Price</div>
                        <div className="col-span-1 text-center">Visibility</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>
                      
                      {[
                        {
                          name: "Solar Panel System - 5kW",
                          description: "Complete 5kW solar panel system including installation",
                          category: "Solar",
                          baseCost: 8500,
                          retailPrice: 12000,
                          visible: true
                        },
                        {
                          name: "HVAC System - 3 Ton",
                          description: "3 Ton high-efficiency HVAC system with installation",
                          category: "HVAC",
                          baseCost: 4200,
                          retailPrice: 6500,
                          visible: true
                        },
                        {
                          name: "Attic Insulation - R30",
                          description: "R30 attic insulation for up to 1500 sq ft",
                          category: "Insulation",
                          baseCost: 1200,
                          retailPrice: 1800,
                          visible: true
                        },
                        {
                          name: "Roofing - Shingle Replacement",
                          description: "Asphalt shingle roof replacement per square (100 sq ft)",
                          category: "Roofing",
                          baseCost: 350,
                          retailPrice: 550,
                          visible: true
                        }
                      ].map((product, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                          <div className="col-span-3 font-medium">{product.name}</div>
                          <div className="col-span-3 text-sm text-muted-foreground">{product.description}</div>
                          <div className="col-span-1 text-center">
                            <Badge variant="outline">{product.category}</Badge>
                          </div>
                          <div className="col-span-1 text-center">${product.baseCost}</div>
                          <div className="col-span-1 text-center">${product.retailPrice}</div>
                          <div className="col-span-1 text-center">
                            <Badge
                              className={
                                product.visible
                                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400"
                              }
                            >
                              {product.visible ? "Visible" : "Hidden"}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex justify-center space-x-2">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Pricing Settings</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="text-sm font-medium mb-3">Pricing Display Options</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Show line-item pricing</span>
                              <div className="border h-6 w-12 rounded-full bg-primary relative">
                                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Show total price</span>
                              <div className="border h-6 w-12 rounded-full bg-primary relative">
                                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Show competitor price comparison</span>
                              <div className="border h-6 w-12 rounded-full bg-primary relative">
                                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <h4 className="text-sm font-medium mb-3">Default Margin Settings</h4>
                          <div className="space-y-3">
                            <div className="flex flex-col space-y-1">
                              <label className="text-sm">Default Markup (%)</label>
                              <input
                                type="number"
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                defaultValue="40"
                              />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-sm">Minimum Margin (%)</label>
                              <input
                                type="number"
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                defaultValue="20"
                              />
                            </div>
                            <Button size="sm" className="mt-2">
                              Save Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time-Sensitive Offers</CardTitle>
                <CardDescription>Manage promotional offers with expiry dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Active Offers</h3>
                    <Button size="sm" onClick={() => {
                      // Simple alert for now, but would be a modal dialog in a full implementation
                      const name = prompt("Enter offer name:");
                      const description = prompt("Enter offer description:");
                      const category = prompt("Enter offer category (Roofing, Windows, HVAC, Paint, Garage Doors, Bundle):");
                      const expiry = prompt("Enter expiry in days:");
                      
                      if (name && description && category) {
                        const newOffer: TimeSensitiveOffer = {
                          id: String(timeSensitiveOffers.length + 1),
                          name,
                          description,
                          discountPercent: 0,
                          expiryDate: new Date(Date.now() + parseInt(expiry || "7") * 24 * 60 * 60 * 1000).toISOString(),
                          isActive: true,
                          usageCount: 0,
                          category
                        };
                        
                        setTimeSensitiveOffers([...timeSensitiveOffers, newOffer]);
                        alert("Offer added successfully!");
                      }
                    }}>
                      <span className="mr-2">+</span> New Offer
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : timeSensitiveOffers.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-1 text-center">Discount</div>
                        <div className="col-span-2 text-center">Expiry Date</div>
                        <div className="col-span-1 text-center">Usage</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-center">Actions</div>
                      </div>
                      
                      {timeSensitiveOffers.map((offer, index) => {
                        const expiryDate = new Date(offer.expiryDate);
                        const now = new Date();
                        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysLeft <= 3 && daysLeft > 0;
                        const isExpired = daysLeft <= 0;
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                            <div className="col-span-3 font-medium">{offer.name}</div>
                            <div className="col-span-3 text-sm text-muted-foreground">{offer.description}</div>
                            <div className="col-span-1 text-center font-medium">{offer.discountPercent}%</div>
                            <div className="col-span-2 text-center text-sm">
                              <span className={isExpiring ? 'text-amber-600' : isExpired ? 'text-red-600' : ''}>
                                {expiryDate.toLocaleDateString()}
                                {isExpiring && !isExpired && (
                                  <span className="block text-xs text-amber-600 whitespace-nowrap">({daysLeft} days left)</span>
                                )}
                                {isExpired && (
                                  <span className="block text-xs text-red-600">Expired</span>
                                )}
                              </span>
                            </div>
                            <div className="col-span-1 text-center text-sm">{offer.usageCount}</div>
                            <div className="col-span-1 text-center">
                              <Badge
                                className={
                                  offer.isActive && !isExpired
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400"
                                }
                              >
                                {offer.isActive && !isExpired ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="col-span-1 text-center">
                              <div className="flex justify-center space-x-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <span className="sr-only">Edit</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <span className="sr-only">Delete</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No offers available</div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Offer Performance</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {timeSensitiveOffers.reduce((sum, offer) => sum + offer.usageCount, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Total Offer Uses</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {timeSensitiveOffers.filter(o => o.isActive).length}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Active Offers</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {Math.max(...timeSensitiveOffers.map(o => o.usageCount))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Most Used Offer</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {Math.max(...timeSensitiveOffers.map(o => o.discountPercent))}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Highest Discount</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financing Options</CardTitle>
                <CardDescription>Manage Greensky and Homerun PACE financing plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Available Plans</h3>
                    <Button size="sm">
                      <span className="mr-2">+</span> Add Plan
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : financingOptions.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-3">Plan Name</div>
                        <div className="col-span-2">Provider</div>
                        <div className="col-span-1 text-center">Interest</div>
                        <div className="col-span-1 text-center">Term</div>
                        <div className="col-span-2 text-center">Payment Factor</div>
                        <div className="col-span-1 text-center">Dealer Fee</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-center">Actions</div>
                      </div>
                      
                      {financingOptions.map((plan, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                          <div className="col-span-3 font-medium">{plan.name}</div>
                          <div className="col-span-2 text-sm">
                            <Badge variant="outline">{plan.provider}</Badge>
                          </div>
                          <div className="col-span-1 text-center">{plan.interestRate}%</div>
                          <div className="col-span-1 text-center">{plan.term} mo</div>
                          <div className="col-span-2 text-center text-sm">{plan.paymentFactor}</div>
                          <div className="col-span-1 text-center text-sm">{plan.dealerFee}%</div>
                          <div className="col-span-1 text-center">
                            <Badge
                              className={
                                plan.isActive
                                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400"
                              }
                            >
                              {plan.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="col-span-1 text-center">
                            <div className="flex justify-center space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Edit</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No financing plans available</div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Sample Payment Calculator</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="loan-amount" className="text-sm font-medium">
                            Loan Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input
                              type="number"
                              id="loan-amount"
                              className="w-full rounded-md border border-input bg-background px-8 py-2"
                              placeholder="10000"
                              defaultValue="10000"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">Financing Plan</label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                              {financingOptions.map((plan, index) => (
                                <option key={index} value={plan.id}>
                                  {plan.name} ({plan.term} mo @ {plan.interestRate}%)
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex flex-col space-y-1">
                            <label className="text-sm font-medium">Dealer Fee</label>
                            <div className="flex items-center rounded-md border bg-muted px-3 py-2">
                              <span className="text-muted-foreground mr-1">
                                {financingOptions[0]?.dealerFee || 0}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (${(10000 * (financingOptions[0]?.dealerFee || 0) / 100).toFixed(2)})
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <Button className="w-full">Calculate</Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-6 space-y-6">
                        <h4 className="text-lg font-semibold">Payment Summary</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Loan Amount:</span>
                            <span className="font-medium">$10,000.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Term:</span>
                            <span className="font-medium">{financingOptions[0]?.term || 60} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Interest Rate:</span>
                            <span className="font-medium">{financingOptions[0]?.interestRate || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Payment Factor:</span>
                            <span className="font-medium">{financingOptions[0]?.paymentFactor || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Dealer Fee:</span>
                            <span className="font-medium">{financingOptions[0]?.dealerFee || 0}%</span>
                          </div>
                          
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between">
                              <span className="font-medium">Monthly Payment:</span>
                              <span className="text-lg font-bold">
                                ${((10000 * (financingOptions[0]?.paymentFactor || 0))).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-muted-foreground">Dealer Cost:</span>
                              <span className="text-sm font-medium">
                                ${(10000 * (financingOptions[0]?.dealerFee || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Detailed analytics and reporting for your system</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[400px]">
                    <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                  </div>
                ) : reportData.statusDistribution.length > 0 ? (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Proposal Status Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {reportData.statusDistribution.map((status, index) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <div className="text-xl font-bold">{status.count}</div>
                              <div className="text-sm text-muted-foreground capitalize">{status.status}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Popular Services</h3>
                      <div className="space-y-3">
                        {reportData.popularServices.map((service, index) => {
                          // Get the base value for calculating percentage and add a safe fallback
                          const baseValue = reportData.popularServices[0]?.count || 1; // Default to 1 if not available
                          
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="text-sm">{service.product_type}</div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{service.count}</span>
                                <Progress value={(service.count / baseValue) * 100} className="w-32 h-2" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>                      <h3 className="text-lg font-medium mb-4">Conversion Metrics</h3>                      <div className="grid grid-cols-2 gap-4">                        <Card>                          <CardContent className="pt-6">                            <div className="text-2xl font-bold">{dashboardMetrics.conversionRate}%</div>                            <div className="text-sm text-muted-foreground">Overall Conversion Rate</div>                            <Progress value={dashboardMetrics.conversionRate} className="mt-2 h-2" />                          </CardContent>                        </Card>                        <Card>                          <CardContent className="pt-6">                            <div className="text-2xl font-bold">42%</div>                            <div className="text-sm text-muted-foreground">Upsell Success Rate</div>                            <Progress value={42} className="mt-2 h-2" />                          </CardContent>                        </Card>                      </div>                                            <div className="mt-4">                        <h4 className="text-sm font-medium mb-2">Conversion by Product Category</h4>                        <div className="border rounded-lg">                          <div className="grid grid-cols-4 gap-2 bg-muted px-4 py-2 font-medium text-xs">                            <div>Category</div>                            <div className="text-center">Proposals</div>                            <div className="text-center">Signed</div>                            <div className="text-center">Rate</div>                          </div>                          {[                            { category: "Solar", proposals: 48, signed: 22, rate: 45.8 },                            { category: "HVAC", proposals: 36, signed: 19, rate: 52.8 },                            { category: "Insulation", proposals: 29, signed: 15, rate: 51.7 },                            { category: "Roofing", proposals: 15, signed: 6, rate: 40.0 }                          ].map((item, index) => (                            <div key={index} className="grid grid-cols-4 gap-2 px-4 py-2 border-t text-sm items-center">                              <div>{item.category}</div>                              <div className="text-center">{item.proposals}</div>                              <div className="text-center">{item.signed}</div>                              <div className="text-center font-medium">{item.rate.toFixed(1)}%</div>                            </div>                          ))}                        </div>                      </div>                    </div>                                        <div className="mt-6">                      <h3 className="text-lg font-medium mb-4">Sales Pipeline</h3>                      <div className="border rounded-lg p-4">                        <div className="space-y-4">                          <div className="flex justify-between text-sm">                            <span>New Leads</span>                            <span className="font-medium">68</span>                          </div>                          <Progress value={68} max={200} className="h-3" />                                                    <div className="flex justify-between text-sm">                            <span>Active Proposals</span>                            <span className="font-medium">{dashboardMetrics.totalProposals}</span>                          </div>                          <Progress value={dashboardMetrics.totalProposals} max={200} className="h-3" />                                                    <div className="flex justify-between text-sm">                            <span>Closing Stage</span>                            <span className="font-medium">24</span>                          </div>                          <Progress value={24} max={200} className="h-3" />                                                    <div className="flex justify-between text-sm">                            <span>Won Deals</span>                            <span className="font-medium">36</span>                          </div>                          <Progress value={36} max={200} className="h-3 bg-green-200" />                        </div>                      </div>                    </div>                  </div>                ) : (                  <div className="text-center text-muted-foreground py-8">No analytics data available</div>                )}              </CardContent>            </Card>          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Detailed history of all system activities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, index) => {
                      // Use real data for as many items as we have, then fill with placeholders
                      const activity = index < recentActivity.length ? recentActivity[index] : {
                        title: "System activity",
                        description: "Regular system activity",
                        time: "Some time ago",
                        icon: Clock,
                        color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
                      };
                      
                      return (
                        <div key={index} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={`https://avatar.vercel.sh/user-${index}`} />
                            <AvatarFallback>U{index}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">No activity data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important notifications and system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Email Service Degraded",
                      description: "The email notification service is experiencing delays",
                      severity: "warning",
                      time: "2 hours ago",
                    },
                    {
                      title: "Database Backup Completed",
                      description: "Automatic database backup completed successfully",
                      severity: "info",
                      time: "Yesterday",
                    },
                    {
                      title: "System Update Available",
                      description: "A new system update is available for installation",
                      severity: "info",
                      time: "3 days ago",
                    },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md ${
                        alert.severity === "warning"
                          ? "bg-amber-50 dark:bg-amber-900/20"
                          : "bg-blue-50 dark:bg-blue-900/20"
                      }`}
                    >
                      <div className="flex items-start">
                        {alert.severity === "warning" ? (
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              alert.severity === "warning"
                                ? "text-amber-800 dark:text-amber-300"
                                : "text-blue-800 dark:text-blue-300"
                            }`}
                          >
                            {alert.title}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              alert.severity === "warning"
                                ? "text-amber-700 dark:text-amber-400"
                                : "text-blue-700 dark:text-blue-400"
                            }`}
                          >
                            {alert.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <Clock
                              className={`h-3 w-3 mr-1 ${
                                alert.severity === "warning"
                                  ? "text-amber-600 dark:text-amber-500"
                                  : "text-blue-600 dark:text-blue-500"
                              }`}
                            />
                            <p
                              className={`text-xs ${
                                alert.severity === "warning"
                                  ? "text-amber-600 dark:text-amber-500"
                                  : "text-blue-600 dark:text-blue-500"
                              }`}
                            >
                              {alert.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contract Templates</CardTitle>
                <CardDescription>Manage contract templates and versions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Available Templates</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.pdf,.docx';
                        fileInput.onchange = async (e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            try {
                              const response = await fetch('/api/contracts/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                alert('Contract template uploaded successfully!');
                                // Add contract to list with mock data
                                const newContract: ContractTemplate = {
                                  id: String(contractTemplates.length + 1),
                                  name: file.name.split('.')[0],
                                  description: "Recently uploaded contract template",
                                  lastUpdated: new Date().toISOString(),
                                  fileUrl: `/contracts/${file.name}`,
                                  version: "1.0"
                                };
                                setContractTemplates([...contractTemplates, newContract]);
                              } else {
                                alert('Failed to upload contract. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error uploading contract:', error);
                              alert('An error occurred during upload.');
                            }
                          }
                        };
                        fileInput.click();
                      }}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Template
                      </Button>
                      <Button size="sm">
                        <span className="mr-2">+</span> New Template
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : contractTemplates.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-3">Template Name</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-1 text-center">Version</div>
                        <div className="col-span-2 text-center">Last Updated</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>
                      
                      {contractTemplates.map((template, index) => {
                        const lastUpdated = new Date(template.lastUpdated);
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                            <div className="col-span-3 font-medium">{template.name}</div>
                            <div className="col-span-4 text-sm text-muted-foreground">{template.description}</div>
                            <div className="col-span-1 text-center">
                              <Badge variant="outline">v{template.version}</Badge>
                            </div>
                            <div className="col-span-2 text-center text-sm">
                              {lastUpdated.toLocaleDateString()}
                            </div>
                            <div className="col-span-2 text-center">
                              <div className="flex justify-center space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  window.open(template.fileUrl, '_blank');
                                }}>
                                  <span className="sr-only">View</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 mr-1"
                                  >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => {
                                  // For now, we'll just show an alert but in a real app this would open an editor
                                  alert(`Editing ${template.name} - v${template.version}`);
                                }}>
                                  <span className="sr-only">Edit</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 mr-1"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No contract templates available</div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Version History</h3>
                    
                    <div className="border rounded-lg">
                      <div className="p-4 border-b">
                        <div className="flex items-center space-x-2">
                          <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                            {contractTemplates.map((template, index) => (
                              <option key={index} value={template.id}>{template.name}</option>
                            ))}
                          </select>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Load History
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="relative pl-6 border-l">
                          {/* Version history timeline */}
                          <div className="mb-8 relative">
                            <div className="absolute -left-[27px] top-1 h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <h4 className="font-semibold">Version 2.0</h4>
                                <span className="text-sm text-muted-foreground">July 15, 2023</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Major update with new legal clauses and updated warranty information.
                              </p>
                              <div className="flex space-x-2 mt-2">
                                <Button variant="outline" size="sm">Compare</Button>
                                <Button variant="outline" size="sm">Download</Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-8 relative">
                            <div className="absolute -left-[27px] top-1 h-4 w-4 rounded-full border-4 border-slate-300 bg-background"></div>
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <h4 className="font-semibold">Version 1.2</h4>
                                <span className="text-sm text-muted-foreground">May 3, 2023</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Minor updates to terms and conditions section.
                              </p>
                              <div className="flex space-x-2 mt-2">
                                <Button variant="outline" size="sm">Compare</Button>
                                <Button variant="outline" size="sm">Download</Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <div className="absolute -left-[27px] top-1 h-4 w-4 rounded-full border-4 border-slate-300 bg-background"></div>
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <h4 className="font-semibold">Version 1.0</h4>
                                <span className="text-sm text-muted-foreground">February 10, 2023</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Initial template creation.
                              </p>
                              <div className="flex space-x-2 mt-2">
                                <Button variant="outline" size="sm">Download</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reminders & Follow-ups</CardTitle>
                <CardDescription>Manage calendar reminders and follow-up tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Upcoming Reminders</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        window.open('https://calendar.google.com/calendar/u/0/r', '_blank');
                      }}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar View
                      </Button>
                      <Button size="sm">
                        <span className="mr-2">+</span> New Reminder
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : reminders.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-1 text-center">Priority</div>
                        <div className="col-span-3">Title</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2">Assigned To</div>
                        <div className="col-span-2 text-center">Due Date</div>
                        <div className="col-span-1 text-center">Actions</div>
                      </div>
                      
                      {reminders.map((reminder, index) => {
                        const dueDate = new Date(reminder.dueDate);
                        const now = new Date();
                        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;
                        const isOverdue = daysUntilDue < 0;
                        
                        const priorityColor = 
                          reminder.priority === 'high' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : reminder.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                            <div className="col-span-1 flex justify-center">
                              <div className={`p-1.5 rounded-full ${priorityColor}`}>
                                <Bell className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <div className="col-span-3 font-medium">{reminder.title}</div>
                            <div className="col-span-3 text-sm text-muted-foreground">{reminder.description}</div>
                            <div className="col-span-2 text-sm">{reminder.assignedTo}</div>
                            <div className="col-span-2 text-center text-sm">
                              <span className={isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : ''}>
                                {dueDate.toLocaleDateString()}
                                {isOverdue && (
                                  <span className="block text-xs text-red-600">Overdue</span>
                                )}
                                {isDueSoon && !isOverdue && (
                                  <span className="block text-xs text-amber-600">Due soon</span>
                                )}
                              </span>
                            </div>
                            <div className="col-span-1 text-center">
                              <div className="flex justify-center space-x-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <path d="m9 11 3 3L22 4" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No upcoming reminders</div>
                  )}
                  
                  <div className="mt-8 grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Create Reminder</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            placeholder="Follow up with customer"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px]"
                            placeholder="Details about the follow-up"
                          ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <input
                              type="date"
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Assigned To</label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                              <option>John Smith</option>
                              <option>Sarah Johnson</option>
                              <option>Mike Chen</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Priority</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="priority" className="rounded-full" />
                              <span>Low</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="priority" className="rounded-full" defaultChecked />
                              <span>Medium</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="priority" className="rounded-full" />
                              <span>High</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button className="w-full" onClick={() => {
                            const title = document.querySelector('input[type="text"]') as HTMLInputElement;
                            const description = document.querySelector('textarea') as HTMLTextAreaElement;
                            const dueDate = document.querySelector('input[type="date"]') as HTMLInputElement;
                            const assignedTo = document.querySelector('select') as HTMLSelectElement;
                            const priority = document.querySelector('input[name="priority"]:checked') as HTMLInputElement;
                            
                            if (title && description && dueDate && assignedTo && priority) {
                              const newReminder: Reminder = {
                                id: String(reminders.length + 1),
                                title: title.value,
                                description: description.value,
                                dueDate: new Date(dueDate.value).toISOString(),
                                assignedTo: assignedTo.value,
                                status: 'pending',
                                priority: priority.value as 'low' | 'medium' | 'high'
                              };
                              
                              setReminders([...reminders, newReminder]);
                              alert('Reminder created successfully!');
                              
                              // Clear form
                              title.value = '';
                              description.value = '';
                              dueDate.value = '';
                            } else {
                              alert('Please fill in all required fields');
                            }
                          }}>
                            Create Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                                        <div>                      <h3 className="text-lg font-medium mb-4">Calendar Integration</h3>                      <div className="border rounded-lg p-6 space-y-4">                        <div className="flex items-center space-x-2">                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">                            <svg                              xmlns="http://www.w3.org/2000/svg"                              viewBox="0 0 24 24"                              fill="none"                              stroke="currentColor"                              strokeWidth="2"                              strokeLinecap="round"                              strokeLinejoin="round"                              className="h-4 w-4"                            >                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />                              <path d="m9 11 3 3L22 4" />                            </svg>                          </div>                          <div>                            <h4 className="font-medium">Google Calendar Connected</h4>                            <p className="text-xs text-muted-foreground">Last synced: Today, 10:42 AM</p>                          </div>                        </div>                                                <div className="space-y-3">                          <div className="flex items-center justify-between">                            <span className="text-sm">Auto-sync reminders</span>                            <div className="border h-6 w-12 rounded-full bg-primary relative">                              <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>                            </div>                          </div>                                                    <div className="flex items-center justify-between">                            <span className="text-sm">Notify 24h before due date</span>                            <div className="border h-6 w-12 rounded-full bg-primary relative">                              <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>                            </div>                          </div>                                                    <div className="flex items-center justify-between">                            <span className="text-sm">Show in shared team calendar</span>                            <div className="border h-6 w-12 rounded-full bg-muted relative">                              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"></div>                            </div>                          </div>                        </div>                                                <div className="pt-2 flex space-x-2">                          <Button variant="outline" className="flex-1">Sync Now</Button>                          <Button variant="outline" className="flex-1">Settings</Button>                        </div>                      </div>                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Default Content</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Default Scope of Work Text</label>
                              <textarea
                                className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
                                defaultValue="Our comprehensive service includes professional installation and setup of all equipment, testing and commissioning, and a thorough walkthrough of the system operation with the customer..."
                              ></textarea>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Default Terms & Conditions</label>
                              <textarea
                                className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
                                defaultValue="This proposal is valid for 30 days from the date issued. All work to be completed in a workmanlike manner according to standard practices. Any alteration or deviation from the above specifications involving extra costs will only be executed upon written orders and will become an extra charge over and above the estimate..."
                              ></textarea>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Auto-Generated Notes</label>
                                <div className="border h-6 w-12 rounded-full bg-primary relative">
                                  <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Enable system to automatically generate notes based on selected products and services
                              </p>
                            </div>
                            
                            <Button size="sm" className="mt-2">
                              Save Default Content
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Reps</CardTitle>
                <CardDescription>Manage sales representatives and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Sales Representatives</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={fetchSalesReps}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                      <Button size="sm">
                        <span className="mr-2">+</span> Add Sales Rep
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : salesReps.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Territory</div>
                        <div className="col-span-1 text-center">Proposals</div>
                        <div className="col-span-1 text-center">Closed</div>
                        <div className="col-span-1 text-center">Conversion</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-center">Actions</div>
                      </div>
                      
                      {salesReps.map((rep, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                          <div className="col-span-3 font-medium">{rep.name}</div>
                          <div className="col-span-3 text-sm">{rep.email}</div>
                          <div className="col-span-2 text-sm">{rep.territory}</div>
                          <div className="col-span-1 text-center">{rep.proposals}</div>
                          <div className="col-span-1 text-center">{rep.closed}</div>
                          <div className="col-span-1 text-center">{rep.conversion}</div>
                          <div className="col-span-1 text-center">{rep.status}</div>
                          <div className="col-span-1 text-center">
                            <div className="flex justify-center space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Edit</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No sales representatives found. <Button size="sm" variant="link" onClick={fetchSalesReps}>Refresh</Button>
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Sales Performance Metrics</h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {salesReps.reduce((sum, rep) => sum + rep.proposals, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Total Proposals</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {salesReps.reduce((sum, rep) => sum + rep.closed, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Total Closed Deals</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {salesReps.reduce((sum, rep) => sum + rep.closed / rep.proposals * 100, 0)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Average Conversion Rate</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {salesReps.reduce((sum, rep) => sum + rep.closed / rep.proposals * 100, 0)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Average Upsell Rate</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Templates</CardTitle>
                <CardDescription>Manage proposal templates and versions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Available Templates</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.pdf,.docx';
                        fileInput.onchange = async (e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            try {
                              const response = await fetch('/api/contracts/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                alert('Contract template uploaded successfully!');
                                // Add contract to list with mock data
                                const newContract: ContractTemplate = {
                                  id: String(contractTemplates.length + 1),
                                  name: file.name.split('.')[0],
                                  description: "Recently uploaded contract template",
                                  lastUpdated: new Date().toISOString(),
                                  fileUrl: `/contracts/${file.name}`,
                                  version: "1.0"
                                };
                                setContractTemplates([...contractTemplates, newContract]);
                              } else {
                                alert('Failed to upload contract. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error uploading contract:', error);
                              alert('An error occurred during upload.');
                            }
                          }
                        };
                        fileInput.click();
                      }}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Template
                      </Button>
                      <Button size="sm">
                        <span className="mr-2">+</span> New Template
                      </Button>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-60">
                      <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : contractTemplates.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 bg-muted px-4 py-3 font-medium text-sm">
                        <div className="col-span-3">Template Name</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-1 text-center">Version</div>
                        <div className="col-span-2 text-center">Last Updated</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>
                      
                      {contractTemplates.map((template, index) => {
                        const lastUpdated = new Date(template.lastUpdated);
                        
                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center">
                            <div className="col-span-3 font-medium">{template.name}</div>
                            <div className="col-span-4 text-sm text-muted-foreground">{template.description}</div>
                            <div className="col-span-1 text-center">
                              <Badge variant="outline">v{template.version}</Badge>
                            </div>
                            <div className="col-span-2 text-center text-sm">
                              {lastUpdated.toLocaleDateString()}
                            </div>
                            <div className="col-span-2 text-center">
                              <div className="flex justify-center space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  window.open(template.fileUrl, '_blank');
                                }}>
                                  <span className="sr-only">View</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 mr-1"
                                  >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8" onClick={() => {
                                  // For now, we'll just show an alert but in a real app this would open an editor
                                  alert(`Editing ${template.name} - v${template.version}`);
                                }}>
                                  <span className="sr-only">Edit</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 mr-1"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No proposal templates available</div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Default Branding</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="h-24 w-24 rounded border flex items-center justify-center text-muted-foreground">
                                Logo
                              </div>
                            </div>
                            <div className="flex justify-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                              </Button>
                              <Button variant="outline" size="sm">
                                Reset
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex flex-col space-y-1">
                              <label className="text-sm font-medium">Primary Color</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  defaultValue="#16A34A"
                                  className="w-10 h-8 rounded-md border border-input bg-background"
                                />
                                <input
                                  type="text"
                                  defaultValue="#16A34A"
                                  className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <label className="text-sm font-medium">Header Text</label>
                              <input
                                type="text"
                                defaultValue="Evergreen Energy"
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </div>
                            
                            <Button size="sm" className="mt-2">
                              Save Branding
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
 