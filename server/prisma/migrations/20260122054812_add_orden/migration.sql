/*
  Warnings:

  - You are about to drop the column `tipo` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "tipo",
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "TipoProducto";
