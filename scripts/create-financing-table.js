require('dotenv').config();
const { Pool } = require('pg');

async function createFinancingTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 
      { rejectUnauthorized: false } : false
  });

  try {
    console.log('Creating financing_plans table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS financing_plans (
        id SERIAL PRIMARY KEY,
        plan_number VARCHAR(50) NOT NULL,
        provider VARCHAR(100) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        interest_rate DECIMAL(5,2) DEFAULT 0,
        term_months INTEGER DEFAULT 0,
        payment_factor DECIMAL(8,4) NOT NULL,
        merchant_fee DECIMAL(5,2) DEFAULT 0,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ financing_plans table created');
    
    // Check if data already exists
    const existing = await pool.query('SELECT COUNT(*) as count FROM financing_plans');
    
    if (existing.rows[0].count === '0') {
      // Add sample data
      await pool.query(`
        INSERT INTO financing_plans (plan_number, provider, plan_name, interest_rate, term_months, payment_factor, merchant_fee, notes) 
        VALUES 
        ('1519', 'Goodleap', 'Same as Cash 18 months', 0, 18, 5.75, 17.5, 'No interest if paid in full within 18 months'),
        ('4158', 'Goodleap', 'Deferred Interest 18 months', 9.99, 18, 5.75, 17.5, 'Deferred interest for 18 months'),
        ('HR20', 'Homerun PACE', '9.99% APR for 20 years', 9.99, 240, 0.96, 10.0, 'PACE financing for 20 years'),
        ('HR25', 'Homerun PACE', '9.99% APR for 25 years', 9.99, 300, 0.88, 10.0, 'PACE financing for 25 years'),
        ('HR30', 'Homerun PACE', '9.99% APR for 30 years', 9.99, 360, 0.84, 10.0, 'PACE financing for 30 years')
      `);
    } else {
      console.log('Sample data already exists, skipping...');
    }
    
    console.log('✅ Sample financing plans added');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createFinancingTable(); 