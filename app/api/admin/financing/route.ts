import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logFinancingUpdate } from "@/lib/activity-logger";

/**
 * GET /api/admin/financing
 * Retrieves all financing plans
 */
export async function GET(request: NextRequest) {
  try {
    const plans = await executeQuery(
      `SELECT * FROM financing_plans ORDER BY plan_number, provider`
    );
    
    return NextResponse.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error("Error fetching financing plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch financing plans" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/financing
 * Creates a new financing plan
 */
export async function POST(request: NextRequest) {
  try {
    const {
      plan_number,
      provider,
      plan_name,
      interest_rate,
      term_months,
      payment_factor,
      merchant_fee,
      notes,
      is_active
    } = await request.json();
    
    // Validate required fields
    if (!plan_number || !provider || !plan_name || !payment_factor) {
      return NextResponse.json({ 
        success: false, 
        error: "Plan number, provider, plan name and payment factor are required" 
      }, { status: 400 });
    }
    
    // Get current user ID
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }
    
    // Insert the new financing plan
    const result = await executeQuery(
      `INSERT INTO financing_plans (
        plan_number, provider, plan_name, interest_rate, term_months,
        payment_factor, merchant_fee, notes, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        plan_number, 
        provider, 
        plan_name, 
        interest_rate || 0, 
        term_months || 0, 
        payment_factor, 
        merchant_fee || 0, 
        notes || '', 
        is_active !== undefined ? is_active : true
      ]
    );
    
    // Log the activity
    await logFinancingUpdate(
      userId,
      'create',
      result[0].id,
      plan_number,
      plan_name,
      provider
    );
    
    return NextResponse.json({
      success: true,
      plan: result[0]
    });
  } catch (error) {
    console.error("Error creating financing plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create financing plan" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/financing
 * Updates an existing financing plan
 */
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      plan_number,
      provider,
      plan_name,
      interest_rate,
      term_months,
      payment_factor,
      merchant_fee,
      notes,
      is_active
    } = await request.json();
    
    // Validate required fields
    if (!id || !plan_number || !provider || !plan_name || !payment_factor) {
      return NextResponse.json({ 
        success: false, 
        error: "ID, plan number, provider, plan name and payment factor are required" 
      }, { status: 400 });
    }
    
    // Get current user ID
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }
    
    // Update the financing plan
    const result = await executeQuery(
      `UPDATE financing_plans SET
        plan_number = $1,
        provider = $2,
        plan_name = $3,
        interest_rate = $4,
        term_months = $5,
        payment_factor = $6,
        merchant_fee = $7,
        notes = $8,
        is_active = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        plan_number, 
        provider, 
        plan_name, 
        interest_rate || 0, 
        term_months || 0, 
        payment_factor, 
        merchant_fee || 0, 
        notes || '', 
        is_active !== undefined ? is_active : true,
        id
      ]
    );
    
    if (result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Financing plan not found" 
      }, { status: 404 });
    }
    
    // Log the activity
    await logFinancingUpdate(
      userId,
      'update',
      id,
      plan_number,
      plan_name,
      provider
    );
    
    return NextResponse.json({
      success: true,
      plan: result[0]
    });
  } catch (error) {
    console.error("Error updating financing plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update financing plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/financing/:id
 * Deletes a financing plan
 */
export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from the URL
    const id = request.nextUrl.pathname.split('/').pop();
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        error: "Valid ID is required" 
      }, { status: 400 });
    }
    
    // Get current user ID
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }
    
    // Get financing plan before deletion for logging
    const planBefore = await executeQuery(
      `SELECT * FROM financing_plans WHERE id = $1`,
      [id]
    );
    
    if (planBefore.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Financing plan not found" 
      }, { status: 404 });
    }
    
    // Delete the financing plan
    await executeQuery(
      `DELETE FROM financing_plans WHERE id = $1`,
      [id]
    );
    
    // Log the activity
    await logFinancingUpdate(
      userId,
      'delete',
      id,
      planBefore[0].plan_number,
      planBefore[0].plan_name,
      planBefore[0].provider
    );
    
    return NextResponse.json({
      success: true,
      message: "Financing plan deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting financing plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete financing plan" },
      { status: 500 }
    );
  }
} 