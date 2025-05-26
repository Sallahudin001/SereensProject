-- Insert sample product categories
INSERT INTO product_categories (name, description)
VALUES 
('Roofing', 'All roofing products and services'),
('Windows', 'Windows and related services'),
('HVAC', 'Heating, ventilation, and air conditioning systems'),
('Paint', 'Exterior and interior painting services'),
('Garage Doors', 'Garage door products and installation services')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products with product_data
INSERT INTO products (
    category_id,
    name, 
    description, 
    base_price, 
    min_price, 
    pricing_unit, 
    is_active, 
    price_visible,
    product_data
)
VALUES (
    (SELECT id FROM product_categories WHERE name = 'Roofing'), 
    'GAF Architectural Shingles', 
    'High-quality architectural shingles with lifetime warranty', 
    150.00, 
    140.00, 
    'per square', 
    TRUE, 
    TRUE,
    '{"color": "charcoal", "warranty": "lifetime", "manufacturer": "GAF"}'::jsonb
);

INSERT INTO products (
    category_id,
    name, 
    description, 
    base_price, 
    min_price, 
    pricing_unit, 
    is_active, 
    price_visible,
    product_data
)
VALUES (
    (SELECT id FROM product_categories WHERE name = 'Windows'), 
    'Vinyl Retrofit Windows', 
    'Energy efficient dual-pane vinyl windows', 
    450.00, 
    400.00, 
    'per window', 
    TRUE, 
    TRUE,
    '{"material": "vinyl", "glass_type": "dual-pane", "energy_star": true}'::jsonb
);

INSERT INTO products (
    category_id,
    name, 
    description, 
    base_price, 
    min_price, 
    pricing_unit, 
    is_active, 
    price_visible,
    product_data
)
VALUES (
    (SELECT id FROM product_categories WHERE name = 'HVAC'), 
    'Split System 14 SEER - 3 Ton', 
    'Split system furnace and AC 80% 14 SEER - 3 ton', 
    5800.00, 
    5500.00, 
    'per unit', 
    TRUE, 
    TRUE,
    '{"type": "split", "seer": 14, "tonnage": 3, "efficiency": "80%"}'::jsonb
); 