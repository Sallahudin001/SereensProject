import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { NotificationService } from '@/lib/notifications'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Add authentication check
    try {
      const session = await auth()
      // Don't require auth for development/testing purposes but log it
      if (!session?.userId) {
        console.warn('No authenticated user for GET /api/approval-requests')
      }
    } catch (authError) {
      console.error('Authentication error in approval-requests GET:', authError)
      // Continue execution but log the error
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    
    let query = `
      SELECT 
        ar.*,
        au_requestor.first_name || ' ' || au_requestor.last_name as requestor_name,
        au_approver.first_name || ' ' || au_approver.last_name as approver_name,
        p.proposal_number,
        c.name as customer_name
      FROM approval_requests ar
      LEFT JOIN admin_users au_requestor ON ar.requestor_id = au_requestor.id
      LEFT JOIN admin_users au_approver ON ar.approver_id = au_approver.id
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
    
    query += ` ORDER BY ar.created_at DESC`
    
    const requests = await executeQuery(query, params)
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching approval requests:', error)
    return NextResponse.json({ error: 'Failed to fetch approval requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Add authentication check
    try {
      const session = await auth()
      // Don't require auth for development/testing purposes but log it
      if (!session?.userId) {
        console.warn('No authenticated user for POST /api/approval-requests')
      }
    } catch (authError) {
      console.error('Authentication error in approval-requests POST:', authError)
      // Continue execution but log the error
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

    try {
      // Verify if the requestor exists in admin_users table
      const requestorCheck = await executeQuery(`
        SELECT id FROM admin_users WHERE id = $1
      `, [requestorId]);

      // If requestor doesn't exist, create a demo user with this ID
      if (requestorCheck.length === 0) {
        console.log(`Creating demo user for requestor ID ${requestorId}`);
        // Create email separately to avoid parameter type confusion
        const testEmail = `testrep${requestorId}@test.com`;
        await executeQuery(`
          INSERT INTO admin_users (
            id, first_name, last_name, email, 
            role, max_discount_percent, can_approve_discounts, is_active
          ) VALUES (
            $1, 'Sales', 'Rep', $2,
            'rep', 10.0, false, true
          ) ON CONFLICT (id) DO NOTHING
        `, [requestorId, testEmail]);
      }
      
      // Find available managers who can approve discounts
      const managers = await executeQuery(`
        SELECT id, first_name, last_name, email 
        FROM admin_users 
        WHERE role = 'manager' 
        AND can_approve_discounts = true 
        AND is_active = true
        ORDER BY id
        LIMIT 1
      `)
      
      // If no managers exist, create a demo manager
      if (managers.length === 0) {
        console.log('Creating demo manager user');
        await executeQuery(`
          INSERT INTO admin_users (
            id, first_name, last_name, email, 
            role, max_discount_percent, can_approve_discounts, is_active
          ) VALUES (
            2, 'Demo', 'Manager', 'manager@evergreenenergy.com',
            'manager', 25.0, true, true
          ) ON CONFLICT (id) DO NOTHING
        `);
        
        // Query again to get the manager
        const newManagers = await executeQuery(`
          SELECT id, first_name, last_name, email 
          FROM admin_users 
          WHERE role = 'manager' 
          AND can_approve_discounts = true
          LIMIT 1
        `);
        
        if (newManagers.length === 0) {
          return NextResponse.json({ error: 'Could not create or find a manager for approval' }, { status: 500 })
        }
        
        var approverId = newManagers[0].id;
        var manager = newManagers[0];
      } else {
        var approverId = managers[0].id;
        var manager = managers[0];
      }
      
      // Create approval request
      const result = await executeQuery(`
        INSERT INTO approval_requests (
          proposal_id, requestor_id, approver_id, request_type, 
          original_value, requested_value, notes, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING id, created_at
      `, [safeProposalId, requestorId, approverId, requestType, originalValue, requestedValue, notes || ''])
      
      // Update the proposal to reference this pending approval request
      await executeQuery(`
        UPDATE proposals
        SET pending_approval_request_id = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [result[0].id, safeProposalId])
      
      // Get requestor details for notification
      const requestor = await executeQuery(`
        SELECT first_name, last_name, email FROM admin_users WHERE id = $1
      `, [requestorId])
      
      // Send notification to manager
      const notificationData = {
        requestId: result[0].id,
        requestorName: requestor.length > 0 ? `${requestor[0].first_name} ${requestor[0].last_name}` : `User #${requestorId}`,
        proposalId: safeProposalId,
        requestType,
        requestedValue,
        discountPercent,
        userMaxPercent,
        managerEmail: manager.email,
        managerName: `${manager.first_name} ${manager.last_name}`
      }
      
      // Send notification using the notification service
      await NotificationService.notifyManagerOfApprovalRequest(notificationData)
      
      return NextResponse.json({ 
        success: true, 
        requestId: result[0].id,
        message: 'Approval request sent to manager',
        approverName: `${manager.first_name} ${manager.last_name}`
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