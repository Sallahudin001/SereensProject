import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

// GET endpoint to check database connection and table structure
export async function GET() {
  try {
    console.log("Testing database connection");
    
    // Simple query to test connection
    const testResult = await executeQuery(`SELECT NOW() as time`);
    console.log("Database connection successful:", testResult[0]?.time);
    
    // Check if proposals table exists
    const proposalsTableExists = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'proposals'
      ) as exists
    `);
    
    // Check if financing_plans table exists
    const financingPlansTableExists = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'financing_plans'
      ) as exists
    `);
    
    // If proposals table exists, check its structure
    let proposalsStructure: ColumnInfo[] = [];
    if (proposalsTableExists.length > 0 && proposalsTableExists[0].exists) {
      const result = await executeQuery(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'proposals'
        ORDER BY ordinal_position
      `);
      proposalsStructure = result as ColumnInfo[];
    }
    
    // If financing_plans table exists, check count of records
    let financingPlansCount = 0;
    if (financingPlansTableExists.length > 0 && financingPlansTableExists[0].exists) {
      const countResult = await executeQuery(`
        SELECT COUNT(*) as count
        FROM financing_plans
      `);
      
      if (countResult.length > 0) {
        financingPlansCount = countResult[0].count;
      }
    }
    
    return NextResponse.json({
      success: true,
      connection: "OK",
      timestamp: testResult.length > 0 ? testResult[0].time : null,
      tables: {
        proposals: proposalsTableExists.length > 0 ? proposalsTableExists[0].exists : false,
        financing_plans: financingPlansTableExists.length > 0 ? financingPlansTableExists[0].exists : false
      },
      financingPlansCount,
      proposalsStructure: proposalsStructure.map((col: ColumnInfo) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES'
      }))
    });
    
  } catch (error) {
    const dbError = error as Error;
    console.error("Database check failed:", dbError);
    return NextResponse.json({
      success: false,
      connection: "Failed",
      error: dbError.message || String(dbError),
      details: typeof dbError === 'object' ? 
        JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)) : 
        String(dbError)
    }, { status: 500 });
  }
} 