INSERT INTO users (
full_name,
email,
phone,
password_hash,
role,
is_active
) VALUES
(
'Super Admin',
'admin@meatlovers.local',
'0700000001',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'SUPER_ADMIN',
TRUE
),
(
'Restaurant Manager',
'manager@meatlovers.local',
'0700000002',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'MANAGER',
TRUE
),
(
'Main Cashier',
'cashier@meatlovers.local',
'0700000003',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'CASHIER',
TRUE
),
(
'Service Waiter',
'waiter@meatlovers.local',
'0700000004',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'WAITER',
TRUE
),
(
'Kitchen Chef',
'chef@meatlovers.local',
'0700000005',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'CHEF',
TRUE
),
(
'Store Keeper',
'store@meatlovers.local',
'0700000006',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'STOREKEEPER',
TRUE
),
(
'Bar Attendant',


'bar@meatlovers.local',
'0700000007',
'$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION',
'BARMAN',
TRUE
);
