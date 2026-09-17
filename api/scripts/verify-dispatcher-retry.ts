import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

async function main() {
  if (process.env.DISPATCHER_RETRY_CONFIRM !== 'YES') {
    throw new Error('Refusing to change staging data. Set DISPATCHER_RETRY_CONFIRM=YES.');
  }

  const delivery = await prisma.delivery.findFirst({
    where: { delivery_notes: 'DISPATCHER_STAGING_TEST' },
    include: { rider: true },
    orderBy: { id: 'desc' },
  });
  if (!delivery) throw new Error('No dispatcher staging delivery found.');

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      'UPDATE deliveries SET status = $1::"DeliveryStatus", cancellation_reason = $2, failed_attempts = failed_attempts + 1 WHERE id = $3',
      'FAILED', 'Staging retry verification', delivery.id,
    );
    await tx.$executeRawUnsafe(
      'INSERT INTO delivery_events (delivery_id, status, note, recorded_by) VALUES ($1, $2::"DeliveryStatus", $3, $4)',
      delivery.id, 'FAILED', 'Staging verification: failed delivery', delivery.rider.user_id,
    );
    await tx.$executeRawUnsafe(
      'UPDATE deliveries SET status = $1::"DeliveryStatus", cancellation_reason = NULL, estimated_delivery_at = $2 WHERE id = $3',
      'ASSIGNED', new Date(Date.now() + 45 * 60 * 1000), delivery.id,
    );
    await tx.$executeRawUnsafe(
      'INSERT INTO delivery_events (delivery_id, status, note, recorded_by) VALUES ($1, $2::"DeliveryStatus", $3, $4)',
      delivery.id, 'ASSIGNED', 'Staging verification: delivery retry scheduled', delivery.rider.user_id,
    );
  });

  const events = await prisma.$queryRawUnsafe<Array<{ status: string; note: string | null }>>(
    'SELECT status, note FROM delivery_events WHERE delivery_id = $1 ORDER BY created_at DESC LIMIT 2',
    delivery.id,
  );
  if (events[0]?.status !== 'ASSIGNED' || (events[1]?.status as string) !== 'FAILED') {
    throw new Error('Retry event verification failed.');
  }
  console.log(`Verified FAILED -> ASSIGNED retry events for staging delivery ${delivery.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
