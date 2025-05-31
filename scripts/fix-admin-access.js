const { executeQuery } = require('../lib/db.js');

async function fixAdminAccess() {
  try {
    const clerkId = process.argv[2];
    
    if (!clerkId) {
      console.error('Error: Clerk User ID is required');
      console.log('Usage: node scripts/fix-admin-access.js YOUR_CLERK_USER_ID');
      console.log('');
      console.log('You can find your Clerk User ID in:');
      console.log('1. Clerk Dashboard > Users > Click on your user');
      console.log('2. Browser dev tools > Application > Local Storage > clerk-session');
      process.exit(1);
    }
    
    console.log('🔧 Fixing admin access for Clerk ID:', clerkId);
    
    // Check if user already exists as admin
    const existingAdmin = await executeQuery(
      'SELECT id, email FROM admin_users WHERE clerk_id = $1',
      [clerkId]
    );
    
    if (existingAdmin.length > 0) {
      console.log('✅ User is already set up as admin');
      console.log('User details:', existingAdmin[0]);
      return;
    }
    
    // Check if there's a default admin we can update
    const defaultAdmin = await executeQuery(
      'SELECT id FROM admin_users WHERE clerk_id = $1 OR email = $2',
      ['admin-default', 'admin@company.com']
    );
    
    if (defaultAdmin.length > 0) {
      // Update default admin with the user's Clerk ID
      await executeQuery(`
        UPDATE admin_users SET 
          clerk_id = $1,
          first_name = 'Admin',
          last_name = 'User',
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [clerkId, defaultAdmin[0].id]);
      
      console.log('✅ Updated default admin user with your Clerk ID');
    } else {
      // Create new admin user
      const adminRole = await executeQuery(
        'SELECT id FROM roles WHERE name = $1',
        ['Administrator']
      );
      
      if (adminRole.length === 0) {
        console.error('❌ Administrator role not found. Please run the system initialization first:');
        console.log('node scripts/init-admin-system.js');
        process.exit(1);
      }
      
      await executeQuery(`
        INSERT INTO admin_users (
          clerk_id, role_id, first_name, last_name, email, 
          is_active, max_discount_percent, can_approve_discounts,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        clerkId, adminRole[0].id, 'Admin', 'User', 'admin@company.com',
        true, 100.0, true
      ]);
      
      console.log('✅ Created new admin user for your Clerk ID');
    }
    
    console.log('');
    console.log('🎉 Admin access fixed! You can now:');
    console.log('1. Access the admin dashboard at /admin');
    console.log('2. View and manage users');
    console.log('3. Create and edit roles and permissions');
    console.log('');
    console.log('Please refresh your browser to see the changes.');
    
  } catch (error) {
    console.error('❌ Error fixing admin access:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixAdminAccess();
}

module.exports = { fixAdminAccess }; 