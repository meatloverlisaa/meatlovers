# TODO

## Feature 2 — Supplier Management

### 2.2 UI: Admin Supplier Operational Page (List view, Create form)
- [x] Create `ui/src/app/admin/suppliers/page.tsx` with suppliers list + status toggle.
- [x] Create `ui/src/app/admin/suppliers/new/page.tsx` with supplier create form.
- [ ] Wire fetch calls to API endpoints and add basic loading/error handling.


### 2.3 Testing: Verify supplier registration and status toggling
- [ ] Update `api/src/supplier/supplier.controller.spec.ts` to test:
  - [ ] Supplier registration via `POST /suppliers`
  - [ ] Status toggling via `PATCH /suppliers/:id`
  - [ ] Assert status persistence.
- [ ] Run API tests.

## Notes
- Follow commit rules: per-file commits, no mixing layers, no combining multiple files in one commit.
