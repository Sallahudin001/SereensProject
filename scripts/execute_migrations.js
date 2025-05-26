require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function executeMigration() {
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
    // Create migrations_log table if it doesn't exist to track executed migrations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get list of executed migrations
    const { rows: executedMigrations } = await pool.query('SELECT migration_name FROM migrations_log');
    const executedMigrationNames = executedMigrations.map(row => row.migration_name);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort for deterministic order
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute migrations that haven't been executed yet
    for (const migrationFile of migrationFiles) {
      if (executedMigrationNames.includes(migrationFile)) {
        console.log(`Migration ${migrationFile} already executed, skipping`);
        continue;
      }
      
      console.log(`Executing migration: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      const sqlQuery = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute in a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sqlQuery);
        
        // Log the migration as executed
        await client.query(
          'INSERT INTO migrations_log (migration_name) VALUES ($1)',
          [migrationFile]
        );
        
        await client.query('COMMIT');
        console.log(`Migration ${migrationFile} executed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error executing migration ${migrationFile}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
    
    console.log('All migrations executed successfully');
    await pool.end();
  } catch (error) {
    console.error('Error executing migrations:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the migration
executeMigration().catch(console.error); 