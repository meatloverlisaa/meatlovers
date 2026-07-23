import { Role } from '@prisma/client';

export const SUPER_ADMIN_ONLY = [Role.SUPER_ADMIN] as const;

export const SYSTEM_ADMIN_ROLES = [Role.SUPER_ADMIN, Role.ADMIN] as const;

export const MANAGEMENT_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
] as const;

export const FINANCE_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.ACCOUNTANT,
] as const;

export const PRODUCT_READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.ACCOUNTANT,
  Role.STOREKEEPER,
  Role.WAITER,
  Role.CASHIER,
  Role.CHEF,
  Role.BARMAN,
] as const;

export const PRODUCT_WRITE_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
] as const;

export const SUPPLIER_READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.ACCOUNTANT,
  Role.STOREKEEPER,
] as const;

export const SUPPLIER_WRITE_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
] as const;

export const STOCK_READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.ACCOUNTANT,
  Role.STOREKEEPER,
  Role.CHEF,
  Role.BARMAN,
] as const;

export const STOCK_OPERATION_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.STOREKEEPER,
] as const;

export const POS_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.WAITER,
  Role.CASHIER,
] as const;

export const KITCHEN_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.CHEF,
] as const;

export const BAR_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.BARMAN,
] as const;

export const CASHIER_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.CASHIER,
] as const;

export const DISPATCH_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.DISPATCHER,
] as const;

export const CRM_ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER] as const;

export const HR_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.HR,
] as const;

export const APPROVER_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
] as const;

export const PROCUREMENT_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.STOREKEEPER,
  Role.ACCOUNTANT,
] as const;

export const OWNER_DASHBOARD_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.ACCOUNTANT,
] as const;
