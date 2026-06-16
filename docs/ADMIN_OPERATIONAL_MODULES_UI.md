# Batch 10 — Admin Operational Modules UI
## System
Meat Lovers CIMS powered by YohPal
## Purpose
This batch adds admin visibility for core restaurant departments.
## Modules Added
1. Suppliers
2. Products
3. Stock
4. Bar
5. Kitchen
6. Dispatch
7. Unsold cooked food
8. Assets
9. HRM
10. Finance
11. Income statement
## Business Control Value
### Suppliers
Shows supply source accountability.
### Products
Confirms food, soft drinks, and alcoholic drinks separation.
### Stock
Supports storekeeping control and theft detection.
### Bar
Separates alcoholic drinks accountability from food and soft drinks.
### Kitchen
Shows food production queue.
### Dispatch
Shows delivery fulfilment status.
### Unsold Food
Tracks cooked food that was not sold.
### Assets
Tracks restaurant equipment and asset register.
### HRM
Shows staff and roles.
### Finance
Shows income and expense entries.
### Income Statement
Shows daily, weekly, monthly, and annual profit/loss visibility.
## Developer Note
This batch uses a shared `OperationalPage` component to avoid repeated page code.
Each module still has its own page file for clean routing and future customization.
