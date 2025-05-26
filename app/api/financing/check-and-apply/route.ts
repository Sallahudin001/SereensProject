import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// Simple check and apply route with minimal dependencies and better error handling
export async function GET() {
  try {
    console.log("Starting check-and-apply process");
    
    // First test the connection
    try {
      const testResult = await executeQuery(`SELECT NOW() as time`);
      console.log("Database connection test successful:", testResult?.[0]?.time);
    } catch (error) {
      const connError = error as Error;
      console.error("Database connection failed:", connError);
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connError?.message || String(connError)
      }, { status: 500 });
    }
    
    // Check if proposals table exists
    let proposalsExist = false;
    try {
      const tableCheckResult = await executeQuery(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'proposals'
        ) as exists
      `);
      
      proposalsExist = tableCheckResult?.[0]?.exists || false;
      console.log("Proposals table exists:", proposalsExist);
      
    } catch (error) {
      const tableCheckError = error as Error;
      console.error("Error checking for proposals table:", tableCheckError);
      return NextResponse.json({
        success: false,
        error: "Failed to check if proposals table exists",
        details: tableCheckError?.message || String(tableCheckError)
      }, { status: 500 });
    }
    
    if (!proposalsExist) {
      return NextResponse.json({
        success: false,
        error: "Proposals table does not exist in the database"
      }, { status: 400 });
    }
    
    // Check if columns already exist
    let columnExists = false;
    try {
      const columnCheckResult = await executeQuery(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'proposals' AND column_name = 'financing_plan_id'
        ) as exists
      `);
      
      columnExists = columnCheckResult?.[0]?.exists || false;
      console.log("financing_plan_id column exists:", columnExists);
      
    } catch (error) {
      const columnCheckError = error as Error;
      console.error("Error checking for column:", columnCheckError);
      return NextResponse.json({
        success: false,
        error: "Failed to check if column exists",
        details: columnCheckError?.message || String(columnCheckError)
      }, { status: 500 });
    }
    
    // If column already exists, we're done
    if (columnExists) {
      return NextResponse.json({
        success: true,
        message: "Migration already completed",
        columnExists
      });
    }
    
    // Add columns individually with detailed error handling
    const columnsToAdd = [
      { name: 'financing_plan_id', type: 'INTEGER' },
      { name: 'financing_plan_name', type: 'VARCHAR(255)' },
      { name: 'merchant_fee', type: 'DECIMAL(10,2)' },
      { name: 'financing_notes', type: 'TEXT' }
    ];
    
    const results = [];
    
    for (const column of columnsToAdd) {
      try {
        console.log(`Adding ${column.name} column...`);
        await executeQuery(`
          ALTER TABLE proposals
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}
        `);
        results.push({ 
          column: column.name, 
          success: true 
        });
      } catch (error) {
        const columnError = error as Error;
        console.error(`Error adding ${column.name} column:`, columnError);
        results.push({ 
          column: column.name, 
          success: false, 
          error: columnError?.message || String(columnError)
        });
      }
    }
    
    // Check for failures
    const failures = results.filter(r => !r.success);
    
    return NextResponse.json({
      success: failures.length === 0,
      message: failures.length === 0 ? 
        "Migration completed successfully" : 
        "Migration completed with some errors",
      results,
      failures
    });
    
  } catch (error) {
    const generalError = error as Error;
    console.error("General error during check-and-apply:", generalError);
    return NextResponse.json({
      success: false,
      error: "Migration failed with an error",
      details: generalError?.message || String(generalError)
    }, { status: 500 });
  }
} 