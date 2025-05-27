import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the user's role and ID from the database
    const userResults = await executeQuery(
      `SELECT au.id, au.role FROM admin_users au 
       WHERE au.clerk_id = $1`,
      [session.userId]
    )

    let userId = null
    let isAdmin = false

    if (userResults && userResults.length > 0) {
      userId = userResults[0].id
      isAdmin = ['admin', 'manager'].includes(userResults[0].role)
    } else {
      // Fall back to the users table if not found in admin_users
      const regularUserResults = await executeQuery(
        `SELECT id, role FROM users WHERE clerk_id = $1`,
        [session.userId]
      )
      
      if (regularUserResults && regularUserResults.length > 0) {
        userId = regularUserResults[0].id
        isAdmin = ['admin', 'manager'].includes(regularUserResults[0].role)
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build the query based on user role
    let query: string
    let params: any[]
    
    if (isAdmin) {
      // Admins and managers can see all proposals with pending approvals
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
          au_req.first_name || ' ' || au_req.last_name as requestor_name
        FROM 
          proposals p
        JOIN 
          customers c ON p.customer_id = c.id
        JOIN 
          approval_requests ar ON p.pending_approval_request_id = ar.id
        LEFT JOIN
          admin_users au_req ON ar.requestor_id = au_req.id
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
          au_req.first_name || ' ' || au_req.last_name as requestor_name
        FROM 
          proposals p
        JOIN 
          customers c ON p.customer_id = c.id
        JOIN 
          approval_requests ar ON p.pending_approval_request_id = ar.id
        LEFT JOIN
          admin_users au_req ON ar.requestor_id = au_req.id
        WHERE
          ar.status = 'pending'
          AND ar.requestor_id = $1
        ORDER BY 
          ar.created_at DESC
      `
      params = [userId]
    }

    const proposals = await executeQuery(query, params)
    return NextResponse.json(proposals)

  } catch (error) {
    console.error('Error fetching pending approval proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals with pending approvals' },
      { status: 500 }
    )
  }
} 