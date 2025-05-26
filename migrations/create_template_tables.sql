-- Create scope templates table
CREATE TABLE IF NOT EXISTS scope_templates (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES product_categories(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Rich text/HTML content
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create upsell offers table
CREATE TABLE IF NOT EXISTS upsell_offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    product_id INTEGER REFERENCES products(id),
    discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    expiration_type VARCHAR(50), -- 48 hours, 72 hours, this week, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bundle discounts table
CREATE TABLE IF NOT EXISTS bundle_discounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_categories TEXT[], -- Array of category IDs that trigger this discount
    min_products INTEGER DEFAULT 2,
    discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create company settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20),
    accent_color VARCHAR(20),
    font_family VARCHAR(100),
    email_template TEXT,
    sms_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scope_templates_category_id ON scope_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_upsell_offers_product_id ON upsell_offers(product_id); 