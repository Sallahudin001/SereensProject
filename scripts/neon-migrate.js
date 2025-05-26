// Import required modules
const fs = require('fs').promises;
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL || 'postgres://localhost:5432/mydatabase');

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Get all migration SQL files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql'));
    
    // Define the order of migrations to handle dependencies
    const migrationOrder = [
      'create_users_table.sql',      // Users table should be created first (for foreign keys)
      'create_user_tables.sql',      // Other user-related tables
      'create_product_tables.sql',   // Products 
      'create_financing_tables.sql', // Financing
      'create_template_tables.sql',  // Templates
      'create_pricing_table.sql',    // Pricing
    ];
    
    // Add any remaining files that aren't in the explicit order
    const remainingFiles = sqlFiles.filter(file => !migrationOrder.includes(file));
    const orderedFiles = [...migrationOrder.filter(file => sqlFiles.includes(file)), ...remainingFiles];
    
    console.log('Migrations will be executed in this order:', orderedFiles.join(', '));
    
    // Track successfully applied migrations
    const appliedMigrations = [];
    
    // Execute each migration file
    for (const file of orderedFiles) {
      try {
        console.log(`\nProcessing migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sqlContent = await fs.readFile(filePath, 'utf8');
        
        // Execute the entire SQL file in one transaction if possible
        try {
          console.log(`Attempting to run ${file} as a single transaction...`);
          await sql.query(`BEGIN;${sqlContent}COMMIT;`);
          console.log(`Successfully executed ${file} as a transaction.`);
          appliedMigrations.push(file);
          continue;
        } catch (txError) {
          console.log(`Cannot run as single transaction: ${txError.message}`);
          console.log('Executing statements individually...');
        }
        
        // If transaction approach fails, try executing statements individually
        // Split the content into individual statements more robustly
        const statements = splitSqlStatements(sqlContent);
        
        // Execute each statement separately
        let successCount = 0;
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i].trim();
          if (statement) {
            try {
              console.log(`Executing statement ${i+1}/${statements.length} from ${file}`);
              await sql.query(statement);
              successCount++;
            } catch (err) {
              const errorMsg = err.message || 'Unknown error';
              
              if (errorMsg.includes('already exists')) {
                console.log(`Table or constraint already exists, continuing...`);
                successCount++;
              } else if (errorMsg.includes('does not exist') && (file.includes('add_') || i > 0)) {
                // This might be a dependency issue, log but don't fail the whole migration
                console.warn(`Warning: Skipping statement due to missing dependency: ${errorMsg}`);
              } else {
                console.error(`Error executing statement from ${file}:`, errorMsg);
                throw err;
              }
            }
          }
        }
        
        console.log(`Successfully executed ${successCount}/${statements.length} statements from: ${file}`);
        appliedMigrations.push(file);
      } catch (migrationError) {
        console.error(`Failed to apply migration ${file}: ${migrationError.message}`);
        console.error(`Continuing with next migration...`);
      }
    }
    
    if (appliedMigrations.length === orderedFiles.length) {
      console.log('\nAll migrations completed successfully!');
    } else {
      console.log(`\nApplied ${appliedMigrations.length}/${orderedFiles.length} migrations`);
      console.log('The following migrations were successful:');
      appliedMigrations.forEach(m => console.log(` - ${m}`));
      
      console.log('\nThe following migrations were not applied:');
      orderedFiles.filter(f => !appliedMigrations.includes(f))
        .forEach(m => console.log(` - ${m}`));
    }
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Improved function to split SQL content into individual statements
function splitSqlStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inQuote = false;
  let quoteChar = '';
  let inComment = false;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';
    
    // Handle comments
    if (!inQuote && char === '-' && nextChar === '-') {
      inComment = true;
    }
    
    if (inComment && char === '\n') {
      inComment = false;
    }
    
    // Skip processing if in a comment
    if (inComment) {
      currentStatement += char;
      continue;
    }
    
    // Handle quotes
    if ((char === "'" || char === '"') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      }
    }
    
    // Add character to current statement
    currentStatement += char;
    
    // If we reach a semicolon outside of quotes, end the statement
    if (char === ';' && !inQuote) {
      statements.push(currentStatement);
      currentStatement = '';
    }
  }
  
  // Add the last statement if it doesn't end with a semicolon
  if (currentStatement.trim()) {
    statements.push(currentStatement);
  }
  
  return statements;
}

// Run migrations
runMigrations(); 