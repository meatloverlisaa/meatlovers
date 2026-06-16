# Batch 5 — PHP Backend Security + Audit Layer
## Purpose
This batch introduces backend control so the system does not merely record transactions, but also controls
risk.
## Security Added
- Auth user resolver
- Required authentication
- Role-based permissions
- Approval request system
- Audit logging
- Protected stock movement
- Protected order cancellation
- Protected discount requests
- Protected cash settlement
## Approval Required For
1. Order cancellation
2. Discount
3. Stock adjustment
4. Refunds
## Roles With Approval Power
- SUPER_ADMIN
- ADMIN
- MANAGER
## Operational Protection
### Stock Adjustment
Storekeepers may request adjustment, but management must approve before sensitive stock changes proceed.
### Order Cancellation
Waiters and cashiers may request cancellation, but management must approve.
### Discount
Waiters and cashiers may request discount, but management must approve.


### Cash Settlement
Only cashier and management-level users may settle payments.
## Audit Rule
Every sensitive action must write to `audit_logs`.
## Theft Control Impact
This layer helps prevent:
- fake stock adjustment
- fake order cancellation
- unauthorized discount
- unauthorized cash settlement
- untraceable system changes
