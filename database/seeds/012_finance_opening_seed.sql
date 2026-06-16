INSERT INTO finance_transactions (
transaction_type,
category,
amount,
reference_number,
notes,
created_by
) VALUES
(
'EXPENSE',
'OPENING_STOCK',
150000.00,
'OPENING-STOCK-COST',
'Estimated opening stock cost for system testing',
2
),
(
'EXPENSE',
'ASSET_REGISTER',
458000.00,
'OPENING-ASSETS',
'Opening asset register value for system testing',
2
);
