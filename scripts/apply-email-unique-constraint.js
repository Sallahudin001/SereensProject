require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Hardcoded database URL as fallback in case environment variable is missing
const FALLBACK_DB_URL = "postgres://default:Q1IaokPXMxrg@ep-icy-haze-05477472.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require";

async function applyEmailUniqueConstraint() {
  // Use environment variable or fallback
  const DATABASE_URL = process.env.DATABASE_URL || FALLBACK_DB_URL;
  
  console.log(`Using database URL: ${DATABASE_URL.substring(0, 20)}...`);

  // Connection config with proper SSL handling
  let clientConfig = {
    connectionString: DATABASE_URL
  };

  // If using SSL, add ssl options
  if (DATABASE_URL.includes('ssl=true') || 
      DATABASE_URL.includes('sslmode=require')) {
    clientConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  const client = new Client(clientConfig);

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/add_email_unique_constraint.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Check if migration table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      ) as exists
    `);

    // Create migrations table if it doesn't exist
    if (!tableCheck.rows[0].exists) {
      console.log('Creating migrations table...');
      await client.query(`
        CREATE TABLE migrations (
          name VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Migrations table created');
    }

    // Check for duplicate emails before applying constraint
    console.log('Checking for duplicate emails in users table...');
    const duplicateCheck = await client.query(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicateCheck.rows.length > 0) {
      console.log('⚠️ WARNING: Found duplicate emails in users table:');
      duplicateCheck.rows.forEach(row => {
        console.log(`- ${row.email}: ${row.count} occurrences`);
      });
      
      console.log('\nResolving duplicate emails by keeping the most recently updated record...');
      
      // For each duplicate email, keep only the most recently updated record
      for (const row of duplicateCheck.rows) {
        const email = row.email;
        
        // Get all user records with this email
        const users = await client.query(`
          SELECT id, clerk_id, email, updated_at
          FROM users
          WHERE email = $1
          ORDER BY updated_at DESC
        `, [email]);
        
        // Keep the first record (most recently updated) and delete the rest
        if (users.rows.length > 1) {
          const keepId = users.rows[0].id;
          const deleteIds = users.rows.slice(1).map(u => u.id);
          
          console.log(`Keeping user ID ${keepId} for email ${email} and removing ${deleteIds.length} duplicate(s)`);
          
          // Delete duplicate records
          await client.query(`
            DELETE FROM users
            WHERE id = ANY($1)
          `, [deleteIds]);
        }
      }
      
      console.log('Duplicate emails resolved');
    } else {
      console.log('✅ No duplicate emails found');
    }

    // Split SQL by semicolons to execute statements separately
    const statements = migrationSql.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Apply the migration statements one by one
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        console.log(`Successfully executed statement ${i+1}/${statements.length}`);
      } catch (err) {
        console.error(`Error executing statement ${i+1}: ${err.message}`);
        console.error('Statement:', stmt);
        throw err; // Re-throw to stop execution
      }
    }

    console.log('✅ Email unique constraint applied successfully');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyEmailUniqueConstraint().catch(console.error); 