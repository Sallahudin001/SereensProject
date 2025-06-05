-- Add product pricing breakdown fields to proposal_data table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB DEFAULT '{}'::jsonb;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS pricing_override BOOLEAN DEFAULT FALSE;

-- Create custom adders table to store custom line items
CREATE TABLE IF NOT EXISTS custom_pricing_adders (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
  product_category VARCHAR(50) NOT NULL, -- roofing, hvac, windows-doors, etc.
  description VARCHAR(255) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_pricing_adders_proposal_id ON custom_pricing_adders(proposal_id);

-- Record migration history
INSERT INTO migration_history (name) VALUES ('add_product_pricing_breakdown'); 