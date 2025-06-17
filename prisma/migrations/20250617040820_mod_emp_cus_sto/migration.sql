/*
  Warnings:

  - You are about to drop the column `govPicture` on the `Customerinfo` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Customerinfo` table. All the data in the column will be lost.
  - You are about to drop the column `govPicture` on the `Employeeinfo` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Employeeinfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_supplierId_fkey";

-- AlterTable
ALTER TABLE "Customerinfo" DROP COLUMN "govPicture",
DROP COLUMN "status",
ADD COLUMN     "album" TEXT,
ADD COLUMN     "contractPDF" TEXT,
ADD COLUMN     "contractPicture" TEXT,
ADD COLUMN     "govBPicture" TEXT,
ADD COLUMN     "govFPicture" TEXT,
ADD COLUMN     "refPhone" TEXT;

-- AlterTable
ALTER TABLE "Employeeinfo" DROP COLUMN "govPicture",
DROP COLUMN "status",
ADD COLUMN     "album" TEXT,
ADD COLUMN     "govBPicture" TEXT,
ADD COLUMN     "govFPicture" TEXT;

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "customerId" UUID,
ALTER COLUMN "supplierId" DROP NOT NULL,
ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
