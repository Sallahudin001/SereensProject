"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Users, 
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { Pagination } from "@/components/ui/pagination"

interface Proposal {
  id: number
  proposal_number: string
  customer_name: string
  customer_email: string
  status: string
  total: number
  monthly_payment?: number
  financing_term?: number
  created_at: string
  updated_at: string
  user_id: string
  creator_name?: string
  creator_email?: string
  services?: string[]
}

interface ProposalStats {
  totalProposals: number
  totalValue: number
  averageValue: number
  statusCounts: Record<string, number>
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: Edit },
  draft_in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
  draft_complete: { label: "Complete", color: "bg-green-100 text-green-800", icon: CheckCircle },
  ready_to_send: { label: "Ready to Send", color: "bg-purple-100 text-purple-800", icon: FileText },
  sent: { label: "Sent", color: "bg-yellow-100 text-yellow-800", icon: FileText },
  viewed: { label: "Viewed", color: "bg-orange-100 text-orange-800", icon: Eye },
  signed: { label: "Signed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  abandoned: { label: "Abandoned", color: "bg-gray-100 text-gray-800", icon: XCircle },
}

export default function AllProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState<ProposalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    fetchProposals()
  }, [currentPage, pageSize])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/proposals?page=${currentPage}&limit=${pageSize}`)
      const data = await response.json()
      
      if (data.success) {
        setProposals(data.proposals)
        setStats(data.stats)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
        setHasNext(data.hasNext)
        setHasPrev(data.hasPrev)
      } else {
        console.error("Failed to fetch proposals:", data.error)
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredAndSortedProposals = proposals
    .filter(proposal => {
      const matchesSearch = 
        proposal.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || proposal.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Proposal]
      let bValue: any = b[sortBy as keyof Proposal]
      
      if (sortBy === "total" || sortBy === "monthly_payment") {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }
      
      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Card */}
      <Card className="shadow-xl rounded-xl overflow-hidden bg-white border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
              <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight">All Proposals</CardTitle>
              <CardDescription className="text-green-100 text-sm sm:text-base">
              Comprehensive view of all proposals created by sales representatives
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProposals}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageValue)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Signed Proposals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.statusCounts.signed || 0) + (stats.statusCounts.completed || 0)}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search proposals, customers, or sales reps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="total-desc">Highest Value</SelectItem>
                  <SelectItem value="total-asc">Lowest Value</SelectItem>
                  <SelectItem value="customer_name-asc">Customer A-Z</SelectItem>
                  <SelectItem value="customer_name-desc">Customer Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Proposals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Proposals ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Sales Rep</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">
                        {proposal.proposal_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{proposal.customer_name}</div>
                          <div className="text-sm text-gray-500">{proposal.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {proposal.creator_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{proposal.creator_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{proposal.creator_email || ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(proposal.status)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(proposal.total)}
                      </TableCell>
                      <TableCell>
                        {proposal.monthly_payment ? formatCurrency(proposal.monthly_payment) : 'N/A'}
                        {proposal.financing_term && (
                          <div className="text-sm text-gray-500">
                            {proposal.financing_term} months
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(proposal.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAndSortedProposals.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters."
                    : "No proposals have been created yet."}
                </p>
              </div>
            )}
          </CardContent>
          {!loading && filteredAndSortedProposals.length > 0 && (
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
  )
} 