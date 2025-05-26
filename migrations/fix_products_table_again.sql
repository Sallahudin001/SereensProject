-- Drop and recreate the products table
DROP TABLE IF EXISTS product_options;
DROP TABLE IF EXISTS products;

-- Recreate products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES product_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) DEFAULT 0,
    min_price DECIMAL(10,2) DEFAULT 0,
    pricing_unit VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    price_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on category_id
CREATE INDEX idx_products_category_id ON products(category_id);

-- Recreate product options table
CREATE TABLE product_options (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10,2),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on product_id
CREATE INDEX idx_product_options_product_id ON product_options(product_id); 