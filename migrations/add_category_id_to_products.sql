-- Add category_id column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES product_categories(id);

-- Add index on the column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id); 