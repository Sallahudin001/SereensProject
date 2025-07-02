"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard-layout"
import { Plus, Search, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import Image from "next/image"
import { Pagination } from "@/components/ui/pagination"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    async function fetchProposals() {
      try {
        setLoading(true)

        const result = await fetch(`/api/proposals?page=${currentPage}&limit=${pageSize}`)
        const data = await result.json()

        if (data.success) {
          setProposals(data.proposals)
          setTotalCount(data.totalCount)
          setTotalPages(data.totalPages)
          setHasNext(data.hasNext)
          setHasPrev(data.hasPrev)
        }
      } catch (error) {
        console.error("Error fetching proposals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [currentPage, pageSize])

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Filter proposals based on search term and status (client-side for current page)
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

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header Card */}
        <Card className="shadow-xl rounded-xl overflow-hidden bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
              <div>
                <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center">
                  <FileText className="w-8 h-8 mr-3" />
                  Proposals Management
                </CardTitle>
                <p className="text-green-100 text-sm sm:text-base">
                  Manage all your customer proposals and track their status
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link href="/proposals/new" className="w-full sm:w-auto">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> New Proposal
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6 border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <CardTitle className="flex items-center text-gray-800">
              <Search className="w-6 h-6 mr-3 text-emerald-600" /> Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <Input
                  placeholder="Search proposals..."
                  className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
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
          className="flex-1"
        >
          <Card className="border-none shadow-md overflow-hidden flex-1 flex flex-col">
            <CardContent className="p-0 flex-1">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No proposals found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {proposals.length === 0 ? 
                      "Create your first proposal to get started." : 
                      "No proposals match your search criteria."}
                  </p>
                  {proposals.length === 0 && (
                    <Link href="/proposals/new">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> Create Proposal
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-emerald-50">
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">Services</th>
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-emerald-800">Actions</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      initial="hidden"
                      animate={tableSection.isInView ? "visible" : "hidden"}
                      variants={staggerContainer}
                    >
                      {filteredProposals.map((proposal, index) => (
                        <motion.tr 
                          key={proposal.id || `proposal-${index}`} 
                          className="border-b hover:bg-emerald-50 transition-colors" 
                          variants={tableRowVariants}
                        >
                          <td className="py-3 px-4 font-medium">{proposal.proposal_number}</td>
                          <td className="py-3 px-4">{proposal.customer_name}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {proposal.services.map((service, i) => (
                                <span key={i} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">{formatDate(proposal.created_at)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(proposal.status)}`}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">${Number.parseFloat(proposal.total).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href={`/proposals/view/${proposal.id}?mode=admin`}>
                                  <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                    View
                                  </Button>
                                </Link>
                              </motion.div>
                              {proposal.status === "draft" && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Link href={`/proposals/new?id=${proposal.id}`}>
                                    <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
            {!loading && filteredProposals.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                hasNext={hasNext}
                hasPrev={hasPrev}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
