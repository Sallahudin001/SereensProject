import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

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
    
    query += ` ORDER BY id ASC`;
    
    const products = await executeQuery(query, params);
    
    // Format the response to match frontend expectations
    const formattedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      basePrice: parseFloat(product.base_price),
      minPrice: parseFloat(product.min_price),
      maxPrice: parseFloat(product.max_price),
      cost: parseFloat(product.cost),
      status: product.status,
      category: product.category
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