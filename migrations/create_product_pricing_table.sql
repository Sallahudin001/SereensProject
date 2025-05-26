-- Create product_pricing table to store product pricing data by category
CREATE TABLE IF NOT EXISTS product_pricing (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  min_price DECIMAL(10, 2) NOT NULL,
  max_price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', 
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_product_pricing_category ON product_pricing(category);

-- Insert initial data for testing
INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status)
VALUES 
  ('Asphalt Shingles', 'square', 450, 430, 550, 400, 'roofing', 'active'),
  ('Metal Roofing', 'square', 850, 800, 950, 750, 'roofing', 'active'),
  ('Vinyl Windows', 'unit', 650, 600, 750, 550, 'windows', 'active'),
  ('Premium Paint Package', 'gallon', 65, 60, 85, 50, 'paint', 'active');

-- Log migration in history  
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migration_history (name) VALUES ('create_product_pricing_table'); 