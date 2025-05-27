const { Client } = require('pg');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

async function fixUsersTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add clerk_id column to users table if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255)
    `);
    console.log('✅ Added clerk_id column to users table');

    // Add unique index on clerk_id for better performance
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_id_idx ON users(clerk_id) WHERE clerk_id IS NOT NULL
    `);
    console.log('✅ Added unique index on clerk_id');

    // Check current structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current users table structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log('\n🎉 Users table updated successfully!');

  } catch (error) {
    console.error('Error fixing users table:', error);
  } finally {
    await client.end();
  }
}

fixUsersTable(); 