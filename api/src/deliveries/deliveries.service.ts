/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  // Rider Management
  async createRider(createRiderDto: CreateRiderDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(createRiderDto.user_id) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a rider
    const existingRider = await this.prisma.rider.findUnique({
      where: { user_id: BigInt(createRiderDto.user_id) },
    });

    if (existingRider) {
      throw new BadRequestException('User is already registered as a rider');
    }

    const rider = await this.prisma.rider.create({
      data: {
        user_id: BigInt(createRiderDto.user_id),
        phone: createRiderDto.phone,
        license_number: createRiderDto.license_number,
        vehicle_type: createRiderDto.vehicle_type,
        vehicle_plate: createRiderDto.vehicle_plate,
        current_location: createRiderDto.current_location,
      },
      include: {
        user: true,
      },
    });

    return rider;
  }

  async findAllRiders() {
    return this.prisma.rider.findMany({
      include: {
        user: true,
        deliveries: {
          include: {
            order: {
              include: {
                items: true,
              },
            },
          },
          orderBy: {
            assigned_at: 'desc',
          },
        },
      },
    });
  }

  async findAvailableRiders() {
    return this.prisma.rider.findMany({
      where: {
        is_available: true,
      },
      include: {
        user: true,
      },
    });
  }

  async findOneRider(id: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: true,
        deliveries: {
          include: {
            order: {
              include: {
                items: true,
              },
            },
          },
          orderBy: {
            assigned_at: 'desc',
          },
        },
      },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    return rider;
  }

  async updateRider(id: string, updateRiderDto: UpdateRiderDto) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: BigInt(id) },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const updatedRider = await this.prisma.rider.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateRiderDto.phone && { phone: updateRiderDto.phone }),
        ...(updateRiderDto.license_number !== undefined && {
          license_number: updateRiderDto.license_number,
        }),
        ...(updateRiderDto.vehicle_type !== undefined && {
          vehicle_type: updateRiderDto.vehicle_type,
        }),
        ...(updateRiderDto.vehicle_plate !== undefined && {
          vehicle_plate: updateRiderDto.vehicle_plate,
        }),
        ...(updateRiderDto.current_location !== undefined && {
          current_location: updateRiderDto.current_location,
        }),
        ...(updateRiderDto.is_available !== undefined && {
          is_available: updateRiderDto.is_available,
        }),
      },
      include: {
        user: true,
      },
    });

    return updatedRider;
  }

  async removeRider(id: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: BigInt(id) },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    await this.prisma.rider.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Rider deleted successfully' };
  }

  // Delivery Management
  async createDelivery(createDeliveryDto: CreateDeliveryDto) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(createDeliveryDto.order_id) },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order already has a delivery
    const existingDelivery = await this.prisma.delivery.findUnique({
      where: { order_id: BigInt(createDeliveryDto.order_id) },
    });

    if (existingDelivery) {
      throw new BadRequestException('Order already has a delivery assigned');
    }

    // Check if rider exists and is available
    const rider = await this.prisma.rider.findUnique({
      where: { id: BigInt(createDeliveryDto.rider_id) },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    if (!rider.is_available) {
      throw new BadRequestException('Rider is not available');
    }

    const delivery = await this.prisma.delivery.create({
      data: {
        order_id: BigInt(createDeliveryDto.order_id),
        rider_id: BigInt(createDeliveryDto.rider_id),
        pickup_address: createDeliveryDto.pickup_address,
        delivery_address: createDeliveryDto.delivery_address,
        delivery_notes: createDeliveryDto.delivery_notes,
        status: 'ASSIGNED',
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
    });

    return delivery;
  }

  async findAllDeliveries(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        assigned_at: 'desc',
      },
    });
  }

  async findOneDelivery(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return delivery;
  }

  async findByOrderId(orderId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { order_id: BigInt(orderId) },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found for this order');
    }

    return delivery;
  }

  async findByRiderId(riderId: string) {
    return this.prisma.delivery.findMany({
      where: { rider_id: BigInt(riderId) },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        assigned_at: 'desc',
      },
    });
  }

  async updateDelivery(id: string, updateDeliveryDto: UpdateDeliveryDto) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDeliveryDto.pickup_address !== undefined && {
          pickup_address: updateDeliveryDto.pickup_address,
        }),
        ...(updateDeliveryDto.delivery_address !== undefined && {
          delivery_address: updateDeliveryDto.delivery_address,
        }),
        ...(updateDeliveryDto.delivery_notes !== undefined && {
          delivery_notes: updateDeliveryDto.delivery_notes,
        }),
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
    });

    return updatedDelivery;
  }

  async updateDeliveryStatus(
    id: string,
    updateDeliveryStatusDto: UpdateDeliveryStatusDto,
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const validStatuses = [
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(updateDeliveryStatusDto.status)) {
      throw new BadRequestException(
        `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
      );
    }

    const updateData: any = {
      status: updateDeliveryStatusDto.status,
    };

    // Update timestamps based on status
    if (updateDeliveryStatusDto.status === 'PICKED_UP') {
      updateData.picked_up_at = new Date();
    } else if (updateDeliveryStatusDto.status === 'DELIVERED') {
      updateData.delivered_at = new Date();
    } else if (updateDeliveryStatusDto.status === 'CANCELLED') {
      updateData.cancelled_at = new Date();
      updateData.cancellation_reason =
        updateDeliveryStatusDto.cancellation_reason;
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        order: {
          include: {
            items: true,
          },
        },
        rider: {
          include: {
            user: true,
          },
        },
      },
    });

    return updatedDelivery;
  }

  async removeDelivery(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    await this.prisma.delivery.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Delivery deleted successfully' };
  }

  async getDeliverySummary(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.assigned_at = {};
      if (startDate) {
        where.assigned_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.assigned_at.lte = new Date(endDate);
      }
    }

    const deliveries = await this.prisma.delivery.findMany({
      where,
      include: {
        order: true,
        rider: {
          include: {
            user: true,
          },
        },
      },
    });

    const summary = {
      totalDeliveries: deliveries.length,
      assigned: deliveries.filter((d) => d.status === 'ASSIGNED').length,
      pickedUp: deliveries.filter((d) => d.status === 'PICKED_UP').length,
      inTransit: deliveries.filter((d) => d.status === 'IN_TRANSIT').length,
      delivered: deliveries.filter((d) => d.status === 'DELIVERED').length,
      cancelled: deliveries.filter((d) => d.status === 'CANCELLED').length,
      activeRiders: deliveries.filter(
        (d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED',
      ).length,
      deliveries,
    };

    return summary;
  }
}
