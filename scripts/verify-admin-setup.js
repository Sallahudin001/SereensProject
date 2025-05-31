const { executeQuery } = require('../lib/db.js');

async function verifyAdminSetup() {
  try {
    console.log('🔍 Verifying admin system setup...\n');
    
    // Check permissions
    const permissions = await executeQuery('SELECT COUNT(*) FROM permissions');
    console.log(`✅ Permissions: ${permissions[0].count} found`);
    
    // Check roles
    const roles = await executeQuery('SELECT COUNT(*) FROM roles');
    console.log(`✅ Roles: ${roles[0].count} found`);
    
    // Check admin users
    const adminUsers = await executeQuery(`
      SELECT au.id, au.clerk_id, au.email, au.first_name, au.last_name, r.name as role_name
      FROM admin_users au
      LEFT JOIN roles r ON au.role_id = r.id
      WHERE au.is_active = true
      ORDER BY au.created_at DESC
    `);
    
    console.log(`✅ Admin Users: ${adminUsers.length} found`);
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`      Role: ${user.role_name}`);
      console.log(`      Clerk ID: ${user.clerk_id}`);
      console.log('');
    });
    
    // Check role permissions
    const rolePermissions = await executeQuery(`
      SELECT r.name as role_name, COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name
      ORDER BY r.name
    `);
    
    console.log('✅ Role Permissions:');
    rolePermissions.forEach(rp => {
      console.log(`   ${rp.role_name}: ${rp.permission_count} permissions`);
    });
    
    console.log('\n🎉 Admin system verification completed!');
    console.log('\n📋 Summary:');
    console.log(`- ${permissions[0].count} permissions defined`);
    console.log(`- ${roles[0].count} roles created`);
    console.log(`- ${adminUsers.length} admin users configured`);
    console.log('- Role permissions properly assigned');
    
    if (adminUsers.length > 0) {
      console.log('\n✅ You should now be able to access /admin/users');
      console.log('🔄 If you still get "Forbidden", please refresh your browser');
    } else {
      console.log('\n⚠️  No admin users found. Please run:');
      console.log('npm run admin:fix YOUR_CLERK_USER_ID');
    }
    
  } catch (error) {
    console.error('❌ Error verifying admin setup:', error);
  }
}

// Run if called directly
if (require.main === module) {
  verifyAdminSetup();
}

module.exports = { verifyAdminSetup }; 