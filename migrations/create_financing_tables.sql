-- Create financing plans table
CREATE TABLE IF NOT EXISTS financing_plans (
    id SERIAL PRIMARY KEY,
    plan_number VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL, -- GreenSky, Homerun PACE, etc.
    plan_name VARCHAR(255) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INTEGER NOT NULL,
    payment_factor DECIMAL(10,4) NOT NULL,
    merchant_fee DECIMAL(5,2) NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create financing calculations table
CREATE TABLE IF NOT EXISTS financing_calculations (
    id SERIAL PRIMARY KEY,
    financing_plan_id INTEGER REFERENCES financing_plans(id),
    calculation_formula TEXT NOT NULL, -- Store the actual formula used
    display_notes TEXT, -- Customer-facing notes about this calculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financing_plans_provider ON financing_plans(provider);
CREATE INDEX IF NOT EXISTS idx_financing_calculations_plan_id ON financing_calculations(financing_plan_id); 