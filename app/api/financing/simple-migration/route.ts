import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// Simple migration endpoint with minimal dependencies
export async function GET() {
  try {
    console.log("Starting simple migration process");
    
    // Check if column exists to avoid errors
    const checkColumn = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'proposals' AND column_name = 'financing_plan_id'
      ) as exists;
    `);
    
    if (checkColumn.length > 0 && checkColumn[0].exists) {
      console.log("Column financing_plan_id already exists, skipping migration");
      return NextResponse.json({ 
        success: true, 
        message: "Migration already completed" 
      });
    }
    
    console.log("Adding columns one by one");
    
    try {
      // Add columns individually to isolate potential issues
      console.log("Adding financing_plan_id...");
      await executeQuery(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS financing_plan_id INTEGER;`);
      
      console.log("Adding financing_plan_name...");
      await executeQuery(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS financing_plan_name VARCHAR(255);`);
      
      console.log("Adding merchant_fee...");
      await executeQuery(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS merchant_fee DECIMAL(10,2);`);
      
      console.log("Adding financing_notes...");
      await executeQuery(`ALTER TABLE proposals ADD COLUMN IF NOT EXISTS financing_notes TEXT;`);
      
      console.log("Migration completed successfully");
      return NextResponse.json({ 
        success: true, 
        message: "Migration completed successfully" 
      });
    } catch (error) {
      const sqlError = error as Error;
      console.error("SQL error during migration:", sqlError);
      return NextResponse.json({ 
        error: "SQL error during migration", 
        details: sqlError.message || String(sqlError)
      }, { status: 500 });
    }
  } catch (error) {
    const generalError = error as Error;
    console.error("General error running migration:", generalError);
    return NextResponse.json({ 
      error: "Failed to run migration", 
      details: generalError.message || String(generalError)
    }, { status: 500 });
  }
} 