import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    
    let query = `
      SELECT p.id, p.category_id, p.name, p.description, p.base_price, 
             p.min_price, p.pricing_unit, p.is_active, p.price_visible, 
             p.product_data, p.created_at, p.updated_at,
             pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
    `;
    
    const params: any[] = [];
    
    if (categoryId) {
      query += ` WHERE p.category_id = $1`;
      params.push(categoryId);
    }
    
    query += ` ORDER BY p.name ASC`;
    
    const products = await executeQuery(query, params);
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Add a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category_id,
      name,
      description,
      base_price,
      min_price,
      pricing_unit,
      is_active,
      price_visible,
      product_data
    } = body;
    
    // Validate required fields
    if (!name || !category_id) {
      return NextResponse.json(
        { error: "Product name and category ID are required" },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (isNaN(Number(base_price)) || isNaN(Number(min_price))) {
      return NextResponse.json(
        { error: "Base price and min price must be numbers" },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const categoryCheck = await executeQuery(
      `SELECT id FROM product_categories WHERE id = $1`,
      [category_id]
    );
    
    if (categoryCheck.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }
    
    // Insert the new product
    const result = await executeQuery(
      `
      INSERT INTO products (
        category_id,
        name,
        description,
        base_price,
        min_price,
        pricing_unit,
        is_active,
        price_visible,
        product_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        category_id,
        name,
        description || null,
        base_price || 0,
        min_price || 0,
        pricing_unit || null,
        is_active !== undefined ? is_active : true,
        price_visible !== undefined ? price_visible : true,
        product_data || '{}'
      ]
    );
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing product
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      category_id,
      name,
      description,
      base_price,
      min_price,
      pricing_unit,
      is_active,
      price_visible,
      product_data
    } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    if (!name || !category_id) {
      return NextResponse.json(
        { error: "Product name and category ID are required" },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (isNaN(Number(base_price)) || isNaN(Number(min_price))) {
      return NextResponse.json(
        { error: "Base price and min price must be numbers" },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const categoryCheck = await executeQuery(
      `SELECT id FROM product_categories WHERE id = $1`,
      [category_id]
    );
    
    if (categoryCheck.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }
    
    // Update the product
    const result = await executeQuery(
      `
      UPDATE products
      SET 
        category_id = $2,
        name = $3,
        description = $4,
        base_price = $5,
        min_price = $6,
        pricing_unit = $7,
        is_active = $8,
        price_visible = $9,
        product_data = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        category_id,
        name,
        description || null,
        base_price || 0,
        min_price || 0,
        pricing_unit || null,
        is_active !== undefined ? is_active : true,
        price_visible !== undefined ? price_visible : true,
        product_data || '{}'
      ]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Check if there are product options associated with this product
    const optionsCount = await executeQuery(
      `
      SELECT COUNT(*) as count FROM product_options WHERE product_id = $1
      `,
      [id]
    );
    
    if (optionsCount[0].count > 0) {
      // Delete product options first
      await executeQuery(
        `DELETE FROM product_options WHERE product_id = $1`,
        [id]
      );
    }
    
    // Delete the product
    const result = await executeQuery(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
} 