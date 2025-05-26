// Test script for CSV parsing
const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  console.log(`Testing CSV parsing for ${filePath}`);
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV data
    const rows = fileContent.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    
    // Create a mapping of standardized header names
    const headerMap = {};
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().replace(/\s+/g, '');
      headerMap[index] = cleanHeader;
    });
    
    console.log('CSV Headers:', headers);
    console.log('Header mapping:', headerMap);
    
    const items = [];
    
    // Parse each row
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows
      
      const values = rows[i].split(',').map(v => v.trim());
      
      console.log(`Row ${i} values:`, values);
      
      // Skip rows with insufficient data
      if (values.length < 2) continue;
      
      const item = {
        plan_number: '',
        rate_name: '',
        payment_factor: 0,
        merchant_fee: 0,
        notes: '',
        visible: true
      };
      
      // Map CSV columns to item properties
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const cleanHeader = headerMap[index];
          
          console.log(`Processing header: ${cleanHeader} = ${values[index]}`);
          
          if (cleanHeader === 'plannumber') {
            item.plan_number = values[index];
          } else if (cleanHeader === 'ratename') {
            item.rate_name = values[index];
          } else if (cleanHeader === 'paymentfactor') {
            item.payment_factor = parseFloat(values[index]) || 0;
          } else if (cleanHeader === 'merchantfee') {
            item.merchant_fee = parseFloat(values[index]) || 0;
          } else if (cleanHeader === 'notes') {
            item.notes = values[index];
          } else if (cleanHeader === 'status') {
            item.visible = values[index] === 'active';
          }
        }
      });
      
      console.log('Processed item:', item);
      
      // Validate required fields
      if (item.rate_name) {
        items.push(item);
      } else {
        console.log('Invalid item (missing rate_name):', item);
      }
    }
    
    console.log(`\nFound ${items.length} valid items in the CSV file`);
    
    return {
      headers,
      items
    };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return null;
  }
}

// Test the template files
const templateFiles = [
  'public/templates/pricing-template.csv',
  'public/templates/roofing-pricing-template.csv',
  'public/templates/windows-pricing-template.csv',
  'public/templates/paint-pricing-template.csv',
  'public/templates/garage-pricing-template.csv',
  'public/templates/hvac-pricing-template.csv',
  'public/templates/solar-pricing-template.csv',
];

templateFiles.forEach(templateFile => {
  console.log(`\n========== Testing ${templateFile} ==========\n`);
  parseCSV(templateFile);
});

console.log("\nCSV parsing tests completed"); 