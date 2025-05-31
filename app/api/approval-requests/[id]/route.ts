import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { NotificationService } from '@/lib/notifications'
import { auth } from '@clerk/nextjs/server'
import { logDiscountDecision } from "@/lib/activity-logger";

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
        req.first_name || ' ' || req.last_name as requestor_name,
        CASE WHEN app.id IS NOT NULL 
          THEN app.first_name || ' ' || app.last_name 
          ELSE 'Not assigned' 
        END as approver_name
      FROM approval_requests ar
      LEFT JOIN proposals p ON ar.proposal_id = p.id
      LEFT JOIN admin_users req ON ar.requestor_id = req.id
      LEFT JOIN admin_users app ON ar.approver_id = app.id
      WHERE ar.id = $1
    `, [requestId])
    
    if (!requestDetails || requestDetails.length === 0) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
    }
    
    return NextResponse.json(requestDetails[0])
    
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
    
    // Get requestor and approver details for notification
    const userDetails = await executeQuery(
      `SELECT 
        req.first_name as requestor_first_name, 
        req.last_name as requestor_last_name, 
        req.email as requestor_email,
        app.first_name as approver_first_name, 
        app.last_name as approver_last_name
       FROM admin_users req
       JOIN admin_users app ON app.id = $1
       WHERE req.id = $2`,
      [validApproverId, request_data.requestor_id]
    )
    
    // Get proposal details
    const proposalDetails = await executeQuery(
      `SELECT proposal_number, customer_id FROM proposals WHERE id = $1`,
      [request_data.proposal_id]
    )
    
    // Notify the requestor about the decision
    if (userDetails && userDetails.length > 0) {
      const notificationData = {
        requestId,
        proposalId: request_data.proposal_id,
        proposalNumber: proposalDetails[0]?.proposal_number,
        requestType: request_data.request_type,
        originalValue: request_data.original_value,
        requestedValue: request_data.requested_value,
        status,
        approverName: `${userDetails[0].approver_first_name} ${userDetails[0].approver_last_name}`,
        requestorEmail: userDetails[0].requestor_email,
        requestorName: `${userDetails[0].requestor_first_name} ${userDetails[0].requestor_last_name}`,
        notes
      }
      
      try {
        await NotificationService.notifyRequestorOfDecision(notificationData)
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError)
        // Continue even if notification fails
      }
    }
    
    // Log the activity using the specialized function
    await logDiscountDecision(
      validApproverId,
      request_data.proposal_id,
      request_data.proposal_number || '',
      parseFloat(request_data.original_value) || 0,
      parseFloat(request_data.requested_value) || 0,
      status === 'approved',
      notes
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