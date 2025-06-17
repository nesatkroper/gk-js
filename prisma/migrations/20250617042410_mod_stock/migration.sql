-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_branchId_fkey";

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "customerId" UUID,
ALTER COLUMN "branchId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Stock_productId_branchId_customerId_idx" ON "Stock"("productId", "branchId", "customerId");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
