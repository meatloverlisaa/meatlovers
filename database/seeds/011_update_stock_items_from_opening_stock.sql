UPDATE stock_items si
JOIN (
SELECT
product_id,
SUM(quantity) AS total_quantity
FROM stock_movements
WHERE reference_number = 'OPENING-STOCK'
GROUP BY product_id
) sm ON si.product_id = sm.product_id
SET si.current_quantity = sm.total_quantity;
