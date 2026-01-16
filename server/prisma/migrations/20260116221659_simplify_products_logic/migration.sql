/*
  Warnings:

  - You are about to drop the column `esProductoFinal` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "esProductoFinal",
ADD COLUMN     "controlarStock" BOOLEAN NOT NULL DEFAULT false;
