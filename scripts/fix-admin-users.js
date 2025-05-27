// Fix admin_users table for approval workflow
require('dotenv').config();
const { Pool } = require('pg');

async function fixAdminUsers() {
  console.log('Fixing admin_users table for approval workflow...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 
      { rejectUnauthorized: false } : false
  });

  let client;
  
  try {
    client = await pool.connect();
    console.log('Connected to database');
    
    // First, check current admin_users structure
    const currentColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users'
      ORDER BY ordinal_position
    `);
    
    console.log('Current admin_users columns:');
    currentColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Add missing columns if they don't exist
    const columnsToAdd = [
      { name: 'role', type: 'VARCHAR(50)', default: "'rep'" },
      { name: 'max_discount_percent', type: 'DECIMAL(5,2)', default: '5.0' },
      { name: 'can_approve_discounts', type: 'BOOLEAN', default: 'false' },
      { name: 'is_active', type: 'BOOLEAN', default: 'true' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        await client.query(`
          ALTER TABLE admin_users 
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type} DEFAULT ${column.default}
        `);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`⚠️  Column ${column.name}: ${error.message}`);
      }
    }
    
    // Create or update sample users
    console.log('\nCreating sample users...');
    
    // Insert/update manager
    try {
      await client.query(`
        INSERT INTO admin_users (
          first_name, last_name, email, role, 
          max_discount_percent, can_approve_discounts, is_active
        ) VALUES (
          'Manager', 'Smith', 'manager@evergreenenergy.com', 'manager',
          25.0, true, true
        ) ON CONFLICT (email) DO UPDATE SET
          role = 'manager',
          max_discount_percent = 25.0,
          can_approve_discounts = true,
          is_active = true
      `);
      console.log('✅ Manager user created/updated');
    } catch (error) {
      console.log(`⚠️  Manager user: ${error.message}`);
    }
    
    // Insert/update sales rep
    try {
      await client.query(`
        INSERT INTO admin_users (
          first_name, last_name, email, role,
          max_discount_percent, can_approve_discounts, is_active
        ) VALUES (
          'Sales', 'Rep', 'salesrep@evergreenenergy.com', 'rep',
          10.0, false, true
        ) ON CONFLICT (email) DO UPDATE SET
          role = 'rep',
          max_discount_percent = 10.0,
          can_approve_discounts = false,
          is_active = true
      `);
      console.log('✅ Sales rep user created/updated');
    } catch (error) {
      console.log(`⚠️  Sales rep user: ${error.message}`);
    }
    
    // Add updated_at trigger function (simpler version)
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS '
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        ' LANGUAGE plpgsql;
      `);
      console.log('✅ Update trigger function created');
      
      // Add trigger to approval_requests table
      await client.query(`
        DROP TRIGGER IF EXISTS update_approval_requests_updated_at ON approval_requests;
        CREATE TRIGGER update_approval_requests_updated_at
            BEFORE UPDATE ON approval_requests
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log('✅ Update trigger added to approval_requests');
      
    } catch (error) {
      console.log(`⚠️  Trigger setup: ${error.message}`);
    }
    
    // Verify final setup
    console.log('\nVerifying final setup...');
    const finalUsers = await client.query(`
      SELECT first_name, last_name, email, role, max_discount_percent, can_approve_discounts, is_active
      FROM admin_users 
      WHERE email IN ('manager@evergreenenergy.com', 'salesrep@evergreenenergy.com')
    `);
    
    if (finalUsers.rows.length > 0) {
      console.log('✅ Sample users verified:');
      finalUsers.rows.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.role}): ${user.max_discount_percent}% max, can approve: ${user.can_approve_discounts}`);
      });
    } else {
      console.log('⚠️  No sample users found - may need manual creation');
    }
    
    console.log('\n🎉 Admin users table setup completed!');
    
  } catch (error) {
    console.error('Error fixing admin_users:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

fixAdminUsers(); 