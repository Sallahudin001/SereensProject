-- Seed product_pricing table with sample data for each category
-- This provides initial data for the new admin pricing management system

-- Clear existing data
DELETE FROM product_pricing;

-- Roofing products
INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status) VALUES
  ('Asphalt Shingles - Standard', 'square', 450.00, 405.00, 540.00, 360.00, 'roofing', 'active'),
  ('Asphalt Shingles - Premium', 'square', 650.00, 585.00, 780.00, 520.00, 'roofing', 'active'),
  ('Metal Roofing - Steel Panel', 'square', 850.00, 765.00, 1020.00, 680.00, 'roofing', 'active'),
  ('Metal Roofing - Aluminum Panel', 'square', 950.00, 855.00, 1140.00, 760.00, 'roofing', 'active'),
  ('Gutters - Aluminum Seamless', 'linear_foot', 12.50, 11.25, 15.00, 10.00, 'roofing', 'active'),
  ('Gutters - Copper', 'linear_foot', 25.00, 22.50, 30.00, 20.00, 'roofing', 'active'),
  ('Roof Underlayment - Standard', 'square', 75.00, 67.50, 90.00, 60.00, 'roofing', 'active'),
  ('Roof Underlayment - Premium', 'square', 125.00, 112.50, 150.00, 100.00, 'roofing', 'active');

-- HVAC products
INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status) VALUES
  ('Central Air Conditioning - 2 Ton', 'unit', 3500.00, 3150.00, 4200.00, 2800.00, 'hvac', 'active'),
  ('Central Air Conditioning - 3 Ton', 'unit', 4200.00, 3780.00, 5040.00, 3360.00, 'hvac', 'active'),
  ('Central Air Conditioning - 4 Ton', 'unit', 5000.00, 4500.00, 6000.00, 4000.00, 'hvac', 'active'),
  ('Gas Furnace - 80% Efficiency', 'unit', 2800.00, 2520.00, 3360.00, 2240.00, 'hvac', 'active'),
  ('Gas Furnace - 90% Efficiency', 'unit', 3500.00, 3150.00, 4200.00, 2800.00, 'hvac', 'active'),
  ('Gas Furnace - 95% Efficiency', 'unit', 4500.00, 4050.00, 5400.00, 3600.00, 'hvac', 'active'),
  ('Ductwork Installation', 'square_foot', 8.50, 7.65, 10.20, 6.80, 'hvac', 'active'),
  ('Ductwork Cleaning', 'square_foot', 3.50, 3.15, 4.20, 2.80, 'hvac', 'active'),
  ('Thermostat - Programmable', 'unit', 250.00, 225.00, 300.00, 200.00, 'hvac', 'active'),
  ('Thermostat - Smart WiFi', 'unit', 450.00, 405.00, 540.00, 360.00, 'hvac', 'active');

-- Windows & Doors products
INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status) VALUES
  ('Vinyl Windows - Double Hung', 'window', 650.00, 585.00, 780.00, 520.00, 'windows', 'active'),
  ('Vinyl Windows - Casement', 'window', 750.00, 675.00, 900.00, 600.00, 'windows', 'active'),
  ('Wood Windows - Double Hung', 'window', 1200.00, 1080.00, 1440.00, 960.00, 'windows', 'active'),
  ('Wood Windows - Casement', 'window', 1400.00, 1260.00, 1680.00, 1120.00, 'windows', 'active'),
  ('Fiberglass Windows - Double Hung', 'window', 950.00, 855.00, 1140.00, 760.00, 'windows', 'active'),
  ('Entry Door - Steel', 'door', 850.00, 765.00, 1020.00, 680.00, 'windows', 'active'),
  ('Entry Door - Fiberglass', 'door', 1200.00, 1080.00, 1440.00, 960.00, 'windows', 'active'),
  ('Entry Door - Wood', 'door', 1800.00, 1620.00, 2160.00, 1440.00, 'windows', 'active'),
  ('Patio Door - Sliding', 'door', 1500.00, 1350.00, 1800.00, 1200.00, 'windows', 'active'),
  ('Patio Door - French', 'door', 2200.00, 1980.00, 2640.00, 1760.00, 'windows', 'active');

-- Garage Door products
INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status) VALUES
  ('Garage Door - Steel Single', 'door', 750.00, 675.00, 900.00, 600.00, 'garage', 'active'),
  ('Garage Door - Steel Double', 'door', 1200.00, 1080.00, 1440.00, 960.00, 'garage', 'active'),
  ('Garage Door - Wood Single', 'door', 1500.00, 1350.00, 1800.00, 1200.00, 'garage', 'active'),
  ('Garage Door - Wood Double', 'door', 2500.00, 2250.00, 3000.00, 2000.00, 'garage', 'active'),
  ('Garage Door - Aluminum Single', 'door', 850.00, 765.00, 1020.00, 680.00, 'garage', 'active'),
  ('Garage Door - Aluminum Double', 'door', 1400.00, 1260.00, 1680.00, 1120.00, 'garage', 'active'),
  ('Garage Door Opener - Chain Drive', 'unit', 350.00, 315.00, 420.00, 280.00, 'garage', 'active'),
  ('Garage Door Opener - Belt Drive', 'unit', 450.00, 405.00, 540.00, 360.00, 'garage', 'active'),
  ('Garage Door Opener - Direct Drive', 'unit', 550.00, 495.00, 660.00, 440.00, 'garage', 'active');

-- Paint products
INSERT INTO product_pricing (name, unit, base_price, min_price, max_price, cost, category, status) VALUES
  ('Interior Paint - Standard', 'gallon', 45.00, 40.50, 54.00, 36.00, 'paint', 'active'),
  ('Interior Paint - Premium', 'gallon', 65.00, 58.50, 78.00, 52.00, 'paint', 'active'),
  ('Exterior Paint - Standard', 'gallon', 55.00, 49.50, 66.00, 44.00, 'paint', 'active'),
  ('Exterior Paint - Premium', 'gallon', 75.00, 67.50, 90.00, 60.00, 'paint', 'active'),
  ('Primer - Interior', 'gallon', 35.00, 31.50, 42.00, 28.00, 'paint', 'active'),
  ('Primer - Exterior', 'gallon', 40.00, 36.00, 48.00, 32.00, 'paint', 'active'),
  ('Paint Labor - Interior', 'square_foot', 2.50, 2.25, 3.00, 2.00, 'paint', 'active'),
  ('Paint Labor - Exterior', 'square_foot', 3.50, 3.15, 4.20, 2.80, 'paint', 'active'),
  ('Paint Prep Work', 'hour', 45.00, 40.50, 54.00, 36.00, 'paint', 'active');



-- Log migration
INSERT INTO migration_history (name) VALUES ('seed_product_pricing')
ON CONFLICT (name) DO NOTHING; 