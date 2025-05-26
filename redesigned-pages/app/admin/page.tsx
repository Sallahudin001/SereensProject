"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Admin. Here's what's happening with your system today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
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
                value: "42",
                change: "+12%",
                changeType: "positive",
                icon: Users,
                color: "bg-blue-500",
              },
              {
                title: "Active Proposals",
                value: "128",
                change: "+24%",
                changeType: "positive",
                icon: FileText,
                color: "bg-green-500",
              },
              {
                title: "Revenue",
                value: "$24,500",
                change: "+8%",
                changeType: "positive",
                icon: DollarSign,
                color: "bg-amber-500",
              },
              {
                title: "Conversion Rate",
                value: "68%",
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
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Key metrics and performance indicators for your system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/70" />
                    <p className="mt-2 text-sm text-muted-foreground">Analytics chart will appear here</p>
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
                  {[
                    {
                      title: "Pricing Updated",
                      description: "HVAC service pricing was updated",
                      time: "2 hours ago",
                      icon: DollarSign,
                      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    },
                    {
                      title: "New User Added",
                      description: "John Smith was added as a sales rep",
                      time: "Yesterday",
                      icon: Users,
                      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    },
                    {
                      title: "Permission Changed",
                      description: "Sales team permissions were updated",
                      time: "2 days ago",
                      icon: Shield,
                      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                    },
                    {
                      title: "System Settings",
                      description: "Email notification settings changed",
                      time: "3 days ago",
                      icon: Settings,
                      color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
                    },
                  ].map((activity, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Overview of system users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Users</div>
                    <div className="text-sm">42</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div>Administrators</div>
                      <div>4</div>
                    </div>
                    <Progress value={10} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div>Sales Representatives</div>
                      <div>28</div>
                    </div>
                    <Progress value={67} className="h-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div>Support Staff</div>
                      <div>10</div>
                    </div>
                    <Progress value={23} className="h-1" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Management</CardTitle>
                <CardDescription>Recent pricing updates and controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-sm">2 days ago</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { service: "Roofing", status: "Updated" },
                      { service: "HVAC", status: "Updated" },
                      { service: "Windows & Doors", status: "Pending" },
                      { service: "Solar Panels", status: "Pending" },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-sm">{item.service}</div>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "Updated"
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Update Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Overall Status</div>
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      Healthy
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        component: "Database",
                        status: "Operational",
                        icon: CheckCircle,
                        color: "text-green-500",
                      },
                      {
                        component: "API Services",
                        status: "Operational",
                        icon: CheckCircle,
                        color: "text-green-500",
                      },
                      {
                        component: "Email Service",
                        status: "Degraded",
                        icon: AlertCircle,
                        color: "text-amber-500",
                      },
                      {
                        component: "Storage",
                        status: "Operational",
                        icon: CheckCircle,
                        color: "text-green-500",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-sm">{item.component}</div>
                        <div className="flex items-center">
                          <item.icon className={`h-4 w-4 ${item.color} mr-1.5`} />
                          <span className="text-xs">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed analytics and reporting for your system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/70" />
                  <p className="mt-2 text-sm text-muted-foreground">Detailed analytics will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Detailed history of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={`https://avatar.vercel.sh/user-${index}`} />
                      <AvatarFallback>U{index}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {["Admin", "John Smith", "Sarah Johnson", "Mike Chen"][index % 4]}{" "}
                        {
                          [
                            "updated pricing for HVAC services",
                            "added a new user to the system",
                            "modified user permissions",
                            "generated a new proposal",
                            "updated system settings",
                          ][index % 5]
                        }
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                        <p className="text-xs text-muted-foreground">
                          {["Just now", "5 minutes ago", "1 hour ago", "Yesterday", "2 days ago"][index % 5]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      </Tabs>
    </div>
  )
}
