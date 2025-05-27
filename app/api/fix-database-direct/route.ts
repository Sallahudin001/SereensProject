import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST() {
  try {
    console.log('Starting direct database fix...')

    // Step 1: Add clerk_id column to users table
    try {
      await executeQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255)`)
      console.log('✅ Added clerk_id column to users table')
    } catch (error) {
      console.log('Note: clerk_id column may already exist:', error)
    }

    // Step 2: Add unique index to users table
    try {
      await executeQuery(`CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id) WHERE clerk_id IS NOT NULL`)
      console.log('✅ Added unique index on clerk_id for users table')
    } catch (error) {
      console.log('Note: Index may already exist:', error)
    }

    // Step 3: Add clerk_id column to admin_users table
    try {
      await executeQuery(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255)`)
      console.log('✅ Added clerk_id column to admin_users table')
    } catch (error) {
      console.log('Note: clerk_id column may already exist for admin_users:', error)
    }

    // Step 4: Add unique index to admin_users table
    try {
      await executeQuery(`CREATE UNIQUE INDEX IF NOT EXISTS admin_users_clerk_id_idx ON admin_users(clerk_id) WHERE clerk_id IS NOT NULL`)
      console.log('✅ Added unique index on clerk_id for admin_users table')
    } catch (error) {
      console.log('Note: Index may already exist for admin_users:', error)
    }

    // Step 5: Add required approval-related columns to admin_users
    try {
      await executeQuery(`
        ALTER TABLE admin_users 
        ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'rep',
        ADD COLUMN IF NOT EXISTS max_discount_percent DECIMAL(5,2) DEFAULT 5.0,
        ADD COLUMN IF NOT EXISTS can_approve_discounts BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
      `)
      console.log('✅ Added approval-related columns to admin_users table')
    } catch (error) {
      console.log('Note: Some columns may already exist:', error)
    }

    // Step 6: Create sample manager user with approval permissions
    try {
      await executeQuery(`
        INSERT INTO admin_users (
          first_name, last_name, email, role, max_discount_percent, 
          can_approve_discounts, is_active, clerk_id
        ) VALUES (
          'Demo', 'Manager', 'manager@evergreenenergy.com', 'manager',
          25.0, true, true, 'demo_manager_clerk_id'
        ) ON CONFLICT (email) DO UPDATE SET
          can_approve_discounts = true,
          max_discount_percent = 25.0,
          role = 'manager',
          is_active = true
      `)
      console.log('✅ Sample manager user created or updated')
    } catch (error) {
      console.log('Note: Error creating sample manager:', error)
    }

    // Step 7: Create sample sales rep user with standard permissions
    try {
      await executeQuery(`
        INSERT INTO admin_users (
          id, first_name, last_name, email, role, max_discount_percent, 
          can_approve_discounts, is_active, clerk_id
        ) VALUES (
          1, 'Demo', 'Sales Rep', 'salesrep@evergreenenergy.com', 'rep',
          10.0, false, true, 'demo_salesrep_clerk_id'
        ) ON CONFLICT (id) DO UPDATE SET
          max_discount_percent = 10.0,
          role = 'rep',
          is_active = true
      `)
      console.log('✅ Sample sales rep user created or updated with ID 1')
    } catch (error) {
      console.log('Note: Error creating sample sales rep with ID 1:', error)
    }

    // Step 8: Create sample manager user with approval permissions
    try {
      await executeQuery(`
        INSERT INTO admin_users (
          id, first_name, last_name, email, role, max_discount_percent, 
          can_approve_discounts, is_active, clerk_id
        ) VALUES (
          2, 'Demo', 'Manager', 'manager@evergreenenergy.com', 'manager',
          25.0, true, true, 'demo_manager_clerk_id'
        ) ON CONFLICT (id) DO UPDATE SET
          can_approve_discounts = true,
          max_discount_percent = 25.0,
          role = 'manager',
          is_active = true
      `)
      console.log('✅ Sample manager user created or updated with ID 2')
    } catch (error) {
      console.log('Note: Error creating sample manager with ID 2:', error)
    }

    // Verify the fix by checking structures
    const usersTableInfo = await executeQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)

    const adminUsersTableInfo = await executeQuery(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' 
      ORDER BY ordinal_position
    `)

    console.log('✅ Database fix completed successfully')
    console.log('Updated users table structure:', usersTableInfo)
    console.log('Updated admin_users table structure:', adminUsersTableInfo)

    return NextResponse.json({
      success: true,
      message: 'Database schema fixed successfully',
      usersTableStructure: usersTableInfo,
      adminUsersTableStructure: adminUsersTableInfo
    })

  } catch (error) {
    console.error('❌ Error fixing database:', error)
    return NextResponse.json({ 
      error: 'Failed to fix database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 