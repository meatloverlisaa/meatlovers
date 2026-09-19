/* eslint-disable @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { FinanceService } from '../finance/finance.service';
import { AuditLogService } from '../auth/audit-log.service';
import { Observable, Subject } from 'rxjs';

export interface DeliveryLiveUpdate {
  type: 'delivery.status' | 'delivery.retry' | 'rider.location';
  deliveryId?: string;
  riderId?: string;
  status?: string;
  occurredAt: string;
}

@Injectable()
export class DeliveriesService {
  private readonly liveUpdates = new Subject<DeliveryLiveUpdate>();

  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService,
    private auditLogService: AuditLogService,
  ) {}

  getLiveUpdates(): Observable<DeliveryLiveUpdate> {
    return this.liveUpdates.asObservable();
  }

  private publishLiveUpdate(update: Omit<DeliveryLiveUpdate, 'occurredAt'>) {
    this.liveUpdates.next({ ...update, occurredAt: new Date().toISOString() });
  }

  // Rider Management
  async createRider(createRiderDto: CreateRiderDto, createdBy?: string) {
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

    if (createdBy) {
      await this.prisma.$executeRawUnsafe(
        'UPDATE riders SET created_by = $1 WHERE id = $2',
        BigInt(createdBy),
        rider.id,
      );
    }

    return (await this.attachRiderCreator([rider]))[0];
  }

  private async attachRiderCreator<T extends { id: bigint }>(riders: T[]) {
    if (!riders.length) return riders;
    if (typeof (this.prisma as any).$queryRawUnsafe !== 'function') return riders;
    const ids = riders.map((rider) => rider.id.toString()).join(',');
    const creators = await this.prisma.$queryRawUnsafe<Array<{
      rider_id: bigint;
      created_by: bigint | null;
      creator_name: string | null;
      creator_email: string | null;
    }>>(
      `SELECT r.id AS rider_id, r.created_by, u.full_name AS creator_name, u.email AS creator_email
       FROM riders r LEFT JOIN users u ON u.id = r.created_by WHERE r.id IN (${ids})`,
    );
    const byRider = new Map(creators.map((creator) => [creator.rider_id.toString(), creator]));
    return riders.map((rider) => {
      const creator = byRider.get(rider.id.toString());
      if (!creator) return rider;
      return {
        ...rider,
        created_by: creator?.created_by?.toString() ?? null,
        created_by_user: creator?.creator_name
          ? { full_name: creator.creator_name, email: creator.creator_email }
          : null,
      };
    });
  }

  async findAllRiders() {
    const riders = await this.prisma.rider.findMany({
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
    return this.attachRiderCreator(riders);
  }

  async findAvailableRiders() {
    const riders = await this.prisma.rider.findMany({
      where: {
        is_available: true,
      },
      include: {
        user: true,
      },
    });
    return this.attachRiderCreator(riders);
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

  async findRiderByUserId(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { user_id: BigInt(userId) },
      include: { user: true },
    });
    if (!rider) throw new NotFoundException('No rider profile is linked to this account');
    return rider;
  }

  async findDeliveriesByUserId(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { user_id: BigInt(userId) },
      select: { id: true },
    });
    if (!rider) throw new NotFoundException('No rider profile is linked to this account');
    return this.findByRiderId(rider.id.toString());
  }

  async updateRiderDeliveryStatus(
    id: string,
    updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    userId: string,
  ) {
    const rider = await this.prisma.rider.findUnique({
      where: { user_id: BigInt(userId) },
      select: { id: true },
    });
    if (!rider) throw new NotFoundException('No rider profile is linked to this account');
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
      select: { rider_id: true },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.rider_id !== rider.id) {
      throw new ForbiddenException('You can only update your own deliveries');
    }
    return this.updateDeliveryStatus(id, updateDeliveryStatusDto, userId);
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
        ...(updateRiderDto.current_latitude !== undefined && {
          current_latitude: updateRiderDto.current_latitude,
        }),
        ...(updateRiderDto.current_longitude !== undefined && {
          current_longitude: updateRiderDto.current_longitude,
        }),
        ...((updateRiderDto.current_location !== undefined ||
          updateRiderDto.current_latitude !== undefined ||
          updateRiderDto.current_longitude !== undefined) && {
          last_location_at: new Date(),
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

  async updateRiderLocation(id: string, updateRiderDto: UpdateRiderDto, userId?: string) {
    const rider = await this.prisma.rider.findUnique({ where: { id: BigInt(id) } });
    if (!rider) throw new NotFoundException('Rider not found');
    if (userId && rider.user_id !== BigInt(userId)) {
      throw new ForbiddenException('You can only update your own rider location');
    }
    const updatedRider = await this.updateRider(id, updateRiderDto);
    this.publishLiveUpdate({ type: 'rider.location', riderId: id });
    return updatedRider;
  }

  async getRouteEstimate(id: string, destinationLat?: number, destinationLng?: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
      include: { rider: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    const targetLat = destinationLat ?? delivery.delivery_latitude;
    const targetLng = destinationLng ?? delivery.delivery_longitude;
    if (targetLat == null || targetLng == null) {
      throw new BadRequestException('Delivery destination coordinates are not available');
    }
    if (delivery.rider.current_latitude == null || delivery.rider.current_longitude == null) {
      throw new BadRequestException('Rider location is not available for route calculation');
    }

    const origin = `${delivery.rider.current_longitude},${delivery.rider.current_latitude}`;
    const destination = `${targetLng},${targetLat}`;
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false`,
    );
    if (!response.ok) {
      return this.fallbackRouteEstimate(
        delivery.rider.current_latitude,
        delivery.rider.current_longitude,
        targetLat,
        targetLng,
      );
    }

    const payload = (await response.json()) as {
      code?: string;
      routes?: Array<{ distance: number; duration: number }>;
    };
    const route = payload.routes?.[0];
    if (payload.code !== 'Ok' || !route) {
      return this.fallbackRouteEstimate(
        delivery.rider.current_latitude,
        delivery.rider.current_longitude,
        targetLat,
        targetLng,
      );
    }

    return {
      provider: 'OSRM',
      distance_km: Number((route.distance / 1000).toFixed(2)),
      duration_minutes: Math.ceil(route.duration / 60),
    };
  }

  private fallbackRouteEstimate(originLat: number, originLng: number, targetLat: number, targetLng: number) {
    const radians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = radians(targetLat - originLat);
    const dLng = radians(targetLng - originLng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(radians(originLat)) * Math.cos(radians(targetLat)) * Math.sin(dLng / 2) ** 2;
    const distance = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return {
      provider: 'HAVERSINE_FALLBACK',
      distance_km: Number(distance.toFixed(2)),
      duration_minutes: Math.ceil((distance / 25) * 60),
    };
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
        delivery_latitude: createDeliveryDto.delivery_latitude,
        delivery_longitude: createDeliveryDto.delivery_longitude,
        delivery_notes: createDeliveryDto.delivery_notes,
        status: 'ASSIGNED',
        estimated_delivery_at: new Date(
          Date.now() + (order.estimated_time ?? 45) * 60 * 1000,
        ),
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

  async findDeliveryEvents(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');

    return this.prisma.deliveryEvent.findMany({
      where: { delivery_id: BigInt(id) },
      include: { recorder: { select: { id: true, full_name: true, role: true } } },
      orderBy: { created_at: 'asc' },
    });
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

  async updateDelivery(id: string, updateDeliveryDto: UpdateDeliveryDto, recordedBy?: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: BigInt(id) },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const data: any = {
      ...(updateDeliveryDto.pickup_address !== undefined && { pickup_address: updateDeliveryDto.pickup_address }),
      ...(updateDeliveryDto.delivery_address !== undefined && { delivery_address: updateDeliveryDto.delivery_address }),
      ...(updateDeliveryDto.delivery_latitude !== undefined && { delivery_latitude: updateDeliveryDto.delivery_latitude }),
      ...(updateDeliveryDto.delivery_longitude !== undefined && { delivery_longitude: updateDeliveryDto.delivery_longitude }),
      ...(updateDeliveryDto.delivery_notes !== undefined && { delivery_notes: updateDeliveryDto.delivery_notes }),
      ...(updateDeliveryDto.priority !== undefined && { priority: updateDeliveryDto.priority }),
      ...(updateDeliveryDto.estimated_delivery_at !== undefined && { estimated_delivery_at: new Date(updateDeliveryDto.estimated_delivery_at) }),
      ...(updateDeliveryDto.delay_reason !== undefined && { delay_reason: updateDeliveryDto.delay_reason }),
      ...(updateDeliveryDto.distance_km !== undefined && { distance_km: updateDeliveryDto.distance_km }),
    };

    if (updateDeliveryDto.rider_id !== undefined && BigInt(updateDeliveryDto.rider_id) !== delivery.rider_id) {
      const rider = await this.prisma.rider.findUnique({ where: { id: BigInt(updateDeliveryDto.rider_id) } });
      if (!rider) throw new NotFoundException('Rider not found');
      if (!rider.is_available) throw new BadRequestException('Rider is not available');
      data.rider_id = BigInt(updateDeliveryDto.rider_id);
      data.reassigned_at = new Date();
      if (recordedBy) data.reassigned_by = BigInt(recordedBy);
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: BigInt(id) },
      data,
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
    recordedBy?: string,
  ) {
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

    const validStatuses = [
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'FAILED',
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
    } else if (updateDeliveryStatusDto.status === 'IN_TRANSIT') {
      updateData.in_transit_at = new Date();
    } else if (updateDeliveryStatusDto.status === 'CANCELLED') {
      updateData.cancelled_at = new Date();
      updateData.cancellation_reason =
        updateDeliveryStatusDto.cancellation_reason;
    } else if (updateDeliveryStatusDto.status === 'FAILED') {
      updateData.failed_at = new Date();
      updateData.failed_attempts = { increment: 1 };
      updateData.cancellation_reason = updateDeliveryStatusDto.cancellation_reason;
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

    if (recordedBy) {
      await this.prisma.deliveryEvent.create({
        data: {
          delivery_id: BigInt(id),
          status: updateDeliveryStatusDto.status as any,
          note: updateDeliveryStatusDto.note ?? updateDeliveryStatusDto.cancellation_reason,
          recorded_by: BigInt(recordedBy),
        },
      });
    }

    this.publishLiveUpdate({
      type: 'delivery.status',
      deliveryId: id,
      status: updateDeliveryStatusDto.status,
    });

    // Create rider settlement when delivery is completed
    if (updateDeliveryStatusDto.status === 'DELIVERED' && delivery.status !== 'DELIVERED') {
      try {
        // Calculate delivery fee (e.g., 10% of order total or fixed fee)
        const orderTotal = delivery.order.items.reduce(
          (sum, item) => sum + Number(item.unit_price) * item.quantity,
          0,
        );
        const deliveryFee = orderTotal * 0.1; // 10% of order total as delivery fee

        // Create finance transaction for rider settlement
        await this.financeService.createFinanceTransaction({
          type: 'EXPENSE' as any,
          category: 'DELIVERY' as any,
          amount: deliveryFee,
          description: `Rider settlement for delivery ${id}`,
          reference: `Delivery-${id}`,
          recorded_by: delivery.rider.user_id.toString(),
          transaction_date: new Date().toISOString(),
        });

        // Log audit entry
        await this.auditLogService.log({
          userId: delivery.rider.user_id,
          action: 'STOCK_MOVEMENT' as any,
          resource: 'delivery',
          resourceId: id,
          metadata: {
            deliveryId: id,
            orderId: delivery.order_id.toString(),
            riderId: delivery.rider_id.toString(),
            deliveryFee,
            orderTotal,
          },
          success: true,
        });
      } catch (error) {
        console.error('Failed to create rider settlement:', error);
        // Don't fail the delivery update if settlement fails
      }
    }

    return updatedDelivery;
  }

  async retryDelivery(id: string, recordedBy?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id: BigInt(id) } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if ((delivery.status as string) !== 'FAILED' && delivery.status !== 'CANCELLED') {
      throw new BadRequestException('Only failed or cancelled deliveries can be retried');
    }

    const updated = await this.prisma.delivery.update({
      where: { id: BigInt(id) },
      data: {
        status: 'ASSIGNED',
        assigned_at: new Date(),
        cancelled_at: null,
        cancellation_reason: null,
        estimated_delivery_at: new Date(Date.now() + 45 * 60 * 1000),
      },
      include: { rider: { include: { user: true } }, order: true },
    });
    if (recordedBy) {
      await this.prisma.deliveryEvent.create({
        data: {
          delivery_id: BigInt(id),
          status: 'ASSIGNED',
          note: 'Delivery retry scheduled',
          recorded_by: BigInt(recordedBy),
        },
      });
    }
    this.publishLiveUpdate({ type: 'delivery.retry', deliveryId: id, status: 'ASSIGNED' });
    return updated;
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
