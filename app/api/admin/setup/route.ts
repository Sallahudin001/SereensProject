import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

// Update default admin user with current user's Clerk ID
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, firstName, lastName } = await request.json()

    console.log('🔧 Updating admin user setup for current user:', userId)

    // Check if current user already exists as admin
    const existingAdmin = await executeQuery(
      'SELECT id, email FROM admin_users WHERE clerk_id = $1',
      [userId]
    )

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'User is already set up as admin',
        user: existingAdmin[0]
      })
    }

    // Check if there's a default admin user we can update
    const defaultAdmin = await executeQuery(
      'SELECT id FROM admin_users WHERE clerk_id = $1 OR email = $2',
      ['admin-default', 'admin@company.com']
    )

    if (defaultAdmin.length > 0) {
      // Update the default admin user with the current user's details
      const adminRoleResult = await executeQuery(
        'SELECT id FROM roles WHERE name = $1',
        ['Administrator']
      )

      if (adminRoleResult.length === 0) {
        return NextResponse.json({
          error: 'Administrator role not found. Please run POST /api/admin/setup first.'
        }, { status: 400 })
      }

      await executeQuery(`
        UPDATE admin_users SET 
          clerk_id = $1,
          first_name = $2,
          last_name = $3,
          email = $4,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [
        userId,
        firstName || 'Admin',
        lastName || 'User',
        email || 'admin@company.com',
        defaultAdmin[0].id
      ])

      console.log('✅ Updated default admin user with current user details')

      return NextResponse.json({
        success: true,
        message: 'Successfully updated admin user with your credentials',
        user: {
          id: defaultAdmin[0].id,
          clerk_id: userId,
          email: email || 'admin@company.com'
        }
      })
    } else {
      // Create new admin user
      const adminRoleResult = await executeQuery(
        'SELECT id FROM roles WHERE name = $1',
        ['Administrator']
      )

      if (adminRoleResult.length === 0) {
        return NextResponse.json({
          error: 'Administrator role not found. Please run POST /api/admin/setup first.'
        }, { status: 400 })
      }

      const newAdmin = await executeQuery(`
        INSERT INTO admin_users (
          clerk_id, 
          role_id, 
          first_name, 
          last_name, 
          email, 
          is_active, 
          max_discount_percent,
          can_approve_discounts,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, clerk_id, email
      `, [
        userId,
        adminRoleResult[0].id,
        firstName || 'Admin',
        lastName || 'User',
        email || 'admin@company.com',
        true,
        100.0,
        true
      ])

      console.log('✅ Created new admin user for current user')

      return NextResponse.json({
        success: true,
        message: 'Successfully created admin user with your credentials',
        user: newAdmin[0]
      })
    }

  } catch (error) {
    console.error('❌ Error updating admin setup:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update admin setup',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Initializing Admin System...')

    // Insert default permissions
    const permissions = [
      { name: 'view_all', description: 'View all data in the system' },
      { name: 'edit_all', description: 'Edit all data in the system' },
      { name: 'manage_users', description: 'Add, edit, and delete users' },
      { name: 'users:read', description: 'View users' },
      { name: 'users:write', description: 'Manage users' },
      { name: 'manage_pricing', description: 'Update pricing information' },
      { name: 'pricing:read', description: 'View pricing' },
      { name: 'pricing:write', description: 'Update pricing' },
      { name: 'products:read', description: 'View products' },
      { name: 'products:write', description: 'Create/edit products' },
      { name: 'manage_contracts', description: 'Create and edit contract templates' },
      { name: 'view_customers', description: 'View customer information' },
      { name: 'edit_customers', description: 'Edit customer information' },
      { name: 'create_proposals', description: 'Create new proposals' },
      { name: 'view_reports', description: 'View reports and analytics' },
      { name: 'approve_discounts', description: 'Approve discount requests' },
      { name: 'settings:read', description: 'View system settings' },
      { name: 'settings:write', description: 'Edit system settings' }
    ]

    // Insert permissions
    for (const permission of permissions) {
      try {
        await executeQuery(`
          INSERT INTO permissions (name, description, created_at, updated_at) 
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (name) DO NOTHING
        `, [permission.name, permission.description])
      } catch (error) {
        console.log(`Permission ${permission.name} might already exist`)
      }
    }

    // Insert default roles
    const roles = [
      { name: 'Administrator', description: 'Full system access with all permissions' },
      { name: 'Sales Manager', description: 'Manages sales team and proposals' },
      { name: 'Sales Representative', description: 'Creates and manages proposals' },
      { name: 'Support', description: 'Customer support and basic system access' }
    ]

    for (const role of roles) {
      try {
        await executeQuery(`
          INSERT INTO roles (name, description, created_at, updated_at) 
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (name) DO NOTHING
        `, [role.name, role.description])
      } catch (error) {
        console.log(`Role ${role.name} might already exist`)
      }
    }

    // Assign permissions to Administrator role (all permissions)
    try {
      await executeQuery(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT 
          r.id as role_id,
          p.id as permission_id
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.name = 'Administrator'
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `)
    } catch (error) {
      console.log('Administrator permissions might already be assigned')
    }

    // Assign permissions to Sales Manager role
    const salesManagerPermissions = [
      'view_all', 'users:read', 'pricing:read', 'pricing:write', 'products:read',
      'view_customers', 'edit_customers', 'create_proposals', 'view_reports', 'approve_discounts'
    ]

    for (const permName of salesManagerPermissions) {
      try {
        await executeQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT 
            r.id as role_id,
            p.id as permission_id
          FROM roles r
          JOIN permissions p ON p.name = $1
          WHERE r.name = 'Sales Manager'
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permName])
      } catch (error) {
        console.log(`Sales Manager permission ${permName} might already be assigned`)
      }
    }

    // Assign permissions to Sales Representative role
    const salesRepPermissions = [
      'pricing:read', 'products:read', 'view_customers', 'edit_customers', 'create_proposals'
    ]

    for (const permName of salesRepPermissions) {
      try {
        await executeQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT 
            r.id as role_id,
            p.id as permission_id
          FROM roles r
          JOIN permissions p ON p.name = $1
          WHERE r.name = 'Sales Representative'
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permName])
      } catch (error) {
        console.log(`Sales Representative permission ${permName} might already be assigned`)
      }
    }

    // Assign permissions to Support role
    const supportPermissions = ['view_customers', 'view_reports']

    for (const permName of supportPermissions) {
      try {
        await executeQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT 
            r.id as role_id,
            p.id as permission_id
          FROM roles r
          JOIN permissions p ON p.name = $1
          WHERE r.name = 'Support'
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permName])
      } catch (error) {
        console.log(`Support permission ${permName} might already be assigned`)
      }
    }

    // Create a default admin user if none exists with the current user's ID
    try {
      const adminRoleResult = await executeQuery(
        'SELECT id FROM roles WHERE name = $1',
        ['Administrator']
      )

      if (adminRoleResult.length > 0) {
        const adminRoleId = adminRoleResult[0].id

        // Check if current user already exists as admin
        const existingAdmin = await executeQuery(
          'SELECT id FROM admin_users WHERE clerk_id = $1',
          [userId]
        )

        if (existingAdmin.length === 0) {
          await executeQuery(`
            INSERT INTO admin_users (
              clerk_id, 
              role_id, 
              first_name, 
              last_name, 
              email, 
              is_active, 
              max_discount_percent,
              can_approve_discounts,
              created_at, 
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            userId,
            adminRoleId,
            'System',
            'Administrator',
            'admin@company.com',
            true,
            100.0,
            true
          ])
        }
      }
    } catch (error) {
      console.log('Default admin user might already exist or there was an error:', error instanceof Error ? error.message : String(error))
    }

    // Update existing admin_users to have proper discount permissions
    try {
      await executeQuery(`
        UPDATE admin_users SET 
          max_discount_percent = CASE 
            WHEN role_id = (SELECT id FROM roles WHERE name = 'Administrator') THEN 100.0
            WHEN role_id = (SELECT id FROM roles WHERE name = 'Sales Manager') THEN 25.0
            WHEN role_id = (SELECT id FROM roles WHERE name = 'Sales Representative') THEN 10.0
            ELSE 0.0
          END,
          can_approve_discounts = CASE 
            WHEN role_id IN (
              SELECT id FROM roles WHERE name IN ('Administrator', 'Sales Manager')
            ) THEN true
            ELSE false
          END
        WHERE max_discount_percent IS NULL OR can_approve_discounts IS NULL
      `)
    } catch (error) {
      console.log('Error updating discount permissions:', error instanceof Error ? error.message : String(error))
    }

    console.log('✅ Admin system initialization completed!')

    return NextResponse.json({
      success: true,
      message: 'Admin system initialized successfully',
      details: {
        permissions_created: permissions.length,
        roles_created: roles.length,
        setup_complete: true
      }
    })

  } catch (error) {
    console.error('❌ Error initializing admin system:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize admin system',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 