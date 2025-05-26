// Script to assign user_id to existing proposals and customers
const { Pool } = require('pg');
require('dotenv').config();

// Configure database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getAdminUser() {
  try {
    // Get the first admin user from the database
    const result = await pool.query(`
      SELECT clerk_id FROM users WHERE role = 'admin' LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      return result.rows[0].clerk_id;
    } else {
      console.log("No admin user found. Checking any user...");
      
      // Get any user if no admin exists
      const anyUserResult = await pool.query(`
        SELECT clerk_id FROM users LIMIT 1
      `);
      
      if (anyUserResult.rows.length > 0) {
        return anyUserResult.rows[0].clerk_id;
      } else {
        throw new Error("No users found in the database");
      }
    }
  } catch (error) {
    console.error("Error getting admin user:", error);
    throw error;
  }
}

async function assignUserToProposals(userId) {
  try {
    console.log(`Assigning user_id ${userId} to existing proposals...`);
    
    // Update proposals without user_id
    const result = await pool.query(`
      UPDATE proposals 
      SET user_id = $1
      WHERE user_id IS NULL OR user_id = ''
      RETURNING id
    `, [userId]);
    
    console.log(`Updated ${result.rowCount} proposals with user_id ${userId}`);
    return result.rowCount;
  } catch (error) {
    console.error("Error assigning user to proposals:", error);
    throw error;
  }
}

async function assignUserToCustomers(userId) {
  try {
    console.log(`Assigning user_id ${userId} to existing customers...`);
    
    // Update customers without user_id
    const result = await pool.query(`
      UPDATE customers 
      SET user_id = $1
      WHERE user_id IS NULL OR user_id = ''
      RETURNING id
    `, [userId]);
    
    console.log(`Updated ${result.rowCount} customers with user_id ${userId}`);
    return result.rowCount;
  } catch (error) {
    console.error("Error assigning user to customers:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting user assignment process...');
    
    // Get admin user ID
    const adminUserId = await getAdminUser();
    console.log(`Using admin user ID: ${adminUserId}`);
    
    // Assign user_id to proposals
    const proposalsUpdated = await assignUserToProposals(adminUserId);
    
    // Assign user_id to customers
    const customersUpdated = await assignUserToCustomers(adminUserId);
    
    console.log('User assignment complete!');
    console.log(`Updated ${proposalsUpdated} proposals and ${customersUpdated} customers`);
  } catch (error) {
    console.error('Assignment process failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

main(); 