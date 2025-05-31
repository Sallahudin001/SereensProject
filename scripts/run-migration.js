// Run migration script using the app's database connection
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();
const { executeQuery } = require('../lib/db.js');

// Configure database connection
const pool = new Pool({
  // Use environment variables for security
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    // Read the migration SQL file
    const sqlFile = path.join(__dirname, '../migrations/add_unique_constraint_to_financing_plans.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Starting migration to add uniqueness constraint to financing plans...');
    
    // Run the SQL in a transaction
    await client.query('BEGIN');
    
    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Migration completed successfully!');
      console.log('A uniqueness constraint has been added to prevent duplicate financing plans.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error executing SQL, transaction rolled back:', err.message);
      throw err;
    }
  } catch (error) {
    console.error('Error running migration:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function runActivityLogMigration() {
  console.log('Running activity log schema migration...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'improve_activity_log_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await executeQuery(migrationSql);
    
    console.log('✅ Activity log schema migration completed successfully');
    
    // Check if the migration was applied correctly
    const columnsResult = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log'
      ORDER BY column_name;
    `);
    
    console.log('Current activity_log table columns:');
    columnsResult.forEach(column => {
      console.log(`- ${column.column_name}`);
    });
    
    // Show row count
    const countResult = await executeQuery(`
      SELECT COUNT(*) as count FROM activity_log;
    `);
    
    console.log(`\nTotal activity log entries: ${countResult[0].count}`);
    
    // Show entity type distribution
    if (columnsResult.some(col => col.column_name === 'entity_type')) {
      const entityTypeResult = await executeQuery(`
        SELECT entity_type, COUNT(*) as count 
        FROM activity_log 
        GROUP BY entity_type 
        ORDER BY count DESC;
      `);
      
      console.log('\nEntity type distribution:');
      entityTypeResult.forEach(row => {
        console.log(`- ${row.entity_type}: ${row.count} entries`);
      });
    }
    
  } catch (error) {
    console.error('Error running activity log migration:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();

// Execute the function if this script is run directly
if (require.main === module) {
  runActivityLogMigration().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch(err => {
    console.error('Migration script failed:', err);
    process.exit(1);
  });
} else {
  // Export for use in other scripts
  module.exports = { runActivityLogMigration };
} 