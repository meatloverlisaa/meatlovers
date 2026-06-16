INSERT INTO stock_movements (
product_id,
movement_type,
quantity,


reference_number,
notes,
user_id
)
SELECT
p.id,
'PURCHASE',
CASE
WHEN p.product_category = 'FOOD' THEN 20
WHEN p.product_category = 'SOFT_DRINK' THEN 48
WHEN p.product_category = 'ALCOHOLIC_DRINK' THEN 36
ELSE 0
END,
'OPENING-STOCK',
'Opening stock loaded during system setup',
6
FROM products p;
