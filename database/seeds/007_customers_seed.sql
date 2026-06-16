INSERT INTO customers (
full_name,
phone,
email,
customer_type,
loyalty_points,
notes
) VALUES
(
'Walk In Customer',
NULL,
NULL,
'WALK_IN',
0,
'Default walk-in customer'
),
(
'Corporate Client One',
'0722000001',
'corporate1@example.com',
'CORPORATE',
0,
'Potential catering and group booking customer'
),
(
'Regular Customer One',
'0722000002',
'regular1@example.com',
'REGULAR',
25,
'Repeat customer'
),
(
'VIP Customer One',
'0722000003',
'vip1@example.com',
'VIP',
100,
'VIP customer for priority service'
),
(
'Delivery Customer One',
'0722000004',
'delivery1@example.com',
'DELIVERY',
10,


'Customer usually orders for delivery'
);
