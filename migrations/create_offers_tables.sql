-- Create special offers table
CREATE TABLE IF NOT EXISTS special_offers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Roofing, Windows, HVAC, Paint, Garage Doors, Bundle, etc.
    discount_amount DECIMAL(10,2), -- Dollar amount discount (if applicable)
    discount_percentage DECIMAL(5,2), -- Percentage discount (if applicable)
    free_product_service TEXT, -- Description of free product/service (if applicable)
    expiration_type VARCHAR(50) NOT NULL, -- hours, days, date
    expiration_value INTEGER, -- Number of hours/days OR NULL if fixed date
    expiration_date TIMESTAMP WITH TIME ZONE, -- Fixed expiration date OR NULL if duration-based
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create offer usage table (to track when offers are used in proposals)
CREATE TABLE IF NOT EXISTS offer_usage (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER REFERENCES special_offers(id),
    proposal_id INTEGER NOT NULL, -- Reference to the proposal where this was used
    user_id INTEGER NOT NULL, -- Sales rep who used this offer
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create offer templates table (for quick reuse of common offers)
CREATE TABLE IF NOT EXISTS offer_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    free_product_service TEXT,
    default_expiration_type VARCHAR(50) NOT NULL,
    default_expiration_value INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_special_offers_category ON special_offers(category);
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON special_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offer_usage_proposal_id ON offer_usage(proposal_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_id ON offer_usage(offer_id); 