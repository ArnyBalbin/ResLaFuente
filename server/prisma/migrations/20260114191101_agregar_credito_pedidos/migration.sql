/*
  Warnings:

  - You are about to drop the column `direccion` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `ruc` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `Empresa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dni]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ruc` on table `Empresa` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "direccion",
DROP COLUMN "ruc",
DROP COLUMN "telefono";

-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "activo",
ADD COLUMN     "creditoUsado" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "diaCierre" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "limiteCredito" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "tieneCredito" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "ruc" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "empresaId" INTEGER,
ADD COLUMN     "esCredito" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dni_key" ON "Cliente"("dni");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
