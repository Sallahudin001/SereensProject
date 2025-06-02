import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { getRBACContext, applyRBACFilter } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Build the query based on user role
    let query: string
    let params: any[]
    
    if (context.isAdmin) {
      // Admins can see all proposals with pending approvals
      query = `
        SELECT 
          p.id, 
          p.proposal_number, 
          c.name as customer_name, 
          p.status, 
          p.subtotal,
          p.discount,
          p.total, 
          p.created_at,
          ar.id as approval_request_id,
          ar.status as approval_status,
          ar.requested_value as requested_discount,
          ar.requestor_id,
          u.clerk_id as requestor_clerk_id
        FROM 
          proposals p
        JOIN 
          customers c ON p.customer_id = c.id
        JOIN 
          approval_requests ar ON p.pending_approval_request_id = ar.id
        LEFT JOIN
          users u ON ar.requestor_id = u.id
        WHERE
          ar.status = 'pending'
        ORDER BY 
          ar.created_at DESC
      `
      params = []
    } else {
      // Regular users can only see their own proposals with pending approvals
      query = `
        SELECT 
          p.id, 
          p.proposal_number, 
          c.name as customer_name, 
          p.status, 
          p.subtotal,
          p.discount,
          p.total, 
          p.created_at,
          ar.id as approval_request_id,
          ar.status as approval_status,
          ar.requested_value as requested_discount,
          ar.requestor_id,
          u.clerk_id as requestor_clerk_id
        FROM 
          proposals p
        JOIN 
          customers c ON p.customer_id = c.id
        JOIN 
          approval_requests ar ON p.pending_approval_request_id = ar.id
        LEFT JOIN
          users u ON ar.requestor_id = u.id
        WHERE
          ar.status = 'pending'
          AND p.user_id = $1
        ORDER BY 
          ar.created_at DESC
      `
      params = [context.userId]
    }

    const proposals = await executeQuery(query, params)
    
    // Get clerk user names if we have clerk_ids
    const clerkIds = proposals
      .map(p => p.requestor_clerk_id)
      .filter(Boolean) as string[]
    
    let userNames: Record<string, string> = {}
    if (clerkIds.length > 0) {
      const { getUserNamesFromClerk } = await import('@/lib/user-utils')
      userNames = await getUserNamesFromClerk(clerkIds)
    }
    
    // Add requestor names to proposals
    const proposalsWithNames = proposals.map(proposal => ({
      ...proposal,
      requestor_name: proposal.requestor_clerk_id && userNames[proposal.requestor_clerk_id] 
        ? userNames[proposal.requestor_clerk_id]
        : 'Unknown'
    }))

    return NextResponse.json(proposalsWithNames)

  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch pending approvals',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 