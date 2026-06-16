# Batch 14 — Cashier Payment Screen + Receipt Flow
## System
Meat Lovers CIMS powered by YohPal
## Purpose
This batch adds cashier payment control and receipt visibility.
## Screens Added
1. Cashier payment page
2. Order search
3. Cash settlement
4. M-Pesa pending placeholder
5. Paid receipt view
6. Print queue placeholder
## Backend Added
1. M-Pesa pending endpoint
2. Receipt endpoint
3. Print queue endpoint
4. Payment audit endpoint
## Print Queue Types
- KITCHEN
- BAR
- CUSTOMER_RECEIPT
## Control Rules
### Cash Payment
Cash settlement changes order status to:
```text
PAID

M-Pesa
M-Pesa is currently only marked as:
PENDING
Real Daraja callback wiring must come later.

Receipt
Receipt shows:
order number
table
status
items
total amount
payment records

Audit
All payment-sensitive actions must be audit logged.
--# Batch 14 Outcome
Cashier flow now includes:
cashier mobile/payment page
order search
cash settlement
M-Pesa pending placeholder
paid receipt view
kitchen/bar receipt print queue placeholder


payment audit visibility
# Next Smart Move
Build **Batch 15 — Monitoring Dashboard Live Control UI**, including:
- owner dashboard
- sales summary cards
- low stock alerts
- pending approvals
- pending M-Pesa
- unsold food alerts
- kitchen queue count
- bar low-stock count
- cashier settlement count
