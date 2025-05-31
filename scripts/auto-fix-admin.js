const { executeQuery } = require('../lib/db.js');

async function autoFixAdmin() {
  try {
    console.log('🔍 Looking for users who need admin access...');
    
    // Find users in the regular users table who might need admin access
    const regularUsers = await executeQuery(`
      SELECT clerk_id, email, name FROM users 
      WHERE clerk_id NOT IN (
        SELECT COALESCE(clerk_id, '') FROM admin_users WHERE clerk_id IS NOT NULL
      )
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${regularUsers.length} regular users not in admin system:`);
    regularUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Unknown'} (${user.email}) - ID: ${user.clerk_id}`);
    });
    
    // If there's only one user, auto-promote them
    if (regularUsers.length === 1) {
      const user = regularUsers[0];
      console.log(`\n🚀 Auto-promoting user: ${user.name || user.email}`);
      
      const adminRole = await executeQuery('SELECT id FROM roles WHERE name = $1', ['Administrator']);
      
      if (adminRole.length === 0) {
        console.error('❌ Administrator role not found. Run admin initialization first.');
        return;
      }
      
      const [firstName, ...lastNameParts] = (user.name || 'Admin User').split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      
      await executeQuery(`
        INSERT INTO admin_users (
          clerk_id, role_id, first_name, last_name, email, 
          is_active, max_discount_percent, can_approve_discounts,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO UPDATE SET 
          clerk_id = EXCLUDED.clerk_id,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      `, [
        user.clerk_id, adminRole[0].id, firstName, lastName, user.email,
        true, 100.0, true
      ]);
      
      console.log('✅ Successfully promoted user to admin!');
      console.log('🎉 You can now access the admin dashboard.');
      console.log('Please refresh your browser to see the changes.');
      
    } else if (regularUsers.length > 1) {
      console.log('\n⚠️  Multiple users found. Please specify which one to promote:');
      console.log('Run: npm run admin:fix CLERK_USER_ID');
      
    } else {
      console.log('\n✅ All users already have admin access or no users found.');
    }
    
  } catch (error) {
    console.error('❌ Error during auto-fix:', error);
  }
}

// Run if called directly
if (require.main === module) {
  autoFixAdmin();
}

module.exports = { autoFixAdmin }; 