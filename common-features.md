# Common Features & Shared Components
**Meat Lovers CIMS - Reusable Patterns & Components**

This document consolidates shared features, components, and utilities used across multiple features to avoid repetition in feature specifications.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Database Common Patterns](#2-database-common-patterns)
3. [API Common Patterns](#3-api-common-patterns)
4. [UI Common Components](#4-ui-common-components)
5. [Data Types & Interfaces](#5-data-types--interfaces)
6. [Error Handling](#6-error-handling)
7. [Validation Patterns](#7-validation-patterns)
8. [Testing Utilities](#8-testing-utilities)

---

## 1. Authentication & Authorization

### 1.1 — Role-Based Access Control (RBAC)

**Roles:**
```typescript
enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  BARMAN = 'BARMAN',
  STOREKEEPER = 'STOREKEEPER',
  DISPATCHER = 'DISPATCHER',
  ACCOUNTANT = 'ACCOUNTANT',
  HR = 'HR'
}
```

**Auth Guards (Backend):**
```typescript
// Apply to endpoints
@Roles(Role.ADMIN, Role.MANAGER)
@Public() // Remove in production - for dev only

// Auth guard checks:
// - Valid JWT token
// - User role matches required roles
// - Token not expired
```

**Auth Context (Frontend):**
```typescript
// useAuth hook provides:
interface AuthContext {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}
```

**Route Protection (Frontend):**
```typescript
// Protect routes by role
<RouteGuard allowedRoles={[Role.ADMIN, Role.MANAGER]}>
  <AdminPage />
</RouteGuard>

// Redirect based on role after login
const redirectMap: Record<Role, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  MANAGER: '/admin',
  CASHIER: '/cashier',
  WAITER: '/pos/menu',
  CHEF: '/kitchen/queue',
  BARMAN: '/bar',
  STOREKEEPER: '/staff',
  DISPATCHER: '/admin/dispatch',
  ACCOUNTANT: '/staff',
  HR: '/staff'
};
```

### 1.2 — JWT Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "ADMIN",
  "full_name": "John Doe",
  "iat": 1719752400,
  "exp": 1719838800
}
```

**Token Expiry:** 24 hours  
**Refresh Strategy:** Auto-refresh 1 hour before expiry

---

## 2. Database Common Patterns

### 2.1 — Timestamp Fields

**All tables include:**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 2.2 — Primary Key Pattern

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
```

**Note:** Prisma uses `BigInt` for IDs, converted to strings in API responses.

### 2.3 — Soft Delete Pattern

**Tables that support soft delete:**
```sql
deleted_at TIMESTAMP NULL,
is_deleted BOOLEAN DEFAULT FALSE
```

**Query pattern:**
```typescript
// Exclude soft-deleted by default
where: { is_deleted: false }

// Soft delete operation
update: { is_deleted: true, deleted_at: new Date() }
```

### 2.4 — Status Enum Pattern

**Common status enums:**
```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
```

### 2.5 — Common Indexes

**Performance indexes applied to:**
```sql
-- Status and timestamp queries
INDEX idx_status_created (status, created_at);

-- Foreign key lookups
INDEX idx_user_id (user_id);
INDEX idx_order_id (order_id);
INDEX idx_product_id (product_id);

-- Date range queries
INDEX idx_created_at (created_at);
INDEX idx_date_range (created_at, updated_at);

-- Location-based queries
INDEX idx_location (location);
```

---

## 3. API Common Patterns

### 3.1 — Standard Response Format

**Success Response:**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp?: string;
  message?: string;
}
```

**Error Response:**
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}
```

### 3.2 — Pagination Pattern

**Query Parameters:**
```typescript
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  sortBy?: string;    // Field name
  sortOrder?: 'asc' | 'desc';  // Default: 'desc'
}
```

**Paginated Response:**
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Example Endpoint:**
```
GET /orders?page=2&limit=20&sortBy=created_at&sortOrder=desc
```

### 3.3 — Date Filter Pattern

**Query Parameters:**
```typescript
interface DateFilterParams {
  startDate?: string;  // ISO 8601: "2026-06-01T00:00:00Z"
  endDate?: string;    // ISO 8601: "2026-06-30T23:59:59Z"
  date?: string;       // Single date: "2026-06-30"
  period?: 'today' | 'week' | 'month' | 'year';
}
```

**Example Endpoints:**
```
GET /orders?startDate=2026-06-01&endDate=2026-06-30
GET /orders?date=2026-06-30
GET /orders?period=today
```

### 3.4 — Common HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 204 | No Content (DELETE with no body) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (valid token, wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate, constraint violation) |
| 422 | Unprocessable Entity (business logic error) |
| 500 | Internal Server Error |

### 3.5 — Common Validation Rules

**Email:**
```typescript
@IsEmail()
@IsNotEmpty()
email: string;
```

**Phone:**
```typescript
@Matches(/^(\+254|0)[17]\d{8}$/)  // Kenyan format
phone: string;
```

**Amount/Price:**
```typescript
@IsNumber()
@Min(0)
@Max(999999.99)
amount: number;
```

**Status Enum:**
```typescript
@IsEnum(OrderStatus)
status: OrderStatus;
```

**ID:**
```typescript
@IsNotEmpty()
@IsNumberString()
id: string;
```

---

## 4. UI Common Components

### 4.1 — Summary Cards

**Component:** `SummaryCard.tsx`

```typescript
interface SummaryCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string | React.ReactNode;
  color?: string;
  onClick?: () => void;
}

// Usage:
<SummaryCard
  label="Today's Revenue"
  value="KSh 45,200"
  change="+12% vs yesterday"
  trend="up"
  icon="💰"
  color="bg-emerald-100"
/>
```

### 4.2 — Status Badge

**Component:** `StatusBadge.tsx`

```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
}

// Color mapping:
const statusColors = {
  PENDING: 'bg-amber-100 text-amber-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-emerald-100 text-emerald-800',
  SERVED: 'bg-purple-100 text-purple-800',
  PAID: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

// Usage:
<StatusBadge status="PREPARING" />
```

### 4.3 — Data Table

**Component:** `DataTable.tsx`

```typescript
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;
}

// Usage:
<DataTable
  data={orders}
  columns={orderColumns}
  loading={isLoading}
  emptyMessage="No orders found"
  pagination={{ page: 1, total: 100, onPageChange }}
/>
```

### 4.4 — Loading Skeleton

**Component:** `Skeleton.tsx`

```typescript
interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

// Usage:
<Skeleton variant="card" count={3} />
<Skeleton variant="text" width="80%" />
<Skeleton variant="circle" width="40px" height="40px" />
```

### 4.5 — Alert Banner

**Component:** `AlertBanner.tsx`

```typescript
interface AlertBannerProps {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage:
<AlertBanner
  type="warning"
  message="5 items are low in stock"
  action={{ label: "View Stock", onClick: handleViewStock }}
/>
```

### 4.6 — Modal Dialog

**Component:** `Modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

// Usage:
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={onConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### 4.7 — Form Input Components

**Text Input:**
```typescript
<Input
  label="Product Name"
  name="product_name"
  value={value}
  onChange={handleChange}
  placeholder="Enter product name"
  required
  error={errors.product_name}
/>
```

**Select Dropdown:**
```typescript
<Select
  label="Category"
  name="category"
  value={value}
  onChange={handleChange}
  options={[
    { value: 'FOOD', label: 'Food' },
    { value: 'DRINK', label: 'Drink' }
  ]}
  required
/>
```

**Date Picker:**
```typescript
<DatePicker
  label="Order Date"
  value={date}
  onChange={setDate}
  minDate={new Date('2026-01-01')}
  maxDate={new Date()}
/>
```

### 4.8 — Button Variants

```typescript
// Primary action
<Button variant="primary">Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Danger action
<Button variant="danger">Delete</Button>

// Ghost/transparent
<Button variant="ghost">View More</Button>

// With icon
<Button icon={<PlusIcon />}>Add Item</Button>

// Loading state
<Button loading={isLoading}>Submit</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## 5. Data Types & Interfaces

### 5.1 — User Types

```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthUser extends User {
  access_token: string;
  refresh_token?: string;
}
```

### 5.2 — Order Types

```typescript
interface Order {
  id: string;
  order_number: string;
  table_id: number;
  waiter_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
  waiter?: User;
  table?: Table;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}
```

### 5.3 — Product Types

```typescript
interface Product {
  id: string;
  product_name: string;
  product_category: ProductCategory;
  unit_price: number;
  description?: string;
  is_available: boolean;
  image_url?: string;
}

enum ProductCategory {
  FOOD = 'FOOD',
  SOFT_DRINK = 'SOFT_DRINK',
  ALCOHOLIC_DRINK = 'ALCOHOLIC_DRINK',
  INGREDIENT = 'INGREDIENT'
}
```

### 5.4 — Stock Types

```typescript
interface StockItem {
  id: string;
  product_id: string;
  current_quantity: number;
  reorder_level: number;
  location: StockLocation;
  unit_of_measure: string;
}

enum StockLocation {
  STORE = 'STORE',
  KITCHEN = 'KITCHEN',
  BAR = 'BAR'
}

interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: MovementType;
  location?: StockLocation;
  from_location?: StockLocation;
  to_location?: StockLocation;
  timestamp: string;
  notes?: string;
}

enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  USAGE = 'USAGE',
  WASTE = 'WASTE'
}
```

### 5.5 — Payment Types

```typescript
interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  transaction_reference?: string;
  status: PaymentStatus;
  cashier_id: string;
  created_at: string;
}

enum PaymentMethod {
  CASH = 'CASH',
  MPESA = 'MPESA',
  CARD = 'CARD'
}
```

---

## 6. Error Handling

### 6.1 — Backend Error Handling

**Custom Exception Filters:**
```typescript
// ValidationException
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Invalid input data',
  details: validationErrors
});

// BusinessLogicException
throw new UnprocessableEntityException({
  code: 'INSUFFICIENT_STOCK',
  message: 'Not enough stock available'
});

// AuthException
throw new UnauthorizedException({
  code: 'INVALID_TOKEN',
  message: 'Authentication token is invalid or expired'
});
```

**Error Codes:**
```typescript
enum ErrorCode {
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authentication
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Business Logic
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

### 6.2 — Frontend Error Handling

**Error Boundary Component:**
```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => logError(error)}
>
  <YourComponent />
</ErrorBoundary>
```

**API Error Hook:**
```typescript
const { data, error, isLoading, retry } = useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  onError: (error) => {
    toast.error(error.message);
  }
});

// Error display
{error && (
  <Alert type="error">
    {error.message}
    <Button onClick={retry}>Retry</Button>
  </Alert>
)}
```

---

## 7. Validation Patterns

### 7.1 — DTO Validation (Backend)

```typescript
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  table_id: number;

  @IsString()
  @IsNotEmpty()
  waiter_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;
}
```

### 7.2 — Form Validation (Frontend)

**Using React Hook Form + Zod:**
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const orderSchema = z.object({
  table_id: z.number().min(1, 'Table is required'),
  items: z.array(z.object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1).max(100)
  })).min(1, 'At least one item required')
});

type OrderFormData = z.infer<typeof orderSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<OrderFormData>({
  resolver: zodResolver(orderSchema)
});
```

---

## 8. Testing Utilities

### 8.1 — Test Data Factories

```typescript
// Factory for creating test users
export const createTestUser = (overrides?: Partial<User>): User => ({
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  role: Role.WAITER,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

// Factory for creating test orders
export const createTestOrder = (overrides?: Partial<Order>): Order => ({
  id: '1',
  order_number: 'ORD-001',
  table_id: 1,
  waiter_id: '1',
  status: OrderStatus.PENDING,
  total_amount: 1000,
  created_at: new Date().toISOString(),
  ...overrides
});
```

### 8.2 — Mock API Responses

```typescript
// Mock successful response
export const mockSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

// Mock error response
export const mockErrorResponse = (code: string, message: string): ErrorResponse => ({
  success: false,
  error: { code, message },
  timestamp: new Date().toISOString()
});
```

### 8.3 — Common Test Assertions

```typescript
// API Response assertions
expect(response).toHaveProperty('success', true);
expect(response.data).toBeInstanceOf(Array);
expect(response.data).toHaveLength(expectedCount);

// Status code assertions
expect(response.status).toBe(200);
expect(response.status).toBeIn([200, 201]);

// Data structure assertions
expect(order).toMatchObject({
  id: expect.any(String),
  status: OrderStatus.PENDING,
  total_amount: expect.any(Number)
});
```

---

## 9. Auto-Refresh Patterns

### 9.1 — Polling Intervals

**Standard refresh rates:**
```typescript
// Operational views (active work areas)
const REFRESH_INTERVAL_FAST = 10000;  // 10 seconds (critical)
const REFRESH_INTERVAL_NORMAL = 30000; // 30 seconds (standard)

// Oversight views (monitoring/reports)
const REFRESH_INTERVAL_SLOW = 60000;  // 60 seconds

// Background sync
const REFRESH_INTERVAL_BACKGROUND = 300000; // 5 minutes
```

**Usage:**
```typescript
useQuery(['bar-orders'], fetchBarOrders, {
  refetchInterval: REFRESH_INTERVAL_NORMAL,
  refetchOnWindowFocus: true
});
```

### 9.2 — Visual Refresh Indicators

```typescript
// Last updated timestamp
<p className="text-xs text-gray-500">
  Last updated: {formatDistanceToNow(lastUpdate)} ago
</p>

// Auto-refresh countdown
<div className="flex items-center gap-2">
  <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
  <span>Auto-refresh in {countdown}s</span>
</div>
```

---

## 10. Performance Optimization

### 10.1 — Database Query Optimization

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    full_name: true,
    email: true
    // Don't load password hash, etc.
  }
});

// Use include judiciously
const orders = await prisma.order.findMany({
  include: {
    items: true,  // Only include what's needed
    waiter: { select: { id: true, full_name: true } }
  }
});

// Use cursor-based pagination for large datasets
const orders = await prisma.order.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastOrderId }
});
```

### 10.2 — Frontend Optimization

```typescript
// Memoize expensive computations
const totalAmount = useMemo(
  () => items.reduce((sum, item) => sum + item.line_total, 0),
  [items]
);

// Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 500);

// Virtual scrolling for long lists
<VirtualList
  data={longList}
  itemHeight={60}
  height={600}
  renderItem={(item) => <ItemCard item={item} />}
/>

// Lazy load images
<img
  src={imageUrl}
  loading="lazy"
  alt={altText}
/>
```

---

## 11. Notification Patterns

### 11.1 — Toast Notifications

```typescript
// Success toast
toast.success('Order created successfully');

// Error toast
toast.error('Failed to update order');

// Info toast
toast.info('New order received');

// Warning toast
toast.warning('Stock running low');

// With action
toast.success('Order ready', {
  action: {
    label: 'View',
    onClick: () => navigate(`/orders/${orderId}`)
  }
});
```

### 11.2 — Browser Notifications

```typescript
// Request permission
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Send notification
const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/badge.png'
    });
  }
};

// Usage
sendNotification('New Order', 'Table 5 placed an order');
```

---

## Usage in Feature Specifications

When writing feature specifications in `features.md`, reference this document to avoid repetition:

**Instead of repeating:**
```
9.2 — API (Bar Queue — BARMAN)
Endpoints:
GET /bar/orders?status=PENDING
Response format: { success: true, data: [...] }
Pagination: page, limit, sortBy, sortOrder
Error handling: Standard error response
Auth: JWT token required, @Roles(Role.BARMAN)
```

**Simply write:**
```
9.2 — API (Bar Queue — BARMAN)
Endpoints:
GET /bar/orders?status=PENDING — Get bar orders
PATCH /bar/orders/:id/status — Update order status
Auth guard: BARMAN

Uses: Common API patterns (pagination, date filters, error handling)
See: common-features.md sections 3.1, 3.2, 3.3, 6.1
```

---

## Maintenance

This document should be updated when:
- New common patterns emerge across features
- Existing patterns are refactored
- New shared components are created
- API standards change
- Database conventions evolve

**Last Updated:** June 30, 2026  
**Version:** 1.0.0
