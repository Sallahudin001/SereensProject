const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the database client
const { sql } = require('../lib/db');

async function runPricingMigration() {
  try {
    console.log('Running pricing table column removal migration...');
    
    // Read migration file
    const migrationFile = path.join(__dirname, '../migrations/remove_payment_merchant_from_pricing.sql');
    let sqlContent = fs.readFileSync(migrationFile, 'utf8');
    
    // Split the SQL content into separate statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement && !statement.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement separately
    for(let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i+1}/${statements.length}`);
      console.log(`SQL: ${statements[i]}`);
      
      try {
        await sql.query(statements[i]);
        console.log(`Statement ${i+1} executed successfully`);
      } catch (error) {
        console.error(`Error executing statement ${i+1}:`, error);
        throw error; // Rethrow to stop execution
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('Removed payment_factor and merchant_fee columns from pricing table.');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runPricingMigration();