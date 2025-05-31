"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { Plus, Search } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import ExportButtons from "@/components/proposal/export-buttons"

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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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

export default function ProposalsPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const tableSection = useScrollAnimation()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function fetchProposals() {
      try {
        setLoading(true)

        const result = await fetch("/api/proposals")
        const data = await result.json()

        if (data.success) {
          setProposals(data.proposals)
        }
      } catch (error) {
        console.error("Error fetching proposals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [])

  // Filter proposals based on search term and status
  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.customer_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "viewed":
        return "bg-purple-100 text-purple-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-teal-100 text-teal-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
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
        <h1 className="text-2xl font-bold">Proposals</h1>
        <div className="flex gap-2">
          <ExportButtons showProductExport={true} />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/proposals/new">
              <Button className="bg-rose-600 hover:bg-rose-700">
                <Plus className="mr-2 h-4 w-4" /> New Proposal
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search proposals..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
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
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {proposals.length === 0 ? (
                  <>
                    No proposals found. Create your first proposal to get started.
                    <div className="mt-4">
                      <Link href="/proposals/new">
                        <Button className="bg-rose-600 hover:bg-rose-700">
                          <Plus className="mr-2 h-4 w-4" /> Create Proposal
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  "No proposals match your search criteria."
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Services</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    initial="hidden"
                    animate={tableSection.isInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                  >
                    {filteredProposals.map((proposal, index) => (
                      <motion.tr key={proposal.id || `proposal-${index}`} className="border-b" variants={tableRowVariants}>
                        <td className="py-3 px-4">{proposal.proposal_number}</td>
                        <td className="py-3 px-4">{proposal.customer_name}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {proposal.services.map((service, i) => (
                              <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {service}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatDate(proposal.created_at)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(proposal.status)}`}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">${Number.parseFloat(proposal.total).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              {/* Adding ?mode=admin shows the proposal in read-only mode for reps */}
                              <Link href={`/proposals/view/${proposal.id}?mode=admin`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            </motion.div>
                            {proposal.status === "draft" && (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href={`/proposals/new?id=${proposal.id}`}>
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                </Link>
                              </motion.div>
                            )}
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
    </DashboardLayout>
  )
}
