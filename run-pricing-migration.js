const { executeQuery } = require('./lib/db.js');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('🚀 Starting Pricing Breakdown Migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('migrations/add_product_pricing_breakdown.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      // Skip comments-only statements
      if (statements[i].split('\n').every(line => line.trim().startsWith('--') || line.trim() === '')) {
        console.log(`⏭️ Skipping comment-only statement ${i + 1}`);
        continue;
      }
      
      const statement = statements[i] + ';';
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        await executeQuery(statement);
        console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error('Statement:', statement);
        throw error;
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Verify the new columns exist
    console.log('\n🔍 Verifying new columns...');
    const columns = await executeQuery(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'proposals' AND column_name IN ('pricing_breakdown', 'pricing_override')
      ORDER BY ordinal_position
    `);
    
    console.log('\nNew proposal columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verify the new table
    console.log('\n🔍 Verifying custom_pricing_adders table...');
    const tableCheck = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'custom_pricing_adders'
      ) as table_exists
    `);
    
    if (tableCheck[0].table_exists) {
      console.log('✅ custom_pricing_adders table exists');
    } else {
      console.log('❌ custom_pricing_adders table NOT found');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 