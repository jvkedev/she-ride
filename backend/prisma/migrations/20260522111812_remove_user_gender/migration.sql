/*
  Warnings:

  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'RIDER_COMPLETED', 'CAPTAIN_COMPLETED');

-- AlterTable
ALTER TABLE "captains" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "profileImage" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "gender",
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING';
