/*
  Warnings:

  - The `album` column on the `Customerinfo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `album` column on the `Employeeinfo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Customerinfo" DROP COLUMN "album",
ADD COLUMN     "album" TEXT[];

-- AlterTable
ALTER TABLE "Employeeinfo" DROP COLUMN "album",
ADD COLUMN     "album" TEXT[];
