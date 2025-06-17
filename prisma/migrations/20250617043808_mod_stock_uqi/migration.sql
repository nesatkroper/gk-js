/*
  Warnings:

  - A unique constraint covering the columns `[productId,branchId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,customerId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_branchId_key" ON "Stock"("productId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_customerId_key" ON "Stock"("productId", "customerId");
