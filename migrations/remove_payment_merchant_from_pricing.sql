-- Migration to remove payment_factor column from pricing table
ALTER TABLE pricing DROP COLUMN IF EXISTS payment_factor;

-- Migration to remove merchant_fee column from pricing table
ALTER TABLE pricing DROP COLUMN IF EXISTS merchant_fee;

-- Update timestamp to reflect changes
UPDATE pricing SET updated_at = CURRENT_TIMESTAMP; 