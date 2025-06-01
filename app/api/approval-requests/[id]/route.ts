import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { NotificationService } from '@/lib/notifications'
import { auth } from '@clerk/nextjs/server'
import { logDiscountDecision, logDiscountDecisionWithClerkId } from "@/lib/activity-logger";
import { getUserNamesFromClerk, getUserDetailsFromClerk } from '@/lib/user-utils'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Ensure params is properly awaited
    const params = await context.params
    const { id } = params
    
    const requestId = parseInt(id, 10)
    if (isNaN(requestId) || requestId < 1) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }
    
    // Get the approval request details
    const requestDetails = await executeQuery(`
      SELECT 
        ar.*,
        p.proposal_number,
        p.subtotal as proposal_subtotal
      FROM approval_requests ar
      LEFT JOIN proposals p ON ar.proposal_id = p.id
      WHERE ar.id = $1
    `, [requestId])
    
    if (!requestDetails || requestDetails.length === 0) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
    }
    
    const request = requestDetails[0]
    
    // Get clerk_ids from users table for this request (not admin_users)
    const userIds = []
    if (request.requestor_id) userIds.push(request.requestor_id)
    if (request.approver_id) userIds.push(request.approver_id)
    
    let userClerkMapping: Record<number, string> = {}
    if (userIds.length > 0) {
      const users = await executeQuery(
        `SELECT id, clerk_id FROM users WHERE id = ANY($1)`,
        [userIds]
      )
      
      users.forEach(user => {
        if (user.clerk_id) {
          userClerkMapping[user.id] = user.clerk_id
        }
      })
    }
    
    // Get unique clerk_ids for name resolution
    const clerkIds = Object.values(userClerkMapping).filter(Boolean)
    const userNames = clerkIds.length > 0 ? await getUserNamesFromClerk(clerkIds) : {}
    
    // Add user names to the request
    const requestorClerkId = userClerkMapping[request.requestor_id]
    const approverClerkId = userClerkMapping[request.approver_id]
    
    const requestWithNames = {
      ...request,
      requestor_name: requestorClerkId ? userNames[requestorClerkId] || 'Unknown User' : 'Unknown User',
      approver_name: request.approver_id && approverClerkId ? userNames[approverClerkId] || 'Not assigned' : 'Not assigned'
    }
    
    return NextResponse.json(requestWithNames)
    
  } catch (error) {
    console.error('Error fetching approval request:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch approval request details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure params is properly awaited
    const params = await context.params
    const { id } = params
    
    const requestId = parseInt(id, 10)
    
    if (isNaN(requestId) || requestId < 1) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }
    
    const { action, notes, approverId } = await request.json()
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    // Validate approver exists in admin_users table
    if (!approverId) {
      return NextResponse.json({ error: 'Approver ID is required' }, { status: 400 })
    }
    
    const approverCheck = await executeQuery(
      `SELECT id FROM admin_users WHERE id = $1`,
      [approverId]
    )
    
    if (approverCheck.length === 0) {
      // Get the first available admin or manager who can approve
      const availableApprovers = await executeQuery(`
        SELECT id FROM admin_users 
        WHERE (role = 'admin' OR role = 'manager') 
        AND can_approve_discounts = true 
        AND is_active = true
        LIMIT 1
      `)
      
      if (availableApprovers.length === 0) {
        return NextResponse.json({ 
          error: 'No valid approver found. Please contact your administrator.'
        }, { status: 400 })
      }
      
      // Use this approver instead
      var validApproverId = availableApprovers[0].id
    } else {
      var validApproverId = approverId
    }
    
    // Get the approval request details first
    const requestDetails = await executeQuery(
      `SELECT * FROM approval_requests WHERE id = $1`,
      [requestId]
    )
    
    if (!requestDetails || requestDetails.length === 0) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
    }
    
    const request_data = requestDetails[0]
    
    // If already processed, don't allow changes
    if (request_data.status !== 'pending') {
      return NextResponse.json({ 
        error: 'This request has already been processed',
        status: request_data.status
      }, { status: 400 })
    }
    
    // Update the approval request status
    const status = action === 'approve' ? 'approved' : 'rejected'
    const result = await executeQuery(
      `UPDATE approval_requests 
       SET status = $1, notes = $2, approver_id = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [status, notes || '', validApproverId, requestId]
    )
    
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Failed to update approval request' }, { status: 500 })
    }
    
    // Get user details from Clerk for notification
    const userIds = [request_data.requestor_id, validApproverId]
    
    // Get clerk_ids from users table (not admin_users)
    let userClerkMapping: Record<number, string> = {}
    const users = await executeQuery(
      `SELECT id, clerk_id FROM users WHERE id = ANY($1)`,
      [userIds]
    )
    
    users.forEach(user => {
      if (user.clerk_id) {
        userClerkMapping[user.id] = user.clerk_id
      }
    })
    
    // Get unique clerk_ids for detail resolution
    const clerkIds = Object.values(userClerkMapping).filter(Boolean)
    const userDetails = clerkIds.length > 0 ? await getUserDetailsFromClerk(clerkIds) : {}
    
    // Get proposal details
    const proposalDetails = await executeQuery(
      `SELECT proposal_number, customer_id FROM proposals WHERE id = $1`,
      [request_data.proposal_id]
    )
    
    // Prepare notification data with Clerk user details
    const requestorClerkId = userClerkMapping[request_data.requestor_id]
    const approverClerkId = userClerkMapping[validApproverId]
    
    const requestorDetails = requestorClerkId ? userDetails[requestorClerkId] || { name: 'Unknown User', email: 'no-email@example.com' } : { name: 'Unknown User', email: 'no-email@example.com' }
    const approverDetails = approverClerkId ? userDetails[approverClerkId] || { name: 'Unknown Approver', email: 'no-email@example.com' } : { name: 'Unknown Approver', email: 'no-email@example.com' }
    
    const notificationData = {
      requestId,
      proposalId: request_data.proposal_id,
      proposalNumber: proposalDetails[0]?.proposal_number,
      requestType: request_data.request_type,
      originalValue: request_data.original_value,
      requestedValue: request_data.requested_value,
      status,
      approverName: approverDetails.name,
      requestorName: requestorDetails.name,
      requestorEmail: requestorDetails.email,
      notes
    }
    
    try {
      await NotificationService.notifyRequestorOfDecision(notificationData)
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
      // Continue even if notification fails
    }
    
    // Log the activity using the specialized function
    await logDiscountDecisionWithClerkId(
      validApproverId.toString(),
      request_data.proposal_id,
      proposalDetails[0]?.proposal_number || '',
      parseFloat(request_data.original_value) || 0,
      parseFloat(request_data.requested_value) || 0,
      requestId,
      status === 'approved',
      notes || ''
    );
    
    // Update the proposal based on approval status
    try {
      if (status === 'approved') {
        // If approved, update the proposal with the requested discount value
        await executeQuery(
          `UPDATE proposals 
           SET discount = $1, 
               total = subtotal - $1,
               pending_approval_request_id = NULL,
               updated_at = NOW()
           WHERE id = $2`,
          [request_data.requested_value, request_data.proposal_id]
        )
      } else {
        // If rejected, just clear the pending approval reference
        await executeQuery(
          `UPDATE proposals 
           SET pending_approval_request_id = NULL,
               updated_at = NOW()
           WHERE id = $1`,
          [request_data.proposal_id]
        )
      }
    } catch (updateError) {
      console.error('Error updating proposal after approval decision:', updateError)
      // Continue even if update fails
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Discount request has been ${status}`,
      request: result[0]
    })
    
  } catch (error) {
    console.error('Error processing approval request:', error)
    return NextResponse.json({ 
      error: 'Failed to process approval request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 