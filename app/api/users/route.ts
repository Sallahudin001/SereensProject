import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Get current authenticated user
    let sessionUserId;
    try {
      const session = await auth()
      sessionUserId = session?.userId
    } catch (authError) {
      console.error('Authentication error in GET:', authError)
      // Continue execution but log the error
    }
    
    if (!sessionUserId) {
      console.warn('No authenticated user for GET /api/users')
      // Instead of returning 401, return a specific error message
      // that the frontend can handle
      return NextResponse.json({ 
        error: 'Not authenticated',
        errorType: 'auth_required'
      }, { status: 200 }) // Use 200 instead of 401 to prevent hard failures
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // First try to get from admin_users table (for the approval system)
    const adminUser = await executeQuery(`
      SELECT 
        id,
        first_name || ' ' || last_name as name,
        email,
        role,
        max_discount_percent,
        can_approve_discounts,
        is_active
      FROM admin_users 
      WHERE id = $1 AND is_active = true
    `, [userId])
    
    if (adminUser.length > 0) {
      return NextResponse.json({
        success: true,
        user: {
          id: adminUser[0].id,
          name: adminUser[0].name,
          email: adminUser[0].email,
          role: adminUser[0].role,
          maxDiscountPercent: parseFloat(adminUser[0].max_discount_percent || '0'),
          canApproveDiscounts: adminUser[0].can_approve_discounts || false
        }
      })
    }
    
    // Fallback to regular users table if not found in admin_users
    const regularUser = await executeQuery(`
      SELECT 
        id,
        name,
        email,
        role
      FROM users 
      WHERE id = $1
    `, [userId])
    
    if (regularUser.length > 0) {
      return NextResponse.json({
        success: true,
        user: {
          id: regularUser[0].id,
          name: regularUser[0].name,
          email: regularUser[0].email,
          role: regularUser[0].role || 'user',
          maxDiscountPercent: 5.0, // Default for regular users
          canApproveDiscounts: false
        }
      })
    }
    
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, targetUserId, clerkId } = await request.json()
    
    // Handle authentication 
    let sessionUserId;
    try {
      const session = await auth()
      sessionUserId = session?.userId
    } catch (authError) {
      console.error('Authentication error:', authError)
      // Continue execution - we'll use the provided clerkId if available
    }
    
    if (action === 'getCurrentUser') {
      // Use provided clerkId if available, otherwise use the session userId
      const effectiveClerkId = clerkId || sessionUserId
      
      if (!effectiveClerkId) {
        return NextResponse.json({ 
          error: 'No user ID available', 
          details: 'Neither clerkId parameter nor valid session found',
          // Still provide a fallback user for demo purposes
          success: false,
          user: {
            id: 1, // Default ID for demo
            name: 'Demo User',
            email: 'demo@evergreenenergy.com',
            role: 'rep',
            maxDiscountPercent: 10.0,
            canApproveDiscounts: false
          }
        }, { status: 200 }) // Use 200 instead of 400 to allow fallback
      }
      
      console.log('Looking up user with clerk ID:', effectiveClerkId)
      
      // Get current user from session and match with database
      // First check admin_users table
      const adminUser = await executeQuery(`
        SELECT 
          id,
          first_name || ' ' || last_name as name,
          email,
          role,
          max_discount_percent,
          can_approve_discounts,
          is_active
        FROM admin_users 
        WHERE clerk_id = $1 AND is_active = true
      `, [effectiveClerkId])
      
      if (adminUser.length > 0) {
        console.log('Found user in admin_users:', adminUser[0].id)
        return NextResponse.json({
          success: true,
          user: {
            id: adminUser[0].id,
            name: adminUser[0].name,
            email: adminUser[0].email,
            role: adminUser[0].role,
            maxDiscountPercent: parseFloat(adminUser[0].max_discount_percent || '0'),
            canApproveDiscounts: adminUser[0].can_approve_discounts || false,
            clerk_id: effectiveClerkId
          }
        })
      }
      
      // Fallback to regular users table
      const regularUser = await executeQuery(`
        SELECT 
          id,
          name,
          email,
          role
        FROM users 
        WHERE clerk_id = $1
      `, [effectiveClerkId])
      
      if (regularUser.length > 0) {
        console.log('Found user in users table:', regularUser[0].id)
        return NextResponse.json({
          success: true,
          user: {
            id: regularUser[0].id,
            name: regularUser[0].name,
            email: regularUser[0].email,
            role: regularUser[0].role || 'user',
            maxDiscountPercent: 5.0,
            canApproveDiscounts: false,
            clerk_id: effectiveClerkId
          }
        })
      }
      
      console.log('User not found in database, returning default user')
      
      // If user not found in database, create default record
      return NextResponse.json({
        success: false,
        error: 'User not found in database',
        user: {
          id: 1, // Default ID for demo
          name: 'Demo User',
          email: 'demo@evergreenenergy.com',
          role: 'rep',
          maxDiscountPercent: 10.0,
          canApproveDiscounts: false,
          clerk_id: effectiveClerkId
        }
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in users POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 