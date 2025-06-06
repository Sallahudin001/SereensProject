// Script to apply the product pricing table migration
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
if (process.env.DATABASE_URL.includes('ssl=true') || process.env.DATABASE_URL.includes('sslmode=require')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

// Add connection timeout and retry settings
poolConfig.connectionTimeoutMillis = 10000;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.max = 10;

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
  console.log('Starting product pricing table migration...');
  console.log(`Using database connection: ${process.env.DATABASE_URL.split('@')[1] || 'local'}`);
  
  // Path to migration SQL file
  const migrationPath = path.resolve(__dirname, '../migrations/create_product_pricing_table.sql');
  
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to database');
    
    // Try to execute the SQL file
    const success = await executeSqlFromFile(migrationPath, client);
    
    if (success) {
      console.log('Product pricing table migration completed successfully');
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