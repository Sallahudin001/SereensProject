"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import { Plus, Search, Mail, Phone, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  proposal_count: number
  created_at: string
}

export default function CustomersPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const tableSection = useScrollAnimation()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)

        const result = await fetch("/api/customers")
        const data = await result.json()

        if (data.success) {
          setCustomers(data.customers)
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm)),
  )

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
                        <Users className="w-8 h-8 mr-3" />
                        Customer Management
                      </CardTitle>
                      <p className="text-green-100 text-sm sm:text-base">Manage all your customers and track their information</p>
                    </div>
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
                <Card className="mb-6 border-none shadow-md">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                    <CardTitle className="flex items-center text-gray-800">
                      <Search className="w-6 h-6 mr-3 text-emerald-600" /> Search Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      <Input
                        placeholder="Search by name, email or phone..."
                        className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <motion.div
                  ref={tableSection.ref}
                  initial="hidden"
                  animate={tableSection.isInView ? "visible" : "hidden"}
                  variants={fadeIn}
                  className="flex-1"
                >
                  <Card className="border-none shadow-md overflow-hidden flex-1 flex flex-col">
                    <CardContent className="p-0 flex-1">
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="text-center py-12 px-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-emerald-500" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No customers found</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {customers.length === 0 ? 
                              "Create your first customer to get started." : 
                              "No customers match your search criteria."}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-emerald-50">
                                <th className="text-left py-3 px-4 font-medium text-emerald-800">Name</th>
                                <th className="text-left py-3 px-4 font-medium text-emerald-800">Email</th>
                                <th className="text-left py-3 px-4 font-medium text-emerald-800">Phone</th>
                                <th className="text-left py-3 px-4 font-medium text-emerald-800">Address</th>
                                <th className="text-left py-3 px-4 font-medium text-emerald-800">Proposals</th>
                                <th className="text-left py-3 px-4 font-medium text-emerald-800">Created</th>
                              </tr>
                            </thead>
                            <motion.tbody
                              initial="hidden"
                              animate={tableSection.isInView ? "visible" : "hidden"}
                              variants={staggerContainer}
                            >
                              {filteredCustomers.map((customer, index) => (
                                <motion.tr 
                                  key={index} 
                                  className="border-b hover:bg-emerald-50 transition-colors" 
                                  variants={tableRowVariants}
                                >
                                  <td className="py-3 px-4 font-medium">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8 border-2 border-emerald-50 shadow-sm">
                                        <AvatarImage src={`https://avatar.vercel.sh/${customer.name}`} />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-800">{customer.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span>{customer.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-emerald-500" />
                                      <span className="text-sm">{customer.email}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {customer.phone ? (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3 text-emerald-500" />
                                        <span className="text-sm">{customer.phone}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">N/A</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-sm">{customer.address || "N/A"}</td>
                                  <td className="py-3 px-4">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                                      {customer.proposal_count || 0}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">{formatDate(customer.created_at)}</td>
                                </motion.tr>
                              ))}
                            </motion.tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
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
