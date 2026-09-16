-- Add explicit failed-delivery tracking for dispatcher retries.
ALTER TYPE "DeliveryStatus" ADD VALUE 'FAILED';

ALTER TABLE "deliveries" ADD COLUMN "failed_at" TIMESTAMP(3);
