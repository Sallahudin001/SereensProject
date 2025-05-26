// Test script for financing plans
const { Pool } = require('pg');
require('dotenv').config();

// Get database connection settings from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testFinancingPlans() {
  try {
    // Fetch all financing plans
    console.log('Fetching financing plans...');
    const plansResult = await pool.query(`
      SELECT * FROM financing_plans
      ORDER BY provider, plan_name
    `);
    
    console.log(`Found ${plansResult.rows.length} financing plans:`);
    plansResult.rows.forEach((plan, index) => {
      console.log(`\nPlan #${index + 1}:`);
      console.log(`  ID: ${plan.id}`);
      console.log(`  Provider: ${plan.provider}`);
      console.log(`  Plan Name: ${plan.plan_name}`);
      console.log(`  Interest Rate: ${plan.interest_rate}%`);
      console.log(`  Term: ${plan.term_months} months`);
      console.log(`  Payment Factor: ${plan.payment_factor}`);
      console.log(`  Merchant Fee: ${plan.merchant_fee}%`);
      console.log(`  Active: ${plan.is_active ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('Error testing financing plans:', error);
  } finally {
    await pool.end();
  }
}

testFinancingPlans(); 