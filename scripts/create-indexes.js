const { executeQuery } = require('../lib/db');

async function createIndexes() {
  console.log('Creating performance indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_lifestyle_upsells_category ON lifestyle_upsells(category);',
    'CREATE INDEX IF NOT EXISTS idx_bundle_rules_priority ON bundle_rules(priority DESC);',
    'CREATE INDEX IF NOT EXISTS idx_proposal_offers_proposal_id ON proposal_offers(proposal_id);',
    'CREATE INDEX IF NOT EXISTS idx_upsell_interactions_proposal_id ON upsell_interactions(proposal_id);'
  ];

  try {
    for (let i = 0; i < indexes.length; i++) {
      console.log(`Creating index ${i + 1}/${indexes.length}...`);
      await executeQuery(indexes[i]);
      console.log(`✓ Index ${i + 1} created successfully`);
    }
    
    console.log('✅ All indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    process.exit(1);
  }
}

createIndexes(); 