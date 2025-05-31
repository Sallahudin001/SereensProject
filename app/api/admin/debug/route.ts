import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    console.log('Debug: Current Clerk ID from session:', userId)
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No Clerk user ID in session',
        userId: null,
        isAuthenticated: false
      })
    }

    // Check if this user exists in admin_users
    const adminUser = await executeQuery(`
      SELECT 
        au.id, au.clerk_id, au.email, au.first_name, au.last_name, 
        au.is_active, r.name as role_name
      FROM admin_users au
      LEFT JOIN roles r ON au.role_id = r.id
      WHERE au.clerk_id = $1
    `, [userId])

    // Check permissions for this user
    const permissions = await executeQuery(`
      SELECT p.name 
      FROM admin_users au
      JOIN role_permissions rp ON au.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE au.clerk_id = $1 AND au.is_active = true
    `, [userId])

    // Check all admin users
    const allAdminUsers = await executeQuery(`
      SELECT clerk_id, email, first_name, last_name, is_active
      FROM admin_users
      ORDER BY created_at DESC
    `)

    return NextResponse.json({
      success: true,
      debug: {
        currentClerkId: userId,
        isAuthenticated: true,
        adminUser: adminUser.length > 0 ? adminUser[0] : null,
        hasAdminRecord: adminUser.length > 0,
        permissions: permissions.map(p => p.name),
        permissionCount: permissions.length,
        allAdminUsers: allAdminUsers,
        hasUsersReadPermission: permissions.some(p => 
          p.name === 'users:read' || p.name === 'view_all'
        )
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        currentClerkId: null,
        isAuthenticated: false,
        adminUser: null,
        hasAdminRecord: false,
        permissions: [],
        permissionCount: 0
      }
    })
  }
} 