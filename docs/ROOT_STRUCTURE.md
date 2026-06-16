# Root Folder Structure
```text
project-root/
│
├── apps/
│
├── website/
│
├── admin-web/
│
├── pos-pwa/
│
└── monitoring-web/
│
├── backend/
│
├── database/
│
├── migrations/
│
├── seeds/
│
└── dumps/
│
├── docs/


│
├── .env.example
├── package.json
└── README.md

Folder Ownership
apps/website
Customer-facing website and AI-enabled acquisition engine.

apps/admin-web
Management dashboard for operations, stock, finance, HRM, CRM, suppliers, reports, and approvals.

apps/pos-pwa
Mobile-first waiter POS.

apps/monitoring-web
Live monitoring dashboard for owner/management.

backend
PHP API.

database
SQL migrations, seed data, and dumps.

docs
Business rules, developer manuals, SOPs, and implementation guides.
--## 1g. `docs/DEVELOPER_RULES.md`
```md
# Developer Rules
This document is binding.
## 1. No Guessing
Developers must not guess:
- where a file belongs
- which system owns data
- which API endpoint to call
- which department owns a workflow
- which product category to use
- which approval rule applies
If unclear, the developer must stop and request clarification.
## 2. Brand Rule
Always refer to the system as:
**Meat Lovers CIMS powered by YohPal**
## 3. Mobile-First Rule
Every frontend screen must be usable on a smartphone.
## 4. API Rule
Frontend apps must not talk directly to the database.
All data must pass through the PHP backend API.
## 5. Department Rule
Every operational action must belong to a department:
- SUPPLIERS
- STORE
- KITCHEN


- SERVICE
- DISPATCH
- BAR
- UNSOLD_FOOD
- HRM
- CRM
- DELIVERIES
- ASSETS
- FINANCE
## 6. Audit Rule
Every sensitive action must be auditable.
Sensitive actions include:
- stock adjustment
- order cancellation
- discount
- refund
- cash settlement
- bar stock movement
- unsold food declaration
- supplier invoice entry
- asset write-off
