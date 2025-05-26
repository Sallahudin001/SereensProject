// Script to apply the product schema update migration
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not defined.');
  console.error('Please set it in your .env file or environment.');
  process.exit(1);
}

// Connection config with fallback options
let poolConfig = {
  connectionString: process.env.DATABASE_URL
};

// If using SSL, add ssl options
if (process.env.DATABASE_URL.includes('ssl=true')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

// Function to execute SQL statements directly from the migration file
async function executeSqlFromFile(filePath, client) {
  console.log(`Reading SQL from ${filePath}`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    console.log('SQL file content loaded successfully');
    
    // Split SQL by semicolons to execute statements separately
    const statements = sqlContent.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        console.log(`Successfully executed statement ${i+1}/${statements.length}`);
      } catch (err) {
        // Log error but continue with next statement
        console.error(`Error executing statement ${i+1}: ${err.message}`);
        console.error('Statement:', stmt.substring(0, 150) + '...');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error reading or executing SQL file:', error);
    return false;
  }
}

async function run() {
  console.log('Starting product schema update...');
  console.log(`Using database connection: ${process.env.DATABASE_URL.split('@')[1] || 'local'}`);
  
  // Path to migration SQL file
  const migrationPath = path.resolve(__dirname, '../migrations/update_product_schema.sql');
  
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to database');
    
    // Try to execute the SQL file
    const success = await executeSqlFromFile(migrationPath, client);
    
    if (success) {
      // Log the migration in history
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS migration_history (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          INSERT INTO migration_history (name)
          VALUES ($1)
        `, ['update_product_schema']);
        
        console.log('Migration recorded in history table');
      } catch (err) {
        console.error('Error recording migration in history:', err.message);
      }
      
      console.log('Product schema update process completed');
    } else {
      console.error('Failed to execute all migration statements');
    }
  } catch (error) {
    console.error('Database connection or query error:', error.message);
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    await pool.end();
    console.log('Connection pool closed');
  }
}

// Run the migration
run().catch(err => {
  console.error('Unhandled error in migration script:', err);
  process.exit(1);
}); 