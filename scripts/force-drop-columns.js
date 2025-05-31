const { sql } = require('../lib/db');

async function dropColumns() {
  try {
    console.log('Forcing column removal with direct SQL commands...');
    
    // Drop payment_factor column
    console.log('Dropping payment_factor column...');
    try {
      await sql.query('ALTER TABLE pricing DROP COLUMN payment_factor');
      console.log('Successfully dropped payment_factor column');
    } catch (error) {
      console.error('Error dropping payment_factor:', error.message);
    }
    
    // Drop merchant_fee column
    console.log('Dropping merchant_fee column...');
    try {
      await sql.query('ALTER TABLE pricing DROP COLUMN merchant_fee');
      console.log('Successfully dropped merchant_fee column');
    } catch (error) {
      console.error('Error dropping merchant_fee:', error.message);
    }
    
    // Check if columns were actually dropped
    console.log('Verifying column removal...');
    const columns = await sql.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pricing'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current pricing table columns:');
    columns.forEach(col => console.log(` - ${col.column_name}`));
    
    // Check if specific columns exist
    const paymentFactorExists = columns.some(col => col.column_name === 'payment_factor');
    const merchantFeeExists = columns.some(col => col.column_name === 'merchant_fee');
    
    if (!paymentFactorExists && !merchantFeeExists) {
      console.log('\nSUCCESS: Columns have been removed successfully!');
    } else {
      console.log('\nWARNING: Some columns still exist after attempted removal:');
      if (paymentFactorExists) console.log('- payment_factor column still exists');
      if (merchantFeeExists) console.log('- merchant_fee column still exists');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

dropColumns(); 