import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FacturacionService {
  // Estos datos te los da Nubefact en su panel de prueba
  private readonly RUTA = 'https://api.nubefact.com/solucion/facturacion/v1/tu-ruta-demo';
  private readonly TOKEN = 'tu-token-demo-gigante';

  async emitirComprobante(pedido: any, cliente: any) {
    // 1. Convertir tu Pedido Prisma al JSON que pide Nubefact
    const dataNubefact = {
      operacion: "generar_comprobante",
      tipo_de_comprobante: cliente.ruc ? "1" : "2", // 1=Factura, 2=Boleta
      serie: cliente.ruc ? "F001" : "B001",
      numero: pedido.id, // O un correlativo propio
      sunat_transaction: "1",
      cliente_tipo_de_documento: cliente.ruc ? "6" : "1", // 6=RUC, 1=DNI
      cliente_numero_de_documento: cliente.ruc || cliente.dni,
      cliente_denominacion: cliente.nombre || cliente.razonSocial,
      cliente_direccion: cliente.direccion || "",
      fecha_de_emision: new Date().toISOString().split('T')[0],
      total: pedido.total,
      moneda: "1", // Soles
      items: pedido.detalles.map(item => ({
        unidad_de_medida: "NIU",
        codigo: item.productoId.toString(),
        descripcion: item.producto.nombre,
        cantidad: item.cantidad,
        valor_unitario: item.precioUnitario, // Sin IGV (cálculo pendiente)
        precio_unitario: item.precioUnitario, // Con IGV
        total: item.precioUnitario * item.cantidad,
        tipo_de_igv: "10" // Gravado
      }))
    };

    try {
      // 2. Enviar a Nubefact
      const respuesta = await axios.post(this.RUTA, dataNubefact, {
        headers: {
          'Authorization': `Bearer ${this.TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      // 3. Retornar lo que nos responde Nubefact (Link del PDF, Estado, etc.)
      return {
        exito: true,
        pdf: respuesta.data.enlace_del_pdf,
        sunat_estado: respuesta.data.sunat_description
      };
    } catch (error) {
      console.error('Error Nubefact:', error.response?.data || error.message);
      return { exito: false, error: 'Error al facturar' };
    }
  }
}