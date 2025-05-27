const { Client } = require('pg');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

async function setupTestUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add clerk_id column to admin_users if it doesn't exist
    await client.query(`
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255)
    `);
    console.log('✅ Added clerk_id column to admin_users');

    // Clear existing test users
    await client.query(`
      DELETE FROM admin_users WHERE email IN ('manager@evergreenenergy.com', 'salesrep@evergreenenergy.com', 'demo@evergreenenergy.com')
    `);
    console.log('✅ Cleared existing test users');

    // Insert demo manager user
    const managerResult = await client.query(`
      INSERT INTO admin_users (
        first_name, last_name, email, role, 
        max_discount_percent, can_approve_discounts, 
        is_active, clerk_id
      ) VALUES (
        'Demo', 'Manager', 'manager@evergreenenergy.com', 'manager',
        25.0, true, true, 'demo_manager_123'
      ) RETURNING id
    `);
    console.log('✅ Created demo manager user with ID:', managerResult.rows[0].id);

    // Insert demo sales rep user
    const repResult = await client.query(`
      INSERT INTO admin_users (
        first_name, last_name, email, role,
        max_discount_percent, can_approve_discounts,
        is_active, clerk_id
      ) VALUES (
        'Demo', 'Sales Rep', 'salesrep@evergreenenergy.com', 'rep',
        10.0, false, true, 'demo_rep_456'
      ) RETURNING id
    `);
    console.log('✅ Created demo sales rep user with ID:', repResult.rows[0].id);

    // Insert demo default user (for fallback)
    const defaultResult = await client.query(`
      INSERT INTO admin_users (
        first_name, last_name, email, role,
        max_discount_percent, can_approve_discounts,
        is_active, clerk_id
      ) VALUES (
        'Demo', 'User', 'demo@evergreenenergy.com', 'rep',
        10.0, false, true, 'demo_default_789'
      ) RETURNING id
    `);
    console.log('✅ Created demo default user with ID:', defaultResult.rows[0].id);

    // Test the API by fetching users
    console.log('\n📊 Testing user data:');
    const users = await client.query(`
      SELECT id, first_name, last_name, email, role, max_discount_percent, can_approve_discounts
      FROM admin_users 
      WHERE email LIKE '%evergreenenergy.com'
      ORDER BY role DESC
    `);

    users.rows.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.role}): ${user.max_discount_percent}% max, can approve: ${user.can_approve_discounts}`);
    });

    console.log('\n🎉 Test users setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Visit /test-approval to test the discount approval workflow');
    console.log('2. Visit /admin/approvals to view the manager approval dashboard');
    console.log('3. The default API will return user ID 1 for testing purposes');

  } catch (error) {
    console.error('Error setting up test users:', error);
  } finally {
    await client.end();
  }
}

setupTestUsers(); 