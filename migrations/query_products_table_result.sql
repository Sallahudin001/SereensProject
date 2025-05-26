-- Result from running query_products_table.sql (this file is just for documentation)
/*
column_name   | data_type                   | is_nullable | column_default
--------------+-----------------------------+-------------+---------------
id            | integer                     | NO          | nextval('products_id_seq'::regclass)
category_id   | integer                     | YES         | NULL
product_data  | jsonb                       | NO          | '{}'::jsonb
name          | character varying           | NO          | 'Unnamed Product'::character varying
description   | text                        | YES         | NULL
base_price    | numeric                     | YES         | 0
is_active     | boolean                     | YES         | true
pricing_unit  | character varying           | YES         | NULL
min_price     | numeric                     | YES         | 0
price_visible | boolean                     | YES         | true
created_at    | timestamp with time zone    | YES         | CURRENT_TIMESTAMP
updated_at    | timestamp with time zone    | YES         | CURRENT_TIMESTAMP
*/ 