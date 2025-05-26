import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET all financing plans
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');
    
    let query = `
      SELECT * FROM financing_plans
    `;
    
    const params: any[] = [];
    
    if (provider) {
      query += ` WHERE provider = $1`;
      params.push(provider);
    }
    
    query += ` ORDER BY provider, plan_name ASC`;
    
    const plans = await executeQuery(query, params);
    
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error("Error fetching financing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch financing plans" },
      { status: 500 }
    );
  }
}

// POST - Add a new financing plan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;
    
    // Validate required fields
    if (!plan_number || !provider || !plan_name || !payment_factor) {
      return NextResponse.json(
        { error: "Plan number, provider, plan name, and payment factor are required" },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (
      isNaN(Number(interest_rate)) || 
      isNaN(Number(term_months)) || 
      isNaN(Number(payment_factor)) || 
      isNaN(Number(merchant_fee))
    ) {
      return NextResponse.json(
        { error: "Interest rate, term, payment factor, and merchant fee must be numbers" },
        { status: 400 }
      );
    }
    
    // Insert the new financing plan
    const result = await executeQuery(
      `
      INSERT INTO financing_plans (
        plan_number,
        provider,
        plan_name,
        interest_rate,
        term_months,
        payment_factor,
        merchant_fee,
        notes,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        plan_number,
        provider,
        plan_name,
        interest_rate || 0,
        term_months || 0,
        payment_factor,
        merchant_fee || 0,
        notes || null,
        is_active !== undefined ? is_active : true
      ]
    );
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding financing plan:", error);
    return NextResponse.json(
      { error: "Failed to add financing plan" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing financing plan
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }
    
    if (!plan_number || !provider || !plan_name || !payment_factor) {
      return NextResponse.json(
        { error: "Plan number, provider, plan name, and payment factor are required" },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (
      isNaN(Number(interest_rate)) || 
      isNaN(Number(term_months)) || 
      isNaN(Number(payment_factor)) || 
      isNaN(Number(merchant_fee))
    ) {
      return NextResponse.json(
        { error: "Interest rate, term, payment factor, and merchant fee must be numbers" },
        { status: 400 }
      );
    }
    
    // Update the financing plan
    const result = await executeQuery(
      `
      UPDATE financing_plans
      SET 
        plan_number = $2,
        provider = $3,
        plan_name = $4,
        interest_rate = $5,
        term_months = $6,
        payment_factor = $7,
        merchant_fee = $8,
        notes = $9,
        is_active = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        plan_number,
        provider,
        plan_name,
        interest_rate || 0,
        term_months || 0,
        payment_factor,
        merchant_fee || 0,
        notes || null,
        is_active !== undefined ? is_active : true
      ]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Financing plan not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error updating financing plan:", error);
    return NextResponse.json(
      { error: "Failed to update financing plan" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a financing plan
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }
    
    // Check if there are financing calculations associated with this plan
    const calculationsCount = await executeQuery(
      `
      SELECT COUNT(*) as count FROM financing_calculations WHERE financing_plan_id = $1
      `,
      [id]
    );
    
    if (calculationsCount[0].count > 0) {
      // Delete associated calculations first
      await executeQuery(
        `DELETE FROM financing_calculations WHERE financing_plan_id = $1`,
        [id]
      );
    }
    
    // Delete the financing plan
    const result = await executeQuery(
      `
      DELETE FROM financing_plans
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Financing plan not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting financing plan:", error);
    return NextResponse.json(
      { error: "Failed to delete financing plan" },
      { status: 500 }
    );
  }
} 