import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Starting users table fix...')

    // Add clerk_id column to users table if it doesn't exist
    await executeQuery(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255)
    `)
    console.log('✅ Added clerk_id column to users table')

    // Add unique index on clerk_id for better performance
    await executeQuery(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id) WHERE clerk_id IS NOT NULL
    `)
    console.log('✅ Added unique index on clerk_id')

    // Check current structure
    const tableInfo = await executeQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Current users table structure:')
    tableInfo.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    return NextResponse.json({
      success: true,
      message: 'Users table updated successfully',
      tableStructure: tableInfo
    })

  } catch (error) {
    console.error('Error fixing users table:', error)
    return NextResponse.json({ 
      error: 'Failed to fix users table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 