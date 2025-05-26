// Import required modules
const fs = require('fs').promises;
const path = require('path');
const { executeQuery } = require('../lib/db');

// Function to split SQL content into individual statements
function splitSQLStatements(sqlContent) {
  // Remove comments and empty lines
  const lines = sqlContent.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('--'));
  
  const cleanedSQL = lines.join('\n');
  
  // Split by semicolon, but be careful with arrays and string literals
  const statements = [];
  let currentStatement = '';
  let inStringLiteral = false;
  let inArray = false;
  let arrayDepth = 0;
  
  for (let i = 0; i < cleanedSQL.length; i++) {
    const char = cleanedSQL[i];
    const nextChar = cleanedSQL[i + 1];
    
    if (char === "'" && cleanedSQL[i - 1] !== '\\') {
      inStringLiteral = !inStringLiteral;
    }
    
    if (!inStringLiteral) {
      if (char === 'A' && cleanedSQL.substr(i, 5) === 'ARRAY') {
        // Look ahead for the opening bracket
        const bracketIndex = cleanedSQL.indexOf('[', i);
        if (bracketIndex !== -1 && bracketIndex - i < 10) {
          inArray = true;
          arrayDepth = 1;
        }
      }
      
      if (inArray && char === '[') {
        arrayDepth++;
      }
      
      if (inArray && char === ']') {
        arrayDepth--;
        if (arrayDepth === 0) {
          inArray = false;
        }
      }
      
      if (char === ';' && !inArray) {
        currentStatement += char;
        const trimmedStatement = currentStatement.trim();
        if (trimmedStatement.length > 0) {
          statements.push(trimmedStatement);
        }
        currentStatement = '';
        continue;
      }
    }
    
    currentStatement += char;
  }
  
  // Add any remaining statement
  const trimmedStatement = currentStatement.trim();
  if (trimmedStatement.length > 0) {
    statements.push(trimmedStatement);
  }
  
  return statements.filter(stmt => stmt.length > 0);
}

async function runSingleMigration(filename) {
  console.log('Running single database migration...');
  
  try {
    const filePath = path.join(process.cwd(), 'migrations', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`Migration file not found: ${filename}`);
      process.exit(1);
    }
    
    console.log(`Executing migration: ${filename}`);
    const sqlContent = await fs.readFile(filePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = splitSQLStatements(sqlContent);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        // Log the first 100 characters of the statement for debugging
        const preview = statement.length > 100 ? statement.substring(0, 100) + '...' : statement;
        console.log(`  Statement preview: ${preview}`);
        
        await executeQuery(statement);
        console.log(`  ✓ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`  ✗ Error executing statement ${i + 1}:`);
        console.error(`  Statement: ${statement.substring(0, 200)}...`);
        console.error(`  Error:`, err.message);
        throw err;
      }
    }
    
    console.log(`✅ Successfully executed migration: ${filename}`);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Get filename from command line arguments
const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node migrate-single.js <filename.sql>');
  console.error('Example: node migrate-single.js create_enhanced_offers_system.sql');
  process.exit(1);
}

// Run single migration
runSingleMigration(filename); 