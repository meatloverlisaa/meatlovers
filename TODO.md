# TODO

- [ ] 5.3 UI: Cart & Order Submission Flow
  - [ ] Update `ui/src/app/pos/menu/page.tsx` to add:
    - [ ] Cart summary (selected items)
    - [ ] Inputs for `tableId` and `waiterId`
    - [ ] Submit Order button
    - [ ] POST `/orders` integration
    - [ ] Client-side validation
    - [ ] Success + error UI
    - [ ] Clear cart on success
  - [ ] Test end-to-end (manual):
    - [ ] UI loads products
    - [ ] Select items, fill IDs, submit order
    - [ ] Verify cart clears and response shows success

