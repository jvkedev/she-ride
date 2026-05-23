-- AlterTable (separate migration so PENDING enum value is committed first)
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PENDING';
