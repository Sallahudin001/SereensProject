// Simple script to add the new columns to the activity_log table without DO blocks
const { executeQuery } = require('../lib/db.js');

async function addActivityLogColumns() {
  console.log('Updating activity_log table schema...');
  
  try {
    // Check if the table exists
    const tableExists = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activity_log'
      ) as exists;
    `);
    
    if (!tableExists[0].exists) {
      console.log('Table activity_log does not exist. Creating it...');
      
      await executeQuery(`
        CREATE TABLE activity_log (
          id SERIAL PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          user_id VARCHAR(100) NOT NULL,
          proposal_id INTEGER,
          details JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Created activity_log table');
    }
    
    // Get existing columns
    const columns = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log';
    `);
    
    const existingColumns = columns.map(col => col.column_name);
    console.log('Existing columns:', existingColumns.join(', '));
    
    // Add entity_type column if it doesn't exist
    if (!existingColumns.includes('entity_type')) {
      await executeQuery(`
        ALTER TABLE activity_log 
        ADD COLUMN entity_type VARCHAR(50) DEFAULT 'none' NOT NULL;
      `);
      console.log('✅ Added entity_type column');
      
      // Add constraint
      await executeQuery(`
        ALTER TABLE activity_log 
        ADD CONSTRAINT activity_log_entity_type_check
        CHECK (entity_type IN ('proposal', 'user', 'pricing', 'financing', 'approval', 'system', 'none'));
      `);
      console.log('✅ Added entity_type check constraint');
    }
    
    // Add user_reference_id column if it doesn't exist
    if (!existingColumns.includes('user_reference_id')) {
      await executeQuery(`
        ALTER TABLE activity_log 
        ADD COLUMN user_reference_id VARCHAR(100);
      `);
      console.log('✅ Added user_reference_id column');
    }
    
    // Add entity_id column if it doesn't exist
    if (!existingColumns.includes('entity_id')) {
      await executeQuery(`
        ALTER TABLE activity_log 
        ADD COLUMN entity_id INTEGER;
      `);
      console.log('✅ Added entity_id column');
    }
    
    // Add status column if it doesn't exist
    if (!existingColumns.includes('status')) {
      await executeQuery(`
        ALTER TABLE activity_log 
        ADD COLUMN status VARCHAR(20) DEFAULT 'success';
      `);
      console.log('✅ Added status column');
    }
    
    // Create indexes if they don't exist
    // We can't easily check if indexes exist in a Postgres-agnostic way,
    // so we'll use a try-catch approach
    
    // Add index on entity_type
    try {
      await executeQuery(`
        CREATE INDEX idx_activity_log_entity_type 
        ON activity_log(entity_type);
      `);
      console.log('✅ Created idx_activity_log_entity_type index');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('Index idx_activity_log_entity_type already exists');
      } else {
        throw e;
      }
    }
    
    // Add index on entity_id
    try {
      await executeQuery(`
        CREATE INDEX idx_activity_log_entity_id 
        ON activity_log(entity_id);
      `);
      console.log('✅ Created idx_activity_log_entity_id index');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('Index idx_activity_log_entity_id already exists');
      } else {
        throw e;
      }
    }
    
    // Add index on user_reference_id
    try {
      await executeQuery(`
        CREATE INDEX idx_activity_log_user_reference_id 
        ON activity_log(user_reference_id);
      `);
      console.log('✅ Created idx_activity_log_user_reference_id index');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('Index idx_activity_log_user_reference_id already exists');
      } else {
        throw e;
      }
    }
    
    // Update existing records to set entity_type based on action
    await executeQuery(`
      UPDATE activity_log 
      SET entity_type = 'proposal' 
      WHERE (entity_type = 'none' OR entity_type IS NULL)
      AND (action LIKE 'create_proposal' OR action LIKE 'update_status_%');
    `);
    
    await executeQuery(`
      UPDATE activity_log 
      SET entity_type = 'user' 
      WHERE (entity_type = 'none' OR entity_type IS NULL)
      AND action = 'update_permissions';
    `);
    
    await executeQuery(`
      UPDATE activity_log 
      SET entity_type = 'pricing' 
      WHERE (entity_type = 'none' OR entity_type IS NULL)
      AND action = 'update_pricing_table';
    `);
    
    await executeQuery(`
      UPDATE activity_log 
      SET entity_type = 'financing' 
      WHERE (entity_type = 'none' OR entity_type IS NULL)
      AND action = 'update_financing_table';
    `);
    
    await executeQuery(`
      UPDATE activity_log 
      SET entity_type = 'approval' 
      WHERE (entity_type = 'none' OR entity_type IS NULL)
      AND action IN ('request_discount', 'approved_discount', 'rejected_discount');
    `);
    
    console.log('✅ Updated entity_type for existing records');
    
    // Add table and column comments
    await executeQuery(`
      COMMENT ON TABLE activity_log IS 'Stores all system activity with improved entity references';
    `);
    
    await executeQuery(`
      COMMENT ON COLUMN activity_log.entity_type IS 'Type of entity this activity relates to (proposal, user, pricing, etc.)';
    `);
    
    await executeQuery(`
      COMMENT ON COLUMN activity_log.entity_id IS 'Generic ID reference to the entity in its respective table';
    `);
    
    await executeQuery(`
      COMMENT ON COLUMN activity_log.user_reference_id IS 'Reference to a user when the activity is about a user other than the actor';
    `);
    
    await executeQuery(`
      COMMENT ON COLUMN activity_log.status IS 'Status of the activity (success, failed, pending)';
    `);
    
    console.log('✅ Added table and column comments');
    
    // Show current schema
    const updatedColumns = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log'
      ORDER BY column_name;
    `);
    
    console.log('\nCurrent activity_log table columns:');
    updatedColumns.forEach(column => {
      console.log(`- ${column.column_name}`);
    });
    
    // Show row count
    const countResult = await executeQuery(`
      SELECT COUNT(*) as count FROM activity_log;
    `);
    
    console.log(`\nTotal activity log entries: ${countResult[0].count}`);
    
    // Show entity type distribution
    const entityTypeResult = await executeQuery(`
      SELECT entity_type, COUNT(*) as count 
      FROM activity_log 
      GROUP BY entity_type 
      ORDER BY count DESC;
    `);
    
    console.log('\nEntity type distribution:');
    entityTypeResult.forEach(row => {
      console.log(`- ${row.entity_type}: ${row.count} entries`);
    });
    
    console.log('\n✅ Migration completed successfully');
    
  } catch (error) {
    console.error('Error updating activity_log schema:', error);
    process.exit(1);
  }
}

// Execute if this script is run directly
if (require.main === module) {
  addActivityLogColumns().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
} else {
  // Export for use in other scripts
  module.exports = { addActivityLogColumns };
} 