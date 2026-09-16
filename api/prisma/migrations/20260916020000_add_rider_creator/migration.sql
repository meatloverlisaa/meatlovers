ALTER TABLE "riders" ADD COLUMN "created_by" BIGINT;

CREATE INDEX "riders_created_by_idx" ON "riders"("created_by");
