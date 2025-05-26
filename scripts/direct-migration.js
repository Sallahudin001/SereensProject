// Direct SQL migration script with robust error handling
require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database, checking schema...');
    
    // Check if column already exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'proposals' AND column_name = 'financing_plan_id'
      ) as exists
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('Column financing_plan_id already exists, skipping migration');
      return;
    }
    
    // Begin transaction
    console.log('Starting transaction...');
    await client.query('BEGIN');
    
    try {
      // Add columns one by one
      console.log('Adding financing_plan_id column...');
      await client.query(`
        ALTER TABLE proposals
        ADD COLUMN IF NOT EXISTS financing_plan_id INTEGER
      `);
      
      console.log('Adding financing_plan_name column...');
      await client.query(`
        ALTER TABLE proposals
        ADD COLUMN IF NOT EXISTS financing_plan_name VARCHAR(255)
      `);
      
      console.log('Adding merchant_fee column...');
      await client.query(`
        ALTER TABLE proposals
        ADD COLUMN IF NOT EXISTS merchant_fee DECIMAL(10,2)
      `);
      
      console.log('Adding financing_notes column...');
      await client.query(`
        ALTER TABLE proposals
        ADD COLUMN IF NOT EXISTS financing_notes TEXT
      `);
      
      // Create index
      console.log('Creating index...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_proposals_financing_plan 
        ON proposals(financing_plan_id)
      `);
      
      // Try to add foreign key constraint
      try {
        console.log('Checking if financing_plans table exists...');
        const tableFkCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'financing_plans'
          ) as exists
        `);
        
        if (tableFkCheck.rows[0].exists) {
          console.log('Adding foreign key constraint...');
          await client.query(`
            ALTER TABLE proposals
            ADD CONSTRAINT fk_proposals_financing_plan
            FOREIGN KEY (financing_plan_id) 
            REFERENCES financing_plans(id)
            ON DELETE SET NULL
          `);
        } else {
          console.log('Skipping foreign key constraint - financing_plans table not found');
        }
      } catch (fkError) {
        console.warn('Note: Foreign key constraint could not be added:', fkError.message);
        // Continue without foreign key if it fails
      }
      
      // Commit transaction
      console.log('Committing transaction...');
      await client.query('COMMIT');
      console.log('Migration completed successfully!');
      
    } catch (migrationError) {
      // Rollback transaction on error
      console.error('Error during migration, rolling back:', migrationError);
      await client.query('ROLLBACK');
      throw migrationError;
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Release client back to the pool
    client.release();
    await pool.end();
  }
}

// Run the migration
console.log('Starting database migration...');
runMigration()
  .then(() => {
    console.log('Migration script completed');
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 