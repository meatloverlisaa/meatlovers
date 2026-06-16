INSERT INTO stock_items (
product_id,
current_quantity,
reorder_level
)
SELECT
id,
0,
10
FROM products;
