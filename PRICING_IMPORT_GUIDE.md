# Pricing Import Guide

## Understanding Validation Errors

When importing pricing data, you might encounter validation errors like the ones shown in the preview and validation screen:

```
Validation Errors:
Row 3: Price exceeds maximum allowed value (Column: basePrice)
Row 4: Minimum price cannot be less than cost (Column: minPrice)
```

These errors occur because:

1. **Maximum Price Error**: The base price exceeds the maximum allowed value set in the system
2. **Minimum Price Error**: The minimum price is set lower than the cost price, which isn't allowed

## How to Fix Pricing Validation Errors

### Option 1: Edit the CSV File Directly

1. Open your CSV file in a spreadsheet program (Excel, Google Sheets, etc.)
2. Find the rows with errors (in the example, rows 3 and 4)
3. Make these corrections:
   - For rows with "Price exceeds maximum allowed value" errors, reduce the base price to be within the allowed range
   - For rows with "Minimum price cannot be less than cost" errors, ensure the minimum price is equal to or greater than the cost price

### Option 2: Use Our Validation Helper Script

We've created a helper script that can automatically detect and fix common pricing validation errors:

```bash
# Install dependencies if you haven't already
pnpm add csv-parser

# Run the validation script on your CSV file
node scripts/fix-pricing-validation.js your-pricing-file.csv
```

The script will:
1. Analyze your CSV file for validation errors
2. Show you exactly what issues were found
3. Create a fixed version of your CSV file (with '_fixed.csv' suffix)
4. You can then import the fixed file instead

### Option 3: Use Our CSV Template

For a quick start, use our template CSV file that follows all validation rules:

```
scripts/import-pricing-template.csv
```

Copy and modify this template for your needs. It's pre-configured to avoid common validation errors.

## Pricing Validation Rules

Here are the key validation rules for pricing imports:

1. **Base Price**:
   - Must be a positive number
   - Cannot exceed the maximum allowed value (currently set to $10,000)

2. **Minimum Price**:
   - Must be a positive number
   - Cannot be less than the cost price
   - Should generally be 0-5% less than the base price

3. **Maximum Price**:
   - Must be a positive number
   - Must be greater than the minimum price
   - Should generally be 10-20% more than the base price

4. **Units**:
   - Must be one of the allowed units: "square", "unit", "linear foot", "system", "gallon"

## Best Practices for Pricing Imports

- Always validate your data before final import
- Use consistent pricing strategies across similar product types
- Include all required fields (Name, Unit, Base Price, Min Price)
- For bulk imports, start with a small test file first
- Keep a backup of your original data before importing

If you continue to experience issues with importing, please contact the administrator for assistance. 