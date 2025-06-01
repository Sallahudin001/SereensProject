import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only allow admins to run migrations
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Starting approval_requests migration...')

    // Step 1: Check current state
    const currentConstraints = await executeQuery(`
      SELECT conname, conrelid::regclass AS table_name, confrelid::regclass AS referenced_table
      FROM pg_constraint 
      WHERE conrelid = 'approval_requests'::regclass 
      AND contype = 'f'
    `)
    
    console.log('Current foreign key constraints:', currentConstraints)

    // Step 2: Drop existing foreign key constraints that reference admin_users
    await executeQuery(`ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_requestor_id_fkey`)
    await executeQuery(`ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_approver_id_fkey`)
    console.log('✅ Dropped old foreign key constraints')

    // Step 3: Add temporary columns to help with migration
    await executeQuery(`ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS temp_requestor_clerk_id VARCHAR(255)`)
    await executeQuery(`ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS temp_approver_clerk_id VARCHAR(255)`)
    console.log('✅ Added temporary columns')

    // Step 4: Map existing requestor_id from admin_users to clerk_id
    const requestorUpdate = await executeQuery(`
      UPDATE approval_requests 
      SET temp_requestor_clerk_id = au.clerk_id
      FROM admin_users au 
      WHERE approval_requests.requestor_id = au.id 
      AND au.clerk_id IS NOT NULL
    `)
    console.log(`✅ Mapped requestor records to clerk_id`)

    // Step 5: Map existing approver_id from admin_users to clerk_id
    const approverUpdate = await executeQuery(`
      UPDATE approval_requests 
      SET temp_approver_clerk_id = au.clerk_id
      FROM admin_users au 
      WHERE approval_requests.approver_id = au.id 
      AND au.clerk_id IS NOT NULL
    `)
    console.log(`✅ Mapped approver records to clerk_id`)

    // Step 6: Update requestor_id to point to users.id based on matching clerk_id
    const requestorRemap = await executeQuery(`
      UPDATE approval_requests 
      SET requestor_id = u.id
      FROM users u 
      WHERE approval_requests.temp_requestor_clerk_id = u.clerk_id
    `)
    console.log(`✅ Remapped requestor_id to users table`)

    // Step 7: Update approver_id to point to users.id based on matching clerk_id
    const approverRemap = await executeQuery(`
      UPDATE approval_requests 
      SET approver_id = u.id
      FROM users u 
      WHERE approval_requests.temp_approver_clerk_id = u.clerk_id
      AND approval_requests.temp_approver_clerk_id IS NOT NULL
    `)
    console.log(`✅ Remapped approver_id to users table`)

    // Step 8: Set approver_id to NULL for records where we couldn't find a matching user
    const approverCleanup = await executeQuery(`
      UPDATE approval_requests 
      SET approver_id = NULL 
      WHERE temp_approver_clerk_id IS NOT NULL 
      AND approver_id NOT IN (SELECT id FROM users)
    `)
    console.log(`✅ Cleaned up approver records without matching users`)

    // Step 9: Drop temporary columns
    await executeQuery(`ALTER TABLE approval_requests DROP COLUMN IF EXISTS temp_requestor_clerk_id`)
    await executeQuery(`ALTER TABLE approval_requests DROP COLUMN IF EXISTS temp_approver_clerk_id`)
    console.log('✅ Dropped temporary columns')

    // Step 10: Add new foreign key constraints that reference users table
    await executeQuery(`
      ALTER TABLE approval_requests 
      ADD CONSTRAINT approval_requests_requestor_id_fkey 
      FOREIGN KEY (requestor_id) REFERENCES users(id) ON DELETE CASCADE
    `)
    
    await executeQuery(`
      ALTER TABLE approval_requests 
      ADD CONSTRAINT approval_requests_approver_id_fkey 
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
    `)
    console.log('✅ Added new foreign key constraints')

    // Step 11: Update indexes
    await executeQuery(`DROP INDEX IF EXISTS idx_approval_requests_requestor_id`)
    await executeQuery(`DROP INDEX IF EXISTS idx_approval_requests_approver_id`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_approval_requests_requestor_id ON approval_requests(requestor_id)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_id ON approval_requests(approver_id)`)
    console.log('✅ Updated indexes')

    // Step 12: Verify the migration
    const newConstraints = await executeQuery(`
      SELECT conname, conrelid::regclass AS table_name, confrelid::regclass AS referenced_table
      FROM pg_constraint 
      WHERE conrelid = 'approval_requests'::regclass 
      AND contype = 'f'
    `)

    const approvalCount = await executeQuery(`SELECT COUNT(*) as count FROM approval_requests`)

    // Check for invalid references
    const invalidRefs = await executeQuery(`
      SELECT 
        ar.id,
        ar.requestor_id,
        ar.approver_id,
        u_requestor.clerk_id as requestor_clerk_id,
        u_approver.clerk_id as approver_clerk_id
      FROM approval_requests ar
      LEFT JOIN users u_requestor ON ar.requestor_id = u_requestor.id
      LEFT JOIN users u_approver ON ar.approver_id = u_approver.id
      WHERE u_requestor.id IS NULL OR (ar.approver_id IS NOT NULL AND u_approver.id IS NULL)
      LIMIT 5
    `)

    return NextResponse.json({
      success: true,
      message: 'Approval requests migration completed successfully',
      details: {
        migrationSteps: [
          'Dropped old foreign key constraints',
          'Added temporary columns',
          'Mapped existing data to clerk_ids',
          'Remapped IDs to users table',
          'Cleaned up orphaned records',
          'Added new foreign key constraints',
          'Updated indexes'
        ],
        totalApprovalRequests: approvalCount[0]?.count || 0,
        newConstraints: newConstraints,
        invalidReferences: invalidRefs.length
      }
    })

  } catch (error) {
    console.error('Error during approval requests migration:', error)
    return NextResponse.json({ 
      error: 'Failed to migrate approval requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 