import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth, clerkClient } from '@clerk/nextjs/server'

// Get all permissions
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
        error: 'Access denied. Only administrators can access permissions.' 
      }, { status: 403 })
    }

    // Return simplified permissions for Admin and User roles
    const permissionsData = [
      {
        id: 1,
        name: 'admin_access',
        description: 'Full administrative access to all features'
      },
      {
        id: 2,
        name: 'user_access',
        description: 'Standard user access to regular features'
      }
    ]

    return NextResponse.json({
      success: true,
      permissions: permissionsData
    })

  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch permissions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// All other operations are disabled
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
        error: 'Access denied. Only administrators can access this resource.' 
      }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Permission creation is disabled. The system uses fixed Admin and User permissions.'
    }, { status: 400 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

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
        error: 'Access denied. Only administrators can access this resource.' 
      }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Permission modification is disabled. The system uses fixed Admin and User permissions.'
    }, { status: 400 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

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
        error: 'Access denied. Only administrators can access this resource.' 
      }, { status: 403 })
    }

    return NextResponse.json({
      error: 'Permission deletion is disabled. Admin and User permissions cannot be deleted.'
    }, { status: 400 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 