// Script to execute the DELETE query
require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

async function main() {
  // Make sure we have the DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For connecting to some cloud databases
    }
  });

  try {
    // Read the SQL file content
    const sqlQuery = fs.readFileSync('./delete_customers.sql', 'utf8');
    console.log('Executing query:', sqlQuery);
    
    // Execute the query
    const result = await pool.query(sqlQuery);
    console.log('Query executed successfully');
    console.log(`Deleted ${result.rowCount} customer records with IDs: 6, 7, 8, 9, 10, 12, 13, 15, 20, 21, 30, 31, 32, 35, 37, 38`);
    
    await pool.end();
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    await pool.end();
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Operation completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 