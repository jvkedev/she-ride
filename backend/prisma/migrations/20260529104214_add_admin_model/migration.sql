/*
  Warnings:

  - You are about to drop the column `defaultDropAddress` on the `Rider` table. All the data in the column will be lost.
  - You are about to drop the column `defaultPickupAddress` on the `Rider` table. All the data in the column will be lost.
  - You are about to drop the column `walletBalance` on the `Rider` table. All the data in the column will be lost.
  - You are about to drop the `wallet_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_rideId_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_riderId_fkey";

-- AlterTable
ALTER TABLE "Rider" DROP COLUMN "defaultDropAddress",
DROP COLUMN "defaultPickupAddress",
DROP COLUMN "walletBalance";

-- DropTable
DROP TABLE "wallet_transactions";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileImage" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "department" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
