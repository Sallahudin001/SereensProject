"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useRBAC } from "@/hooks/use-rbac"

interface PendingApprovalProposal {
  id: number
  proposal_number: string
  customer_name: string
  subtotal: string
  discount: string
  requested_discount: string
  approval_request_id: number
  created_at: string
  requestor_name: string
  requestor_clerk_id?: string
}

export default function PendingApprovals() {
  const [pendingProposals, setPendingProposals] = useState<PendingApprovalProposal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const rbac = useRBAC()
  
  useEffect(() => {
    async function fetchPendingApprovals() {
      // Wait for RBAC to be loaded and user to be authenticated
      if (rbac.isLoading || !rbac.isAuthenticated) {
        return
      }

      try {
        setLoading(true)
        
        // Fetch pending approvals from the main API
        const proposalsResponse = await fetch('/api/proposals/pending-approvals');
        
        let combinedProposals: PendingApprovalProposal[] = [];
        
        if (proposalsResponse.ok) {
          const proposalsData = await proposalsResponse.json();
          // Process proposals data
          combinedProposals = proposalsData.map((proposal: any) => ({
            id: proposal.id,
            proposal_number: proposal.proposal_number,
            customer_name: proposal.customer_name,
            subtotal: proposal.subtotal,
            discount: proposal.discount,
            requested_discount: proposal.requested_discount,
            approval_request_id: proposal.approval_request_id,
            created_at: proposal.created_at,
            requestor_name: proposal.requestor_name || 'Unknown',
            requestor_clerk_id: proposal.requestor_clerk_id
          }));
        } else if (proposalsResponse.status === 401) {
          console.error('Not authenticated for pending approvals');
          setPendingProposals([]);
          setLoading(false);
          return;
        } else {
          console.error('Failed to fetch pending approvals:', proposalsResponse.status);
        }
        
        // Only try to fetch additional approval requests if we don't have enough data
        // and if the first call was successful
        if (combinedProposals.length === 0 && proposalsResponse.ok) {
          try {
            const approvalsResponse = await fetch('/api/approval-requests?status=pending');
            
            if (approvalsResponse.ok) {
              const approvalsData = await approvalsResponse.json();
              
              const additionalApprovals = approvalsData.map((approval: any) => ({
                id: approval.proposal_id,
                proposal_number: approval.proposal_number || `Draft-${approval.proposal_id}`,
                customer_name: approval.customer_name || 'Draft Customer',
                subtotal: approval.proposal_subtotal || approval.original_value || 0,
                discount: approval.original_value || 0,
                requested_discount: approval.requested_value || 0,
                approval_request_id: approval.id,
                created_at: approval.created_at,
                requestor_name: approval.requestor_name || 'Unknown',
                requestor_clerk_id: approval.requestor_clerk_id
              }));
              
              combinedProposals = [...combinedProposals, ...additionalApprovals];
            } else if (approvalsResponse.status !== 401) {
              // Only log non-auth errors
              console.error('Failed to fetch approval requests:', approvalsResponse.status);
            }
          } catch (approvalError) {
            console.warn('Could not fetch additional approval requests:', approvalError);
            // Continue with the data we have
          }
        }
        
        // Sort by created_at (newest first)
        combinedProposals.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setPendingProposals(combinedProposals);
      } catch (error) {
        console.error('Error fetching approvals data:', error);
        setPendingProposals([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingApprovals();
    
    // Only set up polling if user is authenticated
    let intervalId: NodeJS.Timeout | null = null;
    if (rbac.isAuthenticated) {
      intervalId = setInterval(fetchPendingApprovals, 30000);
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [rbac.isLoading, rbac.isAuthenticated]) // Add dependencies for RBAC state
  
  // Format currency function
  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return numValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })
  }
  
  // Format date function
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    })
  }

  // Show loading if RBAC is still loading
  if (rbac.isLoading || loading) {
    return (
      <Card className="h-full">
        <CardHeader className="px-5 py-4 border-b">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="w-5 h-5 mr-2 text-muted-foreground" /> Pending Approvals
          </CardTitle>
          <CardDescription>Proposals awaiting discount approval</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message if not authenticated
  if (!rbac.isAuthenticated) {
    return (
      <Card className="h-full">
        <CardHeader className="px-5 py-4 border-b">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="w-5 h-5 mr-2 text-muted-foreground" /> Pending Approvals
          </CardTitle>
          <CardDescription>Proposals awaiting discount approval</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground">Please sign in to view pending approvals</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (pendingProposals.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="px-5 py-4 border-b">
          <CardTitle className="text-lg font-medium flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> Pending Approvals
          </CardTitle>
          <CardDescription>Proposals awaiting discount approval</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-sm text-muted-foreground">No proposals awaiting approval</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          <Clock className="w-5 h-5 mr-2 text-amber-500" /> Pending Approvals
        </CardTitle>
        <CardDescription>Proposals awaiting discount approval</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {pendingProposals.map((proposal, index) => (
            <motion.div
              key={proposal.approval_request_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{proposal.proposal_number}</h3>
                  <p className="text-xs text-muted-foreground truncate">{proposal.customer_name}</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30 ml-2 whitespace-nowrap">
                  <Clock className="h-3 w-3" /> Pending
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Original Value</p>
                  <p className="font-medium">{formatCurrency(proposal.subtotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Requested Discount</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(proposal.requested_discount)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  By {proposal.requestor_name}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8"
                  onClick={() => router.push(`/admin/approvals?id=${proposal.approval_request_id}`)}
                >
                  Review
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {pendingProposals.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => router.push('/admin/approvals')}
            >
              View All Approvals
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 