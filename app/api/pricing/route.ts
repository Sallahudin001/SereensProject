import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// DEPRECATED: This endpoint manages financing plans, not product pricing
// Use /api/products/pricing for product pricing management
// Use /api/financing/plans for financing plan management

// GET all pricing items (FINANCING PLANS)
export async function GET(req: NextRequest) {
  try {
    console.warn("[DEPRECATED] /api/pricing is deprecated. Use /api/financing/plans for financing plans or /api/products/pricing for product pricing.");
    
    const pricing = await executeQuery(`
      SELECT * FROM pricing
      ORDER BY plan_number ASC
    `);
    
    // Add deprecation header
    const response = NextResponse.json(pricing, { status: 200 });
    response.headers.set('X-Deprecated', 'true');
    response.headers.set('X-Deprecated-Message', 'Use /api/financing/plans for financing plans or /api/products/pricing for product pricing');
    
    return response;
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing data" },
      { status: 500 }
    );
  }
}

// POST - Add a new pricing item (FINANCING PLAN)
export async function POST(req: NextRequest) {
  try {
    console.warn("[DEPRECATED] /api/pricing is deprecated. Use /api/financing/plans for financing plans.");
    
    const body = await req.json();
    const { plan_number, rate_name, notes, visible } = body;
    
    // Validate required fields
    if (!rate_name) {
      return NextResponse.json(
        { error: "Rate name is required" },
        { status: 400 }
      );
    }
    
    // Insert the new pricing item
    const result = await executeQuery(
      `
      INSERT INTO pricing (
        plan_number, rate_name, notes, visible
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        plan_number || null,
        rate_name,
        notes || null,
        visible !== undefined ? visible : true
      ]
    );
    
    const response = NextResponse.json(result[0], { status: 201 });
    response.headers.set('X-Deprecated', 'true');
    return response;
  } catch (error) {
    console.error("Error adding pricing item:", error);
    return NextResponse.json(
      { error: "Failed to add pricing item" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing pricing item (FINANCING PLAN)
export async function PUT(req: NextRequest) {
  try {
    console.warn("[DEPRECATED] /api/pricing is deprecated. Use /api/financing/plans for financing plans.");
    
    const body = await req.json();
    const { id, plan_number, rate_name, notes, visible } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    if (!rate_name) {
      return NextResponse.json(
        { error: "Rate name is required" },
        { status: 400 }
      );
    }
    
    // Update the pricing item
    const result = await executeQuery(
      `
      UPDATE pricing 
      SET 
        plan_number = $2,
        rate_name = $3,
        notes = $4,
        visible = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        plan_number || null,
        rate_name,
        notes || null,
        visible !== undefined ? visible : true
      ]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Pricing item not found" },
        { status: 404 }
      );
    }
    
    const response = NextResponse.json(result[0], { status: 200 });
    response.headers.set('X-Deprecated', 'true');
    return response;
  } catch (error) {
    console.error("Error updating pricing item:", error);
    return NextResponse.json(
      { error: "Failed to update pricing item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a pricing item (FINANCING PLAN)
export async function DELETE(req: NextRequest) {
  try {
    console.warn("[DEPRECATED] /api/pricing is deprecated. Use /api/financing/plans for financing plans.");
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `
      DELETE FROM pricing
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Pricing item not found" },
        { status: 404 }
      );
    }
    
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set('X-Deprecated', 'true');
    return response;
  } catch (error) {
    console.error("Error deleting pricing item:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing item" },
      { status: 500 }
    );
  }
} 