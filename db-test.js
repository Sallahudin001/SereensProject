// Simple script to check database connectivity
const { neon } = require('@neondatabase/serverless');

// Use the provided connection string
const DATABASE_URL = "postgres://neondb_owner:npg_08pKGFSnHerQ@ep-jolly-dream-a4e95pml-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
  console.log('Starting database connection test...');
  try {
    // Create Neon client with the provided connection string
    const sql = neon(DATABASE_URL);
    // Test the connection using tagged template literal syntax
    const result = await sql`SELECT NOW() as time`;
    console.log('Database connected successfully!');
    console.log('Current time from DB:', result[0]?.time);
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 