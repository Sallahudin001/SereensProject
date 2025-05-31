const { executeQuery } = require('../lib/db.js');

async function cleanupRoles() {
  try {
    console.log('🧹 Cleaning up database roles...');
    console.log('📋 This will remove all roles except Admin and User');
    
    // First, check current roles
    const currentRoles = await executeQuery('SELECT * FROM roles ORDER BY name');
    console.log('\n📋 Current roles in database:');
    currentRoles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} - ${role.description}`);
    });
    
    // Remove all role_permissions
    console.log('\n🗑️  Removing all role permissions...');
    await executeQuery('DELETE FROM role_permissions');
    console.log('✅ Role permissions cleared');
    
    // Remove all roles except Admin and User
    console.log('\n🗑️  Removing unnecessary roles...');
    await executeQuery(`DELETE FROM roles WHERE name NOT IN ('Admin', 'User', 'Administrator')`);
    console.log('✅ Unnecessary roles removed');
    
    // Update existing Admin users to have no role_id (since we're using Clerk roles now)
    console.log('\n🔄 Updating admin_users table...');
    await executeQuery('UPDATE admin_users SET role_id = NULL');
    console.log('✅ Admin users updated to use Clerk roles');
    
    // Create/Update only Admin and User roles
    console.log('\n📝 Ensuring Admin and User roles exist...');
    
    // Delete all existing roles first
    await executeQuery('DELETE FROM roles');
    
    // Reset sequence
    await executeQuery('ALTER SEQUENCE roles_id_seq RESTART WITH 1');
    
    // Insert Admin role
    await executeQuery(`
      INSERT INTO roles (id, name, description, created_at, updated_at)
      VALUES (1, 'Admin', 'Full system administrator with all permissions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    // Insert User role
    await executeQuery(`
      INSERT INTO roles (id, name, description, created_at, updated_at)
      VALUES (2, 'User', 'Regular user with standard access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    console.log('✅ Admin and User roles ensured');
    
    // Clean up permissions to only have admin_access and user_access
    console.log('\n🧹 Cleaning up permissions...');
    await executeQuery('DELETE FROM permissions');
    
    await executeQuery(`
      INSERT INTO permissions (id, name, display_name, description, category, created_at)
      VALUES 
        (1, 'admin_access', 'Admin Access', 'Full administrative access to all features', 'system', CURRENT_TIMESTAMP),
        (2, 'user_access', 'User Access', 'Standard user access to regular features', 'system', CURRENT_TIMESTAMP)
    `);
    
    console.log('✅ Permissions cleaned up');
    
    // Set up role permissions
    console.log('\n🔗 Setting up role permissions...');
    await executeQuery(`
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES 
        (1, 1), -- Admin gets admin_access
        (1, 2), -- Admin gets user_access  
        (2, 2)  -- User gets user_access
    `);
    
    console.log('✅ Role permissions set up');
    
    // Final verification
    const finalRoles = await executeQuery(`
      SELECT r.*, COUNT(au.id) as user_count
      FROM roles r
      LEFT JOIN admin_users au ON r.id = au.role_id AND au.is_active = true
      GROUP BY r.id, r.name, r.description
      ORDER BY r.name
    `);
    
    const finalPermissions = await executeQuery('SELECT * FROM permissions ORDER BY name');
    
    console.log('\n🎉 Database cleanup completed!');
    console.log('\n📋 Final roles:');
    finalRoles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} - ${role.description} (${role.user_count} users)`);
    });
    
    console.log('\n🔑 Final permissions:');
    finalPermissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm.name} - ${perm.description}`);
    });
    
    console.log('\n✅ System now uses only Admin and User roles');
    console.log('💡 User roles are now managed through Clerk metadata');
    console.log('🔄 Please refresh your admin dashboard to see changes');
    
  } catch (error) {
    console.error('❌ Error cleaning up roles:', error);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupRoles();
}

module.exports = { cleanupRoles }; 