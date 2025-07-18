import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { NotificationService } from '@/lib/notifications'
import { getRBACContext, applyRBACFilter } from '@/lib/rbac'
import { logDiscountRequestWithClerkId } from '@/lib/activity-logger'
import { getUserNamesFromClerk } from '@/lib/user-utils'

export async function GET(request: NextRequest) {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    
    let query = `
      SELECT 
        ar.*,
        p.proposal_number,
        p.subtotal as proposal_subtotal,
        c.name as customer_name
      FROM approval_requests ar
      LEFT JOIN proposals p ON ar.proposal_id = p.id
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0
    
    if (status) {
      paramCount++
      query += ` AND ar.status = $${paramCount}`
      params.push(status)
    }
    
    if (userId) {
      paramCount++
      query += ` AND ar.approver_id = $${paramCount}`
      params.push(userId)
    }
    
    // Apply RBAC filter - non-admin users only see their own approval requests
    if (!context.isAdmin) {
      paramCount++
      query += ` AND p.user_id = $${paramCount}`
      params.push(context.userId)
    }
    
    query += ` ORDER BY ar.created_at DESC`
    
    const requests = await executeQuery(query, params)
    
    // Extract unique user_ids and get clerk_ids from users table
    const userIds = new Set<number>()
    requests.forEach(req => {
      if (req.requestor_id) userIds.add(req.requestor_id)
      if (req.approver_id) userIds.add(req.approver_id)
    })
    
    // Get clerk_ids from users table
    let userClerkMapping: Record<number, string> = {}
    if (userIds.size > 0) {
      const users = await executeQuery(
        `SELECT id, clerk_id FROM users WHERE id = ANY($1)`,
        [Array.from(userIds)]
      )
      
      users.forEach(user => {
        if (user.clerk_id) {
          userClerkMapping[user.id] = user.clerk_id
        }
      })
    }
    
    // Get Clerk user names
    const clerkIds = Object.values(userClerkMapping).filter(Boolean)
    const userNames = clerkIds.length > 0 ? await getUserNamesFromClerk(clerkIds) : {}
    
    // Map names back to requests
    const requestsWithNames = requests.map(req => {
      const requestorClerkId = userClerkMapping[req.requestor_id]
      const approverClerkId = userClerkMapping[req.approver_id]
      
      return {
        ...req,
        requestor_name: requestorClerkId && userNames[requestorClerkId] 
          ? userNames[requestorClerkId] 
          : 'Unknown',
        requestor_clerk_id: requestorClerkId,
        approver_name: approverClerkId && userNames[approverClerkId] 
          ? userNames[approverClerkId] 
          : 'Manager'
      }
    })
    
    return NextResponse.json(requestsWithNames)
  } catch (error) {
    console.error('Error fetching approval requests:', error)
    return NextResponse.json({ error: 'Failed to fetch approval requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const { 
      proposalId, 
      requestorId, 
      requestType, 
      originalValue, 
      requestedValue, 
      notes,
      discountPercent,
      userMaxPercent 
    } = await request.json()
    
    // Validate required fields
    if (!proposalId || !requestorId || !requestType || originalValue === undefined || requestedValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Ensure proposal ID is a valid integer (within PostgreSQL integer range)
    const safeProposalId = parseInt(proposalId.toString(), 10);
    if (isNaN(safeProposalId) || safeProposalId < 1 || safeProposalId > 2147483647) {
      console.error('Invalid proposal ID format:', proposalId);
      return NextResponse.json({ error: 'Invalid proposal ID format' }, { status: 400 })
    }

    // For non-admin users, verify they own the proposal
    if (!context.isAdmin) {
      const proposalCheck = await executeQuery(
        `SELECT user_id FROM proposals WHERE id = $1`,
        [safeProposalId]
      );
      
      if (proposalCheck.length === 0) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
      }
      
      if (proposalCheck[0].user_id !== context.userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    try {
      // We'll use admin role users from the users table for approval,
      // so we don't need a specific approver_id for the request creation
      // The approval can be handled by any admin user
      
      // Create approval request (approver_id will be set when an admin approves it)
      const result = await executeQuery(`
        INSERT INTO approval_requests (
          proposal_id, requestor_id, approver_id, request_type, 
          original_value, requested_value, notes, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING id, created_at
      `, [safeProposalId, requestorId, null, requestType, originalValue, requestedValue, notes || ''])
      
      // Update the proposal to reference this pending approval request
      await executeQuery(`
        UPDATE proposals
        SET pending_approval_request_id = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [result[0].id, safeProposalId])
      
      // Get requestor details from the users table (current authenticated user)
      const requestorUser = await executeQuery(`
        SELECT name, email FROM users WHERE clerk_id = $1
      `, [context.userId])
      
      let requestorName = `User #${requestorId}`;
      let requestorEmail = '';
      
      if (requestorUser.length > 0) {
        requestorName = requestorUser[0].name || requestorName;
        requestorEmail = requestorUser[0].email || '';
      }
      
      // Send notification to admins (not managers from admin_users table)
      const notificationData = {
        requestId: result[0].id,
        requestorName: requestorName,
        requestorEmail: requestorEmail,
        proposalId: safeProposalId,
        requestType,
        requestedValue,
        discountPercent,
        userMaxPercent,
        managerEmail: '', // Will be populated with admin emails in notification service
        managerName: 'Admin'
      }
      
      // Send notification using the notification service
      await NotificationService.notifyManagerOfApprovalRequest(notificationData)
      
      // Log the discount request activity
      await logDiscountRequestWithClerkId(
        requestorId.toString(), // Use requestorId as the clerk_id
        proposalId,
        await executeQuery(`SELECT proposal_number FROM proposals WHERE id = $1`, [proposalId]).then(result => result[0]?.proposal_number || ''),
        parseFloat(originalValue),
        parseFloat(requestedValue),
        parseFloat(discountPercent),
        result[0].id, // The new approval request ID
        notes
      );
      
      return NextResponse.json({ 
        success: true, 
        requestId: result[0].id,
        message: 'Approval request sent to admins',
        approverName: 'Admin Team'
      })
    } catch (dbError) {
      console.error('Database error creating approval request:', dbError);
      return NextResponse.json({ 
        error: 'Database error creating approval request', 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating approval request:', error)
    return NextResponse.json({ 
      error: 'Failed to create approval request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 