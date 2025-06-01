// Script to test the activity log implementation
const { executeQuery } = require('../lib/db.js');

async function testActivityLog() {
  try {
    console.log('Testing activity log implementation...');
    
    // 1. Insert a test activity log entry
    await executeQuery(`
      INSERT INTO activity_log (
        action, action_category, actor_id, description,
        target_type, target_id, target_identifier,
        metadata, status
      ) VALUES (
        'test_action', 'test', 'test_clerk_id', 'Test activity log entry',
        'test', 1, 'TEST-123',
        '{"test": true}', 'success'
      )
    `);
    
    console.log('✅ Test entry inserted successfully');
    
    // 2. Verify the entry was added
    const result = await executeQuery(`
      SELECT * FROM activity_log 
      WHERE action = 'test_action' AND actor_id = 'test_clerk_id'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (result.length === 0) {
      throw new Error('Test entry not found in the database');
    }
    
    console.log('✅ Test entry verified in database:');
    console.log(JSON.stringify(result[0], null, 2));
    
    // 3. Count total entries in the activity log
    const countResult = await executeQuery(`
      SELECT COUNT(*) as count FROM activity_log
    `);
    
    console.log(`\nTotal entries in activity_log: ${countResult[0].count}`);
    
    return true;
  } catch (error) {
    console.error('Error testing activity log:', error);
    return false;
  }
}

// Run the test
testActivityLog()
  .then(success => {
    if (success) {
      console.log('\n✅ Activity log implementation is working correctly!');
    } else {
      console.error('\n❌ Activity log test failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  }); 