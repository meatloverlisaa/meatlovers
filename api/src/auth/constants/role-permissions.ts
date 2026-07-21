/**
 * Complete Role Permission Matrix
 * Defines granular permissions for each role across all system resources
 * Part C: Authentication Recovery Sprint Part 3
 */

export enum Resource {
  // User Management
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',

  // Product Management
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  RECIPES = 'recipes',
  MENU_ITEMS = 'menu_items',

  // Supplier Management
  SUPPLIERS = 'suppliers',
  SUPPLIER_ORDERS = 'supplier_orders',
  SUPPLIER_PAYMENTS = 'supplier_payments',

  // Stock Management
  STOCK_ITEMS = 'stock_items',
  STOCK_MOVEMENTS = 'stock_movements',
  STOCK_LOCATIONS = 'stock_locations',
  STOCK_TRANSFERS = 'stock_transfers',

  // Order Management
  ORDERS = 'orders',
  ORDER_ITEMS = 'order_items',
  ORDER_STATUS = 'order_status',

  // Payment Management
  PAYMENTS = 'payments',
  PAYMENT_METHODS = 'payment_methods',

  // Production Management
  PRODUCTION_PLANS = 'production_plans',
  PRODUCTION_EXECUTION = 'production_execution',

  // Kitchen & Bar Operations
  KITCHEN_QUEUE = 'kitchen_queue',
  BAR_QUEUE = 'bar_queue',

  // Delivery Management
  DELIVERIES = 'deliveries',
  RIDERS = 'riders',

  // Customer Management
  CUSTOMERS = 'customers',
  CUSTOMER_APPROVALS = 'customer_approvals',

  // Financial Management
  PRICING = 'pricing',
  MARGINS = 'margins',
  FINANCIAL_REPORTS = 'financial_reports',

  // Asset Management
  ASSETS = 'assets',
  ASSET_MAINTENANCE = 'asset_maintenance',

  // HRM
  STAFF = 'staff',
  SHIFTS = 'shifts',
  ATTENDANCE = 'attendance',
  PAYROLL = 'payroll',

  // Approvals
  APPROVALS = 'approvals',
  APPROVAL_REQUESTS = 'approval_requests',

  // System
  AUDIT_LOGS = 'audit_logs',
  SYSTEM_CONFIG = 'system_config',
  REPORTS = 'reports',
  DASHBOARD = 'dashboard',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
}

export interface Permission {
  resource: Resource;
  actions: Action[];
  conditions?: Record<string, any>;
}

/**
 * Complete Role Permission Matrix
 * Maps each role to their allowed resources and actions
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // ====================
  // SUPER_ADMIN - Full System Access
  // ====================
  SUPER_ADMIN: [
    // User Management
    { resource: Resource.USERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ROLES, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.PERMISSIONS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Product Management
    { resource: Resource.PRODUCTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.CATEGORIES, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.RECIPES, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.MENU_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Supplier Management
    { resource: Resource.SUPPLIERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.SUPPLIER_ORDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.SUPPLIER_PAYMENTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Stock Management
    { resource: Resource.STOCK_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.STOCK_MOVEMENTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.STOCK_LOCATIONS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.STOCK_TRANSFERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.APPROVE] },
    
    // Order Management
    { resource: Resource.ORDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ORDER_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE] },
    
    // Payment Management
    { resource: Resource.PAYMENTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.PAYMENT_METHODS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Production Management
    { resource: Resource.PRODUCTION_PLANS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.PRODUCTION_EXECUTION, actions: [Action.EXECUTE, Action.READ] },
    
    // Kitchen & Bar Operations
    { resource: Resource.KITCHEN_QUEUE, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.BAR_QUEUE, actions: [Action.READ, Action.UPDATE] },
    
    // Delivery Management
    { resource: Resource.DELIVERIES, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.RIDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Customer Management
    { resource: Resource.CUSTOMERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.CUSTOMER_APPROVALS, actions: [Action.APPROVE, Action.REJECT, Action.READ] },
    
    // Financial Management
    { resource: Resource.PRICING, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.MARGINS, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.FINANCIAL_REPORTS, actions: [Action.READ, Action.EXPORT] },
    
    // Asset Management
    { resource: Resource.ASSETS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ASSET_MAINTENANCE, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // HRM
    { resource: Resource.STAFF, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.SHIFTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ATTENDANCE, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.PAYROLL, actions: [Action.READ, Action.EXPORT] },
    
    // Approvals
    { resource: Resource.APPROVALS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.APPROVE, Action.REJECT] },
    { resource: Resource.APPROVAL_REQUESTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // System
    { resource: Resource.AUDIT_LOGS, actions: [Action.READ, Action.EXPORT] },
    { resource: Resource.SYSTEM_CONFIG, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.REPORTS, actions: [Action.READ, Action.EXPORT] },
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // ADMIN - Platform Management
  // ====================
  ADMIN: [
    // User Management (limited)
    { resource: Resource.USERS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.ROLES, actions: [Action.READ] },
    
    // Product Management
    { resource: Resource.PRODUCTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.CATEGORIES, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.RECIPES, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.MENU_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Supplier Management
    { resource: Resource.SUPPLIERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.SUPPLIER_ORDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    
    // Stock Management
    { resource: Resource.STOCK_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.STOCK_MOVEMENTS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.STOCK_TRANSFERS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.APPROVE] },
    
    // Order Management
    { resource: Resource.ORDERS, actions: [Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE] },
    
    // Payment Management
    { resource: Resource.PAYMENTS, actions: [Action.READ, Action.UPDATE] },
    
    // Production Management
    { resource: Resource.PRODUCTION_PLANS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.PRODUCTION_EXECUTION, actions: [Action.EXECUTE] },
    
    // Pricing
    { resource: Resource.PRICING, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.MARGINS, actions: [Action.READ] },
    
    // Reports
    { resource: Resource.REPORTS, actions: [Action.READ, Action.EXPORT] },
    { resource: Resource.AUDIT_LOGS, actions: [Action.READ] },
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // MANAGER - Operations Management (READ-ONLY)
  // ====================
  MANAGER: [
    // Products (view only)
    { resource: Resource.PRODUCTS, actions: [Action.READ] },
    { resource: Resource.CATEGORIES, actions: [Action.READ] },
    { resource: Resource.RECIPES, actions: [Action.READ] },
    
    // Suppliers (view only)
    { resource: Resource.SUPPLIERS, actions: [Action.READ] },
    { resource: Resource.SUPPLIER_ORDERS, actions: [Action.READ] },
    
    // Stock (view only)
    { resource: Resource.STOCK_ITEMS, actions: [Action.READ] },
    { resource: Resource.STOCK_MOVEMENTS, actions: [Action.READ] },
    { resource: Resource.STOCK_LOCATIONS, actions: [Action.READ] },
    
    // Orders (view only)
    { resource: Resource.ORDERS, actions: [Action.READ] },
    { resource: Resource.ORDER_ITEMS, actions: [Action.READ] },
    
    // Payments (view only)
    { resource: Resource.PAYMENTS, actions: [Action.READ] },
    
    // Reports (view only)
    { resource: Resource.REPORTS, actions: [Action.READ, Action.EXPORT] },
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // STOREKEEPER - Inventory Management
  // ====================
  STOREKEEPER: [
    // Stock Management (full access)
    { resource: Resource.STOCK_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.STOCK_MOVEMENTS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.STOCK_LOCATIONS, actions: [Action.READ] },
    { resource: Resource.STOCK_TRANSFERS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    
    // Supplier Orders (recording)
    { resource: Resource.SUPPLIER_ORDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    
    // Products (view only)
    { resource: Resource.PRODUCTS, actions: [Action.READ] },
    { resource: Resource.SUPPLIERS, actions: [Action.READ] },
    
    // Dashboard
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // DISPATCHER - Delivery Coordination
  // ====================
  DISPATCHER: [
    // Delivery Management
    { resource: Resource.DELIVERIES, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.RIDERS, actions: [Action.READ, Action.UPDATE] },
    
    // Orders (view delivery-related)
    { resource: Resource.ORDERS, actions: [Action.READ] },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE], conditions: { statusType: 'delivery' } },
    
    // Customers (view contact info)
    { resource: Resource.CUSTOMERS, actions: [Action.READ] },
    
    // Dashboard
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // ACCOUNTANT - Financial Operations
  // ====================
  ACCOUNTANT: [
    // Financial Reports (read only)
    { resource: Resource.FINANCIAL_REPORTS, actions: [Action.READ, Action.EXPORT] },
    { resource: Resource.REPORTS, actions: [Action.READ, Action.EXPORT] },
    
    // Payments (view only)
    { resource: Resource.PAYMENTS, actions: [Action.READ] },
    
    // Pricing (view only)
    { resource: Resource.PRICING, actions: [Action.READ] },
    { resource: Resource.MARGINS, actions: [Action.READ] },
    
    // Suppliers (view financial data)
    { resource: Resource.SUPPLIERS, actions: [Action.READ] },
    { resource: Resource.SUPPLIER_PAYMENTS, actions: [Action.READ] },
    
    // Orders (view financial data)
    { resource: Resource.ORDERS, actions: [Action.READ] },
    
    // Dashboard
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // HR - Human Resources Operations
  // ====================
  HR: [
    // Staff Management
    { resource: Resource.STAFF, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.SHIFTS, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: Resource.ATTENDANCE, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.PAYROLL, actions: [Action.READ, Action.EXPORT] },
    
    // Users (HR-related data)
    { resource: Resource.USERS, actions: [Action.READ, Action.UPDATE], conditions: { fields: ['hrData'] } },
    
    // Dashboard
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // WAITER - Order Taking & Service
  // ====================
  WAITER: [
    // Order Management
    { resource: Resource.ORDERS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.ORDER_ITEMS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE], conditions: { statusType: 'service' } },
    
    // Menu (view only)
    { resource: Resource.MENU_ITEMS, actions: [Action.READ] },
    { resource: Resource.PRODUCTS, actions: [Action.READ] },
    
    // Customers
    { resource: Resource.CUSTOMERS, actions: [Action.CREATE, Action.READ] },
    
    // Dashboard (POS)
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // CHEF - Food Preparation
  // ====================
  CHEF: [
    // Kitchen Queue
    { resource: Resource.KITCHEN_QUEUE, actions: [Action.READ, Action.UPDATE] },
    
    // Orders (kitchen-related)
    { resource: Resource.ORDERS, actions: [Action.READ] },
    { resource: Resource.ORDER_ITEMS, actions: [Action.READ, Action.UPDATE], conditions: { type: 'food' } },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE], conditions: { statusType: 'kitchen' } },
    
    // Recipes
    { resource: Resource.RECIPES, actions: [Action.READ] },
    
    // Production
    { resource: Resource.PRODUCTION_EXECUTION, actions: [Action.EXECUTE] },
    
    // Dashboard (Kitchen)
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // BARMAN - Beverage Preparation
  // ====================
  BARMAN: [
    // Bar Queue
    { resource: Resource.BAR_QUEUE, actions: [Action.READ, Action.UPDATE] },
    
    // Orders (bar-related)
    { resource: Resource.ORDERS, actions: [Action.READ] },
    { resource: Resource.ORDER_ITEMS, actions: [Action.READ, Action.UPDATE], conditions: { type: 'drink' } },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE], conditions: { statusType: 'bar' } },
    
    // Recipes
    { resource: Resource.RECIPES, actions: [Action.READ] },
    
    // Stock (bar items)
    { resource: Resource.STOCK_ITEMS, actions: [Action.READ], conditions: { category: 'beverages' } },
    
    // Dashboard (Bar)
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],

  // ====================
  // CASHIER - Payment Processing
  // ====================
  CASHIER: [
    // Payment Management
    { resource: Resource.PAYMENTS, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: Resource.PAYMENT_METHODS, actions: [Action.READ] },
    
    // Orders (payment-related)
    { resource: Resource.ORDERS, actions: [Action.READ, Action.UPDATE] },
    { resource: Resource.ORDER_STATUS, actions: [Action.UPDATE], conditions: { statusType: 'payment' } },
    
    // Customers
    { resource: Resource.CUSTOMERS, actions: [Action.READ] },
    
    // Dashboard (Cashier)
    { resource: Resource.DASHBOARD, actions: [Action.READ] },
  ],
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: string,
  resource: Resource,
  action: Action,
  conditions?: Record<string, any>,
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  
  if (!permissions) {
    return false;
  }

  const permission = permissions.find((p) => p.resource === resource);
  
  if (!permission) {
    return false;
  }

  if (!permission.actions.includes(action)) {
    return false;
  }

  // Check conditions if provided
  if (permission.conditions && conditions) {
    return Object.entries(permission.conditions).every(
      ([key, value]) => conditions[key] === value,
    );
  }

  return true;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get all resources a role can access
 */
export function getRoleResources(role: string): Resource[] {
  const permissions = getRolePermissions(role);
  return permissions.map((p) => p.resource);
}

/**
 * Get all actions a role can perform on a resource
 */
export function getRoleActions(role: string, resource: Resource): Action[] {
  const permissions = getRolePermissions(role);
  const permission = permissions.find((p) => p.resource === resource);
  return permission?.actions || [];
}

/**
 * Check if a role can perform any action on a resource
 */
export function canAccessResource(role: string, resource: Resource): boolean {
  const actions = getRoleActions(role, resource);
  return actions.length > 0;
}
