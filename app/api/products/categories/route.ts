import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET all product categories
export async function GET(req: NextRequest) {
  try {
    const categories = await executeQuery(`
      SELECT * FROM product_categories
      ORDER BY name ASC
    `);
    
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch product categories" },
      { status: 500 }
    );
  }
}

// POST - Add a new product category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    
    // Insert the new product category
    const result = await executeQuery(
      `
      INSERT INTO product_categories (name, description)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, description || null]
    );
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product category:", error);
    return NextResponse.json(
      { error: "Failed to add product category" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing product category
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }
    
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    
    // Update the product category
    const result = await executeQuery(
      `
      UPDATE product_categories
      SET 
        name = $2,
        description = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id, name, description || null]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error updating product category:", error);
    return NextResponse.json(
      { error: "Failed to update product category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }
    
    // Check if there are products associated with this category
    const productsCount = await executeQuery(
      `
      SELECT COUNT(*) as count FROM products WHERE category_id = $1
      `,
      [id]
    );
    
    if (productsCount[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      );
    }
    
    // Delete the category
    const result = await executeQuery(
      `
      DELETE FROM product_categories
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product category not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product category:", error);
    return NextResponse.json(
      { error: "Failed to delete product category" },
      { status: 500 }
    );
  }
} 