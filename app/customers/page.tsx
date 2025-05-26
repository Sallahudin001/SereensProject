"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import { Plus, Search, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
    <DashboardLayout>
      <motion.div
        ref={headerSection.ref}
        initial="hidden"
        animate={headerSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold">Customers</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {/* <Link href="/proposals/new">
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="mr-2 h-4 w-4" /> New Customer
            </Button>
          </Link> */}
        </motion.div>
      </motion.div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email or phone..."
              className="pl-10"
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
      >
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {customers.length === 0 ? (
                  <>
                    No customers found. Create your first customer to get started.
                    <div className="mt-4">
                      <Link href="/proposals/new">
                        <Button className="bg-rose-600 hover:bg-rose-700">
                          <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  "No customers match your search criteria."
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Phone</th>
                      <th className="text-left py-3 px-4 font-medium">Address</th>
                      <th className="text-left py-3 px-4 font-medium">Proposals</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    initial="hidden"
                    animate={tableSection.isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                  >
                    {filteredCustomers.map((customer, index) => (
                      <motion.tr key={index} className="border-b" variants={tableRowVariants}>
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-slate-50 shadow-sm">
                              <AvatarImage src={`https://avatar.vercel.sh/${customer.name}`} />
                              <AvatarFallback className="bg-rose-100 text-rose-800">{customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{customer.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {customer.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-500" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">{customer.address || "N/A"}</td>
                        <td className="py-3 px-4">{customer.proposal_count || 0}</td>
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
    </DashboardLayout>
  )
}
