"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Filter,
  DollarSign,
  FileText,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@clerk/nextjs"

interface ApprovalRequest {
  id: number
  proposal_id: number
  requestor_id: number
  approver_id: number
  request_type: string
  original_value: number
  requested_value: number
  status: string
  notes: string
  created_at: string
  updated_at: string
  requestor_name: string
  approver_name: string
  proposal_number: string
  customer_name: string
  proposal_subtotal?: number
}

export default function ApprovalsPage() {
  const { userId, isLoaded: isAuthLoaded } = useAuth()
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [currentUserDbId, setCurrentUserDbId] = useState<number | null>(null)
  
  // Dialog states
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalNotes, setApprovalNotes] = useState("")

  // First effect to handle authentication
  useEffect(() => {
    if (isAuthLoaded) {
      if (userId) {
        fetchCurrentUserDbId()
      } else {
        setAuthLoading(false)
        console.log('User not authenticated')
      }
    }
  }, [userId, isAuthLoaded])

  // Second effect to fetch data once authentication is handled
  useEffect(() => {
    // Only fetch data if auth is loaded or we have a current user ID
    if (!authLoading || currentUserDbId) {
      fetchApprovalRequests()
      
      // Set up polling for real-time updates
      const interval = setInterval(fetchApprovalRequests, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [authLoading, currentUserDbId])

  useEffect(() => {
    // Filter requests based on search and status
    let filtered = approvalRequests

    if (searchQuery) {
      filtered = filtered.filter(request => 
        request.proposal_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestor_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }, [approvalRequests, searchQuery, statusFilter])

  const fetchCurrentUserDbId = async () => {
    try {
      setAuthLoading(true)
      
      // Safety check for userId being available
      if (!userId) {
        console.log('Waiting for Clerk userId to be available')
        return
      }
      
      console.log('Fetching user data with Clerk ID:', userId)
      
      // Add timeout to handle stalled requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'getCurrentUser',
            clerkId: userId
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.text()
          console.error('Failed to fetch current user:', response.status, errorData)
          throw new Error(`Failed to fetch user information (${response.status})`)
        }
        
        const data = await response.json()
        if (data.success && data.user?.id) {
          console.log('User DB ID fetched successfully:', data.user.id)
          setCurrentUserDbId(data.user.id)
        } else {
          console.error('User data is incomplete:', data)
          // Even if success is false, try to use the default user provided
          if (data.user?.id) {
            console.log('Using default user ID:', data.user.id)
            setCurrentUserDbId(data.user.id)
          } else {
            throw new Error('User information is incomplete. Please contact support.')
          }
        }
      } catch (fetchError: unknown) {
        if (fetchError && 
            typeof fetchError === 'object' && 
            'name' in fetchError && 
            fetchError.name === 'AbortError') {
          console.error('Request timed out')
          throw new Error('Request timed out. Please check your connection and try again.')
        }
        throw fetchError
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      toast({
        title: "Authentication Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to fetch user information. Please try refreshing the page.",
        variant: "destructive"
      })
      
      // Use a fallback ID for demo purposes only
      // This should be removed in production
      console.log('Using fallback user ID for demo')
      setCurrentUserDbId(1)
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchApprovalRequests = async () => {
    try {
      const response = await fetch('/api/approval-requests')
      if (!response.ok) throw new Error('Failed to fetch approval requests')
      
      const data = await response.json()
      setApprovalRequests(data)
    } catch (error) {
      console.error('Error fetching approval requests:', error)
      toast({
        title: "Error",
        description: "Failed to load approval requests. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalAction = (request: ApprovalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setApprovalAction(action)
    setApprovalNotes("")
    setShowApprovalDialog(true)
  }

  const processApproval = async () => {
    if (!selectedRequest) {
      toast({
        title: "Error",
        description: "No request selected. Please try again.",
        variant: "destructive"
      })
      return
    }

    if (!currentUserDbId) {
      if (!isAuthLoaded || !userId) {
        toast({
          title: "Authentication Error",
          description: "Please wait while we authenticate you, or try refreshing the page.",
          variant: "destructive"
        })
        return
      }
      
      // Try to fetch the user ID again
      try {
        await fetchCurrentUserDbId()
      } catch (error) {
        console.error("Error fetching user ID:", error)
      }
      
      // If still not available, show error
      if (!currentUserDbId) {
        toast({
          title: "Error",
          description: "Unable to find your user account. Please refresh the page and try again.",
          variant: "destructive"
        })
        return
      }
    }

    setProcessingId(selectedRequest.id)
    
    try {
      const response = await fetch(`/api/approval-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: approvalAction, 
          notes: approvalNotes,
          approverId: currentUserDbId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process approval')
      }
      
      const result = await response.json()
      
      // Update the local state immediately for better UX
      setApprovalRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: approvalAction === 'approve' ? 'approved' : 'rejected', notes: approvalNotes }
            : req
        )
      )

      toast({
        title: approvalAction === 'approve' ? "Approved" : "Rejected",
        description: result.message || `Discount request has been ${approvalAction}d.`,
        className: approvalAction === 'approve' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      })

      setShowApprovalDialog(false)
      
      // Refresh the data to ensure consistency
      setTimeout(fetchApprovalRequests, 1000)
    } catch (error) {
      console.error('Error processing approval:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process approval. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingCount = approvalRequests.filter(req => req.status === 'pending').length
  const approvedCount = approvalRequests.filter(req => req.status === 'approved').length
  const rejectedCount = approvalRequests.filter(req => req.status === 'rejected').length

  if (!isAuthLoaded || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Authenticating user...</p>
        </div>
      </div>
    )
  }

  if (isAuthLoaded && !userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to view this page.</p>
          <Button asChild>
            <a href="/admin/login">Log In</a>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading approval requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discount Approvals</h1>
          <p className="text-muted-foreground">Review and approve discount requests from team members</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg p-2 bg-yellow-50 border-yellow-200">
            <Clock className="w-4 h-4 mr-1" />
            {pendingCount} Pending
          </Badge>
          <Badge variant="outline" className="text-lg p-2 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            {approvedCount} Approved
          </Badge>
          <Badge variant="outline" className="text-lg p-2 bg-red-50 border-red-200">
            <XCircle className="w-4 h-4 mr-1" />
            {rejectedCount} Rejected
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by proposal, customer, or requestor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Requests */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {filteredRequests.filter(req => req.status === 'pending').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending approval requests at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests
                .filter(req => req.status === 'pending')
                .map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Discount Request - {request.request_type.replace('_', ' ').toUpperCase()}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Proposal #{request.proposal_number}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {request.requestor_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Customer</p>
                          <p className="font-medium">{request.customer_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Project Total</p>
                          <p className="text-lg font-semibold">{formatCurrency(request.proposal_subtotal || 0)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Requested Discount</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(request.requested_value)}</p>
                        </div>
                      </div>

                      {request.notes && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Request Notes</p>
                          <p className="text-sm bg-gray-50 p-3 rounded-md">{request.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprovalAction(request, 'approve')}
                          disabled={processingId === request.id}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleApprovalAction(request, 'reject')}
                          disabled={processingId === request.id}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {filteredRequests
              .filter(req => req.status === 'approved')
              .map((request) => (
                <Card key={request.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Proposal #{request.proposal_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Approved by {request.approver_name} • {formatDate(request.updated_at)}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Original Value</p>
                        <p className="text-lg">{formatCurrency(request.proposal_subtotal || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Approved Discount</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(request.requested_value)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Final Value</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency((request.proposal_subtotal || 0) - request.requested_value)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/proposals/view/${request.proposal_id}?mode=admin`, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Proposal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {filteredRequests
              .filter(req => req.status === 'rejected')
              .map((request) => (
                <Card key={request.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Proposal #{request.proposal_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Rejected by {request.approver_name} • {formatDate(request.updated_at)}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Original Value</p>
                        <p className="text-lg">{formatCurrency(request.proposal_subtotal || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Requested Discount</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(request.requested_value)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-lg font-bold text-red-600">Rejected</p>
                      </div>
                    </div>
                    {request.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Rejection Reason</p>
                        <p className="text-sm bg-red-50 p-3 rounded-md mt-1">{request.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/proposals/view/${request.proposal_id}?mode=admin`, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Proposal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approvalAction === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Discount Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Proposal #{selectedRequest.proposal_number} - 
                  Requested discount: {formatCurrency(selectedRequest.requested_value)}
                  {selectedRequest.proposal_subtotal && (
                    <> from original value of {formatCurrency(selectedRequest.proposal_subtotal)}</>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="approval-notes">
                {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <Textarea
                id="approval-notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder={
                  approvalAction === 'approve' 
                    ? 'Add any notes about this approval...' 
                    : 'Please explain why this discount is being rejected...'
                }
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={processingId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={processApproval}
              disabled={
                processingId !== null || 
                (approvalAction === 'reject' && !approvalNotes.trim())
              }
              className={
                approvalAction === 'approve' 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processingId !== null ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {approvalAction === 'approve' ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 