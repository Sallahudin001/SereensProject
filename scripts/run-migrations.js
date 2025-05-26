const fs = require('fs');
const path = require('path');
require('dotenv').config(); // will use .env that already exists

// Import the existing database client
const { sql } = require('../lib/db');

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Read migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Execute migration using the existing neon client
      await sql.query(sqlContent);
      console.log(`Completed migration: ${file}`);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations(); 