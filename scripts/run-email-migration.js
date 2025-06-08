// Migration script to add email tracking fields
const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../lib/db');

async function runEmailMigration() {
  console.log('🔄 Running email tracking migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/04_add_email_tracking_fields.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await executeQuery(migrationSql);
    
    console.log('✅ Email tracking migration completed successfully!');
    console.log('Added email tracking fields to reminders and appointments tables.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runEmailMigration(); 