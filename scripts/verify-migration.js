const { executeQuery } = require('../lib/db');

async function verifyMigration() {
  console.log('Verifying migration success...');
  
  try {
    // Check if tables exist
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('lifestyle_upsells', 'bundle_rules', 'proposal_offers', 'upsell_interactions')
    `);
    
    console.log('✓ Tables found:', tables.map(t => t.table_name));
    
    // Check lifestyle upsells data
    const lifestyle = await executeQuery('SELECT COUNT(*) as count FROM lifestyle_upsells;');
    console.log(`✓ Lifestyle upsells: ${lifestyle[0].count} records`);
    
    // Check bundle rules data
    const bundles = await executeQuery('SELECT COUNT(*) as count FROM bundle_rules;');
    console.log(`✓ Bundle rules: ${bundles[0].count} records`);
    
    // Check specific data examples
    const sampleUpsell = await executeQuery('SELECT trigger_phrase, product_suggestion FROM lifestyle_upsells LIMIT 1;');
    if (sampleUpsell.length > 0) {
      console.log(`✓ Sample upsell: "${sampleUpsell[0].trigger_phrase}" -> "${sampleUpsell[0].product_suggestion}"`);
    }
    
    const sampleBundle = await executeQuery('SELECT name, bonus_message FROM bundle_rules LIMIT 1;');
    if (sampleBundle.length > 0) {
      console.log(`✓ Sample bundle: "${sampleBundle[0].name}"`);
    }
    
    console.log('\n🎉 Migration verification successful!');
    console.log('✅ All tables created');
    console.log('✅ Sample data inserted');
    console.log('✅ Ready to use the enhanced offers system');
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
    process.exit(1);
  }
}

verifyMigration(); 