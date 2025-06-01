// Script to run the simple SQL migration
const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../lib/db.js');

async function runMigration() {
  try {
    console.log('Running simple activity_log migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'simple_activity_log.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await executeQuery(sql);
    
    console.log('✅ Migration completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Run the function
runMigration()
  .then(success => {
    if (success) {
      console.log('Done!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 