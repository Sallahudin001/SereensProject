const { executeQuery } = require('../lib/db.js');

async function directAdminInit() {
  try {
    console.log('🚀 Directly initializing admin system...');
    
    // First, check if permissions already exist
    const existingPermissions = await executeQuery('SELECT COUNT(*) FROM permissions');
    const existingRoles = await executeQuery('SELECT COUNT(*) FROM roles');
    
    console.log(`Found ${existingPermissions[0].count} permissions and ${existingRoles[0].count} roles`);
    
    if (existingPermissions[0].count > 0 && existingRoles[0].count > 0) {
      console.log('✅ Admin system already initialized');
      return;
    }
    
    // Insert permissions one by one
    const permissions = [
      { name: 'view_all', description: 'View all data in the system' },
      { name: 'edit_all', description: 'Edit all data in the system' },
      { name: 'manage_users', description: 'Add, edit, and delete users' },
      { name: 'users:read', description: 'View users' },
      { name: 'users:write', description: 'Manage users' },
      { name: 'manage_pricing', description: 'Update pricing information' },
      { name: 'pricing:read', description: 'View pricing' },
      { name: 'pricing:write', description: 'Update pricing' },
      { name: 'products:read', description: 'View products' },
      { name: 'products:write', description: 'Create/edit products' },
      { name: 'manage_contracts', description: 'Create and edit contract templates' },
      { name: 'view_customers', description: 'View customer information' },
      { name: 'edit_customers', description: 'Edit customer information' },
      { name: 'create_proposals', description: 'Create new proposals' },
      { name: 'view_reports', description: 'View reports and analytics' },
      { name: 'approve_discounts', description: 'Approve discount requests' },
      { name: 'settings:read', description: 'View system settings' },
      { name: 'settings:write', description: 'Edit system settings' }
    ];
    
    console.log('📝 Inserting permissions...');
    for (const perm of permissions) {
      try {
        await executeQuery(`
          INSERT INTO permissions (name, description, created_at, updated_at) 
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (name) DO NOTHING
        `, [perm.name, perm.description]);
      } catch (error) {
        console.log(`Permission ${perm.name} might already exist`);
      }
    }
    
    // Insert roles
    const roles = [
      { name: 'Administrator', description: 'Full system access with all permissions' },
      { name: 'Sales Manager', description: 'Manages sales team and proposals' },
      { name: 'Sales Representative', description: 'Creates and manages proposals' },
      { name: 'Support', description: 'Customer support and basic system access' }
    ];
    
    console.log('📝 Inserting roles...');
    for (const role of roles) {
      try {
        await executeQuery(`
          INSERT INTO roles (name, description, created_at, updated_at) 
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (name) DO NOTHING
        `, [role.name, role.description]);
      } catch (error) {
        console.log(`Role ${role.name} might already exist`);
      }
    }
    
    // Assign all permissions to Administrator
    console.log('📝 Assigning permissions to Administrator...');
    try {
      await executeQuery(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT 
          r.id as role_id,
          p.id as permission_id
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.name = 'Administrator'
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `);
    } catch (error) {
      console.log('Administrator permissions might already be assigned');
    }
    
    // Assign specific permissions to Sales Manager
    console.log('📝 Assigning permissions to Sales Manager...');
    const salesManagerPermissions = [
      'view_all', 'users:read', 'pricing:read', 'pricing:write', 'products:read',
      'view_customers', 'edit_customers', 'create_proposals', 'view_reports', 'approve_discounts'
    ];
    
    for (const permName of salesManagerPermissions) {
      try {
        await executeQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT 
            r.id as role_id,
            p.id as permission_id
          FROM roles r
          JOIN permissions p ON p.name = $1
          WHERE r.name = 'Sales Manager'
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permName]);
      } catch (error) {
        console.log(`Sales Manager permission ${permName} might already be assigned`);
      }
    }
    
    // Assign permissions to Sales Representative
    console.log('📝 Assigning permissions to Sales Representative...');
    const salesRepPermissions = [
      'pricing:read', 'products:read', 'view_customers', 'edit_customers', 'create_proposals'
    ];
    
    for (const permName of salesRepPermissions) {
      try {
        await executeQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT 
            r.id as role_id,
            p.id as permission_id
          FROM roles r
          JOIN permissions p ON p.name = $1
          WHERE r.name = 'Sales Representative'
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permName]);
      } catch (error) {
        console.log(`Sales Representative permission ${permName} might already be assigned`);
      }
    }
    
    // Assign permissions to Support
    console.log('📝 Assigning permissions to Support...');
    const supportPermissions = ['view_customers', 'view_reports'];
    
    for (const permName of supportPermissions) {
      try {
        await executeQuery(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT 
            r.id as role_id,
            p.id as permission_id
          FROM roles r
          JOIN permissions p ON p.name = $1
          WHERE r.name = 'Support'
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [permName]);
      } catch (error) {
        console.log(`Support permission ${permName} might already be assigned`);
      }
    }
    
    // Create default admin user
    console.log('📝 Creating default admin user...');
    try {
      const adminRole = await executeQuery('SELECT id FROM roles WHERE name = $1', ['Administrator']);
      
      if (adminRole.length > 0) {
        await executeQuery(`
          INSERT INTO admin_users (
            clerk_id, role_id, first_name, last_name, email, 
            is_active, max_discount_percent, can_approve_discounts,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO NOTHING
        `, [
          'admin-default', adminRole[0].id, 'System', 'Administrator', 'admin@company.com',
          true, 100.0, true
        ]);
      }
    } catch (error) {
      console.log('Default admin user might already exist');
    }
    
    console.log('✅ Admin system initialization completed!');
    console.log('\nDefault setup includes:');
    console.log('- 18 default permissions');
    console.log('- 4 default roles (Administrator, Sales Manager, Sales Representative, Support)');
    console.log('- Role-permission mappings');
    console.log('- Default admin user (admin@company.com)');
    
  } catch (error) {
    console.error('❌ Error initializing admin system:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  directAdminInit();
}

module.exports = { directAdminInit }; 