// Script to apply migrations to add user_id columns
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configure database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration(fileName) {
  try {
    const filePath = path.join(__dirname, '../migrations', fileName);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Applying migration: ${fileName}`);
    await pool.query(sql);
    console.log(`Migration applied successfully: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Error applying migration ${fileName}:`, error);
    return false;
  }
}

async function main() {
  try {
    console.log('Starting migrations...');
    
    // Add user_id to proposals
    const proposalsMigration = await runMigration('add_user_id_to_proposals.sql');
    
    // Add user_id to customers
    const customersMigration = await runMigration('add_user_id_to_customers.sql');
    
    if (proposalsMigration && customersMigration) {
      console.log('All migrations applied successfully!');
    } else {
      console.log('Some migrations failed. Check logs above for details.');
    }
  } catch (error) {
    console.error('Migration process failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

main(); 