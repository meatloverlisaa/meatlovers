Meat Lovers CIMS powered by YohPal

## Work Tracker

- [ ] Feature 3 — Product Segmentation & Pricing Control
  - [ ] 3.1 API: Product CRUD with Segmentation (Food, Soft Drink, Alcohol)
    - [ ] Update Prisma schema: add ProductCategory enum + Product model
    - [ ] Create NestJS Product module (product.module.ts)
    - [ ] Create Product controller (product.controller.ts)
    - [ ] Create Product service (product.service.ts)
    - [ ] Create DTOs (create-product.dto.ts, update-product.dto.ts)
    - [ ] Wire ProductModule into api/src/app.module.ts
    - [ ] Add API tests for Product CRUD (product.controller.spec.ts)
    - [ ] Run API test suite

  - [ ] 3.2 API: Pricing Rules & Price Change Audit Trail
    - [ ] Update Prisma schema: add PricingRule model + PriceChangeAuditTrail model
    - [ ] Create NestJS module/controller/service for pricing rules
    - [ ] Add DTOs for pricing rule create/update and price-change request
    - [ ] Implement business logic: applying pricing rules updates Product.selling_price
    - [ ] Implement audit logging on every price change (before/after, rule, actor, timestamp)
    - [ ] Wire PricingRuleModule into api/src/app.module.ts
    - [ ] Add API tests for pricing rule endpoints and audit logging
    - [ ] Run API test suite

  - [x] 3.4 UI: Pricing Control & Margin Alerts Dashboard
    - [x] 3.4.1 API: Margin alerts endpoints (list + update status/notes)
    - [x] 3.4.2 UI: Admin pricing control dashboard page (summary + alerts table + actions)

    - [ ] 3.4.3 Test UI & API integration



  - [ ] 3.5 UI: Navigation (link to Pricing Control dashboard from admin)

