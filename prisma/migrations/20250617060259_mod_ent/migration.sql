/*
  Warnings:

  - You are about to drop the column `customerId` on the `Entry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_customerId_fkey";

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "customerId";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "memo" DROP NOT NULL;
