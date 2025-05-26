// Script to check the structure of the pricing table
const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function checkPricingTable() {
  console.log('Checking pricing table structure...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }
  
  try {
    // Connect to database
    const sql = neon(process.env.DATABASE_URL);
    console.log('Connected to database');
    
    // Check if pricing table exists
    const tableExists = await sql.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pricing'
      );
    `);
    
    console.log('Table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Get table structure
      const columns = await sql.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'pricing'
        ORDER BY ordinal_position;
      `);
      
      console.log('Table structure:');
      console.table(columns);
      
      // Get sample data
      const sampleData = await sql.query(`
        SELECT * FROM pricing LIMIT 3;
      `);
      
      console.log('Sample data:');
      console.log(JSON.stringify(sampleData, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPricingTable().catch(console.error); 