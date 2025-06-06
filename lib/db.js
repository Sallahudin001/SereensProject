// Import required modules
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
require('dotenv').config();

// Check if code is running on the client side
const isClient = typeof window !== 'undefined';

// Create a dummy implementation for client-side to prevent exposing database credentials
const dummyImplementation = {
  query: () => {
    throw new Error('Database operations cannot be performed on the client side. Use API routes instead.');
  }
};

// Initialize the database connection only on the server side
const sql = isClient 
  ? dummyImplementation 
  : neon(process.env.DATABASE_URL || 'postgres://localhost:5432/mydatabase');

const db = isClient ? null : drizzle(sql);

// Helper function to execute raw SQL queries
async function executeQuery(query, params = []) {
  // Prevent client-side execution
  if (isClient) {
    console.error('Database operations cannot be performed on the client side. Use API routes instead.');
    throw new Error('Database operations cannot be performed on the client side. Use API routes instead.');
  }

  try {
    // Check if this is a multi-statement query
    if (query.includes(';') && query.trim().indexOf(';') !== query.trim().length - 1) {
      // Split by semicolons, but ignore them in quotes
      const statements = splitSqlStatements(query);
      const results = [];
      
      // Execute each statement individually
      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          const result = await sql.query(trimmedStatement, params);
          results.push(result);
        }
      }
      
      return results;
    } else {
      // Single statement query
      const result = await sql.query(query, params);
      return result;
    }
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Function to split SQL content into individual statements
function splitSqlStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    
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

module.exports = {
  sql,
  db,
  executeQuery
}; 