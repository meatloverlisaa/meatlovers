# Batch 17 — Finance + P&L Deepening Pack
## System
Meat Lovers CIMS powered by YohPal
## Purpose
This batch deepens finance from basic income and expenses into controlled P&L, category tracking,
reconciliation, and variance detection.
## Tables Added
1. `finance_categories`
2. `income_statement_snapshots`
3. `cashier_reconciliations`
4. `variance_alerts`
## Finance Categories
The system now separates:
### Income
- Food Sales
- Soft Drinks Sales
- Alcoholic Drinks Sales
- Delivery Income
- Catering Income
- Other Income
### Expenses
- Food Stock Purchase
- Soft Drinks Purchase
- Alcohol Purchase
- Staff Wages
- Rent
- Utilities
- Transport
- Repairs and Maintenance
- Marketing
- Miscellaneous Expense
## P&L Snapshot Types
1. Daily
2. Weekly
3. Monthly
4. Annual
Each snapshot stores:
- food sales
- soft drinks sales
- alcoholic drinks sales
- total sales
- other income
- cost of goods
- total expenses
- gross profit
- net profit
## Profitability Split
The system calculates profitability by:
- food
- soft drinks
- alcoholic drinks
## Cashier Reconciliation
The system compares:


- expected cash vs declared cash
- expected M-Pesa vs confirmed M-Pesa
## Variance Detection Placeholder
Variance alerts are created for:
- cash shortage
- cash excess
- M-Pesa mismatch
Future phases can extend variance detection to:
- stock variance
- sales variance
- bar variance
- kitchen usage variance
