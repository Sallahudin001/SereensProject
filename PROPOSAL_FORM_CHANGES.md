# Proposal Form Changes Documentation

## Overview

This document details the changes made to the proposal forms and database schema to accommodate client feedback on the roofing, windows & doors, garage doors, and paint sections.

## Frontend Changes

### Roofing Form (`components/proposal/product-forms/roofing-product-form.tsx`)

1. **Removed "GAF" Reference**
   - Changed labels and descriptions to use generic "architectural shingles" instead of "GAF architectural shingles"

2. **Linear Feet Field**
   - Added "(optional)" to the Linear Feet field label

3. **Added Plywood Add-on**
   - Added a new checkbox for additional wood/plywood
   - Added percentage input for specifying plywood replacement beyond the standard 20%
   - Added explanatory text to guide users

4. **Updated Pricing Format**
   - Changed from price-per-square to a total price + square count model
   - Added automatic calculation of price per square
   - Added toggle for showing/hiding price per square on the proposal

5. **Added Gutters Pricing**
   - Added input field for gutters & downspouts pricing
   - Added toggle for showing/hiding price breakdown (roofing vs. gutters)

6. **Updated Scope Description**
   - Added note about nail penetration through roof sheathing
   - Updated to dynamically include plywood replacement details when selected

### Windows & Doors Form (`components/proposal/product-forms/windows-doors-product-form.tsx`)

1. **Combined Window Types**
   - Consolidated "vinyl", "retrofit", and "dual-pane" into a single "Vinyl Retrofit Dual Pane" option

2. **Added Pricing Section**
   - Added input for windows total price
   - Added individual price inputs for each door type selected
   - Added calculation for total door price

3. **Added Price Display Options**
   - Added toggle for showing/hiding individual door prices vs. a combined total

### Garage Door Form (`components/proposal/product-forms/garage-doors-product-form.tsx`)

1. **Added Pricing Section**
   - Added total price input for garage door
   - Added individual pricing for each add-on option

2. **Added Price Display Options**
   - Added toggle for showing individual add-on prices or combining into total price

### Paint Form (`components/proposal/product-forms/paint-product-form.tsx`)

1. **Replaced Coats with Color Tone Options**
   - Removed the "Number of Coats" selection
   - Added "Color Tone Options" with 1-Color, 2-Tone, and 3-Tone radio buttons

2. **Paint Inclusion Toggle**
   - Changed from checkbox to toggle switch with default set to "Include Paint"
   - Added descriptive text and helper notes
   - Added conditional text showing different descriptions based on selection

3. **Updated Scope Description**
   - Modified to use color tone terminology
   - Updated paint-related notes based on inclusion toggle selection

## Database Changes

### Database Schema Update (`migrations/update_product_schema.sql`)

1. **Product Data Storage**
   - Ensures a `product_data` JSONB column exists to store form data as JSON
   - Adds comments to document the JSON structure for each form type

2. **Added Columns**
   - Added `service_id` and `proposal_id` columns if they don't exist
   - Added `scope_notes` column to store the generated scope text separately

3. **Indexing**
   - Created indexes on service_id and proposal_id for better performance

4. **Related Tables**
   - Ensures services table exists with necessary fields
   - Ensures proposal_services junction table exists

### JSON Data Structure

The product data from forms is stored in a JSON structure in the `product_data` column. Here's what each form stores:

1. **Roofing Data**
   ```json
   {
     "material": "shingles",
     "addGutters": true,
     "gutterLength": "120",
     "addPlywood": true,
     "plywoodPercentage": "30",
     "totalPrice": "8000",
     "squareCount": "20",
     "gutterPrice": "1200",
     "showPricePerSquare": false,
     "showPriceBreakdown": true,
     "showPricing": true
   }
   ```

2. **Windows & Doors Data**
   ```json
   {
     "windowType": "vinyl-retrofit-dual",
     "windowColor": "white",
     "doorTypes": ["entry", "patio"],
     "windowCount": "8",
     "doorCount": "2",
     "customColors": false,
     "windowPrice": "4000",
     "doorPrices": {
       "entry": "800",
       "patio": "1200"
     },
     "showPricing": true,
     "showDoorPriceBreakdown": true
   }
   ```

3. **Garage Doors Data**
   ```json
   {
     "model": "t50l",
     "width": "16",
     "height": "7",
     "addons": ["liftmaster"],
     "quantity": "1",
     "totalPrice": "2000",
     "addonPrices": {
       "liftmaster": "450"
     },
     "showPricing": true,
     "showAddonPriceBreakdown": false
   }
   ```

4. **Paint Data**
   ```json
   {
     "serviceType": "exterior",
     "squareFootage": "2000",
     "colorTone": "2",
     "includePaint": true,
     "includePrimer": true,
     "includePrep": true
   }
   ```

## How to Apply Changes

1. Run the frontend changes by deploying the updated component files.
2. Apply the database schema updates by running:
   ```bash
   node scripts/apply-product-update.js
   ```

These changes ensure the application can store and display the new form fields and options according to the client's requirements. 