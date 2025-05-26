-- Create contract templates table
CREATE TABLE IF NOT EXISTS contract_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL, -- Path to the contract template file
    version VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create signed contracts table
CREATE TABLE IF NOT EXISTS signed_contracts (
    id SERIAL PRIMARY KEY,
    contract_template_id INTEGER REFERENCES contract_templates(id),
    proposal_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- Sales rep who generated this contract
    file_path VARCHAR(255) NOT NULL, -- Path to the signed contract PDF
    signature_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, signed, cancelled, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create contract sections table (for modular contract building)
CREATE TABLE IF NOT EXISTS contract_sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Legal, Roofing, Windows, HVAC, etc.
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create contract template sections (junction table)
CREATE TABLE IF NOT EXISTS contract_template_sections (
    id SERIAL PRIMARY KEY,
    contract_template_id INTEGER REFERENCES contract_templates(id),
    contract_section_id INTEGER REFERENCES contract_sections(id),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_template_id, contract_section_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contract_templates_is_active ON contract_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_proposal_id ON signed_contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_customer_id ON signed_contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contract_sections_category ON contract_sections(category); 