import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET endpoint to manually run the migration
export async function GET() {
  try {
    // Check if financing_plan_id column exists
    const checkResult = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'proposals' 
      AND column_name = 'financing_plan_id'
    `);
    
    // If column already exists, skip migration
    if (checkResult.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Migration already completed" 
      });
    }
    
    // Add financing plan columns
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN financing_plan_id INTEGER;
    `);
    
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN financing_plan_name VARCHAR(255);
    `);
    
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN merchant_fee DECIMAL(10,2);
    `);
    
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN financing_notes TEXT;
    `);
    
    // Create index
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_proposals_financing_plan 
      ON proposals(financing_plan_id);
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: "Migration completed successfully" 
    });
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json({ 
      error: "Failed to run migration", 
      details: JSON.stringify(error) 
    }, { status: 500 });
  }
} 