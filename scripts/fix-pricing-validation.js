/**
 * Script to validate and fix pricing data for import
 * 
 * This script helps identify and fix common pricing validation errors:
 * 1. Prices exceeding maximum allowed values
 * 2. Minimum prices less than cost prices
 */

// Usage: node scripts/fix-pricing-validation.js <csv-file-path>

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configuration for validation rules
const PRICING_RULES = {
  basePrice: {
    max: 10000, // Maximum base price allowed
  },
  minPrice: {
    relationToCost: 1.0, // Minimum price must be at least equal to cost
  }
};

// Parse command line arguments
const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.error('Please specify a CSV file path as an argument');
  console.error('Usage: node scripts/fix-pricing-validation.js <csv-file-path>');
  process.exit(1);
}

// Function to validate a row of pricing data
function validatePricingRow(row, index) {
  const errors = [];
  
  // Check if basePrice exceeds maximum
  if (row.basePrice && parseFloat(row.basePrice) > PRICING_RULES.basePrice.max) {
    errors.push({
      row: index,
      column: 'basePrice',
      value: row.basePrice,
      message: `Price exceeds maximum allowed value (${PRICING_RULES.basePrice.max})`
    });
  }
  
  // Check if minPrice is less than cost
  if (row.minPrice && row.cost) {
    const minPrice = parseFloat(row.minPrice);
    const cost = parseFloat(row.cost);
    
    if (minPrice < cost * PRICING_RULES.minPrice.relationToCost) {
      errors.push({
        row: index,
        column: 'minPrice',
        value: row.minPrice,
        message: `Minimum price cannot be less than cost (${row.cost})`
      });
    }
  }
  
  return errors;
}

// Function to fix common pricing issues
function fixPricingIssues(row, errors) {
  const fixedRow = { ...row };
  
  for (const error of errors) {
    if (error.column === 'basePrice' && parseFloat(row.basePrice) > PRICING_RULES.basePrice.max) {
      // Fix by setting to maximum allowed value
      fixedRow.basePrice = PRICING_RULES.basePrice.max.toString();
    }
    
    if (error.column === 'minPrice' && parseFloat(row.minPrice) < parseFloat(row.cost)) {
      // Fix by setting minimum price equal to cost
      fixedRow.minPrice = row.cost;
    }
  }
  
  return fixedRow;
}

// Process the CSV file
async function processCSV(filePath) {
  const results = [];
  const allErrors = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        console.log(`Processed ${results.length} rows from ${filePath}`);
        
        // Validate each row
        const validatedData = results.map((row, index) => {
          const rowErrors = validatePricingRow(row, index + 1); // +1 to account for header row
          
          if (rowErrors.length > 0) {
            allErrors.push(...rowErrors);
            const fixedRow = fixPricingIssues(row, rowErrors);
            return { original: row, fixed: fixedRow, errors: rowErrors };
          }
          
          return { original: row, fixed: row, errors: [] };
        });
        
        // Output errors and fixes
        if (allErrors.length > 0) {
          console.log('\nValidation Errors:');
          console.log('=================');
          
          allErrors.forEach(error => {
            console.log(`Row ${error.row}: ${error.message} (Column: ${error.column}, Value: ${error.value})`);
          });
          
          console.log('\nSuggested Fixes:');
          console.log('===============');
          
          validatedData.forEach((item, index) => {
            if (item.errors.length > 0) {
              console.log(`Row ${index + 1}:`);
              Object.keys(item.fixed).forEach(key => {
                if (item.original[key] !== item.fixed[key]) {
                  console.log(`  ${key}: ${item.original[key]} -> ${item.fixed[key]}`);
                }
              });
            }
          });
          
          // Generate fixed CSV
          const fixedFilePath = filePath.replace('.csv', '_fixed.csv');
          const csvHeader = Object.keys(validatedData[0].fixed).join(',');
          const csvRows = validatedData.map(item => 
            Object.values(item.fixed).map(v => `"${v}"`).join(',')
          );
          
          const fixedCSV = [csvHeader, ...csvRows].join('\n');
          fs.writeFileSync(fixedFilePath, fixedCSV);
          
          console.log(`\nFixed CSV file has been written to: ${fixedFilePath}`);
          console.log('You can use this file for import instead of the original');
        } else {
          console.log('No validation errors found. Your file is ready for import!');
        }
        
        resolve({ validatedData, allErrors });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Main execution
async function main() {
  try {
    console.log(`Validating pricing data in ${csvFilePath}...`);
    await processCSV(csvFilePath);
  } catch (error) {
    console.error('Error processing CSV file:', error.message);
    process.exit(1);
  }
}

main(); 