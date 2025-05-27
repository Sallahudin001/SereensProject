// Complete the approval workflow migration
const { executeQuery } = require('../lib/db.js');

async function completeMigration() {
  console.log('Completing approval workflow migration...');
  
  try {
    // Add missing columns to admin_users
    console.log('Adding columns to admin_users...');
    
    await executeQuery(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'rep'
    `);
    console.log('✅ Added role column');
    
    await executeQuery(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS max_discount_percent DECIMAL(5,2) DEFAULT 5.0
    `);
    console.log('✅ Added max_discount_percent column');
    
    await executeQuery(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS can_approve_discounts BOOLEAN DEFAULT false
    `);
    console.log('✅ Added can_approve_discounts column');
    
    await executeQuery(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
    `);
    console.log('✅ Added is_active column');
    
    // Add discount columns to proposals table
    await executeQuery(`
      ALTER TABLE proposals 
      ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.0
    `);
    console.log('✅ Added discount_amount to proposals');
    
    await executeQuery(`
      ALTER TABLE proposals 
      ADD COLUMN IF NOT EXISTS approved_discount DECIMAL(10,2) DEFAULT 0.0
    `);
    console.log('✅ Added approved_discount to proposals');
    
    // Insert sample users
    console.log('\nCreating sample users...');
    
    try {
      await executeQuery(`
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
    
    try {
      await executeQuery(`
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
    
    // Verify the setup
    console.log('\nVerifying setup...');
    const users = await executeQuery(`
      SELECT first_name, last_name, email, role, max_discount_percent, can_approve_discounts
      FROM admin_users 
      WHERE email IN ('manager@evergreenenergy.com', 'salesrep@evergreenenergy.com')
    `);
    
    if (users.length > 0) {
      console.log('✅ Sample users verified:');
      users.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.role}): ${user.max_discount_percent}% max, can approve: ${user.can_approve_discounts}`);
      });
    }
    
    // Check tables
    const approvalRequests = await executeQuery(`
      SELECT COUNT(*) as count FROM approval_requests
    `);
    console.log(`✅ approval_requests table ready (${approvalRequests[0].count} records)`);
    
    const notifications = await executeQuery(`
      SELECT COUNT(*) as count FROM notifications
    `);
    console.log(`✅ notifications table ready (${notifications[0].count} records)`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nThe discount approval workflow is now ready to use:');
    console.log('1. Navigate to /admin/approvals to view the manager dashboard');
    console.log('2. Test by creating a proposal with discount > 10%');
    console.log('3. Manager can approve/reject from the dashboard');
    
  } catch (error) {
    console.error('Migration error:', error.message);
  }
}

completeMigration(); 