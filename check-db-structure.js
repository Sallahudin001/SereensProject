const { executeQuery } = require('./lib/db.js');

async function checkDBStructure() {
  try {
    console.log('=== Checking Database Structure ===');
    
    // Get all tables
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\nTables in database:');
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
    // Check if activity_log exists and its structure
    const activityLogExists = tables.some(t => t.table_name === 'activity_log');
    
    if (activityLogExists) {
      console.log('\n=== Activity Log Table Structure ===');
      const columns = await executeQuery(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'activity_log'
        ORDER BY ordinal_position
      `);
      
      console.log('Current columns:');
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Get some sample data
      const sampleData = await executeQuery(`
        SELECT action, entity_type, COUNT(*) as count
        FROM activity_log 
        GROUP BY action, entity_type 
        ORDER BY count DESC 
        LIMIT 10
      `);
      
      console.log('\nSample activity data:');
      sampleData.forEach(row => {
        console.log(`- ${row.action} (${row.entity_type || 'none'}): ${row.count} records`);
      });
    } else {
      console.log('\n❌ activity_log table does not exist');
    }
    
    // Check key related tables
    console.log('\n=== Key Related Tables ===');
    const keyTables = ['proposals', 'approval_requests', 'admin_users', 'users'];
    
    for (const tableName of keyTables) {
      const exists = tables.some(t => t.table_name === tableName);
      if (exists) {
        const count = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${count[0].count} records`);
      } else {
        console.log(`❌ ${tableName}: does not exist`);
      }
    }
    
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
}

checkDBStructure(); 