// Migration script to fix calendar activity log constraint
const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../lib/db');

async function runMigration() {
  console.log('🔄 Running calendar activity log migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/03_add_calendar_activity_categories.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await executeQuery(migrationSql);
    
    console.log('✅ Calendar activity log migration completed successfully!');
    console.log('Activity log constraint has been updated to include calendar categories.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
runMigration(); 