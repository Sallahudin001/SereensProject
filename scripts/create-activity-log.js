// Script to create the activity_log table
const { executeQuery } = require('../lib/db.js');

async function createActivityLogTable() {
  try {
    console.log('Creating activity_log table...');
    
    // Create the basic activity_log table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        action_category VARCHAR(50) NOT NULL,
        description TEXT,
        actor_type VARCHAR(20) NOT NULL DEFAULT 'user',
        actor_id VARCHAR(100) NOT NULL,
        actor_name VARCHAR(255),
        target_type VARCHAR(50),
        target_id INTEGER,
        target_identifier VARCHAR(255),
        proposal_id INTEGER,
        approval_request_id INTEGER,
        admin_user_id INTEGER,
        metadata JSONB NOT NULL DEFAULT '{}',
        before_state JSONB,
        after_state JSONB,
        status VARCHAR(20) DEFAULT 'success',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
      CREATE INDEX IF NOT EXISTS idx_activity_log_action_category ON activity_log(action_category);
      CREATE INDEX IF NOT EXISTS idx_activity_log_actor_id ON activity_log(actor_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_proposal_id ON activity_log(proposal_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
    `);
    
    console.log('✅ Activity log table and indexes created successfully!');
    
    // Check the table structure
    const columns = await executeQuery(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log'
      ORDER BY ordinal_position
    `);
    
    console.log('\nActivity log table structure:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    return true;
  } catch (error) {
    console.error('Error creating activity_log table:', error);
    return false;
  }
}

// Run the function
createActivityLogTable()
  .then(success => {
    if (success) {
      console.log('Activity log table creation completed');
    } else {
      console.error('Failed to create activity log table');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 