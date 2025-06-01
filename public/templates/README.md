# Pricing CSV Templates

## Overview
These standardized CSV templates are designed for importing pricing data into the system. All templates follow a consistent format that aligns with the database structure.

## Template Format
All CSV templates use the following standardized headers:

| Column Name | Description | Example |
|-------------|-------------|---------|
| Name | Product or service name | Asphalt Shingles - Standard |
| Unit | Unit of measurement | square, window, linear foot |
| Base Price | Default/standard price | 450.00 |
| Min Price | Minimum allowed price | 400.00 |
| Max Price | Maximum suggested price | 525.00 |
| Cost | Actual cost to company | 360.00 |
| Notes | Additional information | Standard installation |
| Status | Whether item is active | active |

## Available Templates
- `pricing-template.csv` - General template with examples from different categories
- `roofing-pricing-template.csv` - Roofing specific products and services
- `hvac-pricing-template.csv` - HVAC specific products and services
- `windows-pricing-template.csv` - Windows and doors specific products and services
- `paint-pricing-template.csv` - Paint specific products and services
- `garage-pricing-template.csv` - Garage door specific products and services
- `solar-pricing-template.csv` - Solar specific products and services

## How to Use

1. **Download the appropriate template** for your product category
2. **Open in Excel or Google Sheets**
3. **Edit the existing entries** or add new rows following the same format
4. **Save as CSV** (important: use UTF-8 encoding)
5. **Import through the admin interface**

## Import Tips

- Prices should be entered as numbers only (no $ symbols)
- The "Status" column should be "active" or "inactive"
- Maintain consistent unit types within each category
- For best results, keep the CSV file under 50KB
- Do not change the column headers or their order

## Troubleshooting

If you encounter issues with your import:

- Ensure all required fields have values
- Check for special characters or formatting issues
- Verify the file is saved as a proper CSV with UTF-8 encoding
- Try opening and re-saving the file in a text editor if Excel gives encoding problems
- Look for any validation errors reported during import

For assistance, contact the system administrator. 