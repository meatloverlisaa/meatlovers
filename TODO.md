# TODO

- [x] Inspect/confirm current orders schema usage (orders.service.ts references Table/Order/items + missing Prisma models in schema snapshot)
- [ ] Update `api/prisma/schema.prisma`:
  - [ ] Add `enum OrderStatus { PENDING PREPARING READY SERVED }`
  - [ ] Add `Table` model (required by OrdersService)
  - [ ] Add `Order` model (status + total_amount + relations)
  - [ ] Add `OrderItem` model (snapshot pricing)
  - [ ] Add relations to `User` (waiter) and `Product` (optional)
- [ ] Update `api/src/orders/orders.service.ts`:
  - [ ] Change created status from `'CREATED'` to `'PENDING'`
  - [ ] Ensure Prisma writes match new schema
- [ ] Add backend endpoints:
  - [ ] `GET /orders?tableId=...` (or latest order for POS)
  - [ ] `PATCH /orders/:id/status` (advance/status update)
- [ ] Update frontend POS UI:
  - [ ] Add “Order Status Tracking” panel with stepper: Pending → Preparing → Ready → Served
  - [ ] After submitting an order, fetch/display the new order status
  - [ ] Decide UI controls: read-only vs advance buttons (implement per decision)
- [ ] Create migration + run backend checks
  - [ ] `prisma migrate` (or equivalent) + `npm --prefix api run build`
  - [ ] `npm --prefix api test` / lint
- [ ] Smoke test in UI: submit order, see status stepper progress

