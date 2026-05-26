import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto, DetallePedidoItemDto } from './dto/create-pedido.dto';
import { EstadoPedido, EstadoPago, MetodoPago, Prisma } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { items, mesaId, clienteId, pagos, ...datosPedido } = createPedidoDto;

    // 1. Validar Mesa
    if (mesaId) {
      const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
      if (!mesa) throw new NotFoundException('La mesa no existe');
      if (mesa.ocupada) throw new ConflictException(`La mesa ${mesa.numero} ya está ocupada`);
    }
    
    // 2. Extraer IDs de productos para validar stock y precios
    const allProductIds = new Set<number>();
    const extractIds = (list: DetallePedidoItemDto[]) => {
      list.forEach(i => {
        allProductIds.add(i.productoId);
        if (i.componentes) extractIds(i.componentes);
      });
    };
    extractIds(items);

    const productosDb = await this.prisma.producto.findMany({
      where: { id: { in: Array.from(allProductIds) } }
    });

    const productoMap = new Map(productosDb.map(p => [p.id, p]));
    let totalCalculado = 0;

    // 3. Iniciar Transacción
    return this.prisma.$transaction(async (tx) => {
      
      // A. Crear Cabecera del Pedido
      const pedido = await tx.pedido.create({
        data: {
          ...datosPedido,
          mesaId,
          clienteId,
          total: 0, 
          estado: EstadoPedido.PENDIENTE,
          estadoPago: EstadoPago.POR_COBRAR // Por defecto
        }
      });

      // B. Procesar Items e Inventario
      const procesarItem = async (item: DetallePedidoItemDto, padreId?: number) => {
        const producto = productoMap.get(item.productoId);
        if (!producto) throw new BadRequestException(`Producto ID ${item.productoId} no existe`);

        if (producto.controlarStock) {
          if (producto.stock < item.cantidad) {
            throw new BadRequestException(`Stock insuficiente para ${producto.nombre}`);
          }
          await tx.producto.update({
            where: { id: producto.id },
            data: { stock: { decrement: item.cantidad } }
          });
          await tx.movimientoInventario.create({
            data: {
              productoId: producto.id,
              tipo: 'SALIDA',
              cantidad: item.cantidad,
              motivo: `Venta Pedido #${pedido.id}`,
              costoUnitario: producto.costo
            }
          });
        }

        const subtotal = Number(producto.precio) * item.cantidad;
        totalCalculado += subtotal;

        const detalle = await tx.detallePedido.create({
          data: {
            pedidoId: pedido.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: producto.precio,
            notas: item.notas,
            detallePadreId: padreId
          }
        });

        if (item.componentes && item.componentes.length > 0) {
          for (const hijo of item.componentes) {
            await procesarItem(hijo, detalle.id);
          }
        }
      };

      for (const item of items) {
        await procesarItem(item);
      }

      // C. Procesar Pagos Mixtos y Créditos
      let sumaPagos = 0;

      if (pagos && pagos.length > 0) {
        for (const pago of pagos) {
          sumaPagos += pago.monto;

          // Si hay algún tipo de crédito, el cliente debe estar identificado
          if ((pago.metodo === MetodoPago.CREDITO_EMPRESA || pago.metodo === MetodoPago.CREDITO_PERSONAL) && !clienteId) {
            throw new BadRequestException('Debe especificar un clienteId para registrar pagos a crédito.');
          }

          // Lógica: Crédito de Empresa (El convenio)
          if (pago.metodo === MetodoPago.CREDITO_EMPRESA) {
            const convenio = await tx.convenioTrabajador.findFirst({
              where: { clienteId: clienteId!, activo: true },
              include: { empresa: true }
            });

            if (!convenio) throw new BadRequestException('El cliente no tiene un convenio activo con ninguna empresa.');
            
            // Validar si el monto excede el límite diario o el saldo general de la empresa
            if (pago.monto > Number(convenio.limiteDiario)) {
              throw new BadRequestException(`El pago excede el límite diario del convenio (S/ ${convenio.limiteDiario}).`);
            }

            const saldoDisponibleEmpresa = Number(convenio.empresa.limiteCredito) - Number(convenio.empresa.creditoUsado);
            if (pago.monto > saldoDisponibleEmpresa) {
              throw new BadRequestException('La empresa ha superado su límite de crédito global.');
            }

            // Sumar deuda a la empresa
            await tx.empresa.update({
              where: { id: convenio.empresaId },
              data: { creditoUsado: { increment: pago.monto } }
            });
          }

          // Lógica: Crédito Personal (Fiado directo al cliente)
          if (pago.metodo === MetodoPago.CREDITO_PERSONAL) {
            const cliente = await tx.cliente.findUnique({ where: { id: clienteId! } });
            if (!cliente?.tieneCredito) throw new BadRequestException('Este cliente no tiene autorización para crédito personal.');
            
            const saldoDisponiblePersonal = Number(cliente.limiteCredito) - Number(cliente.saldoDeuda);
            if (pago.monto > saldoDisponiblePersonal) {
              throw new BadRequestException('El cliente ha superado su límite de crédito personal.');
            }

            // Sumar deuda personal al cliente
            await tx.cliente.update({
              where: { id: clienteId! },
              data: { saldoDeuda: { increment: pago.monto } }
            });
          }

          // Registrar el pago en la base de datos
          await tx.pago.create({
            data: {
              pedidoId: pedido.id,
              cajaId: pago.cajaId || 1, // Asume caja 1 por defecto si no se envía
              monto: pago.monto,
              metodo: pago.metodo
            }
          });
        }
      }

      // D. Determinar el Estado de Pago del Pedido
      // D. Determinar el Estado de Pago del Pedido
      
      // Añade ": EstadoPago" justo después del nombre de la variable
      let estadoPagoFinal: EstadoPago = EstadoPago.POR_COBRAR; 
      
      // Usamos una pequeña tolerancia por problemas de decimales en JS
      if (sumaPagos >= totalCalculado - 0.01) {
        estadoPagoFinal = EstadoPago.PAGADO;
      } else if (sumaPagos > 0) {
        estadoPagoFinal = EstadoPago.PAGADO_PARCIAL;
      }

      // E. Actualizar el pedido con el total final y su estado de pago
      const pedidoActualizado = await tx.pedido.update({
        where: { id: pedido.id },
        data: { 
          total: totalCalculado,
          estadoPago: estadoPagoFinal 
        }
      });

      // F. Marcar mesa como ocupada
      if (mesaId) {
        await tx.mesa.update({
          where: { id: mesaId },
          data: { ocupada: true }
        });
      }

      return pedidoActualizado;
    });
  }

  async findAll(estadosString?: string) {
    const filtroWhere: Prisma.PedidoWhereInput = {};

    if (estadosString) {
      const estadosArray = estadosString.split(',') as EstadoPedido[];
      filtroWhere.estado = { in: estadosArray };
    }

    return this.prisma.pedido.findMany({
      where: filtroWhere,
      include: {
        mesa: { select: { numero: true } },
        usuario: { select: { nombre: true, rol: true } },
        cliente: { select: { nombre: true, telefono: true } }, // Incluimos al cliente
        pagos: true, // Incluimos los pagos para ver cómo se pagó
        detalles: {
          include: {
            producto: { select: { nombre: true, precio: true } },
            hijos: {
              include: { producto: { select: { nombre: true } } }
            }
          }
        }
      },
      orderBy: { fecha: 'asc' },
    });
  }
}