// Script to run the activity_log migration
const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../lib/db.js');

async function runMigration() {
  try {
    console.log('Running activity_log migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'redesign_activity_log.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await executeQuery(sql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Fatal error:', err)); 