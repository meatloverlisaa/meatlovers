import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class InitService {
  constructor(private prisma: PrismaService) {}

  async seedDatabase() {
    // Check if database is already seeded
    const userCount = await this.prisma.user.count();
    
    if (userCount > 0) {
      throw new ConflictException({
        message: 'Database is already seeded. This endpoint can only be called once.',
        userCount,
      });
    }

    const createdUsers: Array<{ email: string | null; role: string; password: string }> = [];

    // Create Super Admin
    const superAdminPassword = await bcrypt.hash('SuperAdmin@1234', 10);
    const superAdmin = await this.prisma.user.create({
      data: {
        full_name: 'Super Administrator',
        email: 'superadmin@meatlovers.com',
        phone: '+254799999999',
        role: Role.SUPER_ADMIN,
        password_hash: superAdminPassword,
        is_active: true,
      },
    });
    createdUsers.push({
      email: superAdmin.email,
      role: superAdmin.role,
      password: 'SuperAdmin@1234',
    });

    // Create Admin
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    const admin = await this.prisma.user.create({
      data: {
        full_name: 'Admin User',
        email: 'admin@meatlovers.com',
        phone: '+254700000001',
        role: Role.ADMIN,
        password_hash: adminPassword,
        is_active: true,
      },
    });
    createdUsers.push({
      email: admin.email,
      role: admin.role,
      password: 'Admin@1234',
    });

    // Create Manager 1
    const manager1Password = await bcrypt.hash('Admin@1234', 10);
    const manager1 = await this.prisma.user.create({
      data: {
        full_name: 'Restaurant Manager',
        email: 'manager@meatlovers.com',
        phone: '+254788888888',
        role: Role.MANAGER,
        password_hash: manager1Password,
        is_active: true,
      },
    });
    createdUsers.push({
      email: manager1.email,
      role: manager1.role,
      password: 'Admin@1234',
    });

    // Create Manager 2 (Kevin)
    const manager2Password = await bcrypt.hash('Admin@1234', 10);
    const manager2 = await this.prisma.user.create({
      data: {
        full_name: 'Kevin Macharia',
        email: 'kevin254@gmail.com',
        phone: '+254700000002',
        role: Role.MANAGER,
        password_hash: manager2Password,
        is_active: true,
      },
    });
    createdUsers.push({
      email: manager2.email,
      role: manager2.role,
      password: 'Admin@1234',
    });

    // Create Accountant
    const accountantPassword = await bcrypt.hash('Admin@1234', 10);
    const accountant = await this.prisma.user.create({
      data: {
        full_name: 'Accountant User',
        email: 'accountant@meatlovers.com',
        phone: '+254700000003',
        role: Role.ACCOUNTANT,
        password_hash: accountantPassword,
        is_active: true,
      },
    });
    createdUsers.push({
      email: accountant.email,
      role: accountant.role,
      password: 'Admin@1234',
    });

    // Create HR
    const hrPassword = await bcrypt.hash('Admin@1234', 10);
    const hr = await this.prisma.user.create({
      data: {
        full_name: 'HR Manager',
        email: 'hr@meatlovers.com',
        phone: '+254700000004',
        role: Role.HR,
        password_hash: hrPassword,
        is_active: true,
      },
    });
    createdUsers.push({
      email: hr.email,
      role: hr.role,
      password: 'Admin@1234',
    });

    // Create Chef
    const chefPassword = await bcrypt.hash('Admin@1234', 10);
    const chef = await this.prisma.user.create({
      data: {
        full_name: 'Head Chef',
        email: 'chef@meatlovers.com',
        phone: '+254700000005',
        role: Role.CHEF,
        password_hash: chefPassword,
        is_active: true,
      },
    });
    createdUsers.push({
      email: chef.email,
      role: chef.role,
      password: 'Admin@1234',
    });

    // Create Cashier
    const cashierPassword = await bcrypt.hash('Admin@1234', 10);
    const cashier = await this.prisma.user.create({
      data: {
        full_name: 'Cashier User',
        email: 'cashier@meatlovers.com',
        phone: '+254700000006',
        role: Role.CASHIER,
        password_hash: cashierPassword,
        is_active: true,
      },
    });
    createdUsers.push({
      email: cashier.email,
      role: cashier.role,
      password: 'Admin@1234',
    });

    return {
      success: true,
      message: 'Database seeded successfully! You can now login with these credentials.',
      totalUsers: createdUsers.length,
      users: createdUsers,
      note: 'This endpoint can only be called once. Subsequent calls will be rejected.',
    };
  }
}
