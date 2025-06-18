/*
  Warnings:

  - You are about to drop the column `contractPicture` on the `Customerinfo` table. All the data in the column will be lost.
  - You are about to drop the column `govBPicture` on the `Customerinfo` table. All the data in the column will be lost.
  - You are about to drop the column `govFPicture` on the `Customerinfo` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `Customerinfo` table. All the data in the column will be lost.
  - You are about to drop the column `govBPicture` on the `Employeeinfo` table. All the data in the column will be lost.
  - You are about to drop the column `govFPicture` on the `Employeeinfo` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `Employeeinfo` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ImageType" ADD VALUE 'contract';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "Customerinfo" DROP COLUMN "contractPicture",
DROP COLUMN "govBPicture",
DROP COLUMN "govFPicture",
DROP COLUMN "picture";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "Employeeinfo" DROP COLUMN "govBPicture",
DROP COLUMN "govFPicture",
DROP COLUMN "picture";
