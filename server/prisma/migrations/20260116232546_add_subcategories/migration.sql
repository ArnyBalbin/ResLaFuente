-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('CARTA', 'MENU', 'GUARNICION', 'BEBIDA', 'EXTRA');

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "padreId" INTEGER;

-- AlterTable
ALTER TABLE "DetallePedido" ADD COLUMN     "detallePadreId" INTEGER;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "tipo" "TipoProducto" NOT NULL DEFAULT 'CARTA';

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_detallePadreId_fkey" FOREIGN KEY ("detallePadreId") REFERENCES "DetallePedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
