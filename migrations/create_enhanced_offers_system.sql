-- Enhanced Offers and Upselling System Database Schema
-- This extends the existing special_offers table with additional functionality

-- Create lifestyle upsells table (for emotional trigger upsells)
CREATE TABLE IF NOT EXISTS lifestyle_upsells (
    id SERIAL PRIMARY KEY,
    trigger_phrase VARCHAR(255) NOT NULL, -- "Want it quieter inside?", "Cut your utility bill even more?"
    product_suggestion VARCHAR(255) NOT NULL, -- "Add dual-pane windows", "Add attic insulation"
    category VARCHAR(100) NOT NULL, -- Category this applies to
    base_price DECIMAL(10,2) NOT NULL,
    monthly_impact DECIMAL(8,2) NOT NULL, -- Monthly payment increase
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced bundle rules table (more sophisticated than bundle_discounts)
CREATE TABLE IF NOT EXISTS bundle_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_services TEXT[] NOT NULL, -- Array of service names that must be selected
    min_services INTEGER DEFAULT 2,
    discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, free_service
    discount_value DECIMAL(10,2), -- Percentage or dollar amount
    free_service VARCHAR(255), -- Name of free service/product if applicable
    bonus_message TEXT, -- Message to display when bundle is detected
    priority INTEGER DEFAULT 0, -- Higher priority rules take precedence
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposal offers junction table (tracks which offers are applied to which proposals)
CREATE TABLE IF NOT EXISTS proposal_offers (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,
    offer_type VARCHAR(50) NOT NULL, -- special_offer, bundle_rule, lifestyle_upsell
    offer_id INTEGER NOT NULL, -- ID of the specific offer
    discount_amount DECIMAL(10,2) DEFAULT 0,
    expiration_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, used, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Add unique constraint to prevent duplicate offer assignments
    UNIQUE(proposal_id, offer_type, offer_id)
);

-- Upsell interactions table (tracks customer interactions with upsells)
CREATE TABLE IF NOT EXISTS upsell_interactions (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,
    upsell_type VARCHAR(50) NOT NULL, -- lifestyle, addon, bundle
    upsell_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- viewed, selected, deselected, purchased
    previous_total DECIMAL(10,2),
    new_total DECIMAL(10,2),
    monthly_impact DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial lifestyle upsells based on client requirements
-- Using ON CONFLICT DO NOTHING to prevent duplicates if run multiple times
INSERT INTO lifestyle_upsells 
(trigger_phrase, product_suggestion, category, base_price, monthly_impact, description, display_order)
VALUES
('Want it quieter inside?', 'Add dual-pane windows', 'comfort', 4000.00, 40.00, 'Dual-pane windows significantly reduce outside noise', 1),
('Cut your utility bill even more?', 'Add attic insulation', 'efficiency', 2500.00, 25.00, 'Proper insulation can reduce heating and cooling costs by up to 30%', 2),
('Cut your utility bill even more?', 'Add a Heat Pump', 'efficiency', 8500.00, 85.00, 'Heat pumps are 3x more efficient than traditional HVAC systems', 3),
('Want to refresh your home exterior?', 'Add exterior paint', 'curb_appeal', 5000.00, 50.00, 'Fresh paint increases home value and curb appeal', 4),
('Looking for modern convenience?', 'Upgrade to smart thermostat', 'smart_home', 350.00, 5.00, 'Control your home temperature from anywhere', 5),
('Want enhanced security?', 'Add smart garage door opener', 'security', 450.00, 8.00, 'Smart openers provide security and convenience', 6)
ON CONFLICT (trigger_phrase, product_suggestion) DO NOTHING;

-- Insert bundle rules based on client requirements
-- Using ON CONFLICT DO NOTHING to prevent duplicates if run multiple times
INSERT INTO bundle_rules 
(name, description, required_services, min_services, discount_type, discount_value, bonus_message, priority)
VALUES
('Roof + Windows Bundle', 'Bundle roofing with windows for automatic savings', ARRAY['roofing', 'windows-doors'], 2, 'percentage', 5.00, 'Bundle a roof + new windows today and get an automatic 5% off.', 1),
('Roof + HVAC Bundle', 'Roof and HVAC combination with free smart thermostat', ARRAY['roofing', 'hvac'], 2, 'free_service', 0, 'Add HVAC with your roof and receive a free smart thermostat upgrade.', 2),
('Triple Service Bundle', 'Three or more services get $1000 off', ARRAY['roofing', 'windows-doors', 'hvac'], 3, 'fixed_amount', 1000.00, 'Add a third service today and we''ll take $1000 off your total project.', 3),
('Paint + Windows Combo', 'Windows and paint combination bonus', ARRAY['windows-doors', 'paint'], 2, 'fixed_amount', 500.00, 'Bundle windows + paint and save $500 on your total project.', 4),
('Complete Home Bundle', 'Four services get maximum discount', ARRAY['roofing', 'windows-doors', 'hvac', 'paint'], 4, 'percentage', 8.00, 'Complete home upgrade! 8% off when you bundle four services.', 5)
ON CONFLICT (name) DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lifestyle_upsells_category ON lifestyle_upsells(category);
CREATE INDEX IF NOT EXISTS idx_bundle_rules_priority ON bundle_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_offers_proposal_id ON proposal_offers(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_offers_expiration ON proposal_offers(expiration_date);
CREATE INDEX IF NOT EXISTS idx_proposal_offers_status ON proposal_offers(status);
CREATE INDEX IF NOT EXISTS idx_upsell_interactions_proposal_id ON upsell_interactions(proposal_id); 