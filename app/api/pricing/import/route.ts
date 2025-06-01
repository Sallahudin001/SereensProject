import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface PricingItem {
  id?: number;
  plan_number: string;
  rate_name: string;
  notes: string;
  status?: string;
  category?: string;
  visible: boolean;
  // Store pricing data for product_pricing table
  base_price?: number;
  min_price?: number;
  max_price?: number;
  cost?: number;
  unit?: string;
}

// List of header mappings to support different CSV formats
const HEADER_MAPPINGS: Record<string, string> = {
  // Standard headers
  'plannumber': 'plan_number',
  'ratename': 'rate_name',
  'paymentfactor': 'base_price', // Map to base_price instead of payment_factor
  'merchantfee': 'cost', // Map to cost instead of merchant_fee
  'baseprice': 'base_price',
  'minprice': 'min_price',
  'maxprice': 'max_price',
  'unit': 'unit',
  
  // Legacy/alternative headers
  'plan': 'plan_number',
  'plan number': 'plan_number',
  'plan_number': 'plan_number',
  'name': 'rate_name',
  'rate name': 'rate_name',
  'rate_name': 'rate_name',
  'payment factor': 'base_price',
  'payment_factor': 'base_price',
  'base price': 'base_price',
  'base_price': 'base_price',
  'price': 'base_price',
  'merchant fee': 'cost',
  'merchant_fee': 'cost',
  'fee': 'cost',
  'cost': 'cost',
  'min price': 'min_price',
  'max price': 'max_price',
};

// Function to detect and handle different file encodings
function normalizeFileContent(content: string): string {
  // Detect Byte Order Mark (BOM)
  if (content.charCodeAt(0) === 0xFEFF) {
    // UTF-8 with BOM - remove BOM
    content = content.slice(1);
  }
  
  // Check for UTF-16 encoding patterns (null bytes between characters)
  if (content.includes('\x00')) {
    console.log('Detected UTF-16 encoding, converting to UTF-8...');
    
    // Remove null bytes and convert to readable format
    content = content.replace(/\x00/g, '');
    
    // Clean up any remaining non-printable characters
    content = content.replace(/[^\x20-\x7E\r\n,]/g, '');
  }
  
  return content;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    
    if (!file || !category) {
      return NextResponse.json(
        { error: "File and category are required" },
        { status: 400 }
      );
    }

    // Read the file content
    let fileContent = await file.text();
    
    // Normalize file content to handle different encodings
    fileContent = normalizeFileContent(fileContent);
    
    // Parse CSV data
    const rows = fileContent.split('\n');
    
    // Check if we have valid data
    if (rows.length === 0 || !rows[0].includes(',')) {
      return NextResponse.json(
        { error: "Invalid CSV format. Could not parse file. Make sure it's a proper CSV with comma separators." },
        { status: 400 }
      );
    }
    
    const headers = rows[0].split(',').map(h => h.trim());
    
    // Create a mapping of standardized header names
    const headerMap: Record<number, string> = {};
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().replace(/\s+/g, '');
      headerMap[index] = cleanHeader;
    });
    
    console.log('Cleaned CSV Headers:', headers);
    console.log('Header mapping:', headerMap);
    
    const pricingItems: PricingItem[] = [];
    
    // Start from row 1 (skip headers)
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows
      
      const values = rows[i].split(',').map(v => v.trim());
      
      console.log(`Row ${i} values:`, values);
      
      // Skip rows with insufficient data
      if (values.length < 2) continue;
      
      const item: any = { 
        visible: true,
        notes: `Imported from ${category} category`,
        plan_number: '',
        rate_name: '',
        base_price: 0,
        min_price: 0,
        max_price: 0,
        cost: 0,
        unit: 'unit'
      };
      
      // Map CSV columns to pricing properties
      headers.forEach((header, index) => {
        if (values[index] !== undefined && values[index] !== '') {
          const cleanHeader = headerMap[index];
          const mappedField = HEADER_MAPPINGS[cleanHeader] || cleanHeader;
          
          console.log(`Processing header: ${cleanHeader} => ${mappedField} = ${values[index]}`);
          
          // Handle specific fields
          if (mappedField === 'plan_number') {
            item.plan_number = values[index];
          } else if (mappedField === 'rate_name') {
            item.rate_name = values[index];
          } else if (mappedField === 'name' && !item.rate_name) {
            // If we have a 'name' field and rate_name is not set, use that
            item.rate_name = values[index];
          } else if (mappedField === 'base_price') {
            item.base_price = parseFloat(values[index]) || 0;
          } else if (mappedField === 'min_price') {
            item.min_price = parseFloat(values[index]) || 0;
          } else if (mappedField === 'max_price') {
            item.max_price = parseFloat(values[index]) || 0;
          } else if (mappedField === 'cost') {
            item.cost = parseFloat(values[index]) || 0;
          } else if (mappedField === 'unit') {
            item.unit = values[index];
          } else if (mappedField === 'notes') {
            item.notes = values[index];
          } else if (mappedField === 'status') {
            item.visible = values[index] === 'active';
          }
        }
      });
      
      // Set category in plan_number if not already set
      if (!item.plan_number) {
        item.plan_number = category.toUpperCase();
      } else if (!item.plan_number.includes(category.toUpperCase())) {
        item.plan_number = `${category.toUpperCase()}-${item.plan_number}`;
      }
      
      // Set min_price and max_price if not specified
      if (!item.min_price) item.min_price = Math.round(item.base_price * 0.9);
      if (!item.max_price) item.max_price = Math.round(item.base_price * 1.2);
      
      console.log('Processed item:', item);
      
      // Validate required fields
      if (item.rate_name) {
        pricingItems.push(item as PricingItem);
      } else {
        console.log('Invalid item (missing rate_name):', item);
      }
    }
    
    if (pricingItems.length === 0) {
      return NextResponse.json(
        { error: "No valid pricing items found in the file. Check that the CSV format is correct and includes required fields." },
        { status: 400 }
      );
    }

    // Validate pricing
    const validationErrors = pricingItems.map((item, index) => {
      const errors = [];
      
      if (item.base_price !== undefined && item.base_price > 10000) {
        errors.push({
          row: index + 1,
          column: "base_price",
          message: "Price exceeds maximum allowed value (10000)"
        });
      }
      
      if (item.cost !== undefined && (item.cost < 0 || item.cost > 10000)) {
        errors.push({
          row: index + 1,
          column: "cost",
          message: "Cost must be between 0 and 10000"
        });
      }
      
      return errors.length > 0 ? { item, errors } : null;
    }).filter(Boolean);
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          validationErrors 
        },
        { status: 400 }
      );
    }

    // Insert all pricing items into product_pricing instead of pricing table
    const results = [];

    for (const item of pricingItems) {
      // Check if a similar item already exists
      const existingItems = await executeQuery(
        `
        SELECT id FROM product_pricing 
        WHERE name = $1 AND category = $2
        `,
        [item.rate_name, category.toLowerCase()]
      );

      let result;

      if (existingItems.length > 0) {
        // Update existing item
        const id = existingItems[0].id;
        result = await executeQuery(
          `
          UPDATE product_pricing
          SET
            base_price = $2,
            min_price = $3,
            max_price = $4,
            cost = $5,
            unit = $6,
            status = $7,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
          `,
          [
            id,
            item.base_price,
            item.min_price,
            item.max_price,
            item.cost,
            item.unit || 'unit',
            item.visible ? 'active' : 'inactive'
          ]
        );
      } else {
        // Insert new item
        result = await executeQuery(
          `
          INSERT INTO product_pricing (
            name, unit, base_price, min_price, max_price, cost, status, category
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
          `,
          [
            item.rate_name,
            item.unit || 'unit',
            item.base_price,
            item.min_price,
            item.max_price,
            item.cost,
            item.visible ? 'active' : 'inactive',
            category.toLowerCase()
          ]
        );
      }

      if (result && result.length > 0) {
        results.push(result[0]);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Imported ${pricingItems.length} pricing items for ${category} category`,
        items: results
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error importing pricing data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Error importing pricing data: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
} 