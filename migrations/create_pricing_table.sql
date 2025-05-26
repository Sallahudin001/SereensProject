-- Create pricing table for financing rates
CREATE TABLE IF NOT EXISTS pricing (
  id SERIAL PRIMARY KEY,
  plan_number VARCHAR(50),
  rate_name VARCHAR(255) NOT NULL,
  payment_factor DECIMAL(10, 4),
  merchant_fee DECIMAL(10, 4),
  notes TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pricing_plan_number ON pricing(plan_number); 