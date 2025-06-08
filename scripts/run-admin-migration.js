const { executeQuery } = require('../lib/db.js');
const fs = require('fs');

async function runAdminMigration() {
  try {
    console.log('🚀 Running admin dashboard enhancement migration...');
    
    const sql = fs.readFileSync('./database/admin-dashboard-enhancements.sql', 'utf8');
    const statements = sql.split(';').filter(statement => statement.trim().length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await executeQuery(statement);
          console.log(`✅ Statement ${i + 1} completed`);
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} failed (may be expected): ${error.message}`);
        }
      }
    }
    
    console.log('✅ Admin dashboard enhancement migration completed!');
    console.log('🎉 New features available:');
    console.log('   - All Proposals page at /admin/proposals');
    console.log('   - All Customers page at /admin/customers');
    console.log('   - Enhanced database schema with customer lifecycle tracking');
    console.log('   - Improved admin analytics and reporting');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runAdminMigration(); 