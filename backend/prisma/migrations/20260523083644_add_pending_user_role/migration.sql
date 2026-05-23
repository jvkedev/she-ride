-- AlterEnum (must be committed alone before using the new value)
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PENDING';
