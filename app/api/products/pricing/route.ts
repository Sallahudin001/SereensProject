import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const VALID_CATEGORIES = ['roofing', 'hvac', 'windows', 'garage', 'paint'];

// GET product pricing data by category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    let query = `
      SELECT * FROM product_pricing
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ` AND category = $1`;
      params.push(category);
    }
    
    query += ` ORDER BY name ASC`;
    
    const products = await executeQuery(query, params);
    
    // Format the response to match frontend expectations
    const formattedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      base_price: parseFloat(product.base_price),
      min_price: parseFloat(product.min_price),
      max_price: parseFloat(product.max_price),
      cost: parseFloat(product.cost),
      status: product.status,
      category: product.category,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
    
    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching product pricing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch product pricing data" },
      { status: 500 }
    );
  }
}

// POST - Add a new product pricing item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, unit, base_price, min_price, max_price, cost, status, category } = body;
    
    // Validate required fields
    if (!name || !unit || !base_price || !category) {
      return NextResponse.json(
        { error: "Name, unit, base price, and category are required" },
        { status: 400 }
      );
    }
    
    // Insert the new product pricing item
    const result = await executeQuery(
      `
      INSERT INTO product_pricing (
        name, unit, base_price, min_price, max_price, cost, status, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        name,
        unit,
        parseFloat(base_price),
        parseFloat(min_price) || parseFloat(base_price) * 0.9,
        parseFloat(max_price) || parseFloat(base_price) * 1.2,
        parseFloat(cost) || parseFloat(base_price) * 0.8,
        status || 'active',
        category
      ]
    );
    
    const savedItem = result[0];
    
    // Format response
    const formattedItem = {
      id: savedItem.id,
      name: savedItem.name,
      unit: savedItem.unit,
      base_price: parseFloat(savedItem.base_price),
      min_price: parseFloat(savedItem.min_price),
      max_price: parseFloat(savedItem.max_price),
      cost: parseFloat(savedItem.cost),
      status: savedItem.status,
      category: savedItem.category,
      created_at: savedItem.created_at,
      updated_at: savedItem.updated_at
    };
    
    return NextResponse.json(formattedItem, { status: 201 });
  } catch (error) {
    console.error("Error adding product pricing item:", error);
    return NextResponse.json(
      { error: "Failed to add product pricing item" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing product pricing item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, unit, base_price, min_price, max_price, cost, status, category } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    if (!name || !unit || !base_price || !category) {
      return NextResponse.json(
        { error: "Name, unit, base price, and category are required" },
        { status: 400 }
      );
    }
    
    // Update the product pricing item
    const result = await executeQuery(
      `
      UPDATE product_pricing 
      SET 
        name = $2,
        unit = $3,
        base_price = $4,
        min_price = $5,
        max_price = $6,
        cost = $7,
        status = $8,
        category = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        name,
        unit,
        parseFloat(base_price),
        parseFloat(min_price) || parseFloat(base_price) * 0.9,
        parseFloat(max_price) || parseFloat(base_price) * 1.2,
        parseFloat(cost) || parseFloat(base_price) * 0.8,
        status || 'active',
        category
      ]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product pricing item not found" },
        { status: 404 }
      );
    }
    
    const savedItem = result[0];
    
    // Format response
    const formattedItem = {
      id: savedItem.id,
      name: savedItem.name,
      unit: savedItem.unit,
      base_price: parseFloat(savedItem.base_price),
      min_price: parseFloat(savedItem.min_price),
      max_price: parseFloat(savedItem.max_price),
      cost: parseFloat(savedItem.cost),
      status: savedItem.status,
      category: savedItem.category,
      created_at: savedItem.created_at,
      updated_at: savedItem.updated_at
    };
    
    return NextResponse.json(formattedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating product pricing item:", error);
    return NextResponse.json(
      { error: "Failed to update product pricing item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product pricing item
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `
      DELETE FROM product_pricing
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product pricing item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product pricing item:", error);
    return NextResponse.json(
      { error: "Failed to delete product pricing item" },
      { status: 500 }
    );
  }
} 