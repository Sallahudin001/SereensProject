import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth, clerkClient } from '@clerk/nextjs/server'

// Get all roles
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const currentUserRole = currentUser.publicMetadata?.role || 'user'
    
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Only administrators can access roles.' 
      }, { status: 403 })
    }

    // Only return Admin and User roles
    const rolesData = [
      {
        id: 1,
        name: 'Admin',
        description: 'Full system administrator with all permissions',
        user_count: 0,
        permissions: []
      },
      {
        id: 2,
        name: 'User',
        description: 'Regular user with standard access',
        user_count: 0,
        permissions: []
      }
    ]

    return NextResponse.json({
      success: true,
      roles: rolesData
    })

  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch roles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Create/Update role (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const currentUserRole = currentUser.publicMetadata?.role || 'user'
    
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Only administrators can create roles.' 
      }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Role creation is disabled. Only Admin and User roles are allowed in this system.'
    }, { status: 400 })

  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ 
      error: 'Failed to create role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Update role (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const currentUserRole = currentUser.publicMetadata?.role || 'user'
    
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Only administrators can modify roles.' 
      }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Role modification is disabled. Only Admin and User roles are allowed in this system.'
    }, { status: 400 })

  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ 
      error: 'Failed to update role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Delete role (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const currentUserRole = currentUser.publicMetadata?.role || 'user'
    
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Only administrators can delete roles.' 
      }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Role deletion is disabled. Admin and User roles cannot be deleted.'
    }, { status: 400 })

  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ 
      error: 'Failed to delete role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 