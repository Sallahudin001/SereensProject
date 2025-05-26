import { createClient } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('Checking database connection...');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not defined in environment');
      process.exit(1);
    }
    
    console.log('Database URL:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    // Create Neon client
    const sql = createClient({
      connectionString: process.env.DATABASE_URL
    });
    
    // Test the connection
    console.log('Executing query...');
    const result = await sql(`SELECT NOW() as time`);
    console.log('Database connected successfully!');
    console.log('Current time from DB:', result.rows[0].time);
    
    // Check users table
    try {
      console.log('\nChecking users table...');
      const usersTable = await sql(`SELECT * FROM users LIMIT 5`);
      console.log(`Found ${usersTable.rows.length} users in the database.`);
      if (usersTable.rows.length > 0) {
        console.log('Sample user data:', usersTable.rows[0]);
      }
    } catch (tableError) {
      console.error('Error checking users table:', tableError.message);
      
      // Check if table exists
      const tableCheck = await sql(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.error('The users table does not exist in the database.');
        console.log('Creating users table...');
        
        try {
          await sql(`
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              clerk_id VARCHAR(255) NOT NULL UNIQUE,
              email VARCHAR(255) NOT NULL,
              name VARCHAR(255),
              role VARCHAR(50),
              metadata JSONB,
              last_login TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log('Successfully created users table!');
        } catch (createError) {
          console.error('Failed to create users table:', createError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

main(); 