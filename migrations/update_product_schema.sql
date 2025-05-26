-- Migration to update products table for new form fields
-- This is necessary to store the new fields added to the product forms

-- First, check if the product_data column exists, and if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'product_data'
    ) THEN
        ALTER TABLE products ADD COLUMN product_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add service_id and proposal_id columns if they don't exist
-- These columns are used to link products to specific proposals and services
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'service_id'
    ) THEN
        ALTER TABLE products ADD COLUMN service_id INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'proposal_id'
    ) THEN
        ALTER TABLE products ADD COLUMN proposal_id INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'scope_notes'
    ) THEN
        ALTER TABLE products ADD COLUMN scope_notes TEXT;
    END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_service_id ON products(service_id);
CREATE INDEX IF NOT EXISTS idx_products_proposal_id ON products(proposal_id);

-- Create or update services table if needed
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create proposal_services join table if needed
CREATE TABLE IF NOT EXISTS proposal_services (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (proposal_id, service_id)
);

-- Add missing services if they don't exist
INSERT INTO services (name, display_name, description)
VALUES 
    ('roofing', 'Roofing', 'Roofing services including installation and repair'),
    ('windows-doors', 'Windows & Doors', 'Window and door installation and replacement'),
    ('garage-doors', 'Garage Doors', 'Garage door installation and repair'),
    ('paint', 'Paint', 'Interior and exterior painting services')
ON CONFLICT (name) DO NOTHING;

-- Add comments to explain the JSON structure
COMMENT ON COLUMN products.product_data IS 'JSONB column to store product form data. 
For roofing: {material, addGutters, gutterLength, addPlywood, plywoodPercentage, totalPrice, squareCount, gutterPrice, showPricePerSquare, showPriceBreakdown, showPricing}
For windows-doors: {windowType, windowColor, doorTypes, windowCount, doorCount, customColors, windowPrice, doorPrices, showPricing, showDoorPriceBreakdown}
For garage-doors: {model, width, height, addons, quantity, totalPrice, addonPrices, showPricing, showAddonPriceBreakdown}
For paint: {serviceType, squareFootage, colorTone, includePaint, includePrimer, includePrep}'; 