import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Create a temporary table with unique plans
    await executeQuery(`
      CREATE TEMP TABLE temp_unique_plans AS
      SELECT DISTINCT ON (plan_number, provider, payment_factor) 
          id, 
          plan_number, 
          provider,
          plan_name,
          interest_rate,
          term_months,
          payment_factor,
          merchant_fee,
          notes,
          is_active,
          created_at,
          updated_at
      FROM financing_plans
      ORDER BY plan_number, provider, payment_factor, id DESC;
    `);

    // Get the count of all plans before deduplication
    const beforeCount = await executeQuery(`
      SELECT COUNT(*) as count FROM financing_plans
    `);
    
    // Get the count of unique plans
    const uniqueCount = await executeQuery(`
      SELECT COUNT(*) as count FROM temp_unique_plans
    `);
    
    // If there are duplicates, remove them
    if (beforeCount[0].count > uniqueCount[0].count) {
      // Delete all existing plans
      await executeQuery(`DELETE FROM financing_plans`);
      
      // Re-insert only the unique plans
      await executeQuery(`
        INSERT INTO financing_plans (
          id, 
          plan_number, 
          provider,
          plan_name,
          interest_rate,
          term_months,
          payment_factor,
          merchant_fee,
          notes,
          is_active,
          created_at,
          updated_at
        )
        SELECT 
          id, 
          plan_number, 
          provider,
          plan_name,
          interest_rate,
          term_months,
          payment_factor,
          merchant_fee,
          notes,
          is_active,
          created_at,
          updated_at
        FROM temp_unique_plans
      `);
      
      // Try to add a unique constraint if it doesn't exist
      try {
        await executeQuery(`
          ALTER TABLE financing_plans
          ADD CONSTRAINT unique_plan_provider_factor 
          UNIQUE (plan_number, provider, payment_factor)
        `);
      } catch (error) {
        console.log("Unique constraint may already exist or could not be created:", error);
      }
    }
    
    // Drop the temporary table
    await executeQuery(`DROP TABLE IF EXISTS temp_unique_plans`);
    
    // Get the final count
    const afterCount = await executeQuery(`
      SELECT COUNT(*) as count FROM financing_plans
    `);
    
    return NextResponse.json({
      success: true,
      message: "Financing plans deduplicated successfully",
      beforeCount: beforeCount[0].count,
      afterCount: afterCount[0].count,
      duplicatesRemoved: beforeCount[0].count - afterCount[0].count
    }, { status: 200 });
  } catch (error) {
    console.error("Error deduplicating financing plans:", error);
    return NextResponse.json(
      { error: "Failed to deduplicate financing plans" },
      { status: 500 }
    );
  }
} 