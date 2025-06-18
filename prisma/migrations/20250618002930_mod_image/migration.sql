/*
  Warnings:

  - You are about to drop the `Imageaddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('address', 'backId', 'frontId', 'card', 'album', 'product');

-- DropForeignKey
ALTER TABLE "Imageaddress" DROP CONSTRAINT "Imageaddress_addressId_fkey";

-- DropTable
DROP TABLE "Imageaddress";

-- CreateTable
CREATE TABLE "Image" (
    "imageId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "imageUrl" TEXT NOT NULL,
    "imageType" "ImageType" NOT NULL DEFAULT 'product',
    "addressId" UUID,
    "productId" UUID,
    "employeeId" UUID,
    "customerId" UUID,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("imageId")
);

-- CreateIndex
CREATE INDEX "Image_addressId_productId_employeeId_customerId_idx" ON "Image"("addressId", "productId", "employeeId", "customerId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
