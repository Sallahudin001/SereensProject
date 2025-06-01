const { executeQuery } = require('./lib/db.js');

async function verifyRemoval() {
  try {
    console.log('Checking remaining activity-related tables...');
    
    // Check for tables
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'activity%'
    `);
    
    if (tables.length === 0) {
      console.log('✅ No activity-related tables found.');
    } else {
      console.log('⚠️ Some activity-related tables still exist:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // Check for views
    const views = await executeQuery(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'activity%'
    `);
    
    if (views.length === 0) {
      console.log('✅ No activity-related views found.');
    } else {
      console.log('⚠️ Some activity-related views still exist:');
      views.forEach(view => {
        console.log(`   - ${view.table_name}`);
      });
    }
    
    // Check for functions
    const functions = await executeQuery(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
      AND routine_name LIKE '%activity%' OR routine_name = 'log_activity'
    `);
    
    if (functions.length === 0) {
      console.log('✅ No activity-related functions found.');
    } else {
      console.log('⚠️ Some activity-related functions still exist:');
      functions.forEach(func => {
        console.log(`   - ${func.routine_name}`);
      });
    }
    
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

verifyRemoval(); 