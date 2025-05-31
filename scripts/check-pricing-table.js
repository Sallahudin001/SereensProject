// Script to check the structure of the pricing table
const fs = require('fs');
const { sql } = require('../lib/db');

async function checkPricingTable() {
  try {
    let output = 'Checking pricing table structure...\n\n';
    
    // Get column information from the pricing table
    const result = await sql.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pricing'
      ORDER BY ordinal_position;
    `);
    
    output += 'Current pricing table structure:\n';
    output += JSON.stringify(result, null, 2) + '\n\n';
    
    // Check if specific columns exist
    const paymentFactorExists = result.some(col => col.column_name === 'payment_factor');
    const merchantFeeExists = result.some(col => col.column_name === 'merchant_fee');
    
    if (!paymentFactorExists && !merchantFeeExists) {
      output += 'SUCCESS: payment_factor and merchant_fee columns have been removed!\n';
    } else {
      output += 'WARNING: Some columns still exist:\n';
      if (paymentFactorExists) output += '- payment_factor column still exists\n';
      if (merchantFeeExists) output += '- merchant_fee column still exists\n';
    }
    
    // Write results to file
    fs.writeFileSync('pricing-table-check.txt', output);
    console.log('Check completed. Results written to pricing-table-check.txt');
    
  } catch (error) {
    console.error('Error checking pricing table:', error);
    fs.writeFileSync('pricing-table-check-error.txt', JSON.stringify(error, null, 2));
  }
}

checkPricingTable(); 