import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface PricingItem {
  id?: number;
  plan_number: string;
  rate_name: string;
  payment_factor: number;
  merchant_fee: number;
  notes: string;
  status?: string;
  category?: string;
  visible: boolean;
}

// List of header mappings to support different CSV formats
const HEADER_MAPPINGS: Record<string, string> = {
  // Standard headers
  'plannumber': 'plan_number',
  'ratename': 'rate_name',
  'paymentfactor': 'payment_factor',
  'merchantfee': 'merchant_fee',
  
  // Legacy/alternative headers
  'plan': 'plan_number',
  'plan number': 'plan_number',
  'plan_number': 'plan_number',
  'name': 'rate_name',
  'rate name': 'rate_name',
  'rate_name': 'rate_name',
  'payment factor': 'payment_factor',
  'payment_factor': 'payment_factor',
  'base price': 'payment_factor',
  'baseprice': 'payment_factor',
  'price': 'payment_factor',
  'merchant fee': 'merchant_fee',
  'merchant_fee': 'merchant_fee',
  'fee': 'merchant_fee',
  'cost': 'merchant_fee',
};

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
    const fileContent = await file.text();
    
    // Parse CSV data
    const rows = fileContent.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    
    // Create a mapping of standardized header names
    const headerMap: Record<number, string> = {};
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().replace(/\s+/g, '');
      headerMap[index] = cleanHeader;
    });
    
    console.log('CSV Headers:', headers);
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
        payment_factor: 0,
        merchant_fee: 0
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
          } else if (mappedField === 'payment_factor') {
            item.payment_factor = parseFloat(values[index]) || 0;
          } else if (mappedField === 'merchant_fee') {
            item.merchant_fee = parseFloat(values[index]) || 0;
          } else if (mappedField === 'notes') {
            item.notes = values[index];
          } else if (mappedField === 'status') {
            item.visible = values[index] === 'active';
          } else if (cleanHeader === 'unit') {
            // Add unit information to notes
            item.notes = `${item.notes}, Unit: ${values[index]}`;
          }
        }
      });
      
      // Set category in plan_number if not already set
      if (!item.plan_number) {
        item.plan_number = category.toUpperCase();
      } else if (!item.plan_number.includes(category.toUpperCase())) {
        item.plan_number = `${category.toUpperCase()}-${item.plan_number}`;
      }
      
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
        { error: "No valid pricing items found in the file" },
        { status: 400 }
      );
    }

    // Validate pricing
    const validationErrors = pricingItems.map((item, index) => {
      const errors = [];
      
      if (item.payment_factor > 10000) {
        errors.push({
          row: index + 1,
          column: "payment_factor",
          message: "Price exceeds maximum allowed value (10000)"
        });
      }
      
      if (item.merchant_fee < 0 || item.merchant_fee > 100) {
        errors.push({
          row: index + 1,
          column: "merchant_fee",
          message: "Merchant fee must be between 0 and 100 percent"
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

    // Insert all pricing items
    const results = [];

    for (const item of pricingItems) {
      // Check if a similar item already exists
      const existingItems = await executeQuery(
        `
        SELECT id FROM pricing 
        WHERE plan_number = $1 AND rate_name = $2
        `,
        [item.plan_number, item.rate_name]
      );

      let result;

      if (existingItems.length > 0) {
        // Update existing item
        const id = existingItems[0].id;
        result = await executeQuery(
          `
          UPDATE pricing
          SET
            payment_factor = $2,
            merchant_fee = $3,
            notes = $4,
            visible = $5,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
          `,
          [
            id,
            item.payment_factor,
            item.merchant_fee,
            item.notes,
            item.visible
          ]
        );
      } else {
        // Insert new item
        result = await executeQuery(
          `
          INSERT INTO pricing (
            plan_number, rate_name, payment_factor, merchant_fee, notes, visible
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
          `,
          [
            item.plan_number,
            item.rate_name,
            item.payment_factor,
            item.merchant_fee,
            item.notes,
            item.visible
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
  } catch (error) {
    console.error("Error importing pricing data:", error);
    return NextResponse.json(
      { error: "Failed to import pricing data" },
      { status: 500 }
    );
  }
} 