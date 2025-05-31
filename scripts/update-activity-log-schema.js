// Script to update the activity_log table schema
const { executeQuery } = require('../lib/db.js');
const fs = require('fs');
const path = require('path');

async function updateActivityLogSchema() {
  console.log('Updating activity_log table schema...');
  
  try {
    // Check if table exists
    const tableExists = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activity_log'
      ) as exists
    `);
    
    if (!tableExists[0].exists) {
      console.log('❌ activity_log table does not exist. Creating first...');
      
      // Create the table with the updated schema
      await executeQuery(`
        CREATE TABLE activity_log (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER,
          user_id VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          details JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ activity_log table created with updated schema');
      
      // Create indexes
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
        CREATE INDEX IF NOT EXISTS idx_activity_log_proposal_id ON activity_log(proposal_id);
        CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
      `);
      
      console.log('✅ Created indexes for activity_log table');
      return;
    }
    
    console.log('✅ activity_log table exists. Checking structure...');
    
    // Check if proposal_id is NOT NULL
    const columnInfo = await executeQuery(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log' AND column_name = 'proposal_id'
    `);
    
    if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'NO') {
      console.log('❌ proposal_id is NOT NULL. Updating to allow NULL values...');
      
      // Read the migration SQL file
      const migrationPath = path.join(__dirname, '..', 'migrations', 'update_activity_log_schema.sql');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the migration
      await executeQuery(migrationSql);
      
      console.log('✅ Successfully updated activity_log table schema');
    } else {
      console.log('✅ activity_log table schema already up to date');
    }
    
  } catch (error) {
    console.error('Error updating activity_log schema:', error);
    process.exit(1);
  }
}

// Run the function
updateActivityLogSchema().then(() => {
  console.log('Schema update complete.');
  process.exit(0);
}).catch(err => {
  console.error('Failed to update schema:', err);
  process.exit(1);
}); 