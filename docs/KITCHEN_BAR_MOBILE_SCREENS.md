# Batch 13 — Kitchen + Bar Mobile Screens
## System
Meat Lovers CIMS powered by YohPal
## Purpose
This batch extends the mobile POS app so kitchen and bar staff can operate from smartphones.
## Kitchen Screens
### Kitchen Queue
Allows kitchen/chef staff to:
- view pending orders
- view preparing orders
- mark order as preparing
- mark order as ready
## Bar Screens
### Bar Stock
Allows bar staff to:
- view alcoholic drinks stock
- see current quantity
- see reorder level
- receive low-stock alerts
### Bar Issue
Allows bar staff to:
- issue bar stock
- record product ID
- record quantity
- record reference number
- record notes
## Controls
### Kitchen
Kitchen cannot delete orders.
Kitchen can only update status:
- PREPARING
- READY
### Bar
Bar stock movement is recorded through backend API.


All bar stock issues are audit logged.
## Mobile-First Rule
All pages are designed for smartphones first.
The bottom navigation gives fast access to:
- POS
- Kitchen
- Bar
- Orders
