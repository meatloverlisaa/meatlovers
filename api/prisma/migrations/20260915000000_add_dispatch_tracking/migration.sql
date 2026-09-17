ALTER TABLE "riders"
  ADD COLUMN "current_latitude" DOUBLE PRECISION,
  ADD COLUMN "current_longitude" DOUBLE PRECISION,
  ADD COLUMN "last_location_at" TIMESTAMP(3);

ALTER TABLE "deliveries"
  ADD COLUMN "estimated_delivery_at" TIMESTAMP(3),
  ADD COLUMN "last_location" TEXT,
  ADD COLUMN "last_latitude" DOUBLE PRECISION,
  ADD COLUMN "last_longitude" DOUBLE PRECISION,
  ADD COLUMN "last_location_at" TIMESTAMP(3),
  ADD COLUMN "delay_reason" TEXT,
  ADD COLUMN "failed_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reassigned_at" TIMESTAMP(3),
  ADD COLUMN "reassigned_by" BIGINT;

CREATE TABLE "delivery_events" (
  "id" BIGSERIAL NOT NULL,
  "delivery_id" BIGINT NOT NULL,
  "status" "DeliveryStatus" NOT NULL,
  "note" TEXT,
  "recorded_by" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "delivery_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deliveries_estimated_delivery_at_idx" ON "deliveries"("estimated_delivery_at");
CREATE INDEX "deliveries_priority_status_idx" ON "deliveries"("priority", "status");
CREATE INDEX "deliveries_reassigned_by_idx" ON "deliveries"("reassigned_by");
CREATE INDEX "delivery_events_delivery_id_created_at_idx" ON "delivery_events"("delivery_id", "created_at");
CREATE INDEX "delivery_events_status_idx" ON "delivery_events"("status");
CREATE INDEX "delivery_events_recorded_by_idx" ON "delivery_events"("recorded_by");

ALTER TABLE "deliveries"
  ADD CONSTRAINT "deliveries_reassigned_by_fkey"
  FOREIGN KEY ("reassigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "delivery_events"
  ADD CONSTRAINT "delivery_events_delivery_id_fkey"
  FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "delivery_events_recorded_by_fkey"
  FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
