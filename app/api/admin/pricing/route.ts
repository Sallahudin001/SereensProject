import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logPricingUpdate } from "@/lib/activity-logger";

/**
 * GET /api/admin/pricing
 * Retrieves pricing data
 */
export async function GET(request: NextRequest) {
  try {
    const pricing = await executeQuery(
      `SELECT * FROM pricing ORDER BY id DESC`
    );
    
    return NextResponse.json({
      success: true,
      pricing
    });
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing
 * Creates a new pricing entry
 */
export async function POST(request: NextRequest) {
  try {
    const { plan_number, rate_name, payment_factor, merchant_fee, notes, category } = await request.json();
    
    // Validate required fields
    if (!rate_name || !payment_factor) {
      return NextResponse.json({ 
        success: false, 
        error: "Rate name and payment factor are required" 
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
    
    // Insert the new pricing entry
    const result = await executeQuery(
      `INSERT INTO pricing (
        plan_number, rate_name, payment_factor, merchant_fee, notes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [plan_number, rate_name, payment_factor, merchant_fee, notes]
    );
    
    // Log the activity
    await logPricingUpdate(
      userId,
      'create',
      category || 'general',
      result[0].id,
      rate_name,
      { planNumber: plan_number }
    );
    
    return NextResponse.json({
      success: true,
      pricing: result[0]
    });
  } catch (error) {
    console.error("Error creating pricing entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create pricing entry" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/:id
 * Updates an existing pricing entry
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, plan_number, rate_name, payment_factor, merchant_fee, notes, category, visible } = await request.json();
    
    // Validate required fields
    if (!id || !rate_name || !payment_factor) {
      return NextResponse.json({ 
        success: false, 
        error: "ID, rate name and payment factor are required" 
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
    
    // Update the pricing entry
    const result = await executeQuery(
      `UPDATE pricing SET
        plan_number = $1,
        rate_name = $2,
        payment_factor = $3,
        merchant_fee = $4,
        notes = $5,
        visible = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [plan_number, rate_name, payment_factor, merchant_fee, notes, visible !== undefined ? visible : true, id]
    );
    
    if (result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Pricing entry not found" 
      }, { status: 404 });
    }
    
    // Log the activity
    await logPricingUpdate(
      userId,
      'update',
      category || 'general',
      id,
      rate_name,
      { planNumber: plan_number }
    );
    
    return NextResponse.json({
      success: true,
      pricing: result[0]
    });
  } catch (error) {
    console.error("Error updating pricing entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update pricing entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pricing/:id
 * Deletes a pricing entry
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
    
    // Get pricing entry before deletion for logging
    const pricingBefore = await executeQuery(
      `SELECT * FROM pricing WHERE id = $1`,
      [id]
    );
    
    if (pricingBefore.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Pricing entry not found" 
      }, { status: 404 });
    }
    
    // Delete the pricing entry
    await executeQuery(
      `DELETE FROM pricing WHERE id = $1`,
      [id]
    );
    
    // Log the activity
    await logPricingUpdate(
      userId,
      'delete',
      'general',
      id,
      pricingBefore[0].rate_name,
      { planNumber: pricingBefore[0].plan_number }
    );
    
    return NextResponse.json({
      success: true,
      message: "Pricing entry deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting pricing entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete pricing entry" },
      { status: 500 }
    );
  }
} 