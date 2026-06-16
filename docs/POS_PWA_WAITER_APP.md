# Batch 12 — POS PWA Waiter Smartphone App
## System
Meat Lovers CIMS powered by YohPal
## Purpose
This batch builds the mobile-first waiter POS app.
## Features Added
1. Waiter login
2. Mobile menu
3. Product category tabs
4. Table selection
5. Cart
6. Create order


7. Payment pending state
8. Order status view
9. Cancel request
10. Discount request
11. Mobile-first bottom navigation
## Product Separation
The menu separates:
- Food
- Soft drinks
- Alcoholic drinks
## Waiter Flow
1. Waiter logs in
2. Waiter selects table
3. Waiter opens menu
4. Waiter adds products to cart
5. Waiter selects payment state
6. Waiter creates order
7. Kitchen sees order
8. Cashier settles payment
9. Manager approves cancellations or discounts if requested
## Control Rule
Waiters cannot directly cancel or discount orders.
They can only submit:
- cancellation request
- discount request
Approval must be handled by manager/admin.
