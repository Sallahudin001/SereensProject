// Import required modules
const fs = require('fs').promises;
const path = require('path');
const { executeQuery } = require('../lib/db');

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Get all migration SQL files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));
    
    // Sort files to ensure proper execution order
    sqlFiles.sort();
    
    // Execute each migration file
    for (const file of sqlFiles) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = await fs.readFile(filePath, 'utf8');
      
      try {
        // Execute the entire SQL file - the executeQuery function now handles multiple statements
        await executeQuery(sqlContent);
        console.log(`Successfully executed: ${file}`);
      } catch (err) {
        console.error(`Error executing migration file: ${file}`);
        throw err;
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 