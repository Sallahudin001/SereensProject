import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET custom adders for a proposal
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');
    
    if (!proposalId) {
      return NextResponse.json(
        { error: "Missing proposalId parameter" },
        { status: 400 }
      );
    }
    
    const adders = await executeQuery(
      `SELECT * FROM custom_pricing_adders 
       WHERE proposal_id = $1 
       ORDER BY product_category, id`,
      [proposalId]
    );
    
    return NextResponse.json(adders, { status: 200 });
  } catch (error) {
    console.error("Error fetching custom adders:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom adders" },
      { status: 500 }
    );
  }
}

// POST create a new custom adder
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, productCategory, description, cost } = body;
    
    // Validate required fields
    if (!proposalId || !productCategory || !description || cost === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `INSERT INTO custom_pricing_adders (
        proposal_id, product_category, description, cost
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [proposalId, productCategory, description, cost]
    );
    
    if (result && result.length > 0) {
      return NextResponse.json(result[0], { status: 201 });
    } else {
      throw new Error("Failed to create custom adder");
    }
  } catch (error) {
    console.error("Error creating custom adder:", error);
    return NextResponse.json(
      { error: "Failed to create custom adder" },
      { status: 500 }
    );
  }
}

// DELETE remove a custom adder
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `DELETE FROM custom_pricing_adders WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result && result.length > 0) {
      return NextResponse.json(
        { success: true, message: "Custom adder deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Custom adder not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting custom adder:", error);
    return NextResponse.json(
      { error: "Failed to delete custom adder" },
      { status: 500 }
    );
  }
} 