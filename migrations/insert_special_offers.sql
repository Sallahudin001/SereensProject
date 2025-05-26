-- Insert initial special offers based on client's requirements
INSERT INTO special_offers
(name, description, category, discount_amount, discount_percentage, free_product_service, expiration_type, expiration_value, is_active)
VALUES
-- Roofing offers
('Free Gutters & Downspouts', 'Book your roof this week and we''ll include free gutters & downspouts', 'Roofing', NULL, NULL, 'Gutters & Downspouts', 'days', 7, TRUE),
('10% Off Roofing Project', 'Sign within 72 hours and receive 10% off your entire roofing project.', 'Roofing', NULL, 10.00, NULL, 'hours', 72, TRUE),
('Free Attic Insulation Labor', 'Add attic insulation today with your roof project and we''ll waive the labor cost (expires in 3 days).', 'Roofing', NULL, NULL, 'Attic Insulation Labor', 'days', 3, TRUE),

-- Windows offers
('$500 Off Window Package', 'Add a patio door today and we''ll discount $500 off your window package - this week only.', 'Windows', 500.00, NULL, NULL, 'days', 7, TRUE),
('Free Interior Entry Door', 'Confirm today and we''ll include one free interior entry door from the provided options (the door and installation).', 'Windows', NULL, NULL, 'Interior Entry Door', 'days', 1, TRUE),
('Free Smart Lock', 'Add a new entry door today and we''ll include a keyless smart lock system — easy access, modern design, and enhanced security. Offer valid for 72 hours.', 'Windows', NULL, NULL, 'Keyless Smart Lock System', 'hours', 72, TRUE),

-- HVAC offers
('Free Smart Thermostat', 'Book your HVAC install by Friday and receive a free smart thermostat upgrade part of the package', 'HVAC', NULL, NULL, 'Smart Thermostat', 'days', 5, TRUE),

-- Paint offers
('Free Two-Tone Paint', 'Add exterior painting to your project and we''ll include another free color (2 tones) (expires in 48 hours).', 'Paint', NULL, NULL, 'Additional Paint Color', 'hours', 48, TRUE),
('Free Door Paint', 'Confirm today — we''ll paint your front door free with your exterior paint job.', 'Paint', NULL, NULL, 'Front Door Painting', 'days', 1, TRUE),

-- Garage Door offers
('$200 Garage Door Rebate', 'Sign this week — get a $200 rebate on any garage door model', 'Garage Doors', 200.00, NULL, NULL, 'days', 7, TRUE),
('Free Smart Garage Opener', 'Sign this week, and we''ll include a keyless smart lock system — easy access, modern design, and enhanced security. Offer valid for 72 hours.', 'Garage Doors', NULL, NULL, 'Smart Garage Opener', 'hours', 72, TRUE),

-- Bundle offers
('$1000 Off Bundle Discount', 'Add a second service today (like paint or windows), and we''ll take $1000 off your total project.', 'Bundle', 1000.00, NULL, NULL, 'days', 1, TRUE),
('Free Attic Insulation with Bundle', 'Bundle roof + HVAC — we''ll throw in attic insulation labor at no charge to keep your home insulated.', 'Bundle', NULL, NULL, 'Attic Insulation Labor', 'days', 3, TRUE),
('3 Free Monthly Payments', 'Bundle 2 services today and we''ll cover your first 3 monthly payments — delivered as a rebate check once the project is complete.', 'Bundle', NULL, NULL, '3 Monthly Payments Rebate', 'days', 1, TRUE);

-- Insert offer templates for quick reuse
INSERT INTO offer_templates
(name, description, category, discount_amount, discount_percentage, free_product_service, default_expiration_type, default_expiration_value, is_active)
VALUES
('Free Gutters Template', 'Book your roof this week and we''ll include free gutters & downspouts', 'Roofing', NULL, NULL, 'Gutters & Downspouts', 'days', 7, TRUE),
('10% Off Template', 'Sign within 72 hours and receive 10% off your entire project.', 'Any', NULL, 10.00, NULL, 'hours', 72, TRUE),
('$500 Off Template', 'Add an additional service today and we''ll discount $500 off your package', 'Any', 500.00, NULL, NULL, 'days', 7, TRUE),
('Free Smart Device Template', 'Sign today and receive a free smart home device with your installation', 'Any', NULL, NULL, 'Smart Home Device', 'days', 1, TRUE); 