const { sql } = require('../lib/db');

async function checkPricingTable() {
  try {
    console.log('Directly checking pricing table structure...');
    
    // Get column information from the pricing table
    const result = await sql.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pricing'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current pricing table columns:');
    result.forEach(col => console.log(` - ${col.column_name}`));
    
    // Check if specific columns exist
    const paymentFactorExists = result.some(col => col.column_name === 'payment_factor');
    const merchantFeeExists = result.some(col => col.column_name === 'merchant_fee');
    
    if (!paymentFactorExists && !merchantFeeExists) {
      console.log('\nSUCCESS: payment_factor and merchant_fee columns have been removed!');
    } else {
      console.log('\nWARNING: Some columns still exist:');
      if (paymentFactorExists) console.log('- payment_factor column still exists');
      if (merchantFeeExists) console.log('- merchant_fee column still exists');
    }
    
  } catch (error) {
    console.error('Error checking pricing table:', error);
  }
}

checkPricingTable(); 