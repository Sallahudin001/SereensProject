const { executeQuery } = require('../lib/db.js');
const fs = require('fs');
const path = require('path');

async function initializeAdminSystem() {
  try {
    console.log('🚀 Initializing Admin System...');
    
    // Read the SQL initialization file
    const sqlPath = path.join(__dirname, '../database/init-admin-data.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await executeQuery(statement);
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} skipped (might already exist):`, error.message);
        }
      }
    }
    
    console.log('✅ Admin system initialization completed!');
    console.log('\nDefault setup includes:');
    console.log('- Default permissions (view_all, edit_all, manage_users, etc.)');
    console.log('- Default roles (Administrator, Sales Manager, Sales Representative, Support)');
    console.log('- Role-permission mappings');
    console.log('- Default admin user (admin@company.com)');
    console.log('\n🔑 Next steps:');
    console.log('1. Update the default admin user with your actual Clerk ID');
    console.log('2. Change the default admin email to your actual email');
    console.log('3. Set up proper password hashing (currently using plaintext)');
    
  } catch (error) {
    console.error('❌ Error initializing admin system:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeAdminSystem();
}

module.exports = { initializeAdminSystem }; 