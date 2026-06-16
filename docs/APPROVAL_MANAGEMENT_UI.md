# Batch 16 — Approval Management UI
## System
Meat Lovers CIMS powered by YohPal


## Purpose
This batch gives management a dashboard for approving, rejecting, and applying sensitive operational requests.
## Approval Types Supported
1. Order cancellation
2. Discount
3. Stock adjustment
4. Refund placeholder
## Pages Added
### Approval List
Shows current approval requests and allows:
- approve
- reject
- apply approved request
### Approval History
Shows all approval decisions and request history.
### Approval Rules
Explains which sensitive actions require management approval.
## Apply Logic
### Order Cancellation
When an approved order cancellation is applied:
```text
orders.order_status = CANCELLED

Discount
When an approved discount is applied:
orders.discount_amount = requested discount
orders.total_amount = subtotal - discount

Stock Adjustment
When an approved stock adjustment is applied:
a stock movement is created
stock item quantity is updated

Refund
Refund approval is intentionally not executed yet.
It remains a placeholder until the payment refund phase is built.

Theft Control Value
This module prevents:
unauthorized order cancellation
unauthorized discount
unauthorized stock adjustment
unapproved refund execution
--# Batch 16 Outcome
Approval management now includes:
approval list page
approve action
reject action
approval status history
cancellation approval handling
discount approval handling


stock adjustment approval handling
refund approval placeholder
# Next Smart Move
Build **Batch 17 — Finance + P&L Deepening Pack**, including:
- expense categories
- income categories
- daily income statement table
- weekly income statement table
- monthly income statement table
- annual income statement table
- food/soft drinks/alcohol profitability split
- cashier settlement reconciliation
- variance detection placeholder
