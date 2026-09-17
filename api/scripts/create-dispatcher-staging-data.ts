import { PrismaClient } from '@prisma/client';


const databaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  if (process.env.DISPATCHER_STAGING_CONFIRM !== 'YES') {
    throw new Error(
      'Refusing to create data. Set DISPATCHER_STAGING_CONFIRM=YES before running this script.',
    );
  }

  const riderUser = await prisma.user.upsert({
    where: { email: 'dispatcher-staging-rider@meatlovers.com' },
    update: { is_active: true },
    create: {
      full_name: 'Dispatcher Staging Rider',
      email: 'dispatcher-staging-rider@meatlovers.com',
      phone: '+254700009999',
      password_hash: 'staging-account-no-login',
      role: 'DISPATCHER',
      is_active: true,
    },
  });

  const rider = await prisma.rider.upsert({
    where: { user_id: riderUser.id },
    update: {
      is_available: true,
      current_location: 'Meat Lovers staging kitchen',
      current_latitude: -1.2864,
      current_longitude: 36.8172,
      last_location_at: new Date(),
    },
    create: {
      user_id: riderUser.id,
      phone: riderUser.phone ?? '+254700009999',
      vehicle_type: 'Motorcycle',
      vehicle_plate: 'STAGING-01',
      current_location: 'Meat Lovers staging kitchen',
      current_latitude: -1.2864,
      current_longitude: 36.8172,
    },
  });

  const table = await prisma.table.findFirst({ where: { is_active: true } });
  const waiter = await prisma.user.findFirst({ where: { role: 'WAITER', is_active: true } });
  if (!table || !waiter) {
    throw new Error('A live table and active WAITER are required to create staging order data.');
  }

  const order = await prisma.order.create({
    data: {
      table_id: table.id,
      waiter_id: waiter.id,
      status: 'READY',
      total_amount: 0,
      special_requests: 'DISPATCHER_STAGING_TEST — safe to remove after verification',
    },
  });

  const delivery = await prisma.delivery.create({
    data: {
      order_id: order.id,
      rider_id: rider.id,
      status: 'ASSIGNED',
      pickup_address: 'Meat Lovers staging kitchen',
      delivery_address: 'Dispatcher staging address',
      delivery_latitude: -1.2921,
      delivery_longitude: 36.8219,
      customer_name: 'Dispatcher Staging Customer',
      customer_phone: '+254700009998',
      delivery_notes: 'DISPATCHER_STAGING_TEST',
      estimated_delivery_at: new Date(Date.now() + 45 * 60 * 1000),
      priority: 1,
    },
  });

  console.log(`Created staging order ${order.id} and delivery ${delivery.id}.`);
  console.log('Run the dispatcher status flow, then query delivery_events to verify the audit records.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
