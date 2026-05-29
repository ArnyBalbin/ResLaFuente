-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MOZO', 'COCINA', 'CAJA');

-- CreateEnum
CREATE TYPE "TipoArticulo" AS ENUM ('PLATO', 'PRODUCTO');

-- CreateEnum
CREATE TYPE "AreaDespacho" AS ENUM ('COCINA', 'BARRA');

-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('MESA', 'LLEVAR', 'DELIVERY');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'LISTO', 'SERVIDO', 'CERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('POR_COBRAR', 'PAGADO_PARCIAL', 'PAGADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'YAPE_PLIN', 'TARJETA', 'CREDITO_EMPRESA', 'CREDITO_PERSONAL');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "password" TEXT NOT NULL,
    "pinAcceso" VARCHAR(4) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'MOZO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "tieneCredito" BOOLEAN NOT NULL DEFAULT false,
    "limiteCredito" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creditoUsado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "diaCierre" INTEGER NOT NULL DEFAULT 30,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT,
    "ruc" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "tieneCredito" BOOLEAN NOT NULL DEFAULT false,
    "limiteCredito" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "saldoDeuda" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConvenioTrabajador" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "limiteDiario" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConvenioTrabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "padreId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoArticulo" NOT NULL DEFAULT 'PLATO',
    "precio" DECIMAL(10,2) NOT NULL,
    "areaDespacho" "AreaDespacho" NOT NULL DEFAULT 'COCINA',
    "controlarStock" BOOLEAN NOT NULL DEFAULT false,
    "costo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "disponibleHoy" BOOLEAN NOT NULL DEFAULT true,
    "imagenUrl" TEXT,
    "categoriaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuDia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "segundoId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuEntrada" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,

    CONSTRAINT "MenuEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "ocupada" BOOLEAN NOT NULL DEFAULT false,
    "salon" TEXT NOT NULL DEFAULT 'Principal',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "convenioId" TEXT,
    "tipo" "TipoPedido" NOT NULL DEFAULT 'MESA',
    "direccion" TEXT,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "motivoAnulacion" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'POR_COBRAR',

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoMesa" (
    "pedidoId" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,

    CONSTRAINT "PedidoMesa_pkey" PRIMARY KEY ("pedidoId","mesaId")
);

-- CreateTable
CREATE TABLE "DetallePedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "detallePadreId" TEXT,
    "menuId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetallePedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CajaDiaria" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "montoInicial" DECIMAL(10,2) NOT NULL,
    "montoFinal" DECIMAL(10,2),
    "observaciones" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CajaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaGasto" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT,
    "nombre" TEXT NOT NULL,
    "esCosto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CategoriaGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriaId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "cajaId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "cajaId" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprobanteUrl" TEXT,
    "tipoComprobante" TEXT,
    "serie" TEXT,
    "numero" TEXT,
    "sunatEstado" TEXT,
    "codigoOperacion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "costoUnitario" DECIMAL(10,2),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dni_key" ON "Cliente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "ConvenioTrabajador_clienteId_empresaId_key" ON "ConvenioTrabajador"("clienteId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_sucursalId_numero_key" ON "Mesa"("sucursalId", "numero");

-- CreateIndex
CREATE INDEX "Pedido_sucursalId_fecha_idx" ON "Pedido"("sucursalId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaGasto_nombre_key" ON "CategoriaGasto"("nombre");

-- CreateIndex
CREATE INDEX "Gasto_sucursalId_fecha_idx" ON "Gasto"("sucursalId", "fecha");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvenioTrabajador" ADD CONSTRAINT "ConvenioTrabajador_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvenioTrabajador" ADD CONSTRAINT "ConvenioTrabajador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuDia" ADD CONSTRAINT "MenuDia_segundoId_fkey" FOREIGN KEY ("segundoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuEntrada" ADD CONSTRAINT "MenuEntrada_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuDia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuEntrada" ADD CONSTRAINT "MenuEntrada_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesa" ADD CONSTRAINT "Mesa_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "ConvenioTrabajador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMesa" ADD CONSTRAINT "PedidoMesa_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMesa" ADD CONSTRAINT "PedidoMesa_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_detallePadreId_fkey" FOREIGN KEY ("detallePadreId") REFERENCES "DetallePedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuDia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaDiaria" ADD CONSTRAINT "CajaDiaria_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CajaDiaria" ADD CONSTRAINT "CajaDiaria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaGasto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "CajaDiaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "CajaDiaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
