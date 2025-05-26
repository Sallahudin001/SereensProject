-- Add uniqueness constraint to financing_plans table
BEGIN;

-- First, clean up any existing duplicates if they exist in the database
-- We keep the most recently created plan (highest ID) for each plan_number + provider combination
CREATE TEMP TABLE IF NOT EXISTS temp_unique_plans AS
SELECT DISTINCT ON (plan_number, provider) 
    id, 
    plan_number, 
    provider,
    plan_name,
    interest_rate,
    term_months,
    payment_factor,
    merchant_fee,
    notes,
    is_active,
    created_at,
    updated_at
FROM financing_plans
ORDER BY plan_number, provider, id DESC;

-- Delete all plans
DELETE FROM financing_plans;

-- Re-insert only the unique plans
INSERT INTO financing_plans
SELECT * FROM temp_unique_plans;

-- Add uniqueness constraint
ALTER TABLE financing_plans
ADD CONSTRAINT unique_plan_number_provider UNIQUE (plan_number, provider);

DROP TABLE temp_unique_plans;

COMMIT; 