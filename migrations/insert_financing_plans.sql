-- Insert initial financing plans based on client's spreadsheet
INSERT INTO financing_plans 
(plan_number, provider, plan_name, interest_rate, term_months, payment_factor, merchant_fee, notes, is_active)
VALUES
('Plan 2832', 'GreenSky', '12.99% APR 120 months', 12.99, 120, 1.49, 0, NULL, TRUE),
('Plan 1509', 'GreenSky', '10.99% APR 180 months', 10.99, 180, 1.14, 3, NULL, TRUE),
('Plan 1599', 'GreenSky', '9.99% APR 180 months', 9.99, 180, 1.07, 6, NULL, TRUE),
('Plan 2737', 'GreenSky', '7.99% APR for 120 months', 7.99, 120, 1.21, 8, NULL, TRUE),
('Plan 1519', 'GreenSky', '11.99% APR for 180 months', 11.99, 180, 1.20, 0, NULL, TRUE),
('Plan 4158', 'GreenSky', 'Deferred Interest', 0, 180, 0, 6, 'Interest waived if amount financed is paid in full within 15 month Promo Period. 84 monthly payments required, including during the Promo Period.', TRUE);

-- Insert Homerun PACE financing options
INSERT INTO financing_plans 
(plan_number, provider, plan_name, interest_rate, term_months, payment_factor, merchant_fee, notes, is_active)
VALUES
('PACE-20', 'Homerun PACE', '9.99% APR 20 years', 9.99, 240, 0.97, 5, 'Check Homerun portal for actual monthly payment calculations.', TRUE),
('PACE-25', 'Homerun PACE', '9.99% APR 25 years', 9.99, 300, 0.88, 5, 'Check Homerun portal for actual monthly payment calculations.', TRUE),
('PACE-30', 'Homerun PACE', '9.99% APR 30 years', 9.99, 360, 0.83, 5, 'Check Homerun portal for actual monthly payment calculations.', TRUE);

-- Insert special notes - use WHERE clause to ensure exactly one row
INSERT INTO financing_calculations
(financing_plan_id, calculation_formula, display_notes)
SELECT id, 'Project total x Payment Factor = Monthly Payment', 'Check Minimum monthly payment in the Greensky app'
FROM financing_plans 
WHERE plan_number = 'Plan 4158'
LIMIT 1; 