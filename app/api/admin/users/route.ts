import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { logPermissionChangeWithClerkId } from '@/lib/activity-logger'

interface ClerkUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  emailAddresses: Array<{ emailAddress: string }>
  publicMetadata: Record<string, any>
  privateMetadata: Record<string, any>
  lastSignInAt?: number | null
  createdAt: number
  updatedAt: number
}

interface FormattedUser {
  id: string
  clerk_id: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  last_login?: string | null
  created_at: string
  updated_at: string
  max_discount_percent: number
  can_approve_discounts: boolean
  user_type: string
}

// Get all users from Clerk
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Current user ID:', userId)

    // Get current user from Clerk to check role
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const currentUserRole = currentUser.publicMetadata?.role || 'user'
    
    console.log('Current user role from Clerk:', currentUserRole)

    // Strict role checking - only admin can access
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Access denied. Only administrators can access this resource.',
        debug: {
          currentUserId: userId,
          currentUserRole: currentUserRole,
          requiredRole: 'admin'
        }
      }, { status: 403 })
    }

    // Fetch all users from Clerk
    console.log('Fetching all users from Clerk...')
    
    const clerkUserList = await clerk.users.getUserList({
      limit: 100,
      orderBy: 'created_at',
    })
    
    console.log(`Found ${clerkUserList.totalCount} users in Clerk`)
    
    // Format users for frontend
    const formattedUsers: FormattedUser[] = clerkUserList.data.map((user: any) => {
      const firstName = user.firstName || 'Unknown'
      const lastName = user.lastName || 'User'
      const email = user.emailAddresses[0]?.emailAddress || 'no-email@example.com'
      const role = user.publicMetadata?.role || 'user' // Default to 'user' role
      
      return {
        id: user.id,
        clerk_id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role,
        is_active: true,
        last_login: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
        created_at: new Date(user.createdAt).toISOString(),
        updated_at: new Date(user.updatedAt).toISOString(),
        max_discount_percent: role === 'admin' ? 100.0 : 0.0,
        can_approve_discounts: role === 'admin',
        user_type: 'clerk'
      }
    })

    console.log(`Returning ${formattedUsers.length} total users`)

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      debug: {
        totalUsers: formattedUsers.length,
        currentUserRole: currentUserRole
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Update user role in Clerk
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
      return NextResponse.json({ error: 'Access denied. Only administrators can modify users.' }, { status: 403 })
    }

    const { clerk_id, role } = await request.json()

    if (!clerk_id || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: clerk_id and role' 
      }, { status: 400 })
    }

    // Validate role - only 'admin' or 'user' allowed
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ 
        error: 'Invalid role. Only "admin" or "user" roles are allowed.' 
      }, { status: 400 })
    }

    // Update user role in Clerk
    const targetUser = await clerk.users.getUser(clerk_id)
    await clerk.users.updateUserMetadata(clerk_id, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        role: role
      }
    })

    // Log the permission change with clerk_id tracking
    await logPermissionChangeWithClerkId(
      userId, // Admin clerk_id
      clerk_id, // Target user's clerk_id
      targetUser.emailAddresses[0]?.emailAddress || 'unknown',
      targetUser.publicMetadata?.role?.toString() || 'user',
      role
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Create new user (invite to Clerk)
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
      return NextResponse.json({ error: 'Access denied. Only administrators can create user invitations.' }, { status: 403 })
    }

    const { email, role = 'user' } = await request.json()

    if (!email) {
      return NextResponse.json({ 
        error: 'Missing required field: email' 
      }, { status: 400 })
    }

    // Validate role - only 'admin' or 'user' allowed
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ 
        error: 'Invalid role. Only "admin" or "user" roles are allowed.' 
      }, { status: 400 })
    }

    // Create invitation in Clerk
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: role, // Will be 'user' by default
        invited_by: userId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User invitation sent successfully',
      invitation_id: invitation.id
    })

  } catch (error) {
    console.error('Error creating user invitation:', error)
    return NextResponse.json({ 
      error: 'Failed to create user invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Remove user (demote to user role OR permanently delete)
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
      return NextResponse.json({ error: 'Access denied. Only administrators can modify user roles.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userIdToUpdate = searchParams.get('id')
    const action = searchParams.get('action') || 'demote' // 'demote' or 'delete'

    if (!userIdToUpdate) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent self-modification
    if (userIdToUpdate === userId) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
    }

    const targetUser = await clerk.users.getUser(userIdToUpdate)

    if (action === 'delete') {
      // Permanently delete user from Clerk
      try {
        await clerk.users.deleteUser(userIdToUpdate)
        
        // Note: The webhook will handle removing from our database when Clerk sends the user.deleted event
        
        return NextResponse.json({
          success: true,
          message: 'User permanently deleted from the system'
        })
      } catch (error) {
        console.error('Error permanently deleting user:', error)
        return NextResponse.json({ 
          error: 'Failed to permanently delete user',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    } else {
      // Default action: demote user to regular user role
      await clerk.users.updateUserMetadata(userIdToUpdate, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          role: 'user'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User demoted to regular user role'
      })
    }

  } catch (error) {
    console.error('Error in user deletion/demotion:', error)
    return NextResponse.json({ 
      error: 'Failed to process user action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 