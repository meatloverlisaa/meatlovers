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
  const deliveryId = process.env.DELIVERY_ID;
  if (process.env.DISPATCHER_STATUS_FLOW === 'YES' && process.env.DISPATCHER_STAGING_CONFIRM !== 'YES') {
    throw new Error('Refusing to change status. Set DISPATCHER_STAGING_CONFIRM=YES as well.');
  }

  if (process.env.DISPATCHER_STATUS_FLOW === 'YES') {
    const delivery = await prisma.delivery.findFirst({
      where: {
        ...(deliveryId ? { id: BigInt(deliveryId) } : {}),
        delivery_notes: 'DISPATCHER_STAGING_TEST',
      },
      include: { rider: true },
    });
    if (!delivery) throw new Error('No dispatcher staging delivery found. Create one first.');

    for (const status of ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] as const) {
      const timestamp = new Date();
      await prisma.$transaction([
        prisma.delivery.update({
          where: { id: delivery.id },
          data: {
            status,
            ...(status === 'PICKED_UP' ? { picked_up_at: timestamp } : {}),
            ...(status === 'IN_TRANSIT' ? { in_transit_at: timestamp } : {}),
            ...(status === 'DELIVERED' ? { delivered_at: timestamp } : {}),
          },
        }),
        prisma.deliveryEvent.create({
          data: {
            delivery_id: delivery.id,
            status,
            note: `Staging verification: ${status}`,
            recorded_by: delivery.rider.user_id,
          },
        }),
      ]);
    }
    console.log(`Verified status flow for staging delivery ${delivery.id}.`);
  }

  const events = await prisma.deliveryEvent.findMany({
    where: deliveryId ? { delivery_id: BigInt(deliveryId) } : undefined,
    select: {
      id: true,
      delivery_id: true,
      status: true,
      note: true,
      recorded_by: true,
      created_at: true,
    },
    orderBy: { created_at: 'asc' },
  });

  console.log(JSON.stringify(events, (_, value) => (
    typeof value === 'bigint' ? value.toString() : value
  ), 2));
  console.log(`Verified ${events.length} delivery event(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
