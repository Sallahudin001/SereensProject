// Simple script to check database connectivity
const { neon } = require('@neondatabase/serverless');

// Hard-coded for testing - replace with your actual connection string
const DATABASE_URL = "postgres://default:Q1IaokPXMxrg@ep-icy-haze-05477472.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require";

async function testConnection() {
  console.log('Starting database connection test...');
  
  try {
    // Create Neon client with the hardcoded connection string
    console.log('Creating database client...');
    const sql = neon(DATABASE_URL);
    
    // Test the connection
    console.log('Testing connection...');
    const result = await sql(`SELECT NOW() as time`);
    console.log('Database connected successfully!');
    console.log('Current time from DB:', result[0]?.time);
    
    // Check if users table exists
    console.log('Checking if users table exists...');
    const tableCheck = await sql(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `);
    
    if (tableCheck[0]?.exists) {
      console.log('Users table exists!');
      
      // Check users in the table
      const users = await sql(`SELECT * FROM users LIMIT 5`);
      console.log(`Found ${users.length} users in the database:`);
      users.forEach((user, i) => {
        console.log(`User ${i+1}:`, user);
      });
    } else {
      console.log('Users table does not exist. Creating...');
      
      // Create the users table
      await sql(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          clerk_id VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50),
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Users table created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 