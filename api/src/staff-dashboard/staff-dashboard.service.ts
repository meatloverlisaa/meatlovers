/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get role-specific dashboard summary
   */
  async getSummary(role: Role) {
    switch (role) {
      case Role.ACCOUNTANT:
        return this.getAccountantSummary();
      case Role.HR:
        return this.getHRSummary();
      case Role.STOREKEEPER:
        return this.getStorekeeperSummary();
      default:
        return {
          role,
          cards: [],
          alerts: [],
          quickActions: [],
        };
    }
  }

  /**
   * Get pending tasks for the current user role
   */
  async getTasks(role: Role, userId: string) {
    switch (role) {
      case Role.ACCOUNTANT:
        return this.getAccountantTasks(userId);
      case Role.HR:
        return this.getHRTasks(userId);
      case Role.STOREKEEPER:
        return this.getStorekeeperTasks(userId);
      default:
        return { tasks: [] };
    }
  }

  // ─── ACCOUNTANT Methods ───────────────────────────────────────────────────

  private async getAccountantSummary() {
    // In production, fetch real data from database
    // For now, returning structured mock data

    // Example: Count pending payments from finance_transactions table
    // const pendingPayments = await this.prisma.financeTransaction.count({
    //   where: { status: 'PENDING' }
    // });

    return {
      role: Role.ACCOUNTANT,
      cards: [
        {
          label: 'Pending Payments',
          value: '8',
          icon: '💳',
          color: 'bg-amber-100',
          trend: 'neutral',
        },
        {
          label: "Today's Revenue",
          value: 'KSh 45K',
          change: '+12%',
          trend: 'up',
          icon: '💰',
          color: 'bg-emerald-100',
        },
        {
          label: 'Unreconciled',
          value: '3',
          icon: '⚠️',
          color: 'bg-red-100',
          trend: 'neutral',
        },
        {
          label: 'Reports Due',
          value: '2',
          icon: '📊',
          color: 'bg-blue-100',
          trend: 'neutral',
        },
      ],
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: '3 payment variances require review',
          action: { label: 'Review', href: '/staff/finance' },
        },
        {
          id: '2',
          type: 'info',
          message: 'Weekly report due in 2 days',
          action: { label: 'Start', href: '/staff/reports' },
        },
      ],
      quickActions: [
        {
          label: 'Record Payment',
          icon: '💳',
          href: '/staff/payments/new',
          color: 'bg-emerald-50',
        },
        {
          label: 'View Reports',
          icon: '📈',
          href: '/staff/reports',
          color: 'bg-blue-50',
        },
        {
          label: 'Check Variances',
          icon: '⚠️',
          href: '/staff/finance',
          color: 'bg-amber-50',
        },
        {
          label: 'Export Data',
          icon: '📥',
          href: '/staff/reports/export',
          color: 'bg-purple-50',
        },
      ],
    };
  }

  private async getAccountantTasks(userId: string) {
    // In production, fetch from task management system or database
    return {
      tasks: [
        {
          id: '1',
          title: 'Reconcile M-Pesa payments for June 25',
          priority: 'high',
          dueDate: 'Today',
          action: { label: 'Reconcile', href: '/staff/payments' },
        },
        {
          id: '2',
          title: 'Generate weekly financial report',
          priority: 'medium',
          dueDate: 'Jun 27',
          action: { label: 'Create', href: '/staff/reports' },
        },
        {
          id: '3',
          title: 'Review variance alerts (3 items)',
          priority: 'medium',
          action: { label: 'Review', href: '/staff/finance' },
        },
      ],
    };
  }

  // ─── HR Methods ───────────────────────────────────────────────────────────

  private async getHRSummary() {
    // Example: Count employees from users table
    // const totalEmployees = await this.prisma.user.count({
    //   where: { role: { not: Role.CUSTOMER } }
    // });

    return {
      role: Role.HR,
      cards: [
        {
          label: 'Total Employees',
          value: '42',
          change: '+2 this month',
          trend: 'up',
          icon: '👥',
          color: 'bg-blue-100',
        },
        {
          label: 'Present Today',
          value: '38',
          icon: '✅',
          color: 'bg-emerald-100',
          trend: 'neutral',
        },
        {
          label: 'Leave Requests',
          value: '5',
          icon: '📅',
          color: 'bg-amber-100',
          trend: 'neutral',
        },
        {
          label: 'Payroll Due',
          value: '3 days',
          icon: '💵',
          color: 'bg-purple-100',
          trend: 'neutral',
        },
      ],
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: '5 leave requests pending approval',
          action: { label: 'Review', href: '/staff/attendance' },
        },
        {
          id: '2',
          type: 'info',
          message: 'Payroll processing due in 3 days',
          action: { label: 'Prepare', href: '/staff/payroll' },
        },
      ],
      quickActions: [
        {
          label: 'Add Employee',
          icon: '➕',
          href: '/staff/employees/new',
          color: 'bg-emerald-50',
        },
        {
          label: 'Mark Attendance',
          icon: '📋',
          href: '/staff/attendance',
          color: 'bg-blue-50',
        },
        {
          label: 'Process Payroll',
          icon: '💵',
          href: '/staff/payroll',
          color: 'bg-purple-50',
        },
        {
          label: 'View Reports',
          icon: '📊',
          href: '/staff/reports',
          color: 'bg-amber-50',
        },
      ],
    };
  }

  private async getHRTasks(userId: string) {
    return {
      tasks: [
        {
          id: '1',
          title: 'Review 5 pending leave requests',
          priority: 'high',
          dueDate: 'Today',
          action: { label: 'Review', href: '/staff/attendance' },
        },
        {
          id: '2',
          title: 'Process payroll for June',
          priority: 'high',
          dueDate: 'Jun 28',
          action: { label: 'Process', href: '/staff/payroll' },
        },
        {
          id: '3',
          title: 'Update employee records (2 new hires)',
          priority: 'medium',
          action: { label: 'Update', href: '/staff/employees' },
        },
      ],
    };
  }

  // ─── STOREKEEPER Methods ──────────────────────────────────────────────────

  private async getStorekeeperSummary() {
    // Example: Count products and check stock levels
    // const totalProducts = await this.prisma.product.count();
    // const lowStock = await this.prisma.product.count({
    //   where: { quantity_in_stock: { lte: this.prisma.product.fields.minimum_stock_threshold } }
    // });

    return {
      role: Role.STOREKEEPER,
      cards: [
        {
          label: 'Stock Items',
          value: '247',
          change: '+8 this week',
          trend: 'up',
          icon: '📦',
          color: 'bg-blue-100',
        },
        {
          label: 'Low Stock',
          value: '12',
          icon: '⚠️',
          color: 'bg-amber-100',
          trend: 'neutral',
        },
        {
          label: 'Out of Stock',
          value: '3',
          icon: '❌',
          color: 'bg-red-100',
          trend: 'neutral',
        },
        {
          label: 'Pending Orders',
          value: '5',
          icon: '📥',
          color: 'bg-purple-100',
          trend: 'neutral',
        },
      ],
      alerts: [
        {
          id: '1',
          type: 'error',
          message: '3 items out of stock - reorder urgently',
          action: { label: 'Reorder', href: '/staff/stock' },
        },
        {
          id: '2',
          type: 'warning',
          message: '12 items below minimum threshold',
          action: { label: 'Review', href: '/staff/stock' },
        },
        {
          id: '3',
          type: 'info',
          message: '5 pending deliveries for today',
          action: { label: 'View', href: '/staff/receiving' },
        },
      ],
      quickActions: [
        {
          label: 'Receive Delivery',
          icon: '📥',
          href: '/staff/receiving/new',
          color: 'bg-emerald-50',
        },
        {
          label: 'Check Stock',
          icon: '📦',
          href: '/staff/stock',
          color: 'bg-blue-50',
        },
        {
          label: 'Order Supplies',
          icon: '🛒',
          href: '/staff/suppliers/order',
          color: 'bg-purple-50',
        },
        {
          label: 'Stock Report',
          icon: '📊',
          href: '/staff/stock/report',
          color: 'bg-amber-50',
        },
      ],
    };
  }

  private async getStorekeeperTasks(userId: string) {
    return {
      tasks: [
        {
          id: '1',
          title: 'Receive 3 pending supplier deliveries',
          priority: 'high',
          dueDate: 'Today',
          action: { label: 'Receive', href: '/staff/receiving' },
        },
        {
          id: '2',
          title: 'Reorder 12 low-stock items',
          priority: 'high',
          action: { label: 'Order', href: '/staff/stock' },
        },
        {
          id: '3',
          title: 'Update stock counts (weekly audit)',
          priority: 'medium',
          dueDate: 'Jun 27',
          action: { label: 'Audit', href: '/staff/stock/audit' },
        },
      ],
    };
  }
}
