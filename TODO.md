# Project TODO

## Orders API: Order Creation & Order Items (Table, Waiter assignment)

- [ ] Update Prisma schema: add `Table`, `Order`, `OrderItem` models + relations to `User` (waiter) and `Product`.
- [ ] Add/adjust enums as needed (e.g., `OrderStatus`).
- [ ] Create Prisma migration.
- [ ] Implement `OrdersModule` (controller + service).
- [ ] Implement DTOs for order creation: tableId, waiterId, items[{productId, quantity}].
- [ ] Implement controller endpoint `POST /orders` returning created order with items.
- [ ] Implement service logic with validation + transaction:
  - validate table exists
  - validate waiter exists and role == WAITER
  - validate products exist/active
  - compute unitPrice/lineTotal and order total
  - persist Order + OrderItems in a single transaction
- [ ] Wire `OrdersModule` into `AppModule`.
- [ ] Run `npm test` / `npm run build` and verify API starts.

