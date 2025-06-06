// Import required modules with ESM syntax
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeQuery } from '../lib/db.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Get all migration SQL files
    const migrationsDir = path.join(path.dirname(__dirname), 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));
    
    // Sort files to ensure proper execution order
    sqlFiles.sort();
    
    // Execute each migration file
    for (const file of sqlFiles) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Execute the SQL script
      await executeQuery(sql);
      
      console.log(`Successfully executed: ${file}`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 