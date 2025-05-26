// Run migration script using the app's database connection
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

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

// Run the migration
runMigration(); 