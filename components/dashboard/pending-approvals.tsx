"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

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
}

export default function PendingApprovals() {
  const [pendingProposals, setPendingProposals] = useState<PendingApprovalProposal[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    async function fetchPendingApprovals() {
      try {
        setLoading(true)
        const [proposalsResponse, approvalsResponse] = await Promise.all([
          fetch('/api/proposals/pending-approvals'),
          fetch('/api/approval-requests?status=pending')
        ]);
        
        // Process proposals with pending approvals
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
            requestor_name: proposal.requestor_name || 'Unknown'
          }));
        } else {
          console.error('Failed to fetch pending approvals:', proposalsResponse.status);
        }
        
        // Process approval requests
        if (approvalsResponse.ok) {
          const approvalsData = await approvalsResponse.json();
          
          // Get approval requests not already included
          const approvalProposalIds = new Set(combinedProposals.map(p => p.approval_request_id));
          
          const additionalApprovals = approvalsData
            .filter((approval: any) => !approvalProposalIds.has(approval.id))
            .map((approval: any) => ({
              id: approval.proposal_id,
              proposal_number: approval.proposal_number || `Draft-${approval.proposal_id}`,
              customer_name: approval.customer_name || 'Draft Customer',
              subtotal: approval.original_value || 0,
              discount: approval.original_value || 0,
              requested_discount: approval.requested_value || 0,
              approval_request_id: approval.id,
              created_at: approval.created_at,
              requestor_name: approval.requestor_name || 'Unknown'
            }));
          
          // Combine both datasets
          combinedProposals = [...combinedProposals, ...additionalApprovals];
        } else {
          console.error('Failed to fetch approval requests:', approvalsResponse.status);
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
    
    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchPendingApprovals, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [])
  
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
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
          <CardDescription>Proposals awaiting discount approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (pendingProposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
          <CardDescription>Proposals awaiting discount approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <p className="text-sm text-gray-500">No proposals awaiting approval</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
        <CardDescription>Proposals awaiting discount approval</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingProposals.map((proposal, index) => (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{proposal.proposal_number}</h3>
                  <p className="text-sm text-gray-500">{proposal.customer_name}</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <p className="text-gray-500">Original Discount</p>
                  <p>{formatCurrency(proposal.discount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Requested Discount</p>
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(proposal.requested_discount)}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>Created: {formatDate(proposal.created_at)}</span>
                </div>
                <div>Requestor: {proposal.requestor_name}</div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/proposals/view/${proposal.id}?mode=admin`)}
                >
                  <FileText className="h-3 w-3 mr-1" /> View Proposal
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push(`/admin/approvals?request=${proposal.approval_request_id}`)}
                >
                  <Clock className="h-3 w-3 mr-1" /> Review Approval
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 