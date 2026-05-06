-- Migration: Add category, location, severity, frequency, recency, fileUrl to Report
-- Generated for AegisOps S3 integration

ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "category"  TEXT;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "location"  TEXT;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "severity"  DOUBLE PRECISION;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "frequency" DOUBLE PRECISION;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "recency"   DOUBLE PRECISION;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "fileUrl"   TEXT;
